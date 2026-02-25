-- Supabase Storage Bucket for Athlete Videos
-- Run this in Supabase SQL Editor AFTER creating the bucket in the dashboard
-- First, create the bucket via Dashboard: Storage > New Bucket > "athlete-videos"

-- Storage bucket policies for athlete-videos bucket
-- Note: Bucket must be created first via Supabase Dashboard with these settings:
-- - Name: athlete-videos
-- - Public: false (private bucket)
-- - File size limit: 500MB (524288000 bytes)
-- - Allowed MIME types: video/mp4, video/quicktime, video/webm

-- Policy: Users can upload to their own folder
DROP POLICY IF EXISTS "Users can upload videos to own folder" ON storage.objects;
CREATE POLICY "Users can upload videos to own folder" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'athlete-videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can view their own videos
DROP POLICY IF EXISTS "Users can view own videos" ON storage.objects;
CREATE POLICY "Users can view own videos" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'athlete-videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can update their own videos
DROP POLICY IF EXISTS "Users can update own videos" ON storage.objects;
CREATE POLICY "Users can update own videos" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'athlete-videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can delete their own videos
DROP POLICY IF EXISTS "Users can delete own videos" ON storage.objects;
CREATE POLICY "Users can delete own videos" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'athlete-videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create a thumbnails bucket for video thumbnails
-- This can be public for easier loading in the UI
-- Create via Dashboard: Storage > New Bucket > "video-thumbnails"
-- - Name: video-thumbnails
-- - Public: true
-- - File size limit: 5MB
-- - Allowed MIME types: image/jpeg, image/png, image/webp

-- Policy: Users can upload thumbnails to their own folder
DROP POLICY IF EXISTS "Users can upload thumbnails to own folder" ON storage.objects;
CREATE POLICY "Users can upload thumbnails to own folder" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'video-thumbnails'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Anyone can view thumbnails (public bucket)
DROP POLICY IF EXISTS "Anyone can view thumbnails" ON storage.objects;
CREATE POLICY "Anyone can view thumbnails" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'video-thumbnails');

-- Policy: Users can update their own thumbnails
DROP POLICY IF EXISTS "Users can update own thumbnails" ON storage.objects;
CREATE POLICY "Users can update own thumbnails" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'video-thumbnails'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can delete their own thumbnails
DROP POLICY IF EXISTS "Users can delete own thumbnails" ON storage.objects;
CREATE POLICY "Users can delete own thumbnails" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'video-thumbnails'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
