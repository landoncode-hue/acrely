# Acrely v2 - API Reference

## Overview

This document provides comprehensive API reference for Acrely v2, including database access patterns, Edge Functions, and third-party integrations.

## Table of Contents

1. [Database API (Supabase Client)](#database-api)
2. [Edge Functions](#edge-functions)
3. [Authentication API](#authentication-api)
4. [Storage API](#storage-api)
5. [Realtime API](#realtime-api)
6. [External APIs](#external-apis)

---

## Database API

### Supabase Client Usage

```typescript
import { supabase } from "@acrely/services";

// Query data
const { data, error } = await supabase
  .from("table_name")
  .select("*")
  .eq("column", "value");

// Insert data
const { data, error } = await supabase
  .from("table_name")
  .insert({ column: "value" });

// Update data
const { data, error } = await supabase
  .from("table_name")
  .update({ column: "new_value" })
  .eq("id", "uuid");

// Delete data
const { data, error } = await supabase
  .from("table_name")
  .delete()
  .eq("id", "uuid");
```

### Common Query Patterns

#### Customers

```typescript
// Get all customers
const { data: customers } = await supabase
  .from("customers")
  .select("*")
  .order("created_at", { ascending: false });

// Get customer with allocations
const { data: customer } = await supabase
  .from("customers")
  .select(`
    *,
    allocations (
      *,
      plot:plots (*)
    )
  `)
  .eq("id", customerId)
  .single();

// Search customers
const { data: results } = await supabase
  .from("customers")
  .select("*")
  .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`);
```

#### Allocations

```typescript
// Get active allocations with customer and plot details
const { data: allocations } = await supabase
  .from("allocations")
  .select(`
    *,
    customer:customers (*),
    plot:plots (*),
    agent:users (*)
  `)
  .eq("status", "active");

// Get allocation summary
const { data: summary } = await supabase
  .from("allocations")
  .select("total_amount, amount_paid, balance")
  .eq("customer_id", customerId);
```

#### Payments

```typescript
// Record payment
const { data: payment, error } = await supabase
  .from("payments")
  .insert({
    allocation_id: allocationId,
    amount: 50000,
    payment_method: "bank_transfer",
    payment_date: new Date().toISOString().split("T")[0],
    reference: `PAY-${Date.now()}`,
    status: "confirmed",
    recorded_by: userId,
  })
  .select()
  .single();

// Get payment history
const { data: payments } = await supabase
  .from("payments")
  .select(`
    *,
    allocation:allocations (
      customer:customers (full_name, phone)
    )
  `)
  .eq("allocation_id", allocationId)
  .order("payment_date", { ascending: false });
```

#### Analytics

```typescript
// Get monthly billing summary
const { data: billingSummary } = await supabase
  .from("billing_summary")
  .select("*")
  .eq("month", "2025-01")
  .single();

// Get estate performance
const { data: estatePerformance } = await supabase
  .from("monthly_estate_performance")
  .select("*")
  .order("total_revenue", { ascending: false });

// Get agent performance
const { data: agentPerformance } = await supabase
  .from("agent_performance_monthly")
  .select("*")
  .eq("agent_id", userId)
  .order("month", { ascending: false });
```

---

## Edge Functions

All Edge Functions are deployed at: `https://your-project.supabase.co/functions/v1/{function-name}`

### Authentication

All Edge Function requests require authentication:

```typescript
// Using service role key (server-side only)
const response = await fetch(`${SUPABASE_URL}/functions/v1/function-name`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

// Using user token (client-side)
const { data: { session } } = await supabase.auth.getSession();
const response = await fetch(`${SUPABASE_URL}/functions/v1/function-name`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});
```

### send-sms

Send SMS via Termii API.

**Endpoint**: `POST /functions/v1/send-sms`

**Request Body**:
```json
{
  "to": "+2348012345678",
  "message": "Your payment has been received. Thank you!",
  "sender_id": "PinnacleB"
}
```

**Response**:
```json
{
  "success": true,
  "message_id": "termii_message_id",
  "status": "sent"
}
```

**Error Response**:
```json
{
  "error": "Failed to send SMS",
  "details": "Error message"
}
```

### generate-receipt

Generate PDF receipt and send via SMS.

**Endpoint**: `POST /functions/v1/generate-receipt`

**Request Body**:
```json
{
  "payment_id": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "receipt_url": "https://storage.supabase.co/receipts/...",
  "sms_sent": true
}
```

### commission-calculation

Calculate agent commissions.

**Endpoint**: `POST /functions/v1/commission-calculation`

**Request Body**:
```json
{
  "allocation_id": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "commission_id": "uuid",
  "commission_amount": 50000,
  "commission_rate": 0.05
}
```

### check-overdue-payments

Check and notify overdue payments (Cron job).

**Endpoint**: `POST /functions/v1/check-overdue-payments`

**Trigger**: Automated via `pg_cron` daily at 08:00 UTC

**Response**:
```json
{
  "success": true,
  "overdue_count": 12,
  "notifications_sent": 12
}
```

### generate-billing-summary

Generate monthly billing summary (Cron job).

**Endpoint**: `POST /functions/v1/generate-billing-summary`

**Trigger**: Automated via `pg_cron` on 1st of each month at 23:59 UTC

**Response**:
```json
{
  "success": true,
  "month": "2025-01",
  "total_revenue": 5000000,
  "total_payments": 150
}
```

### predict-trends

Predict revenue trends using simple linear regression.

**Endpoint**: `POST /functions/v1/predict-trends`

**Request Body**:
```json
{
  "months_to_predict": 3
}
```

**Response**:
```json
{
  "success": true,
  "predictions": [
    { "month": "2025-02", "predicted_revenue": 5200000 },
    { "month": "2025-03", "predicted_revenue": 5400000 },
    { "month": "2025-04", "predicted_revenue": 5600000 }
  ]
}
```

### backup-database

Create database backup.

**Endpoint**: `POST /functions/v1/backup-database`

**Request Body**:
```json
{
  "tables": ["customers", "allocations", "payments"]
}
```

**Response**:
```json
{
  "success": true,
  "backup_url": "https://storage.supabase.co/backups/...",
  "backup_size": "2.5MB",
  "tables_backed_up": 3
}
```

### system-health-check

Check system health.

**Endpoint**: `POST /functions/v1/system-health-check`

**Trigger**: Automated via `pg_cron` every 15 minutes

**Response**:
```json
{
  "success": true,
  "status": "healthy",
  "checks": {
    "database": "ok",
    "storage": "ok",
    "edge_functions": "ok"
  }
}
```

---

## Authentication API

### Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: "user@pinnaclegroups.ng",
  password: "securePassword123",
});
```

### Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@pinnaclegroups.ng",
  password: "securePassword123",
});
```

### Sign Out

```typescript
const { error } = await supabase.auth.signOut();
```

### Get Current User

```typescript
const { data: { user } } = await supabase.auth.getUser();
```

### Get Session

```typescript
const { data: { session } } = await supabase.auth.getSession();
```

---

## Storage API

### Upload File

```typescript
const { data, error } = await supabase.storage
  .from("receipts")
  .upload(`receipts/${fileName}`, file, {
    contentType: "application/pdf",
    cacheControl: "3600",
  });
```

### Get Public URL

```typescript
const { data } = supabase.storage
  .from("receipts")
  .getPublicUrl(`receipts/${fileName}`);

const publicUrl = data.publicUrl;
```

### Download File

```typescript
const { data, error } = await supabase.storage
  .from("receipts")
  .download(`receipts/${fileName}`);
```

### Delete File

```typescript
const { data, error } = await supabase.storage
  .from("receipts")
  .remove([`receipts/${fileName}`]);
```

---

## Realtime API

### Subscribe to Table Changes

```typescript
const channel = supabase
  .channel("payments-changes")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "payments",
    },
    (payload) => {
      console.log("New payment:", payload.new);
    }
  )
  .subscribe();

// Unsubscribe
channel.unsubscribe();
```

### Subscribe to Specific Row

```typescript
const channel = supabase
  .channel(`customer-${customerId}`)
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "customers",
      filter: `id=eq.${customerId}`,
    },
    (payload) => {
      console.log("Customer updated:", payload.new);
    }
  )
  .subscribe();
```

---

## External APIs

### Termii SMS API

**Base URL**: `https://api.ng.termii.com/api`

**Authentication**: API Key in request body

#### Send SMS

```typescript
const response = await fetch("https://api.ng.termii.com/api/sms/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    to: "+2348012345678",
    from: "PinnacleB",
    sms: "Your message here",
    type: "plain",
    channel: "generic",
    api_key: process.env.TERMII_API_KEY,
  }),
});
```

**Response**:
```json
{
  "message_id": "123456789",
  "message": "Successfully Sent",
  "balance": 500,
  "user": "user@example.com"
}
```

---

## Rate Limits

### Supabase
- **Database**: 100 connections
- **Edge Functions**: 500,000 invocations/month (Pro plan)
- **Storage**: 100GB (Pro plan)
- **Realtime**: 200 concurrent connections

### Termii
- **SMS**: Depends on account balance
- **Rate**: ~10 requests/second

---

## Error Codes

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

### Custom Error Codes
- `PGRST116` - No rows found
- `23505` - Unique constraint violation
- `23503` - Foreign key violation
- `42P01` - Table does not exist

---

## Best Practices

1. **Always handle errors**: Use try-catch blocks and check for `error` in responses
2. **Use TypeScript**: Leverage type safety for API calls
3. **Implement retry logic**: For transient failures
4. **Cache responses**: Where appropriate to reduce API calls
5. **Use RLS**: Never bypass Row Level Security
6. **Validate input**: On both client and server side
7. **Use transactions**: For multi-step operations
8. **Monitor usage**: Track API call volumes and performance

---

**Version**: 2.5.0
**Last Updated**: 2025-01-19
**Maintained By**: Kennedy — Landon Digital
