-- =====================================================
-- TRASHED_DOCUMENTS TABLE
-- =====================================================
CREATE TABLE trashed_documents (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content jsonb,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  trashed_at timestamptz DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_trashed_documents_account_id ON trashed_documents(user_id);
CREATE INDEX idx_trashed_documents_trashed_at ON trashed_documents(trashed_at DESC);

-- =====================================================
-- ENABLE RLS
-- =====================================================
ALTER TABLE trashed_documents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR TRASHED_DOCUMENTS
-- =====================================================

-- SELECT: Users can only view their own trashed documents
CREATE POLICY "Users can view own trashed documents"
  ON trashed_documents FOR SELECT
  USING (auth.uid() = user_id);

-- DELETE: Users can permanently delete their own trashed documents
CREATE POLICY "Users can permanently delete own trashed documents"
  ON trashed_documents FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PROCEDURES
-- =====================================================

-- Procedure to trash a document (move from documents to trashed_documents)
CREATE OR REPLACE FUNCTION trash_document(p_document_id uuid)
RETURNS void AS $$
DECLARE
  v_account_id uuid;
BEGIN
  -- Get current user
  v_account_id := auth.uid();

  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Move document to trash (in a transaction)
  -- First insert into trashed_documents
  INSERT INTO trashed_documents (id, user_id, title, content, created_at, updated_at)
  SELECT id, user_id, title, content, created_at, updated_at
  FROM documents
  WHERE id = p_document_id
    AND user_id = v_account_id;

  -- Check if document was found and belongs to user
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Document not found or access denied';
  END IF;

  -- Then delete from documents (this will cascade delete shared_documents)
  DELETE FROM documents
  WHERE id = p_document_id
    AND user_id = v_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Procedure to restore a document (move from trashed_documents back to documents)
CREATE OR REPLACE FUNCTION restore_document(p_document_id uuid)
RETURNS void AS $$
DECLARE
  v_account_id uuid;
BEGIN
  -- Get current user
  v_account_id := auth.uid();

  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Restore document from trash
  -- First insert back into documents
  INSERT INTO documents (id, user_id, title, content, created_at, updated_at)
  SELECT id, user_id, title, content, created_at, updated_at
  FROM trashed_documents
  WHERE id = p_document_id
    AND user_id = v_account_id;

  -- Check if document was found and belongs to user
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Document not found in trash or access denied';
  END IF;

  -- Then delete from trashed_documents
  DELETE FROM trashed_documents
  WHERE id = p_document_id
    AND user_id = v_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Procedure to permanently delete a trashed document
CREATE OR REPLACE FUNCTION permanently_delete_document(p_document_id uuid)
RETURNS void AS $$
DECLARE
  v_account_id uuid;
BEGIN
  -- Get current user
  v_account_id := auth.uid();

  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Permanently delete from trash
  DELETE FROM trashed_documents
  WHERE id = p_document_id
    AND user_id = v_account_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Document not found in trash or access denied';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
