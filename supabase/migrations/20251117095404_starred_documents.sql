-- =====================================================
-- STARRED_DOCUMENTS TABLE
-- =====================================================
-- Junction table to track which documents users have starred
-- Supports multiple users starring the same document (for shared docs)
CREATE TABLE starred_documents (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  -- Ensure a user can only star a document once
  unique(document_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_starred_documents_document_id ON starred_documents(document_id);
CREATE INDEX user_id ON starred_documents(user_id);
CREATE INDEX idx_starred_documents_created_at ON starred_documents(created_at DESC);

-- Composite index for efficient queries (user's starred documents, ordered by when starred)
CREATE INDEX idx_starred_documents_user_created ON starred_documents(user_id, created_at DESC);

-- =====================================================
-- ENABLE RLS
-- =====================================================
ALTER TABLE starred_documents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR STARRED_DOCUMENTS
-- =====================================================

-- SELECT: Users can view their own starred documents
CREATE POLICY "Users can view their own starred documents"
    ON starred_documents FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT: Users can star documents they own or have access to
CREATE POLICY "Users can star own documents"
    ON starred_documents FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = starred_documents.document_id
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can star shared documents"
    ON starred_documents FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM shared_documents
            WHERE shared_documents.document_id = starred_documents.document_id
        )
        AND EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = starred_documents.document_id
        )
    );

-- DELETE: Users can unstar their own starred documents
CREATE POLICY "Users can unstar their own documents"
    ON starred_documents FOR DELETE
    USING (auth.uid() = user_id);
