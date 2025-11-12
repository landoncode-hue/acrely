-- =====================================================
-- Migration: Audit Logs Extended Schema
-- Version: 1.6.0
-- Description: Enhance audit_logs table with role tracking,
--              entity naming, and improved indexing
-- =====================================================

-- Add new columns to audit_logs for better tracking
ALTER TABLE public.audit_logs 
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS entity TEXT,
  ADD COLUMN IF NOT EXISTS entity_id UUID,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Update entity column based on existing table_name
UPDATE public.audit_logs 
SET entity = table_name 
WHERE entity IS NULL;

-- Add composite index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_date 
  ON public.audit_logs(entity, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_role 
  ON public.audit_logs(role);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id 
  ON public.audit_logs(entity_id);

-- Create function to get current user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'unknown');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced audit logging function with role and entity tracking
CREATE OR REPLACE FUNCTION log_audit_entry()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  entity_name TEXT;
  entity_desc TEXT;
BEGIN
  -- Get current user role
  user_role := get_current_user_role();
  
  -- Map table name to entity name
  entity_name := TG_TABLE_NAME;
  
  -- Generate description based on operation
  IF TG_OP = 'INSERT' THEN
    entity_desc := 'Created new ' || entity_name || ' record';
  ELSIF TG_OP = 'UPDATE' THEN
    entity_desc := 'Updated ' || entity_name || ' record';
  ELSIF TG_OP = 'DELETE' THEN
    entity_desc := 'Deleted ' || entity_name || ' record';
  END IF;
  
  -- Insert audit log
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      user_id, 
      role, 
      action, 
      table_name, 
      entity,
      entity_id,
      record_id, 
      old_data,
      description,
      metadata
    )
    VALUES (
      auth.uid(), 
      user_role,
      TG_OP, 
      TG_TABLE_NAME,
      entity_name,
      OLD.id,
      OLD.id, 
      to_jsonb(OLD),
      entity_desc,
      jsonb_build_object('trigger', TG_NAME, 'table', TG_TABLE_NAME)
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (
      user_id, 
      role,
      action, 
      table_name,
      entity,
      entity_id,
      record_id, 
      old_data, 
      new_data,
      description,
      metadata
    )
    VALUES (
      auth.uid(), 
      user_role,
      TG_OP, 
      TG_TABLE_NAME,
      entity_name,
      NEW.id,
      NEW.id, 
      to_jsonb(OLD), 
      to_jsonb(NEW),
      entity_desc,
      jsonb_build_object('trigger', TG_NAME, 'table', TG_TABLE_NAME, 'changed_fields', (
        SELECT jsonb_object_agg(key, value)
        FROM jsonb_each(to_jsonb(NEW))
        WHERE to_jsonb(NEW) -> key IS DISTINCT FROM to_jsonb(OLD) -> key
      ))
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      user_id, 
      role,
      action, 
      table_name,
      entity,
      entity_id,
      record_id, 
      new_data,
      description,
      metadata
    )
    VALUES (
      auth.uid(), 
      user_role,
      TG_OP, 
      TG_TABLE_NAME,
      entity_name,
      NEW.id,
      NEW.id, 
      to_jsonb(NEW),
      entity_desc,
      jsonb_build_object('trigger', TG_NAME, 'table', TG_TABLE_NAME)
    );
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing triggers to use new function
DROP TRIGGER IF EXISTS audit_payments_trigger ON public.payments;
DROP TRIGGER IF EXISTS audit_allocations_trigger ON public.allocations;
DROP TRIGGER IF EXISTS audit_commissions_trigger ON public.commissions;

CREATE TRIGGER audit_payments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

CREATE TRIGGER audit_allocations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.allocations
  FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

CREATE TRIGGER audit_commissions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.commissions
  FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

-- Add audit triggers to additional key tables
CREATE TRIGGER audit_customers_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

CREATE TRIGGER audit_receipts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.receipts
  FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

-- Create view for easier audit log querying
CREATE OR REPLACE VIEW public.audit_logs_view AS
SELECT 
  al.id,
  al.created_at,
  al.user_id,
  u.full_name as user_name,
  u.email as user_email,
  al.role as user_role,
  al.action,
  al.entity,
  al.entity_id,
  al.description,
  al.old_data,
  al.new_data,
  al.metadata,
  al.ip_address
FROM public.audit_logs al
LEFT JOIN public.users u ON al.user_id = u.id
ORDER BY al.created_at DESC;

-- Grant access to view for admin roles
GRANT SELECT ON public.audit_logs_view TO authenticated;

-- Add RLS policy for the view
CREATE POLICY "Admin can view audit logs view" ON public.audit_logs
  FOR SELECT USING (is_admin_level());

-- Create function to export audit logs for a date range
CREATE OR REPLACE FUNCTION get_audit_logs(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW(),
  filter_entity TEXT DEFAULT NULL,
  filter_user_id UUID DEFAULT NULL,
  filter_action TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  user_name TEXT,
  user_email TEXT,
  user_role TEXT,
  action TEXT,
  entity TEXT,
  entity_id UUID,
  description TEXT,
  old_data JSONB,
  new_data JSONB,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.created_at,
    u.full_name,
    u.email,
    al.role,
    al.action,
    al.entity,
    al.entity_id,
    al.description,
    al.old_data,
    al.new_data,
    al.metadata
  FROM public.audit_logs al
  LEFT JOIN public.users u ON al.user_id = u.id
  WHERE 
    al.created_at BETWEEN start_date AND end_date
    AND (filter_entity IS NULL OR al.entity = filter_entity)
    AND (filter_user_id IS NULL OR al.user_id = filter_user_id)
    AND (filter_action IS NULL OR al.action = filter_action)
  ORDER BY al.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment the schema
COMMENT ON TABLE public.audit_logs IS 'System-wide audit log for tracking all data changes';
COMMENT ON COLUMN public.audit_logs.role IS 'User role at the time of the action';
COMMENT ON COLUMN public.audit_logs.entity IS 'Entity type being modified (customers, payments, etc)';
COMMENT ON COLUMN public.audit_logs.entity_id IS 'ID of the entity being modified';
COMMENT ON COLUMN public.audit_logs.description IS 'Human-readable description of the action';
COMMENT ON COLUMN public.audit_logs.metadata IS 'Additional context and changed fields';
