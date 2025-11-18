-- =====================================================
-- COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  quote_text text,
  position jsonb,
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES FOR COMMENTS
-- =====================================================
CREATE INDEX idx_comments_document_id ON comments(document_id);
CREATE INDEX idx_comments_account_id ON comments(user_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_comments_is_resolved ON comments(is_resolved) WHERE is_resolved = false;
CREATE INDEX idx_comments_document_created ON comments(document_id, created_at DESC);

-- =====================================================
-- TRIGGER TO ENFORCE SINGLE-LEVEL NESTING
-- =====================================================
CREATE OR REPLACE FUNCTION enforce_single_level_nesting()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a reply (has parent_comment_id)
  IF NEW.parent_comment_id IS NOT NULL THEN
    -- Check if the parent is itself a reply
    IF EXISTS (
      SELECT 1 FROM comments
      WHERE id = NEW.parent_comment_id
      AND parent_comment_id IS NOT NULL
    ) THEN
      RAISE EXCEPTION 'Replies cannot have replies (single-level nesting only)';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_single_level_nesting
  BEFORE INSERT OR UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_level_nesting();

-- =====================================================
-- ENABLE RLS FOR COMMENTS
-- =====================================================
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR COMMENTS
-- =====================================================

-- SELECT: Document owners can view all comments
CREATE POLICY "Document owners can view comments"
    ON comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = comments.document_id
            AND documents.user_id = auth.uid()
        )
    );

-- SELECT: Users with access can view comments (RLS on shared_documents auto-filters)
CREATE POLICY "Shared users can view comments"
    ON comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM shared_documents
            WHERE shared_documents.document_id = comments.document_id
        )
    );

-- INSERT: Document owners can comment
CREATE POLICY "Document owners can comment"
    ON comments FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = comments.document_id
            AND documents.user_id = auth.uid()
        )
    );

-- INSERT: Users with comment/edit access can comment (RLS on shared_documents auto-filters)
CREATE POLICY "Shared users can comment with sufficient access"
    ON comments FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM shared_documents
            WHERE shared_documents.document_id = comments.document_id
            AND shared_documents.access_level IN ('comment', 'edit')
        )
    );

-- UPDATE: Users can update own comments
CREATE POLICY "Users can update own comments"
    ON comments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Document owners can resolve/edit any comment
CREATE POLICY "Document owners can update any comment"
    ON comments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = comments.document_id
            AND documents.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = comments.document_id
            AND documents.user_id = auth.uid()
        )
    );

-- DELETE: Users can delete own comments
CREATE POLICY "Users can delete own comments"
    ON comments FOR DELETE
    USING (auth.uid() = user_id);

-- DELETE: Document owners can delete any comment
CREATE POLICY "Document owners can delete any comment"
    ON comments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = comments.document_id
            AND documents.user_id = auth.uid()
        )
    );

-- =====================================================
-- COLUMN-LEVEL PERMISSIONS
-- =====================================================
-- Revoke all update permissions on comments
REVOKE UPDATE ON comments FROM authenticated, anon;

-- Grant update only on is_resolved column (RLS policies still control WHO can update)
GRANT UPDATE (is_resolved) ON comments TO authenticated;

-- =====================================================
-- TRIGGER FOR UPDATED_AT AUTO-UPDATE
-- =====================================================
CREATE OR REPLACE FUNCTION handle_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-update the updated_at timestamp
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_comments_updated_at_trigger
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION handle_comments_updated_at();

-- =====================================================
-- FUNCTION TO GET COMMENTS WITH USER DATA
-- =====================================================
-- Retrieves comments with user information (name, email, picture_url) from public.accounts
-- Uses SECURITY DEFINER to bypass RLS on accounts table
-- Only returns comments the user has access to (RLS on comments still applies)
CREATE OR REPLACE FUNCTION public.get_comments_with_users(p_document_id uuid)
RETURNS TABLE (
    id uuid,
    document_id uuid,
    user_id uuid,
    parent_comment_id uuid,
    content text,
    quote_text text,
    "position" jsonb,
    is_resolved boolean,
    created_at timestamptz,
    updated_at timestamptz,
    user_name varchar(255),
    user_email varchar(320),
    user_picture_url varchar(1000),
    user_public_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- First check if the caller has access to this document
    IF NOT EXISTS (
        SELECT 1 FROM documents d
        WHERE d.id = p_document_id
        AND (
            d.user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM shared_documents sd
                WHERE sd.document_id = d.id
                AND sd.user_id = auth.uid()
            )
        )
    ) THEN
        RAISE EXCEPTION 'You do not have access to this document';
    END IF;

    -- Return comments with account data
    -- SECURITY DEFINER allows bypassing RLS on accounts table
    RETURN QUERY
    SELECT
        c.id,
        c.document_id,
        c.user_id,
        c.parent_comment_id,
        c.content,
        c.quote_text,
        c."position",
        c.is_resolved,
        c.created_at,
        c.updated_at,
        a.name AS user_name,
        a.email AS user_email,
        a.picture_url AS user_picture_url,
        a.public_data AS user_public_data
    FROM comments c
    INNER JOIN accounts a ON c.user_id = a.id
    WHERE c.document_id = p_document_id
    ORDER BY c.created_at ASC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_comments_with_users(uuid) TO authenticated;
