-- Migration: Create Storage Bucket for Receipts
-- Author: Kennedy - Landon Digital
-- Version: 1.5.0
-- Description: Creates Supabase Storage bucket for receipt files with appropriate policies

-- ============================================
-- Create Storage Bucket for Receipts
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  true, -- Public bucket so receipt links can be shared via SMS
  52428800, -- 50MB file size limit
  ARRAY['text/html', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Storage Policies for Receipts Bucket
-- ============================================

-- Allow authenticated users to upload receipts
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'receipts');

-- Allow public read access to receipts (for SMS links)
CREATE POLICY "Public read access to receipts"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'receipts');

-- Allow authenticated users to view receipts
CREATE POLICY "Authenticated users can view receipts"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'receipts');

-- Only admins and system can update receipts
CREATE POLICY "Service role can update receipts"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'receipts' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'SysAdmin')
  )
);

-- Only admins can delete receipt files
CREATE POLICY "Admins can delete receipts"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'receipts' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'SysAdmin')
  )
);

-- ============================================
-- Add receipt_url column to payments if not exists
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'payments' 
    AND column_name = 'receipt_url'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN receipt_url TEXT;
  END IF;
END $$;

-- Add index for faster lookup
CREATE INDEX IF NOT EXISTS idx_payments_receipt_url ON public.payments(receipt_url) WHERE receipt_url IS NOT NULL;
