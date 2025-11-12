-- Seed initial estate data for Pinnacle Builders

INSERT INTO public.plots (plot_number, estate_name, estate_code, size_sqm, price, status, location_description)
VALUES
  -- City of David Estate (CODE)
  ('001', 'City of David Estate', 'CODE', 500, 2500000, 'available', 'Prime location near main road'),
  ('002', 'City of David Estate', 'CODE', 500, 2500000, 'available', 'Corner piece with dual access'),
  ('003', 'City of David Estate', 'CODE', 600, 3000000, 'available', 'Larger plot with garden space'),
  
  -- Soar High Estate (SHE)
  ('001', 'Soar High Estate', 'SHE', 450, 2250000, 'available', 'Well drained land'),
  ('002', 'Soar High Estate', 'SHE', 450, 2250000, 'available', 'Facing east with morning sun'),
  ('003', 'Soar High Estate', 'SHE', 550, 2750000, 'available', 'Premium corner plot'),
  
  -- Oduwa Housing Estate (OHE)
  ('001', 'Oduwa Housing Estate', 'OHE', 500, 2600000, 'available', 'Near estate entrance'),
  ('002', 'Oduwa Housing Estate', 'OHE', 500, 2600000, 'available', 'Quiet neighborhood location'),
  ('003', 'Oduwa Housing Estate', 'OHE', 600, 3100000, 'available', 'Large family plot'),
  
  -- Ehi Green Park Estate (EGPE)
  ('001', 'Ehi Green Park Estate', 'EGPE', 450, 2400000, 'available', 'Park adjacent location'),
  ('002', 'Ehi Green Park Estate', 'EGPE', 500, 2650000, 'available', 'Central location'),
  ('003', 'Ehi Green Park Estate', 'EGPE', 550, 2900000, 'available', 'Premium lakefront view'),
  
  -- New Era of Wealth Estate (NEWE)
  ('001', 'New Era of Wealth Estate', 'NEWE', 600, 3500000, 'available', 'Luxury development area'),
  ('002', 'New Era of Wealth Estate', 'NEWE', 600, 3500000, 'available', 'Prime commercial zone'),
  ('003', 'New Era of Wealth Estate', 'NEWE', 750, 4200000, 'available', 'Executive estate section'),
  
  -- Ose Perfection Garden Estate (OPGE)
  ('001', 'Ose Perfection Garden Estate', 'OPGE', 500, 2800000, 'available', 'Garden view location'),
  ('002', 'Ose Perfection Garden Estate', 'OPGE', 550, 3000000, 'available', 'Elevated terrain'),
  ('003', 'Ose Perfection Garden Estate', 'OPGE', 600, 3300000, 'available', 'Corner plot with gardens'),
  
  -- Hectares Of Diamond Estate (HODE)
  ('001', 'Hectares Of Diamond Estate', 'HODE', 650, 3800000, 'available', 'Premium diamond section'),
  ('002', 'Hectares Of Diamond Estate', 'HODE', 700, 4000000, 'available', 'Large plot with amenities access'),
  ('003', 'Hectares Of Diamond Estate', 'HODE', 800, 4500000, 'available', 'Executive diamond plot'),
  
  -- Success Palace Estate (SUPE)
  ('001', 'Success Palace Estate', 'SUPE', 550, 3100000, 'available', 'Palace view location'),
  ('002', 'Success Palace Estate', 'SUPE', 600, 3400000, 'available', 'Premium residential area'),
  ('003', 'Success Palace Estate', 'SUPE', 700, 3900000, 'available', 'Luxury palace section');

-- Insert default system settings
INSERT INTO public.settings (key, value, description)
VALUES
  ('company_name', 'Pinnacle Builders Homes & Properties', 'Company legal name'),
  ('company_email', 'noreply@pinnaclegroups.ng', 'Company contact email'),
  ('company_phone', '+234XXXXXXXXXX', 'Company contact phone'),
  ('company_address', 'Edo, Nigeria', 'Company physical address'),
  ('default_commission_rate', '5', 'Default commission rate percentage for agents'),
  ('payment_reminder_days', '7', 'Days before payment due date to send reminder'),
  ('sms_sender_id', 'Pinnacle', 'Default SMS sender ID'),
  ('receipt_prefix', 'RCP', 'Receipt number prefix'),
  ('allocation_prefix', 'ALC', 'Allocation reference prefix'),
  ('currency', 'NGN', 'System currency'),
  ('tax_rate', '0', 'Tax rate percentage if applicable');
