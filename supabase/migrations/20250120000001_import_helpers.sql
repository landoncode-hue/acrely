-- Helper functions for importing legacy data
-- These run with SECURITY DEFINER to bypass RLS

CREATE OR REPLACE FUNCTION import_customer(
  p_full_name TEXT,
  p_phone TEXT,
  p_address TEXT,
  p_created_at TIMESTAMPTZ
) RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_customer_id UUID;
BEGIN
  -- Check if customer exists
  SELECT id INTO v_customer_id
  FROM customers
  WHERE phone = p_phone
  LIMIT 1;
  
  IF v_customer_id IS NULL THEN
    -- Insert new customer
    INSERT INTO customers (full_name, phone, address, created_at)
    VALUES (p_full_name, p_phone, p_address, p_created_at)
    RETURNING id INTO v_customer_id;
  END IF;
  
  RETURN v_customer_id;
END;
$$;

CREATE OR REPLACE FUNCTION import_plot(
  p_plot_number TEXT,
  p_estate_name TEXT,
  p_estate_code TEXT,
  p_size_sqm NUMERIC,
  p_price NUMERIC,
  p_status TEXT
) RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_plot_id UUID;
BEGIN
  -- Check if plot exists
  SELECT id INTO v_plot_id
  FROM plots
  WHERE estate_code = p_estate_code AND plot_number = p_plot_number
  LIMIT 1;
  
  IF v_plot_id IS NULL THEN
    -- Insert new plot
    INSERT INTO plots (plot_number, estate_name, estate_code, size_sqm, price, status)
    VALUES (p_plot_number, p_estate_name, p_estate_code, p_size_sqm, p_price, p_status)
    RETURNING id INTO v_plot_id;
  END IF;
  
  RETURN v_plot_id;
END;
$$;

CREATE OR REPLACE FUNCTION import_allocation(
  p_customer_id UUID,
  p_plot_id UUID,
  p_allocation_date DATE,
  p_total_amount NUMERIC,
  p_amount_paid NUMERIC,
  p_payment_plan TEXT,
  p_status TEXT
) RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_allocation_id UUID;
BEGIN
  -- Check if allocation exists
  SELECT id INTO v_allocation_id
  FROM allocations
  WHERE customer_id = p_customer_id AND plot_id = p_plot_id
  LIMIT 1;
  
  IF v_allocation_id IS NULL THEN
    -- Insert new allocation
    INSERT INTO allocations (
      customer_id,
      plot_id,
      allocation_date,
      total_amount,
      amount_paid,
      payment_plan,
      status
    )
    VALUES (
      p_customer_id,
      p_plot_id,
      p_allocation_date,
      p_total_amount,
      p_amount_paid,
      p_payment_plan,
      p_status
    )
    RETURNING id INTO v_allocation_id;
  END IF;
  
  RETURN v_allocation_id;
END;
$$;

-- Grant execute permissions to service role
GRANT EXECUTE ON FUNCTION import_customer TO service_role;
GRANT EXECUTE ON FUNCTION import_plot TO service_role;
GRANT EXECUTE ON FUNCTION import_allocation TO service_role;
