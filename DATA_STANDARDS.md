# 📏 Acrely v2 - Data Standards & Conventions

**Version**: 2.0  
**Effective Date**: November 14, 2025  
**Scope**: All data entry, import, and storage operations

---

## 🎯 Overview

This document defines the canonical standards for all data in the Acrely v2 system. These standards ensure consistency across imports, user input, API responses, and database storage.

---

## 📅 Date Formats

### Standard Format
**Format**: `DD-MM-YYYY` (e.g., `14-11-2025`)

### Database Storage
- **Type**: `DATE` or `TIMESTAMPTZ`
- **Format**: PostgreSQL native date format
- **Input**: Accept multiple formats, normalize to standard

### Supported Input Formats
During import/entry, accept these formats and convert to standard:
1. `DD-MM-YYYY` → Standard (14-11-2025)
2. `MM/DD/YYYY` → Convert to standard
3. `YYYY-MM-DD` → Convert to standard (ISO 8601)
4. `DD-Mon-YY` → Convert to standard (14-Nov-25)
5. `DD-MON-YYYY` → Convert to standard (14-NOV-2025)

### Display Format
- **Web UI**: `14 November 2025` (full month name)
- **Mobile UI**: `14 Nov 2025` (abbreviated month)
- **Reports**: `14-11-2025` (standard format)
- **Exports**: `YYYY-MM-DD` (ISO 8601 for Excel compatibility)

### Implementation
```sql
-- Helper function
CREATE OR REPLACE FUNCTION parse_date(raw TEXT) RETURNS DATE AS $$
DECLARE t TEXT;
BEGIN
  IF raw IS NULL THEN RETURN NULL; END IF;
  t := TRIM(raw);
  IF t = '' THEN RETURN NULL; END IF;
  -- Try multiple formats
  BEGIN RETURN TO_DATE(t, 'DD-MM-YYYY'); EXCEPTION WHEN others THEN
  BEGIN RETURN TO_DATE(t, 'MM/DD/YYYY'); EXCEPTION WHEN others THEN
  BEGIN RETURN TO_DATE(t, 'YYYY-MM-DD'); EXCEPTION WHEN others THEN
  RETURN NULL; END; END; END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

---

## 📐 Plot Sizes

### Standard Unit
**Unit**: Square meters (sqm)

### Display Format
**Format**: `XXX sqm` (e.g., `465 sqm`, `930 sqm`)

### Input Formats Accepted

#### 1. Fraction Format (Legacy)
- `50/100` → 465 sqm (50% of standard plot)
- `100/100` → 930 sqm (full standard plot)
- `25/50` → 465 sqm (normalize to sqm)

**Conversion Formula**:
```
sqm = (numerator / denominator) × 930
```

#### 2. Direct Sqm Format
- `465sqm` → 465 sqm
- `930 SQM` → 930 sqm
- `465` → 465 sqm (assume sqm if numeric)

#### 3. Feet Format
- `50ft x 100ft` → 465 sqm (convert from feet)
- `50'x100'` → 465 sqm

**Conversion Formula**:
```
sqm = (length_ft × width_ft) × 0.092903
```

### Standard Plot Sizes
| Code | Size (sqm) | Size (ft) | Description |
|------|-----------|-----------|-------------|
| QTR | 232.5 | 25 x 100 | Quarter plot |
| HALF | 465 | 50 x 100 | Half plot |
| FULL | 930 | 100 x 100 | Full plot |
| DBL | 1,860 | 200 x 100 | Double plot |

### Database Constraints
```sql
-- Plot size must be positive
ALTER TABLE plots ADD CONSTRAINT plot_size_positive 
  CHECK (size_sqm > 0);

-- Plot size should be within reasonable bounds
ALTER TABLE plots ADD CONSTRAINT plot_size_bounds 
  CHECK (size_sqm BETWEEN 100 AND 10000);
```

---

## 🔢 Plot Numbers

### Standard Format
**Format**: Alphanumeric, uppercase (e.g., `PLOT-001`, `A-12`, `BLOCK-B-05`)

### Normalization Rules
1. **Uppercase**: Convert all plot numbers to uppercase
2. **Trim whitespace**: Remove leading/trailing spaces
3. **Unique per estate**: Plot numbers must be unique within an estate

### Examples
| Input | Normalized |
|-------|-----------|
| `plot 1` | `PLOT-1` |
| ` a12 ` | `A12` |
| `Block B, Plot 5` | `BLOCK-B-PLOT-5` |

### Database Constraints
```sql
-- Unique plot number per estate
ALTER TABLE plots ADD CONSTRAINT unique_plot_per_estate 
  UNIQUE (estate_code, plot_number);

-- Plot number cannot be empty
ALTER TABLE plots ADD CONSTRAINT plot_number_not_empty 
  CHECK (TRIM(plot_number) != '');
```

---

## 🏘️ Estate Codes

### Standard Codes
| Estate Name | Code | Status |
|------------|------|--------|
| City of David Estate | `CODE` | Active |
| Ehi Green Park Estate | `EGPE` | Active |
| New Era of Wealth Estate | `NEWE` | Active |
| Oduwa Housing Estate | `OHE` | Active |
| Ose Perfection Garden Estate | `OPGE` | Active |
| Soar High Estate | `SHE` | Active |
| Success Palace Estate | `SUPE` | Active |

### Format Rules
1. **Uppercase**: All estate codes in uppercase
2. **Length**: 3-4 characters
3. **Alphanumeric**: Letters only, no spaces or special characters
4. **Immutable**: Estate codes cannot be changed once assigned

### Database Constraints
```sql
-- Estate code must be uppercase
ALTER TABLE plots ADD CONSTRAINT estate_code_uppercase 
  CHECK (estate_code = UPPER(estate_code));

-- Estate code length
ALTER TABLE plots ADD CONSTRAINT estate_code_length 
  CHECK (LENGTH(estate_code) BETWEEN 3 AND 5);
```

---

## 💰 Currency & Amounts

### Currency
**Currency**: Nigerian Naira (₦)

### Format
**Format**: `₦X,XXX,XXX.XX` (e.g., `₦1,500,000.00`)

### Database Storage
- **Type**: `NUMERIC(15, 2)`
- **Precision**: 15 digits total, 2 decimal places
- **No currency symbol in database**: Store as pure number

### Input Formats Accepted
1. `1500000` → 1,500,000.00
2. `1,500,000` → 1,500,000.00
3. `₦1,500,000` → 1,500,000.00
4. `1500000.50` → 1,500,000.50
5. `1.5M` → 1,500,000.00 (M = million)
6. `1500K` → 1,500,000.00 (K = thousand)

### Complex Formats
- `1100000+220K` → 1,320,000.00 (sum of parts)
- `50%` → NULL (percentage without base is invalid)

### Database Constraints
```sql
-- Amount must be non-negative
ALTER TABLE payments ADD CONSTRAINT payment_amount_positive 
  CHECK (amount >= 0);

-- Reasonable upper bound
ALTER TABLE plots ADD CONSTRAINT plot_price_reasonable 
  CHECK (price BETWEEN 0 AND 1000000000);
```

---

## 📞 Phone Numbers

### Standard Format
**Format**: `+234XXXXXXXXXX` (E.164 format)

### Example
`+2348012345678`

### Normalization Rules
1. **Remove spaces and special characters**: `080 1234 5678` → `08012345678`
2. **Add country code**: `08012345678` → `+2348012345678`
3. **Handle multiple numbers**: `080.../070...` → Use first number only

### Input Formats Accepted
| Input | Normalized |
|-------|-----------|
| `08012345678` | `+2348012345678` |
| `234 801 234 5678` | `+2348012345678` |
| `+234-801-234-5678` | `+2348012345678` |
| `0801 234 5678` | `+2348012345678` |
| `8012345678` | `+2348012345678` |

### Invalid Inputs
- Empty string → `NULL`
- Non-numeric → `NULL`
- Too short (<10 digits) → `NULL`

### Database Constraints
```sql
-- Phone number format
ALTER TABLE customers ADD CONSTRAINT phone_format 
  CHECK (phone ~ '^\+234[0-9]{10}$' OR phone IS NULL);
```

---

## 👤 Names & Text

### Customer Names
**Format**: Title Case (e.g., `John Doe`, `Mary Jane Smith`)

### Normalization Rules
1. **Trim whitespace**: Remove leading/trailing spaces
2. **Title case**: Capitalize first letter of each word
3. **Multiple spaces**: Replace with single space

### Examples
| Input | Normalized |
|-------|-----------|
| ` john doe ` | `John Doe` |
| `MARY JANE` | `Mary Jane` |
| `john  doe` | `John Doe` |

### Database Constraints
```sql
-- Name cannot be empty
ALTER TABLE customers ADD CONSTRAINT customer_name_not_empty 
  CHECK (TRIM(full_name) != '');
```

---

## 🔑 Primary Keys

### Standard
**Type**: UUID v4

### Generation
```sql
-- Default UUID generation
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

### Format
`550e8400-e29b-41d4-a716-446655440000`

---

## 🕐 Timestamps

### Standard Fields
All tables should have:
```sql
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
```

### Timezone
**Timezone**: Africa/Lagos (WAT - West Africa Time)

### Display Format
- **Web UI**: `14 Nov 2025, 3:45 PM`
- **Mobile UI**: `14/11/25 15:45`
- **Reports**: `2025-11-14 15:45:00 WAT`

---

## 📊 Status Values

### Plot Status
- `available` - Available for sale
- `reserved` - Temporarily reserved
- `allocated` - Allocated to customer
- `sold` - Fully paid and sold

### Allocation Status
- `active` - Payment ongoing
- `completed` - Fully paid
- `defaulted` - Payment overdue
- `cancelled` - Allocation cancelled

### Payment Status
- `pending` - Awaiting confirmation
- `confirmed` - Payment confirmed
- `failed` - Payment failed

### Commission Status
- `pending` - Awaiting approval
- `approved` - Approved, awaiting payment
- `paid` - Commission paid

---

## ✅ Validation Rules

### Required Fields
| Table | Required Fields |
|-------|----------------|
| customers | `full_name`, `phone` |
| plots | `plot_number`, `estate_code`, `size_sqm`, `price` |
| allocations | `customer_id`, `plot_id`, `total_amount`, `payment_plan` |
| payments | `allocation_id`, `amount`, `payment_method`, `reference` |

### Unique Constraints
| Table | Unique Fields |
|-------|--------------|
| customers | `phone` |
| plots | `estate_code + plot_number` |
| payments | `reference` |

---

## 🔄 Import Pipeline Standards

### CSV Import Requirements
1. **Encoding**: UTF-8
2. **Delimiter**: Comma (`,`)
3. **Quote Character**: Double quote (`"`)
4. **Header Row**: First row must contain column names
5. **Date Format**: Accept multiple, normalize to `DD-MM-YYYY`
6. **Phone Format**: Accept multiple, normalize to `+234XXXXXXXXXX`
7. **Amount Format**: Accept multiple, normalize to decimal

### Error Handling
1. **Invalid dates**: Set to `NULL`, log warning
2. **Invalid phone**: Set to `NULL`, log warning
3. **Duplicate customers**: Use existing record
4. **Duplicate plots**: Skip, log error
5. **Missing required fields**: Skip row, log error

---

## 📖 Reference Implementation

### Normalization Functions
All normalization functions are available in:
`supabase/migrations/20250120000000_import_legacy_data.sql`

Key functions:
- `normalize_phone(TEXT)` → `TEXT`
- `parse_date(TEXT)` → `DATE`
- `parse_amount_advanced(TEXT)` → `NUMERIC`
- `parse_plot_size(TEXT)` → `NUMERIC`

---

## 🔐 Security Standards

### Sensitive Data
- **PII**: Customer names, phones, addresses, ID numbers
- **Financial**: Payment amounts, commissions, balances
- **Authentication**: User passwords, API keys, tokens

### Encryption
- **At rest**: Supabase automatic encryption
- **In transit**: HTTPS/TLS only
- **Passwords**: bcrypt with salt (handled by Supabase Auth)

### Access Control
- **RLS**: Enabled on all tables
- **Roles**: CEO, MD, SysAdmin, Frontdesk, Agent
- **Audit**: All sensitive operations logged in `audit_logs`

---

## 📅 Maintenance

### Review Schedule
- **Monthly**: Review data quality metrics
- **Quarterly**: Update standards if needed
- **Annually**: Full audit of all data

### Quality Metrics
1. **Completeness**: % of required fields filled
2. **Accuracy**: % of data matching standards
3. **Consistency**: % of data following format rules
4. **Uniqueness**: % of duplicates in unique fields

---

**Document Owner**: DevOps Team  
**Last Updated**: November 14, 2025  
**Next Review**: February 14, 2026
