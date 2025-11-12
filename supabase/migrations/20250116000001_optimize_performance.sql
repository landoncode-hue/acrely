-- Migration: Performance optimization - indexes and maintenance
-- Author: Kennedy — Landon Digital
-- Version: 1.8.0
-- Quest: acrely-v2-system-maintenance

-- Add missing indexes on payments table
CREATE INDEX IF NOT EXISTS idx_payments_allocation_id ON payments(allocation_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_amount ON payments(amount);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Add missing indexes on receipts table
CREATE INDEX IF NOT EXISTS idx_receipts_payment_id ON receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_receipts_generated_at ON receipts(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);

-- Add missing indexes on audit_logs table
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);

-- Add missing indexes on billing_summary table
CREATE INDEX IF NOT EXISTS idx_billing_summary_period_start ON billing_summary(period_start DESC);
CREATE INDEX IF NOT EXISTS idx_billing_summary_total_revenue ON billing_summary(total_revenue);

-- Add indexes on allocations for better join performance
CREATE INDEX IF NOT EXISTS idx_allocations_customer_id ON allocations(customer_id);
CREATE INDEX IF NOT EXISTS idx_allocations_plot_id ON allocations(plot_id);
CREATE INDEX IF NOT EXISTS idx_allocations_status ON allocations(status);

-- Add indexes on customers
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Create view for slow queries monitoring
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time,
  stddev_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100 -- queries slower than 100ms
ORDER BY mean_exec_time DESC
LIMIT 50;

-- Grant access to slow_queries view
GRANT SELECT ON slow_queries TO postgres;

-- Create function to perform routine maintenance
CREATE OR REPLACE FUNCTION run_database_maintenance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Run VACUUM ANALYZE on main tables
  VACUUM ANALYZE payments;
  VACUUM ANALYZE receipts;
  VACUUM ANALYZE audit_logs;
  VACUUM ANALYZE billing_summary;
  VACUUM ANALYZE allocations;
  VACUUM ANALYZE customers;
  VACUUM ANALYZE cron_logs;
  
  -- Update table statistics
  ANALYZE payments;
  ANALYZE receipts;
  ANALYZE audit_logs;
  ANALYZE billing_summary;
  
  -- Log completion
  INSERT INTO cron_logs (job_name, status, duration_ms, metadata)
  VALUES (
    'database_maintenance',
    'success',
    0,
    jsonb_build_object('tables_optimized', 8)
  );
END;
$$;

-- Create function to get database size and usage stats
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS TABLE(
  total_size_mb NUMERIC,
  table_name TEXT,
  table_size_mb NUMERIC,
  index_size_mb NUMERIC,
  row_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND((pg_database_size(current_database()) / 1024.0 / 1024.0)::numeric, 2) as total_size_mb,
    schemaname || '.' || tablename as table_name,
    ROUND((pg_total_relation_size(schemaname||'.'||tablename) / 1024.0 / 1024.0)::numeric, 2) as table_size_mb,
    ROUND((pg_indexes_size(schemaname||'.'||tablename) / 1024.0 / 1024.0)::numeric, 2) as index_size_mb,
    n_live_tup as row_count
  FROM pg_stat_user_tables
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$;

COMMENT ON FUNCTION run_database_maintenance IS 'Performs VACUUM and ANALYZE on all main tables';
COMMENT ON FUNCTION get_database_stats IS 'Returns database size and table statistics';
