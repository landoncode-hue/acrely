-- =====================================================
-- Migration: Comprehensive Audit Triggers
-- Version: 1.6.0
-- Description: Add audit triggers to all key tables
--              with automatic logging functionality
-- =====================================================

-- Function to check if user is performing the action
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'system');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced logging for estate-related operations
CREATE OR REPLACE FUNCTION log_estate_operation()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  operation_desc TEXT;
BEGIN
  user_role := current_user_role();
  
  IF TG_TABLE_NAME = 'estates' THEN
    IF TG_OP = 'INSERT' THEN
      operation_desc := 'Created estate: ' || NEW.name;
    ELSIF TG_OP = 'UPDATE' THEN
      operation_desc := 'Updated estate: ' || NEW.name;
    ELSIF TG_OP = 'DELETE' THEN
      operation_desc := 'Deleted estate: ' || OLD.name;
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      user_id, role, action, table_name, entity, entity_id,
      record_id, old_data, description
    ) VALUES (
      auth.uid(), user_role, TG_OP, TG_TABLE_NAME, 'estates',
      OLD.id, OLD.id, to_jsonb(OLD), operation_desc
    );
    RETURN OLD;
  ELSE
    INSERT INTO public.audit_logs (
      user_id, role, action, table_name, entity, entity_id,
      record_id, old_data, new_data, description
    ) VALUES (
      auth.uid(), user_role, TG_OP, TG_TABLE_NAME, 'estates',
      COALESCE(NEW.id, OLD.id), COALESCE(NEW.id, OLD.id),
      CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) END,
      to_jsonb(NEW), operation_desc
    );
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced logging for billing operations
CREATE OR REPLACE FUNCTION log_billing_operation()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  operation_desc TEXT;
  customer_name TEXT;
BEGIN
  user_role := current_user_role();
  
  -- Get customer name for context
  IF TG_TABLE_NAME = 'billing_summary' THEN
    SELECT c.full_name INTO customer_name
    FROM public.customers c
    WHERE c.id = COALESCE(NEW.customer_id, OLD.customer_id);
    
    IF TG_OP = 'INSERT' THEN
      operation_desc := 'Generated billing summary for ' || customer_name;
    ELSIF TG_OP = 'UPDATE' THEN
      operation_desc := 'Updated billing summary for ' || customer_name;
    ELSIF TG_OP = 'DELETE' THEN
      operation_desc := 'Deleted billing summary for ' || customer_name;
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      user_id, role, action, table_name, entity, entity_id,
      record_id, old_data, description, metadata
    ) VALUES (
      auth.uid(), user_role, TG_OP, TG_TABLE_NAME, 'billing',
      OLD.id, OLD.id, to_jsonb(OLD), operation_desc,
      jsonb_build_object('customer_id', OLD.customer_id, 'customer_name', customer_name)
    );
    RETURN OLD;
  ELSE
    INSERT INTO public.audit_logs (
      user_id, role, action, table_name, entity, entity_id,
      record_id, old_data, new_data, description, metadata
    ) VALUES (
      auth.uid(), user_role, TG_OP, TG_TABLE_NAME, 'billing',
      COALESCE(NEW.id, OLD.id), COALESCE(NEW.id, OLD.id),
      CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) END,
      to_jsonb(NEW), operation_desc,
      jsonb_build_object('customer_id', COALESCE(NEW.customer_id, OLD.customer_id), 'customer_name', customer_name)
    );
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers to estates table
DROP TRIGGER IF EXISTS audit_estates_trigger ON public.estates;
CREATE TRIGGER audit_estates_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.estates
  FOR EACH ROW EXECUTE FUNCTION log_estate_operation();

-- Apply triggers to billing_summary table
DROP TRIGGER IF EXISTS audit_billing_summary_trigger ON public.billing_summary;
CREATE TRIGGER audit_billing_summary_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.billing_summary
  FOR EACH ROW EXECUTE FUNCTION log_billing_operation();

-- Create manual audit log function for edge function calls
CREATE OR REPLACE FUNCTION create_audit_log(
  p_action TEXT,
  p_entity TEXT,
  p_entity_id UUID,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
  user_role TEXT;
BEGIN
  user_role := current_user_role();
  
  INSERT INTO public.audit_logs (
    user_id, role, action, entity, entity_id, description, metadata
  ) VALUES (
    auth.uid(), user_role, p_action, p_entity, p_entity_id, p_description, p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get recent audit activity
CREATE OR REPLACE FUNCTION get_recent_audit_activity(
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  user_name TEXT,
  user_role TEXT,
  action TEXT,
  entity TEXT,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.created_at,
    u.full_name,
    al.role,
    al.action,
    al.entity,
    al.description
  FROM public.audit_logs al
  LEFT JOIN public.users u ON al.user_id = u.id
  ORDER BY al.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get activity stats
CREATE OR REPLACE FUNCTION get_audit_activity_stats(
  days_back INTEGER DEFAULT 1
)
RETURNS TABLE (
  total_actions BIGINT,
  total_creates BIGINT,
  total_updates BIGINT,
  total_deletes BIGINT,
  unique_users BIGINT,
  most_active_entity TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_actions,
    COUNT(*) FILTER (WHERE action = 'INSERT') as total_creates,
    COUNT(*) FILTER (WHERE action = 'UPDATE') as total_updates,
    COUNT(*) FILTER (WHERE action = 'DELETE') as total_deletes,
    COUNT(DISTINCT user_id) as unique_users,
    (
      SELECT entity
      FROM public.audit_logs
      WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
      GROUP BY entity
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as most_active_entity
  FROM public.audit_logs
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create system health check function
CREATE OR REPLACE FUNCTION system_health_check()
RETURNS TABLE (
  metric TEXT,
  value BIGINT,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'Total Users'::TEXT, COUNT(*)::BIGINT, 'active'::TEXT FROM public.users WHERE deleted_at IS NULL
  UNION ALL
  SELECT 'Total Customers'::TEXT, COUNT(*)::BIGINT, 'active'::TEXT FROM public.customers WHERE deleted_at IS NULL
  UNION ALL
  SELECT 'Total Allocations'::TEXT, COUNT(*)::BIGINT, 'active'::TEXT FROM public.allocations WHERE deleted_at IS NULL
  UNION ALL
  SELECT 'Total Payments'::TEXT, COUNT(*)::BIGINT, 'active'::TEXT FROM public.payments WHERE deleted_at IS NULL
  UNION ALL
  SELECT 'Pending Payments'::TEXT, COUNT(*)::BIGINT, 
    CASE WHEN COUNT(*) > 0 THEN 'warning'::TEXT ELSE 'good'::TEXT END
  FROM public.allocations 
  WHERE status = 'active' AND balance_due > 0 AND deleted_at IS NULL
  UNION ALL
  SELECT 'Audit Logs (30d)'::TEXT, COUNT(*)::BIGINT, 'tracked'::TEXT
  FROM public.audit_logs
  WHERE created_at >= NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_audit_log TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_audit_activity TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_activity_stats TO authenticated;
GRANT EXECUTE ON FUNCTION system_health_check TO authenticated;

-- Comment the functions
COMMENT ON FUNCTION create_audit_log IS 'Manually create an audit log entry from edge functions or application code';
COMMENT ON FUNCTION get_recent_audit_activity IS 'Get the most recent audit activity for the activity feed';
COMMENT ON FUNCTION get_audit_activity_stats IS 'Get statistics about system activity for dashboard cards';
COMMENT ON FUNCTION system_health_check IS 'Get overall system health metrics';
