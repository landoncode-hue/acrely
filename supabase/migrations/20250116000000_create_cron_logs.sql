-- Migration: Create cron_logs table for tracking scheduled jobs
-- Author: Kennedy — Landon Digital
-- Version: 1.8.0
-- Quest: acrely-v2-system-maintenance

-- Create cron_logs table
CREATE TABLE IF NOT EXISTS cron_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name VARCHAR(100) NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_ms INTEGER,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'warning')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_cron_logs_job_name ON cron_logs(job_name);
CREATE INDEX idx_cron_logs_executed_at ON cron_logs(executed_at DESC);
CREATE INDEX idx_cron_logs_status ON cron_logs(status);

-- Create view for cron summary
CREATE OR REPLACE VIEW cron_summary AS
SELECT 
  job_name,
  COUNT(*) as total_executions,
  COUNT(*) FILTER (WHERE status = 'success') as successful,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  COUNT(*) FILTER (WHERE status = 'warning') as warnings,
  ROUND(AVG(duration_ms)::numeric, 2) as avg_duration_ms,
  MAX(executed_at) as last_execution,
  (COUNT(*) FILTER (WHERE status = 'success')::float / COUNT(*) * 100)::numeric(5,2) as success_rate
FROM cron_logs
WHERE executed_at > NOW() - INTERVAL '7 days'
GROUP BY job_name
ORDER BY last_execution DESC;

-- Create system_health table for tracking health metrics
CREATE TABLE IF NOT EXISTS system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  database_response_ms INTEGER NOT NULL,
  storage_accessible BOOLEAN NOT NULL,
  error_count INTEGER DEFAULT 0,
  uptime_percentage NUMERIC(5,2),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for time-series queries
CREATE INDEX idx_system_health_checked_at ON system_health(checked_at DESC);

-- RLS Policies for cron_logs (SysAdmin and CEO only)
ALTER TABLE cron_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SysAdmin and CEO can view cron logs"
  ON cron_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('SysAdmin', 'CEO')
    )
  );

-- Service role can insert (for Edge Functions)
CREATE POLICY "Service role can insert cron logs"
  ON cron_logs FOR INSERT
  WITH CHECK (true);

-- RLS for system_health
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SysAdmin and CEO can view system health"
  ON system_health FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('SysAdmin', 'CEO')
    )
  );

CREATE POLICY "Service role can insert system health"
  ON system_health FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON cron_logs TO authenticated;
GRANT SELECT ON cron_summary TO authenticated;
GRANT SELECT ON system_health TO authenticated;
GRANT INSERT ON cron_logs TO service_role;
GRANT INSERT ON system_health TO service_role;

COMMENT ON TABLE cron_logs IS 'Tracks execution of all scheduled cron jobs';
COMMENT ON TABLE system_health IS 'Stores system health check results';
COMMENT ON VIEW cron_summary IS 'Aggregated cron job statistics for the last 7 days';
