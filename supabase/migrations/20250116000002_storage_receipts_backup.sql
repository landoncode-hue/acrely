-- Migration: Storage bucket for backups
-- Author: Kennedy — Landon Digital
-- Version: 1.8.0
-- Quest: acrely-v2-system-maintenance

-- Create backups storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'backups',
  'backups',
  false,
  524288000, -- 500MB limit
  ARRAY['application/gzip', 'application/x-gzip', 'application/sql']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for backups bucket (SysAdmin only)
CREATE POLICY "SysAdmin can upload backups"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'backups' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'SysAdmin'
    )
  );

CREATE POLICY "SysAdmin and CEO can view backups"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'backups' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('SysAdmin', 'CEO')
    )
  );

CREATE POLICY "SysAdmin can delete old backups"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'backups' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'SysAdmin'
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to backups"
  ON storage.objects FOR ALL
  USING (bucket_id = 'backups')
  WITH CHECK (bucket_id = 'backups');

-- Create backup_history table to track backups
CREATE TABLE IF NOT EXISTS backup_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_file VARCHAR(255) NOT NULL,
  backup_size_mb NUMERIC(10,2),
  backup_type VARCHAR(50) DEFAULT 'full',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'in_progress')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_backup_history_created_at ON backup_history(created_at DESC);

-- RLS for backup_history
ALTER TABLE backup_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SysAdmin and CEO can view backup history"
  ON backup_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('SysAdmin', 'CEO')
    )
  );

CREATE POLICY "Service role can manage backup history"
  ON backup_history FOR ALL
  USING (true)
  WITH CHECK (true);

GRANT SELECT ON backup_history TO authenticated;

COMMENT ON TABLE backup_history IS 'Tracks database backup creation and status';
