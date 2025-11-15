-- Add service role policies to allow backend queries to work
-- Service role should bypass RLS but we need explicit policies for safety

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Service role full access" ON public.customers;
DROP POLICY IF EXISTS "Service role full access" ON public.plots;
DROP POLICY IF EXISTS "Service role full access" ON public.allocations;
DROP POLICY IF EXISTS "Service role full access" ON public.payments;
DROP POLICY IF EXISTS "Service role full access" ON public.commissions;
DROP POLICY IF EXISTS "Service role full access" ON public.estates;
DROP POLICY IF EXISTS "Service role full access" ON public.leads;
DROP POLICY IF EXISTS "Service role full access" ON public.call_logs;
DROP POLICY IF EXISTS "Service role full access" ON public.sms_campaigns;
DROP POLICY IF EXISTS "Service role full access" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can read customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can read plots" ON public.plots;
DROP POLICY IF EXISTS "Authenticated users can read allocations" ON public.allocations;
DROP POLICY IF EXISTS "Authenticated users can read payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can read commissions" ON public.commissions;
DROP POLICY IF EXISTS "Authenticated users can read estates" ON public.estates;

-- Service role full access to all tables
CREATE POLICY "Service role full access" ON public.customers
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON public.plots
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON public.allocations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON public.payments
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON public.commissions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON public.estates
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON public.leads
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON public.call_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON public.sms_campaigns
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON public.users
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated users can read all data (dashboard needs this)
CREATE POLICY "Authenticated users can read customers" ON public.customers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read plots" ON public.plots
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read allocations" ON public.allocations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read payments" ON public.payments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read commissions" ON public.commissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read estates" ON public.estates
  FOR SELECT TO authenticated USING (true);
