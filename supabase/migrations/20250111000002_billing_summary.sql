-- Billing Summary Table
CREATE TABLE IF NOT EXISTS public.billing_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL,
  estate_code TEXT NOT NULL,
  estate_name TEXT NOT NULL,
  total_allocations INTEGER DEFAULT 0,
  total_payments INTEGER DEFAULT 0,
  total_amount_collected NUMERIC DEFAULT 0,
  outstanding_balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(month, estate_code)
);

CREATE INDEX idx_billing_summary_month ON public.billing_summary(month);
CREATE INDEX idx_billing_summary_estate ON public.billing_summary(estate_code);
