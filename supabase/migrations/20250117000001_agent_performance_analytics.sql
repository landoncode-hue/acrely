-- Migration: Agent Performance Analytics Integration
-- Description: Extend billing summary and add performance scoring
-- Author: Kennedy — Landon Digital
-- Version: 2.3.0

-- ============================================================================
-- 1. Create agent_daily_performance table for time-series tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_daily_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    performance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Daily Scores (0-100)
    activity_score DECIMAL(5,2) DEFAULT 0 CHECK (activity_score >= 0 AND activity_score <= 100),
    success_score DECIMAL(5,2) DEFAULT 0 CHECK (success_score >= 0 AND success_score <= 100),
    revenue_score DECIMAL(5,2) DEFAULT 0 CHECK (revenue_score >= 0 AND revenue_score <= 100),
    overall_score DECIMAL(5,2) DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
    
    -- Rank (1 = best)
    daily_rank INTEGER,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_agent_performance_date UNIQUE (agent_id, performance_date)
);

-- Create indexes
CREATE INDEX idx_agent_daily_performance_agent_id ON public.agent_daily_performance(agent_id);
CREATE INDEX idx_agent_daily_performance_date ON public.agent_daily_performance(performance_date DESC);
CREATE INDEX idx_agent_daily_performance_overall_score ON public.agent_daily_performance(overall_score DESC);

-- Enable RLS
ALTER TABLE public.agent_daily_performance ENABLE ROW LEVEL SECURITY;

-- Agents can view their own performance
CREATE POLICY "agents_view_own_performance"
ON public.agent_daily_performance
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

-- Only system can insert/update (via triggers)
CREATE POLICY "system_manage_performance"
ON public.agent_daily_performance
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role = 'sysadmin'
    )
);

-- ============================================================================
-- 2. Create function to calculate agent performance scores
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_agent_performance_score(
    p_agent_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    activity_score DECIMAL,
    success_score DECIMAL,
    revenue_score DECIMAL,
    overall_score DECIMAL,
    rank INTEGER
) AS $$
DECLARE
    v_total_visits INTEGER;
    v_successful_visits INTEGER;
    v_payments_collected DECIMAL;
    v_leads_generated INTEGER;
    
    -- Benchmarks (can be adjusted based on company standards)
    v_visits_benchmark INTEGER := 10; -- Expected visits per day
    v_success_benchmark DECIMAL := 0.70; -- 70% success rate
    v_revenue_benchmark DECIMAL := 50000.00; -- Daily revenue target
    
    v_activity_score DECIMAL;
    v_success_score DECIMAL;
    v_revenue_score DECIMAL;
    v_overall_score DECIMAL;
    v_agent_rank INTEGER;
BEGIN
    -- Get agent's daily metrics
    SELECT 
        COALESCE(total_visits, 0),
        COALESCE(successful_visits, 0),
        COALESCE(payments_collected, 0.00),
        COALESCE(leads_generated, 0)
    INTO 
        v_total_visits,
        v_successful_visits,
        v_payments_collected,
        v_leads_generated
    FROM public.field_reports
    WHERE agent_id = p_agent_id
    AND report_date = p_date
    AND status = 'approved';
    
    -- Calculate Activity Score (based on visits and leads)
    v_activity_score := LEAST(100, (
        (v_total_visits::DECIMAL / v_visits_benchmark::DECIMAL * 60) +
        (v_leads_generated::DECIMAL / 5 * 40) -- 5 leads per day = 40 points
    ));
    
    -- Calculate Success Score (based on success rate)
    IF v_total_visits > 0 THEN
        v_success_score := LEAST(100, (
            (v_successful_visits::DECIMAL / v_total_visits::DECIMAL) / v_success_benchmark * 100
        ));
    ELSE
        v_success_score := 0;
    END IF;
    
    -- Calculate Revenue Score (based on payments collected)
    v_revenue_score := LEAST(100, (
        v_payments_collected / v_revenue_benchmark * 100
    ));
    
    -- Calculate Overall Score (weighted average)
    v_overall_score := ROUND(
        (v_activity_score * 0.30) + 
        (v_success_score * 0.30) + 
        (v_revenue_score * 0.40),
        2
    );
    
    -- Calculate rank for the day
    SELECT COUNT(*) + 1 INTO v_agent_rank
    FROM public.agent_daily_performance
    WHERE performance_date = p_date
    AND overall_score > v_overall_score;
    
    -- Return scores
    RETURN QUERY SELECT 
        v_activity_score,
        v_success_score,
        v_revenue_score,
        v_overall_score,
        v_agent_rank;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. Create trigger function to auto-calculate performance
-- ============================================================================

CREATE OR REPLACE FUNCTION update_agent_performance_on_report()
RETURNS TRIGGER AS $$
DECLARE
    v_scores RECORD;
BEGIN
    -- Only process approved reports
    IF (TG_OP = 'INSERT' AND NEW.status = 'approved') OR 
       (TG_OP = 'UPDATE' AND NEW.status = 'approved' AND OLD.status != 'approved') THEN
        
        -- Calculate performance scores
        SELECT * INTO v_scores
        FROM calculate_agent_performance_score(NEW.agent_id, NEW.report_date);
        
        -- Upsert into agent_daily_performance
        INSERT INTO public.agent_daily_performance (
            agent_id,
            performance_date,
            activity_score,
            success_score,
            revenue_score,
            overall_score,
            daily_rank
        ) VALUES (
            NEW.agent_id,
            NEW.report_date,
            v_scores.activity_score,
            v_scores.success_score,
            v_scores.revenue_score,
            v_scores.overall_score,
            v_scores.rank
        )
        ON CONFLICT (agent_id, performance_date)
        DO UPDATE SET
            activity_score = v_scores.activity_score,
            success_score = v_scores.success_score,
            revenue_score = v_scores.revenue_score,
            overall_score = v_scores.overall_score,
            daily_rank = v_scores.rank,
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER field_report_performance_update
    AFTER INSERT OR UPDATE ON public.field_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_agent_performance_on_report();

-- ============================================================================
-- 4. Create leaderboard view for top performing agents
-- ============================================================================

CREATE OR REPLACE VIEW public.agent_leaderboard AS
SELECT 
    adp.agent_id,
    u.full_name as agent_name,
    u.email as agent_email,
    adp.performance_date,
    adp.overall_score,
    adp.activity_score,
    adp.success_score,
    adp.revenue_score,
    adp.daily_rank,
    
    -- Get actual metrics from field reports
    fr.total_visits,
    fr.successful_visits,
    fr.payments_collected,
    fr.leads_generated,
    
    -- Badge/tier calculation
    CASE 
        WHEN adp.overall_score >= 90 THEN 'Platinum'
        WHEN adp.overall_score >= 75 THEN 'Gold'
        WHEN adp.overall_score >= 60 THEN 'Silver'
        ELSE 'Bronze'
    END as performance_tier
    
FROM public.agent_daily_performance adp
JOIN public.users u ON adp.agent_id = u.id
LEFT JOIN public.field_reports fr ON fr.agent_id = adp.agent_id AND fr.report_date = adp.performance_date
WHERE u.role = 'agent'
ORDER BY adp.performance_date DESC, adp.overall_score DESC;

-- Enable RLS on view (through base table policies)
-- Agents see only their own, admins see all
CREATE OR REPLACE FUNCTION get_agent_leaderboard(
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
    p_end_date DATE DEFAULT CURRENT_DATE,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    agent_id UUID,
    agent_name TEXT,
    agent_email TEXT,
    performance_date DATE,
    overall_score DECIMAL,
    activity_score DECIMAL,
    success_score DECIMAL,
    revenue_score DECIMAL,
    daily_rank INTEGER,
    total_visits INTEGER,
    successful_visits INTEGER,
    payments_collected DECIMAL,
    leads_generated INTEGER,
    performance_tier TEXT
) AS $$
BEGIN
    -- Check authorization
    IF NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role IN ('sysadmin', 'md', 'ceo', 'agent')
    ) THEN
        RAISE EXCEPTION 'Unauthorized access to leaderboard';
    END IF;
    
    RETURN QUERY
    SELECT * FROM public.agent_leaderboard
    WHERE performance_date BETWEEN p_start_date AND p_end_date
    ORDER BY overall_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. Create notification function for report approval
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_agent_on_report_review()
RETURNS TRIGGER AS $$
BEGIN
    -- Only notify on status change from pending
    IF OLD.status = 'pending' AND NEW.status != 'pending' THEN
        -- Insert notification (assumes notifications table exists)
        INSERT INTO public.notifications (
            user_id,
            title,
            message,
            type,
            reference_id,
            reference_type
        ) VALUES (
            NEW.agent_id,
            CASE 
                WHEN NEW.status = 'approved' THEN '✅ Field Report Approved'
                WHEN NEW.status = 'flagged' THEN '⚠️ Field Report Flagged for Review'
                WHEN NEW.status = 'rejected' THEN '❌ Field Report Rejected'
            END,
            CASE 
                WHEN NEW.status = 'approved' THEN 'Your field report for ' || NEW.report_date || ' has been approved.'
                WHEN NEW.status = 'flagged' THEN 'Your field report needs attention. Review notes: ' || COALESCE(NEW.review_notes, 'No notes provided.')
                WHEN NEW.status = 'rejected' THEN 'Your field report was rejected. Reason: ' || COALESCE(NEW.review_notes, 'No reason provided.')
            END,
            CASE 
                WHEN NEW.status = 'approved' THEN 'success'
                WHEN NEW.status = 'flagged' THEN 'warning'
                WHEN NEW.status = 'rejected' THEN 'error'
            END,
            NEW.id,
            'field_report'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for notifications
CREATE TRIGGER field_report_review_notification
    AFTER UPDATE ON public.field_reports
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION notify_agent_on_report_review();

-- ============================================================================
-- 6. Grant permissions
-- ============================================================================

GRANT SELECT ON public.agent_daily_performance TO authenticated;
GRANT SELECT ON public.agent_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_agent_performance_score TO authenticated;
GRANT EXECUTE ON FUNCTION get_agent_leaderboard TO authenticated;

-- ============================================================================
-- 7. Add comments
-- ============================================================================

COMMENT ON TABLE public.agent_daily_performance IS 'Daily performance scores and rankings for agents';
COMMENT ON FUNCTION calculate_agent_performance_score IS 'Calculates performance scores based on field report metrics';
COMMENT ON FUNCTION get_agent_leaderboard IS 'Returns top performing agents with RLS enforcement';
COMMENT ON VIEW public.agent_leaderboard IS 'Ranked list of agent performance with scores and tiers';
