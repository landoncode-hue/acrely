-- =====================================================
-- Analytics Suite: Unified Database Views
-- Created: 2025-01-18
-- Purpose: Aggregate data for executive analytics dashboard
-- =====================================================

-- Estate Performance Summary View
-- Aggregates revenue, payment metrics, and customer counts per estate
CREATE OR REPLACE VIEW estate_performance_summary AS
SELECT 
    e.estate_id,
    e.estate_name,
    e.estate_location,
    
    -- Revenue Metrics
    COALESCE(SUM(p.amount), 0) AS total_revenue,
    COALESCE(AVG(p.amount), 0) AS avg_payment_amount,
    COUNT(DISTINCT p.payment_id) AS total_payments,
    
    -- Customer Metrics
    COUNT(DISTINCT c.customer_id) AS total_customers,
    COUNT(DISTINCT CASE WHEN c.status = 'Active' THEN c.customer_id END) AS active_customers,
    
    -- Allocation Metrics
    COUNT(DISTINCT a.allocation_id) AS total_allocations,
    COUNT(DISTINCT CASE WHEN a.status = 'Active' THEN a.allocation_id END) AS active_allocations,
    
    -- Growth Rate (Last 30 days vs Previous 30 days)
    COALESCE(
        (SUM(CASE WHEN p.payment_date >= CURRENT_DATE - INTERVAL '30 days' THEN p.amount ELSE 0 END) - 
         SUM(CASE WHEN p.payment_date >= CURRENT_DATE - INTERVAL '60 days' 
                   AND p.payment_date < CURRENT_DATE - INTERVAL '30 days' 
                   THEN p.amount ELSE 0 END)) /
        NULLIF(SUM(CASE WHEN p.payment_date >= CURRENT_DATE - INTERVAL '60 days' 
                        AND p.payment_date < CURRENT_DATE - INTERVAL '30 days' 
                        THEN p.amount ELSE 0 END), 0) * 100,
        0
    ) AS growth_rate_30d,
    
    -- Conversion Rate (Customers with payments / Total customers)
    CASE 
        WHEN COUNT(DISTINCT c.customer_id) > 0 
        THEN (COUNT(DISTINCT CASE WHEN p.payment_id IS NOT NULL THEN c.customer_id END)::DECIMAL / 
              COUNT(DISTINCT c.customer_id)::DECIMAL) * 100
        ELSE 0
    END AS conversion_rate,
    
    -- Revenue Share (% of total company revenue)
    0 AS revenue_share_percent,  -- Will be calculated in application layer
    
    -- Time-based metrics
    MIN(p.payment_date) AS first_payment_date,
    MAX(p.payment_date) AS last_payment_date,
    
    -- Summary timestamp
    NOW() AS calculated_at

FROM estates e
LEFT JOIN customers c ON c.estate_id = e.estate_id
LEFT JOIN allocations a ON a.customer_id = c.customer_id
LEFT JOIN payments p ON p.allocation_id = a.allocation_id

GROUP BY e.estate_id, e.estate_name, e.estate_location
ORDER BY total_revenue DESC;


-- Agent Performance Summary View
-- Aggregates agent activities, commissions, and field report metrics
CREATE OR REPLACE VIEW agent_performance_summary AS
SELECT 
    u.user_id AS agent_id,
    p.full_name AS agent_name,
    p.phone_number AS agent_phone,
    
    -- Commission Metrics
    COALESCE(SUM(com.commission_amount), 0) AS total_commissions,
    COALESCE(SUM(CASE WHEN com.status = 'Approved' THEN com.commission_amount ELSE 0 END), 0) AS approved_commissions,
    COALESCE(SUM(CASE WHEN com.status = 'Pending' THEN com.commission_amount ELSE 0 END), 0) AS pending_commissions,
    COUNT(DISTINCT com.commission_id) AS total_commission_records,
    
    -- Payment Collection Metrics
    COUNT(DISTINCT pay.payment_id) AS payments_collected,
    COALESCE(SUM(pay.amount), 0) AS total_payments_amount,
    COALESCE(AVG(pay.amount), 0) AS avg_payment_amount,
    
    -- Customer Relationship Metrics
    COUNT(DISTINCT cust.customer_id) AS customers_managed,
    COUNT(DISTINCT CASE WHEN cust.status = 'Active' THEN cust.customer_id END) AS active_customers,
    
    -- Field Report Metrics
    COUNT(DISTINCT fr.report_id) AS total_field_reports,
    COUNT(DISTINCT CASE WHEN fr.report_date >= CURRENT_DATE - INTERVAL '30 days' 
                        THEN fr.report_id END) AS reports_last_30d,
    COALESCE(AVG(fr.rating), 0) AS avg_report_rating,
    
    -- Activity Metrics
    MAX(pay.payment_date) AS last_payment_date,
    MAX(fr.report_date) AS last_report_date,
    
    -- Performance Score (0-100)
    -- Formula: (Payments + Reports + Commissions normalized)
    LEAST(100, 
        (COUNT(DISTINCT pay.payment_id) * 2 + 
         COUNT(DISTINCT fr.report_id) * 3 + 
         COUNT(DISTINCT com.commission_id) * 5)
    ) AS performance_score,
    
    -- Conversion Rate
    CASE 
        WHEN COUNT(DISTINCT cust.customer_id) > 0 
        THEN (COUNT(DISTINCT CASE WHEN pay.payment_id IS NOT NULL THEN cust.customer_id END)::DECIMAL / 
              COUNT(DISTINCT cust.customer_id)::DECIMAL) * 100
        ELSE 0
    END AS customer_conversion_rate,
    
    -- Summary timestamp
    NOW() AS calculated_at

FROM users u
INNER JOIN profiles p ON p.user_id = u.user_id
LEFT JOIN customers cust ON cust.assigned_agent_id = u.user_id
LEFT JOIN allocations alloc ON alloc.customer_id = cust.customer_id
LEFT JOIN payments pay ON pay.allocation_id = alloc.allocation_id
LEFT JOIN commissions com ON com.agent_id = u.user_id
LEFT JOIN field_reports fr ON fr.agent_id = u.user_id

WHERE u.role IN ('Agent', 'Manager')

GROUP BY u.user_id, p.full_name, p.phone_number
ORDER BY performance_score DESC, total_commissions DESC;


-- Revenue Trends Summary View
-- Monthly aggregated revenue with growth calculations
CREATE OR REPLACE VIEW revenue_trends_summary AS
SELECT 
    DATE_TRUNC('month', p.payment_date) AS month,
    EXTRACT(YEAR FROM p.payment_date) AS year,
    EXTRACT(MONTH FROM p.payment_date) AS month_number,
    
    -- Revenue Metrics
    COALESCE(SUM(p.amount), 0) AS total_revenue,
    COALESCE(AVG(p.amount), 0) AS avg_payment_amount,
    COUNT(p.payment_id) AS payment_count,
    COUNT(DISTINCT p.allocation_id) AS unique_allocations,
    
    -- Customer Metrics
    COUNT(DISTINCT c.customer_id) AS unique_customers,
    COUNT(DISTINCT c.estate_id) AS estates_with_activity,
    
    -- Payment Method Distribution
    COUNT(CASE WHEN p.payment_method = 'Cash' THEN 1 END) AS cash_payments,
    COUNT(CASE WHEN p.payment_method = 'Bank Transfer' THEN 1 END) AS bank_transfer_payments,
    COUNT(CASE WHEN p.payment_method = 'Card' THEN 1 END) AS card_payments,
    
    -- Growth Metrics (Month-over-Month)
    LAG(COALESCE(SUM(p.amount), 0)) OVER (ORDER BY DATE_TRUNC('month', p.payment_date)) AS prev_month_revenue,
    
    (COALESCE(SUM(p.amount), 0) - 
     LAG(COALESCE(SUM(p.amount), 0)) OVER (ORDER BY DATE_TRUNC('month', p.payment_date))) /
    NULLIF(LAG(COALESCE(SUM(p.amount), 0)) OVER (ORDER BY DATE_TRUNC('month', p.payment_date)), 0) * 100 
    AS mom_growth_rate,
    
    -- Summary timestamp
    NOW() AS calculated_at

FROM payments p
LEFT JOIN allocations a ON a.allocation_id = p.allocation_id
LEFT JOIN customers c ON c.customer_id = a.customer_id

WHERE p.payment_date IS NOT NULL

GROUP BY DATE_TRUNC('month', p.payment_date)
ORDER BY month DESC;


-- Customer Engagement Summary View
-- Tracks customer activity and payment patterns
CREATE OR REPLACE VIEW customer_engagement_summary AS
SELECT 
    e.estate_id,
    e.estate_name,
    
    -- Customer Segmentation
    COUNT(DISTINCT c.customer_id) AS total_customers,
    COUNT(DISTINCT CASE WHEN c.status = 'Active' THEN c.customer_id END) AS active_customers,
    COUNT(DISTINCT CASE WHEN c.status = 'Inactive' THEN c.customer_id END) AS inactive_customers,
    
    -- Payment Activity
    COUNT(DISTINCT CASE 
        WHEN p.payment_date >= CURRENT_DATE - INTERVAL '30 days' 
        THEN c.customer_id 
    END) AS customers_paid_30d,
    
    COUNT(DISTINCT CASE 
        WHEN p.payment_date >= CURRENT_DATE - INTERVAL '90 days' 
        THEN c.customer_id 
    END) AS customers_paid_90d,
    
    -- Engagement Rate (% of customers with recent payments)
    CASE 
        WHEN COUNT(DISTINCT c.customer_id) > 0 
        THEN (COUNT(DISTINCT CASE 
                WHEN p.payment_date >= CURRENT_DATE - INTERVAL '30 days' 
                THEN c.customer_id 
            END)::DECIMAL / COUNT(DISTINCT c.customer_id)::DECIMAL) * 100
        ELSE 0
    END AS engagement_rate_30d,
    
    -- Average payments per customer
    CASE 
        WHEN COUNT(DISTINCT c.customer_id) > 0 
        THEN COUNT(p.payment_id)::DECIMAL / COUNT(DISTINCT c.customer_id)::DECIMAL
        ELSE 0
    END AS avg_payments_per_customer,
    
    -- Revenue per customer
    CASE 
        WHEN COUNT(DISTINCT c.customer_id) > 0 
        THEN COALESCE(SUM(p.amount), 0) / COUNT(DISTINCT c.customer_id)::DECIMAL
        ELSE 0
    END AS revenue_per_customer,
    
    -- Churn indicators (customers with no payment in last 90 days)
    COUNT(DISTINCT CASE 
        WHEN c.status = 'Active' 
        AND (p.payment_date IS NULL OR p.payment_date < CURRENT_DATE - INTERVAL '90 days')
        THEN c.customer_id 
    END) AS at_risk_customers,
    
    -- Summary timestamp
    NOW() AS calculated_at

FROM estates e
LEFT JOIN customers c ON c.estate_id = e.estate_id
LEFT JOIN allocations a ON a.customer_id = c.customer_id
LEFT JOIN payments p ON p.allocation_id = a.allocation_id

GROUP BY e.estate_id, e.estate_name
ORDER BY total_customers DESC;


-- Grant access to authenticated users
GRANT SELECT ON estate_performance_summary TO authenticated;
GRANT SELECT ON agent_performance_summary TO authenticated;
GRANT SELECT ON revenue_trends_summary TO authenticated;
GRANT SELECT ON customer_engagement_summary TO authenticated;

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_allocation ON payments(allocation_id);
CREATE INDEX IF NOT EXISTS idx_field_reports_date ON field_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_field_reports_agent ON field_reports(agent_id);
CREATE INDEX IF NOT EXISTS idx_commissions_agent ON commissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);

COMMENT ON VIEW estate_performance_summary IS 'Aggregated estate performance metrics including revenue, customers, and growth rates';
COMMENT ON VIEW agent_performance_summary IS 'Agent performance metrics including commissions, payments, and field reports';
COMMENT ON VIEW revenue_trends_summary IS 'Monthly revenue trends with growth calculations';
COMMENT ON VIEW customer_engagement_summary IS 'Customer engagement and activity metrics by estate';
