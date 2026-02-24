-- ============================================================
-- RAG Search Function using pgvector
-- ============================================================
-- This function performs similarity search on the documents table
-- using vector embeddings for retrieval-augmented generation (RAG)
-- ============================================================

-- First, ensure pgvector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(768), -- Gemini text-embedding-004 produces 768 dimensions
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster similarity search
CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_metadata_sport ON documents((metadata->>'sport'));

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own documents + system-seeded docs
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    metadata->>'source' = 'system_seed'
  );

-- Policy: Users can create their own documents
CREATE POLICY "Users can create documents" ON documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own documents
CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- match_documents function for RAG similarity search
-- ============================================================
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5,
  filter_sport text DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM documents d
  WHERE
    -- Either user's own docs or system-seeded docs
    (d.user_id = auth.uid() OR d.metadata->>'source' = 'system_seed')
    -- Filter by sport if specified
    AND (filter_sport IS NULL OR d.metadata->>'sport' = filter_sport)
    -- Only return results above threshold
    AND 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================
-- Usage example:
-- ============================================================
-- SELECT * FROM match_documents(
--   '[0.1, 0.2, ...]'::vector(768),  -- query embedding
--   0.5,                               -- similarity threshold
--   5,                                 -- max results
--   'basketball'                       -- filter by sport
-- );
