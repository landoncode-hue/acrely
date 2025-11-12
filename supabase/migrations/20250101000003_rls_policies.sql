-- Row Level Security (RLS) Policies for Single-Tenant Setup
-- Since this is single-tenant for Pinnacle Builders, RLS ensures data security at the database level

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON public.users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Customers policies
CREATE POLICY "Authenticated users can view customers" ON public.customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create customers" ON public.customers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update customers" ON public.customers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete customers" ON public.customers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Plots policies
CREATE POLICY "Everyone can view available plots" ON public.plots
  FOR SELECT USING (true);

CREATE POLICY "Admins and managers can manage plots" ON public.plots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Allocations policies
CREATE POLICY "Users can view allocations" ON public.allocations
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      agent_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "Authenticated users can create allocations" ON public.allocations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update relevant allocations" ON public.allocations
  FOR UPDATE USING (
    agent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete allocations" ON public.allocations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Payments policies
CREATE POLICY "Users can view payments" ON public.payments
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      EXISTS (
        SELECT 1 FROM public.allocations
        WHERE allocations.id = allocation_id
        AND (allocations.agent_id = auth.uid() OR
             EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'manager')))
      )
    )
  );

CREATE POLICY "Authenticated users can create payments" ON public.payments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins and managers can update payments" ON public.payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Commissions policies
CREATE POLICY "Agents can view own commissions" ON public.commissions
  FOR SELECT USING (
    agent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "System can create commissions" ON public.commissions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins and managers can update commissions" ON public.commissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Inspection schedules policies
CREATE POLICY "Authenticated users can view inspections" ON public.inspection_schedules
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create inspections" ON public.inspection_schedules
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update inspections" ON public.inspection_schedules
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete inspections" ON public.inspection_schedules
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (user_id = auth.uid());

-- Leads policies
CREATE POLICY "Authenticated users can view leads" ON public.leads
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      assigned_to = auth.uid() OR
      assigned_to IS NULL OR
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "Authenticated users can create leads" ON public.leads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update leads" ON public.leads
  FOR UPDATE USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Call logs policies
CREATE POLICY "Authenticated users can view call logs" ON public.call_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create call logs" ON public.call_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- SMS campaigns policies
CREATE POLICY "Authenticated users can view campaigns" ON public.sms_campaigns
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and managers can manage campaigns" ON public.sms_campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Campaign recipients policies
CREATE POLICY "Authenticated users can view recipients" ON public.campaign_recipients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage recipients" ON public.campaign_recipients
  FOR ALL USING (auth.role() = 'authenticated');

-- Settings policies
CREATE POLICY "Authenticated users can view settings" ON public.settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage settings" ON public.settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
