-- Pinnacle Builders Homes & Properties - Official Estates Seed Data
-- This file contains the 8 exclusive estates managed by Pinnacle Builders
-- DO NOT MODIFY without authorization from management

-- ============================================================================
-- Pinnacle Builders Estate Portfolio
-- ============================================================================

-- Clear existing plot data (if any)
DELETE FROM public.plots WHERE estate_code IN (
  'CODE', 'SHE', 'OHE', 'EGPE', 'NEWE', 'OPGE', 'HODE', 'SUPE'
);

-- ============================================================================
-- ESTATE 1: City of David Estate (CODE)
-- ============================================================================
INSERT INTO public.plots (plot_number, estate_name, estate_code, size_sqm, price, status, location_description)
VALUES
  ('001', 'City of David Estate', 'CODE', 500, 3000000, 'available', 'Prime corner plot with road access'),
  ('002', 'City of David Estate', 'CODE', 500, 3000000, 'available', 'Interior plot with drainage'),
  ('003', 'City of David Estate', 'CODE', 500, 3000000, 'available', 'Near estate entrance'),
  ('004', 'City of David Estate', 'CODE', 600, 3500000, 'available', 'Large corner plot'),
  ('005', 'City of David Estate', 'CODE', 500, 3000000, 'available', 'Standard residential plot');

-- ============================================================================
-- ESTATE 2: Soar High Estate (SHE)
-- ============================================================================
INSERT INTO public.plots (plot_number, estate_name, estate_code, size_sqm, price, status, location_description)
VALUES
  ('001', 'Soar High Estate', 'SHE', 450, 2800000, 'available', 'Well-positioned corner plot'),
  ('002', 'Soar High Estate', 'SHE', 450, 2800000, 'available', 'Standard plot with good drainage'),
  ('003', 'Soar High Estate', 'SHE', 450, 2800000, 'available', 'Interior plot'),
  ('004', 'Soar High Estate', 'SHE', 500, 3200000, 'available', 'Premium size plot'),
  ('005', 'Soar High Estate', 'SHE', 450, 2800000, 'available', 'Near recreational area');

-- ============================================================================
-- ESTATE 3: Oduwa Housing Estate (OHE)
-- ============================================================================
INSERT INTO public.plots (plot_number, estate_name, estate_code, size_sqm, price, status, location_description)
VALUES
  ('001', 'Oduwa Housing Estate', 'OHE', 550, 3300000, 'available', 'Premium corner plot'),
  ('002', 'Oduwa Housing Estate', 'OHE', 500, 3000000, 'available', 'Standard residential plot'),
  ('003', 'Oduwa Housing Estate', 'OHE', 500, 3000000, 'available', 'Interior location'),
  ('004', 'Oduwa Housing Estate', 'OHE', 600, 3800000, 'available', 'Extra-large plot'),
  ('005', 'Oduwa Housing Estate', 'OHE', 500, 3000000, 'available', 'Near main road');

-- ============================================================================
-- ESTATE 4: Ehi Green Park Estate (EGPE)
-- ============================================================================
INSERT INTO public.plots (plot_number, estate_name, estate_code, size_sqm, price, status, location_description)
VALUES
  ('001', 'Ehi Green Park Estate', 'EGPE', 500, 3100000, 'available', 'Corner plot near park'),
  ('002', 'Ehi Green Park Estate', 'EGPE', 500, 3100000, 'available', 'Standard plot with greenery'),
  ('003', 'Ehi Green Park Estate', 'EGPE', 500, 3100000, 'available', 'Interior plot'),
  ('004', 'Ehi Green Park Estate', 'EGPE', 550, 3400000, 'available', 'Premium plot facing park'),
  ('005', 'Ehi Green Park Estate', 'EGPE', 500, 3100000, 'available', 'Standard residential');

-- ============================================================================
-- ESTATE 5: New Era of Wealth Estate (NEWE)
-- ============================================================================
INSERT INTO public.plots (plot_number, estate_name, estate_code, size_sqm, price, status, location_description)
VALUES
  ('001', 'New Era of Wealth Estate', 'NEWE', 500, 3200000, 'available', 'Prime corner location'),
  ('002', 'New Era of Wealth Estate', 'NEWE', 500, 3200000, 'available', 'Standard interior plot'),
  ('003', 'New Era of Wealth Estate', 'NEWE', 500, 3200000, 'available', 'Well-positioned plot'),
  ('004', 'New Era of Wealth Estate', 'NEWE', 600, 3800000, 'available', 'Extra-large premium plot'),
  ('005', 'New Era of Wealth Estate', 'NEWE', 500, 3200000, 'available', 'Standard residential');

-- ============================================================================
-- ESTATE 6: Ose Perfection Garden Estate (OPGE)
-- ============================================================================
INSERT INTO public.plots (plot_number, estate_name, estate_code, size_sqm, price, status, location_description)
VALUES
  ('001', 'Ose Perfection Garden Estate', 'OPGE', 500, 3000000, 'available', 'Corner plot with garden view'),
  ('002', 'Ose Perfection Garden Estate', 'OPGE', 500, 3000000, 'available', 'Standard residential plot'),
  ('003', 'Ose Perfection Garden Estate', 'OPGE', 500, 3000000, 'available', 'Interior plot'),
  ('004', 'Ose Perfection Garden Estate', 'OPGE', 550, 3300000, 'available', 'Premium garden-facing plot'),
  ('005', 'Ose Perfection Garden Estate', 'OPGE', 500, 3000000, 'available', 'Near estate entrance');

-- ============================================================================
-- ESTATE 7: Hectares Of Diamond Estate (HODE)
-- ============================================================================
INSERT INTO public.plots (plot_number, estate_name, estate_code, size_sqm, price, status, location_description)
VALUES
  ('001', 'Hectares Of Diamond Estate', 'HODE', 700, 4500000, 'available', 'Premium large corner plot'),
  ('002', 'Hectares Of Diamond Estate', 'HODE', 600, 3900000, 'available', 'Large standard plot'),
  ('003', 'Hectares Of Diamond Estate', 'HODE', 600, 3900000, 'available', 'Interior large plot'),
  ('004', 'Hectares Of Diamond Estate', 'HODE', 800, 5200000, 'available', 'Extra-large premium location'),
  ('005', 'Hectares Of Diamond Estate', 'HODE', 600, 3900000, 'available', 'Large plot near main road');

-- ============================================================================
-- ESTATE 8: Success Palace Estate (SUPE)
-- ============================================================================
INSERT INTO public.plots (plot_number, estate_name, estate_code, size_sqm, price, status, location_description)
VALUES
  ('001', 'Success Palace Estate', 'SUPE', 500, 3100000, 'available', 'Corner plot with excellent access'),
  ('002', 'Success Palace Estate', 'SUPE', 500, 3100000, 'available', 'Standard residential plot'),
  ('003', 'Success Palace Estate', 'SUPE', 500, 3100000, 'available', 'Interior plot'),
  ('004', 'Success Palace Estate', 'SUPE', 550, 3400000, 'available', 'Premium corner location'),
  ('005', 'Success Palace Estate', 'SUPE', 500, 3100000, 'available', 'Near estate facilities');

-- ============================================================================
-- Estate Summary
-- ============================================================================
-- Total Estates: 8
-- Total Plots Seeded: 40 (5 per estate)
-- Organization: Pinnacle Builders Homes & Properties (PBLD001)
-- Status: All plots initially set to 'available'
-- ============================================================================
