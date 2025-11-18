-- =====================================================
-- DOCUMENTS TABLE
-- =====================================================
CREATE TABLE documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Untitled Document',
  content jsonb,
  is_public boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes for performance
CREATE INDEX idx_documents_account_id ON documents(user_id);
CREATE INDEX idx_documents_updated_at ON documents(updated_at DESC);
CREATE INDEX idx_documents_is_public ON documents(is_public) WHERE is_public = true;

-- =====================================================
-- shared_documents TABLE
-- =====================================================
-- Create enum for access levels
CREATE TYPE access_level_enum AS ENUM ('view', 'comment', 'edit');

CREATE TABLE shared_documents (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  access_level access_level_enum not null default 'view',
  shared_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  -- Ensure a user can't have duplicate access to the same document
  unique(document_id, user_id),
  unique(document_id, email)
);

-- Indexes for performance
CREATE INDEX idx_shared_documents_document_id ON shared_documents(document_id);
CREATE INDEX idx_shared_documents_account_id ON shared_documents(user_id);
CREATE INDEX idx_shared_documents_email ON shared_documents(email);
CREATE INDEX idx_shared_documents_shared_by ON shared_documents(shared_by);

-- =====================================================
-- ENABLE RLS
-- =====================================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_documents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR DOCUMENTS
-- =====================================================

-- SELECT: Users can view documents they own or have access to (excluding soft-deleted)
CREATE POLICY "Users can view own documents"
    ON documents FOR SELECT
    USING (
        auth.uid() = user_id 
    );

CREATE POLICY "Users can view documents shared with them"
    ON documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM shared_documents
            WHERE shared_documents.document_id = documents.id
            AND shared_documents.user_id = auth.uid()
        )
    );

-- Anyone can view public documents (even unauthenticated users)
CREATE POLICY "Anyone can view public documents"
    ON documents FOR SELECT
    USING (is_public = true);

-- INSERT: Users can create documents
CREATE POLICY "Users can create documents"
    ON documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Owners and editors can update (including soft delete)
CREATE POLICY "Owners can update own documents"
    ON documents FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Editors can update shared documents"
    ON documents FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM shared_documents
            WHERE shared_documents.document_id = documents.id
            AND shared_documents.user_id = auth.uid()
            AND shared_documents.access_level = 'edit'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM shared_documents
            WHERE shared_documents.document_id = documents.id
            AND shared_documents.user_id = auth.uid()
            AND shared_documents.access_level = 'edit'
        )
    );

-- DELETE: Only owners can hard delete
CREATE POLICY "Owners can delete own documents"
    ON documents FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES FOR shared_documents
-- =====================================================

-- SELECT: Users can view access records they created or their own access records
CREATE POLICY "Users can view access records they shared"
    ON shared_documents FOR SELECT
    USING (shared_by = auth.uid());

CREATE POLICY "Users can view their own access records"
    ON shared_documents FOR SELECT
    USING (
        user_id = auth.uid()
        or email = auth.jwt() ->> 'email'
    );

-- INSERT: Only document owners can grant access
CREATE POLICY "Owners can grant access to their documents"
    ON shared_documents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = shared_documents.document_id
            AND documents.user_id = auth.uid()
        )
        AND shared_by = auth.uid()
    );

-- UPDATE: Only users who shared can modify access
CREATE POLICY "Users can modify access records they created"
    ON shared_documents FOR UPDATE
    USING (shared_by = auth.uid())
    WITH CHECK (shared_by = auth.uid());

-- DELETE: Only users who shared can revoke access
CREATE POLICY "Users can revoke access records they created"
    ON shared_documents FOR DELETE
    USING (shared_by = auth.uid());

-- =====================================================
-- COLUMN-LEVEL PERMISSIONS FOR DOCUMENTS
-- =====================================================
-- Revoke all update permissions on documents
REVOKE UPDATE ON documents FROM authenticated, anon;

-- Grant update only on modifiable columns (RLS policies control WHO can update)
-- title and content can be updated by owners and editors
-- is_public can be updated but trigger will enforce only owner can change it
GRANT UPDATE (title, content, is_public) ON documents TO authenticated;

-- =====================================================
-- COLUMN-LEVEL PERMISSIONS FOR SHARED_DOCUMENTS
-- =====================================================
-- Revoke all update permissions on shared_documents
REVOKE UPDATE ON shared_documents FROM authenticated, anon;

-- Grant update only on modifiable columns
-- user_id and email need to be updatable for accept_pending_invitations() function
-- access_level can be updated but trigger will enforce only shared_by can change it
GRANT UPDATE (user_id, email, access_level) ON shared_documents TO authenticated;

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATE AND CONDITIONAL PROTECTION
-- =====================================================
-- Trigger for documents: auto-update updated_at AND protect is_public with ownership check
CREATE OR REPLACE FUNCTION handle_documents_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-update the updated_at timestamp
    NEW.updated_at = NOW();

    -- Protect is_public: only owner can change it
    IF OLD.is_public IS DISTINCT FROM NEW.is_public THEN
        IF auth.uid() != NEW.user_id THEN
            RAISE EXCEPTION 'Only the document owner can change the is_public setting';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for shared_documents: auto-update updated_at AND protect access_level with ownership check
CREATE OR REPLACE FUNCTION handle_shared_documents_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-update the updated_at timestamp
    NEW.updated_at = NOW();

    -- Protect access_level: only the user who shared can change it
    IF OLD.access_level IS DISTINCT FROM NEW.access_level THEN
        IF auth.uid() != NEW.shared_by THEN
            RAISE EXCEPTION 'Only the user who shared the document can change the access level';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for documents table
CREATE TRIGGER handle_documents_update_trigger
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION handle_documents_update();

-- Triggers for shared_documents table
CREATE TRIGGER handle_shared_documents_update_trigger
    BEFORE UPDATE ON shared_documents
    FOR EACH ROW
    EXECUTE FUNCTION handle_shared_documents_update();

-- =====================================================
-- ACCEPT PENDING INVITATIONS
-- =====================================================
-- This function converts email-based invitations to user-based access
-- when a user signs up with an email that has pending invitations
CREATE OR REPLACE FUNCTION accept_pending_invitations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  updated_count INTEGER;
BEGIN
  -- Get the current user's email from JWT
  user_email := auth.jwt() ->> 'email';

  -- Check if user is authenticated
  IF auth.uid() IS NULL OR user_email IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Update all pending invitations for this email
  -- Convert email-based access to user_id-based access
  UPDATE shared_documents
  SET
    user_id = auth.uid(),
    updated_at = NOW()
  WHERE
    email = user_email
    AND user_id IS NULL
    -- Ensure we don't violate unique constraint (document_id, user_id)
    AND NOT EXISTS (
      SELECT 1 FROM shared_documents existing
      WHERE existing.document_id = shared_documents.document_id
      AND existing.user_id = auth.uid()
    );

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  RETURN updated_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION accept_pending_invitations() TO authenticated;

-- =====================================================
-- FUNCTION TO GET DOCUMENTS WITH USER DATA
-- =====================================================
-- Retrieves documents with user information (name, email, picture_url) from public.accounts
-- Uses SECURITY DEFINER to bypass RLS on accounts table
-- Returns documents the user owns

CREATE OR REPLACE FUNCTION public.get_my_documents_with_users()
RETURNS TABLE (
    id uuid,
    user_id uuid,
    title text,
    content jsonb,
    is_public boolean,
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
    -- Return documents owned by the user with account data
    -- SECURITY DEFINER allows bypassing RLS on accounts table
    RETURN QUERY
    SELECT
        d.id,
        d.user_id,
        d.title,
        d.content,
        d.is_public,
        d.created_at,
        d.updated_at,
        a.name AS user_name,
        a.email AS user_email,
        a.picture_url AS user_picture_url,
        a.public_data AS user_public_data
    FROM documents d
    INNER JOIN accounts a ON d.user_id = a.id
    WHERE d.user_id = auth.uid()
    ORDER BY d.updated_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_documents_with_users() TO authenticated;

-- =====================================================
-- FUNCTION TO GET SHARED DOCUMENTS WITH USER DATA
-- =====================================================
-- Retrieves documents shared with the user, including user information

CREATE OR REPLACE FUNCTION public.get_shared_documents_with_users()
RETURNS TABLE (
    id uuid,
    user_id uuid,
    title text,
    content jsonb,
    is_public boolean,
    created_at timestamptz,
    updated_at timestamptz,
    access_level text,
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
    -- Return documents shared with the user with user account data
    RETURN QUERY
    SELECT
        d.id,
        d.user_id,
        d.title,
        d.content,
        d.is_public,
        d.created_at,
        d.updated_at,
        sd.access_level::text,
        a.name AS user_name,
        a.email AS user_email,
        a.picture_url AS user_picture_url,
        a.public_data AS user_public_data
    FROM documents d
    INNER JOIN shared_documents sd ON d.id = sd.document_id
    INNER JOIN accounts a ON d.user_id = a.id
    WHERE sd.user_id = auth.uid()
    ORDER BY d.updated_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_shared_documents_with_users() TO authenticated;

-- =====================================================
-- FUNCTION TO GET STARRED DOCUMENTS WITH USER DATA
-- =====================================================
-- Retrieves starred documents with user information

CREATE OR REPLACE FUNCTION public.get_starred_documents_with_users()
RETURNS TABLE (
    id uuid,
    user_id uuid,
    title text,
    content jsonb,
    is_public boolean,
    created_at timestamptz,
    updated_at timestamptz,
    starred_at timestamptz,
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
    -- Return starred documents with user account data
    RETURN QUERY
    SELECT
        d.id,
        d.user_id,
        d.title,
        d.content,
        d.is_public,
        d.created_at,
        d.updated_at,
        std.created_at AS starred_at,
        a.name AS user_name,
        a.email AS user_email,
        a.picture_url AS user_picture_url,
        a.public_data AS user_public_data
    FROM documents d
    INNER JOIN starred_documents std ON d.id = std.document_id
    INNER JOIN accounts a ON d.user_id = a.id
    WHERE std.user_id = auth.uid()
    ORDER BY std.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_starred_documents_with_users() TO authenticated;

-- =====================================================
-- FUNCTION TO GET TRASHED DOCUMENTS WITH USER DATA
-- =====================================================
-- Retrieves trashed documents with user information

CREATE OR REPLACE FUNCTION public.get_trashed_documents_with_users()
RETURNS TABLE (
    id uuid,
    user_id uuid,
    title text,
    content jsonb,
    created_at timestamptz,
    updated_at timestamptz,
    trashed_at timestamptz,
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
    -- Return trashed documents with user account data
    RETURN QUERY
    SELECT
        td.id,
        td.user_id,
        td.title,
        td.content,
        td.created_at,
        td.updated_at,
        td.trashed_at,
        a.name AS user_name,
        a.email AS user_email,
        a.picture_url AS user_picture_url,
        a.public_data AS user_public_data
    FROM trashed_documents td
    INNER JOIN accounts a ON td.user_id = a.id
    WHERE td.user_id = auth.uid()
    ORDER BY td.trashed_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_trashed_documents_with_users() TO authenticated;