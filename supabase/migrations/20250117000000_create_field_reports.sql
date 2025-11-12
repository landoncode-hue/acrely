-- Migration: Create Field Reports System
-- Description: Enable agents to submit daily field activity reports
-- Author: Kennedy — Landon Digital
-- Version: 2.3.0

-- ============================================================================
-- 1. Create field_reports table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.field_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Activity Metrics
    total_visits INTEGER NOT NULL DEFAULT 0 CHECK (total_visits >= 0),
    successful_visits INTEGER NOT NULL DEFAULT 0 CHECK (successful_visits >= 0 AND successful_visits <= total_visits),
    payments_collected DECIMAL(12,2) NOT NULL DEFAULT 0.00 CHECK (payments_collected >= 0),
    leads_generated INTEGER NOT NULL DEFAULT 0 CHECK (leads_generated >= 0),
    
    -- Report Details
    notes TEXT,
    attachments JSONB DEFAULT '[]'::jsonb, -- Array of file URLs from storage
    
    -- Review Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'flagged', 'rejected')),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_agent_date UNIQUE (agent_id, report_date),
    CONSTRAINT valid_success_rate CHECK (successful_visits <= total_visits)
);

-- Create indexes for performance
CREATE INDEX idx_field_reports_agent_id ON public.field_reports(agent_id);
CREATE INDEX idx_field_reports_date ON public.field_reports(report_date DESC);
CREATE INDEX idx_field_reports_status ON public.field_reports(status);
CREATE INDEX idx_field_reports_reviewed_by ON public.field_reports(reviewed_by);
CREATE INDEX idx_field_reports_created_at ON public.field_reports(created_at DESC);

-- Composite index for common queries
CREATE INDEX idx_field_reports_agent_date_status ON public.field_reports(agent_id, report_date DESC, status);

-- ============================================================================
-- 2. Enable Row Level Security
-- ============================================================================

ALTER TABLE public.field_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Agents can view their own reports
CREATE POLICY "agents_view_own_reports"
ON public.field_reports
FOR SELECT
TO authenticated
USING (
    agent_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role IN ('sysadmin', 'md', 'ceo')
    )
);

-- Policy: Agents can insert their own reports
CREATE POLICY "agents_insert_own_reports"
ON public.field_reports
FOR INSERT
TO authenticated
WITH CHECK (
    agent_id = auth.uid()
    AND
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role = 'agent'
    )
);

-- Policy: Agents can update their own reports (within 24 hours, only if pending)
CREATE POLICY "agents_update_own_reports"
ON public.field_reports
FOR UPDATE
TO authenticated
USING (
    agent_id = auth.uid()
    AND status = 'pending'
    AND created_at > NOW() - INTERVAL '24 hours'
)
WITH CHECK (
    agent_id = auth.uid()
    AND status = 'pending'
);

-- Policy: Admins and MD can update any report (for review)
CREATE POLICY "admins_update_reports"
ON public.field_reports
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role IN ('sysadmin', 'md')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role IN ('sysadmin', 'md')
    )
);

-- Policy: Agents cannot delete reports
-- Only admins can delete if necessary
CREATE POLICY "admins_delete_reports"
ON public.field_reports
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role = 'sysadmin'
    )
);

-- ============================================================================
-- 3. Create updated_at trigger
-- ============================================================================

CREATE TRIGGER set_field_reports_updated_at
    BEFORE UPDATE ON public.field_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. Create audit trigger for field reports
-- ============================================================================

CREATE TRIGGER field_reports_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.field_reports
    FOR EACH ROW
    EXECUTE FUNCTION log_audit();

-- ============================================================================
-- 5. Create agent_performance_summary materialized view
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.agent_performance_summary AS
SELECT 
    fr.agent_id,
    u.full_name as agent_name,
    u.email as agent_email,
    
    -- Current Month Performance
    COUNT(CASE WHEN fr.report_date >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as reports_this_month,
    SUM(CASE WHEN fr.report_date >= DATE_TRUNC('month', CURRENT_DATE) THEN fr.total_visits ELSE 0 END) as visits_this_month,
    SUM(CASE WHEN fr.report_date >= DATE_TRUNC('month', CURRENT_DATE) THEN fr.successful_visits ELSE 0 END) as successful_visits_this_month,
    SUM(CASE WHEN fr.report_date >= DATE_TRUNC('month', CURRENT_DATE) THEN fr.payments_collected ELSE 0 END) as payments_this_month,
    SUM(CASE WHEN fr.report_date >= DATE_TRUNC('month', CURRENT_DATE) THEN fr.leads_generated ELSE 0 END) as leads_this_month,
    
    -- Last 7 Days Performance
    COUNT(CASE WHEN fr.report_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as reports_last_7_days,
    SUM(CASE WHEN fr.report_date >= CURRENT_DATE - INTERVAL '7 days' THEN fr.total_visits ELSE 0 END) as visits_last_7_days,
    SUM(CASE WHEN fr.report_date >= CURRENT_DATE - INTERVAL '7 days' THEN fr.successful_visits ELSE 0 END) as successful_visits_last_7_days,
    SUM(CASE WHEN fr.report_date >= CURRENT_DATE - INTERVAL '7 days' THEN fr.payments_collected ELSE 0 END) as payments_last_7_days,
    
    -- All-Time Performance
    COUNT(*) as total_reports,
    SUM(fr.total_visits) as total_visits,
    SUM(fr.successful_visits) as total_successful_visits,
    SUM(fr.payments_collected) as total_payments_collected,
    SUM(fr.leads_generated) as total_leads_generated,
    
    -- Performance Metrics
    CASE 
        WHEN SUM(fr.total_visits) > 0 
        THEN ROUND((SUM(fr.successful_visits)::DECIMAL / SUM(fr.total_visits)::DECIMAL * 100), 2)
        ELSE 0 
    END as success_rate_percentage,
    
    CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND(SUM(fr.payments_collected) / COUNT(*), 2)
        ELSE 0 
    END as avg_payment_per_report,
    
    -- Status Breakdown
    COUNT(CASE WHEN fr.status = 'approved' THEN 1 END) as approved_reports,
    COUNT(CASE WHEN fr.status = 'pending' THEN 1 END) as pending_reports,
    COUNT(CASE WHEN fr.status = 'flagged' THEN 1 END) as flagged_reports,
    
    -- Timestamps
    MAX(fr.report_date) as last_report_date,
    MIN(fr.report_date) as first_report_date
    
FROM public.field_reports fr
JOIN public.users u ON fr.agent_id = u.id
WHERE u.role = 'agent'
GROUP BY fr.agent_id, u.full_name, u.email;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_agent_performance_summary_agent_id ON public.agent_performance_summary(agent_id);
CREATE INDEX idx_agent_performance_summary_success_rate ON public.agent_performance_summary(success_rate_percentage DESC);
CREATE INDEX idx_agent_performance_summary_payments ON public.agent_performance_summary(payments_this_month DESC);

-- ============================================================================
-- 6. Create function to refresh agent performance summary
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_agent_performance_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- Refresh the materialized view concurrently (non-blocking)
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.agent_performance_summary;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-refresh performance summary
CREATE TRIGGER refresh_performance_summary_after_field_report
    AFTER INSERT OR UPDATE OR DELETE ON public.field_reports
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_agent_performance_summary();

-- ============================================================================
-- 7. Create RLS policies for agent_performance_summary
-- ============================================================================

-- Note: Materialized views don't support RLS directly, so we create a security-definer function
CREATE OR REPLACE FUNCTION get_agent_performance_summary(target_agent_id UUID DEFAULT NULL)
RETURNS TABLE (
    agent_id UUID,
    agent_name TEXT,
    agent_email TEXT,
    reports_this_month BIGINT,
    visits_this_month NUMERIC,
    successful_visits_this_month NUMERIC,
    payments_this_month NUMERIC,
    leads_this_month NUMERIC,
    reports_last_7_days BIGINT,
    visits_last_7_days NUMERIC,
    successful_visits_last_7_days NUMERIC,
    payments_last_7_days NUMERIC,
    total_reports BIGINT,
    total_visits NUMERIC,
    total_successful_visits NUMERIC,
    total_payments_collected NUMERIC,
    total_leads_generated NUMERIC,
    success_rate_percentage NUMERIC,
    avg_payment_per_report NUMERIC,
    approved_reports BIGINT,
    pending_reports BIGINT,
    flagged_reports BIGINT,
    last_report_date DATE,
    first_report_date DATE
) AS $$
BEGIN
    -- Check if user is authorized
    IF NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND (role IN ('sysadmin', 'md', 'ceo') OR id = target_agent_id)
    ) THEN
        RAISE EXCEPTION 'Unauthorized access to performance summary';
    END IF;
    
    -- Return filtered results
    RETURN QUERY
    SELECT * FROM public.agent_performance_summary
    WHERE target_agent_id IS NULL OR public.agent_performance_summary.agent_id = target_agent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. Grant necessary permissions
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON public.field_reports TO authenticated;
GRANT SELECT ON public.agent_performance_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_agent_performance_summary TO authenticated;

-- ============================================================================
-- 9. Add comments for documentation
-- ============================================================================

COMMENT ON TABLE public.field_reports IS 'Daily field activity reports submitted by agents';
COMMENT ON COLUMN public.field_reports.agent_id IS 'Reference to the agent who submitted the report';
COMMENT ON COLUMN public.field_reports.report_date IS 'Date of the field activities (defaults to today)';
COMMENT ON COLUMN public.field_reports.total_visits IS 'Total number of customer visits made';
COMMENT ON COLUMN public.field_reports.successful_visits IS 'Number of successful visits (customer engaged)';
COMMENT ON COLUMN public.field_reports.payments_collected IS 'Total amount of payments collected during visits';
COMMENT ON COLUMN public.field_reports.leads_generated IS 'Number of new leads generated';
COMMENT ON COLUMN public.field_reports.status IS 'Review status: pending, approved, flagged, rejected';
COMMENT ON COLUMN public.field_reports.reviewed_by IS 'Admin/MD who reviewed the report';
COMMENT ON COLUMN public.field_reports.attachments IS 'JSONB array of attachment file URLs from storage';

COMMENT ON MATERIALIZED VIEW public.agent_performance_summary IS 'Aggregated performance metrics for all agents';
COMMENT ON FUNCTION get_agent_performance_summary IS 'Security-definer function to retrieve agent performance with RLS enforcement';
