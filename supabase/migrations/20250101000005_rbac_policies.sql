-- Enhanced Role-Based Access Control (RBAC) for Acrely v2
-- Roles: CEO, MD, SysAdmin, Frontdesk, Agent

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is admin level
CREATE OR REPLACE FUNCTION is_admin_level()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('CEO', 'MD', 'SysAdmin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is management level
CREATE OR REPLACE FUNCTION is_management_level()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('CEO', 'MD', 'SysAdmin', 'Frontdesk')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Drop existing policies that conflict
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete customers" ON public.customers;
DROP POLICY IF EXISTS "Admins and managers can manage plots" ON public.plots;
DROP POLICY IF EXISTS "Admins can delete allocations" ON public.allocations;
DROP POLICY IF EXISTS "Admins and managers can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admins and managers can update commissions" ON public.commissions;
DROP POLICY IF EXISTS "Admins can delete inspections" ON public.inspection_schedules;
DROP POLICY IF EXISTS "Admins and managers can manage campaigns" ON public.sms_campaigns;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;

-- Enhanced Users policies
CREATE POLICY "Admin level can manage users" ON public.users
  FOR ALL USING (is_admin_level());

-- Enhanced Customers policies
CREATE POLICY "Admin level can delete customers" ON public.customers
  FOR DELETE USING (is_admin_level());

-- Enhanced Plots policies
CREATE POLICY "Management level can manage plots" ON public.plots
  FOR ALL USING (is_management_level());

-- Enhanced Allocations policies
CREATE POLICY "Admin level can delete allocations" ON public.allocations
  FOR DELETE USING (is_admin_level());

-- Agents can view their own allocations
CREATE POLICY "Agents view own allocations" ON public.allocations
  FOR SELECT USING (
    agent_id = auth.uid() OR is_management_level()
  );

-- Enhanced Payments policies
CREATE POLICY "Management level can update payments" ON public.payments
  FOR UPDATE USING (is_management_level());

-- Enhanced Commissions policies
CREATE POLICY "Management level can update commissions" ON public.commissions
  FOR UPDATE USING (is_management_level());

-- Enhanced Inspection schedules policies
CREATE POLICY "Admin level can delete inspections" ON public.inspection_schedules
  FOR DELETE USING (is_admin_level());

-- Enhanced SMS campaigns policies
CREATE POLICY "Management level can manage campaigns" ON public.sms_campaigns
  FOR ALL USING (is_management_level());

-- Enhanced Settings policies
CREATE POLICY "Admin level can manage settings" ON public.settings
  FOR ALL USING (is_admin_level());

-- Frontdesk specific policies
CREATE POLICY "Frontdesk can create customers" ON public.customers
  FOR INSERT WITH CHECK (
    current_user_role() = 'Frontdesk' OR is_admin_level()
  );

CREATE POLICY "Frontdesk can create allocations" ON public.allocations
  FOR INSERT WITH CHECK (
    current_user_role() IN ('Frontdesk', 'Agent') OR is_admin_level()
  );

CREATE POLICY "Frontdesk can record payments" ON public.payments
  FOR INSERT WITH CHECK (
    current_user_role() = 'Frontdesk' OR is_management_level()
  );

-- Agent specific policies
CREATE POLICY "Agents can view own customers" ON public.customers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.allocations
      WHERE allocations.customer_id = customers.id
      AND allocations.agent_id = auth.uid()
    ) OR is_management_level()
  );

-- Leads policies for Agents
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
CREATE POLICY "Users can view assigned or unassigned leads" ON public.leads
  FOR SELECT USING (
    assigned_to = auth.uid() OR 
    assigned_to IS NULL OR 
    is_management_level()
  );

CREATE POLICY "Agents can update assigned leads" ON public.leads
  FOR UPDATE USING (
    assigned_to = auth.uid() OR is_management_level()
  );

-- Notification policies
CREATE POLICY "Management can create notifications for all" ON public.notifications
  FOR INSERT WITH CHECK (is_management_level());

-- Audit log table for tracking sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admin level can view audit logs
CREATE POLICY "Admin level can view audit logs" ON public.audit_logs
  FOR SELECT USING (is_admin_level());

-- Function to log sensitive operations
CREATE OR REPLACE FUNCTION log_sensitive_operation()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_payments_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION log_sensitive_operation();

CREATE TRIGGER audit_allocations_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.allocations
FOR EACH ROW EXECUTE FUNCTION log_sensitive_operation();

CREATE TRIGGER audit_commissions_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.commissions
FOR EACH ROW EXECUTE FUNCTION log_sensitive_operation();
