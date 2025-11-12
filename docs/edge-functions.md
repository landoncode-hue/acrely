# Acrely v2 - Edge Functions Reference

## Overview

Edge Functions are serverless TypeScript functions deployed on Supabase's global edge network using the Deno runtime. They handle backend logic, integrations, and scheduled tasks.

## Function List

| Function | Type | Trigger | Purpose |
|----------|------|---------|---------|
| `send-sms` | On-demand | HTTP POST | Send SMS via Termii API |
| `generate-receipt` | On-demand | HTTP POST | Generate PDF receipts |
| `commission-calculation` | On-demand | HTTP POST | Calculate agent commissions |
| `check-overdue-payments` | Cron | Daily 08:00 UTC | Check and notify overdue payments |
| `generate-billing-summary` | Cron | 1st of month 23:59 UTC | Generate monthly billing reports |
| `predict-trends` | On-demand | HTTP POST | Predict revenue trends |
| `backup-database` | Cron | Daily 23:59 UTC | Backup database tables |
| `system-health-check` | Cron | Every 15 minutes | Monitor system health |
| `process-receipt-queue` | Cron | Every 5 minutes | Process queued receipts |
| `process-sms-queue` | Cron | Every 2 minutes | Process queued SMS |
| `bulk-sms-campaign` | On-demand | HTTP POST | Send bulk SMS campaigns |
| `alert-notification` | On-demand | HTTP POST | Send alert notifications |
| `storage-cleanup` | Cron | Weekly Sunday 02:00 UTC | Clean up old storage files |
| `commission-claim` | On-demand | HTTP POST | Process commission claims |

## Development Guidelines

### File Structure

```
supabase/functions/
├── function-name/
│   └── index.ts          # Main function file
├── _shared/              # Shared utilities
│   ├── auth.ts          # Authentication helpers
│   ├── supabase.ts      # Supabase client
│   └── types.ts         # TypeScript types
├── deno.json            # Deno configuration
└── import_map.json      # Import mappings
```

### Basic Template

```typescript
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get request body
    const { param1, param2 } = await req.json();

    // Validate input
    if (!param1) {
      throw new Error("Missing required parameter: param1");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Your logic here
    const result = await doSomething(param1, param2);

    // Return success response
    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    // Return error response
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
```

### Environment Variables

Access via `Deno.env.get()`:

```typescript
const apiKey = Deno.env.get("TERMII_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
```

### Authentication

```typescript
// Verify JWT token
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const authHeader = req.headers.get("Authorization");
if (!authHeader) {
  throw new Error("Missing authorization header");
}

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  {
    global: {
      headers: { Authorization: authHeader },
    },
  }
);

const { data: { user }, error } = await supabaseClient.auth.getUser();
if (error || !user) {
  throw new Error("Unauthorized");
}
```

## Testing Locally

### Start Supabase

```bash
supabase start
```

### Serve Function

```bash
supabase functions serve function-name --env-file ./supabase/.env.local
```

### Test with cURL

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/function-name' \
  --header 'Authorization: Bearer SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"param1": "value1"}'
```

## Deployment

### Deploy Single Function

```bash
supabase functions deploy function-name
```

### Deploy All Functions

```bash
for func in supabase/functions/*/; do
  supabase functions deploy $(basename $func)
done
```

## Monitoring

### View Logs

```bash
# Real-time logs
supabase functions logs function-name --tail

# Last 100 logs
supabase functions logs function-name --limit 100
```

### Log from Function

```typescript
console.log("Info message");
console.error("Error message");
console.warn("Warning message");
```

## Error Handling

### Best Practices

```typescript
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== "POST") {
      throw new Error("Method not allowed");
    }

    // Parse and validate body
    let body;
    try {
      body = await req.json();
    } catch {
      throw new Error("Invalid JSON body");
    }

    // Validate required fields
    if (!body.required_field) {
      throw new Error("Missing required field: required_field");
    }

    // Business logic
    const result = await processRequest(body);

    // Success response
    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    // Log error
    console.error("Function error:", error);

    // Determine status code
    const status = error.message.includes("Unauthorized") ? 401
                 : error.message.includes("not found") ? 404
                 : 400;

    // Error response
    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status,
      }
    );
  }
});
```

## Performance Optimization

### Minimize Cold Starts

- Keep dependencies minimal
- Reuse connections
- Cache when possible

```typescript
// Cache Supabase client
let supabaseClient: SupabaseClient;

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
  }
  return supabaseClient;
}
```

### Parallel Processing

```typescript
// Process multiple items in parallel
const results = await Promise.all(
  items.map(item => processItem(item))
);
```

### Timeout Handling

```typescript
// Set timeout for long-running operations
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error("Operation timeout")), 30000)
);

const result = await Promise.race([
  processData(),
  timeoutPromise
]);
```

## Security Best Practices

1. **Never expose service role key** to client
2. **Validate all inputs** before processing
3. **Use RLS policies** for database access
4. **Sanitize user data** to prevent injection
5. **Rate limit** API calls
6. **Log security events**
7. **Rotate secrets** regularly

## Common Patterns

### Database Query

```typescript
const { data, error } = await supabaseClient
  .from("table_name")
  .select("*")
  .eq("id", id)
  .single();

if (error) throw error;
```

### External API Call

```typescript
const response = await fetch(API_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${API_KEY}`,
  },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  throw new Error(`API error: ${response.statusText}`);
}

const data = await response.json();
```

### File Upload to Storage

```typescript
const { data, error } = await supabaseClient.storage
  .from("bucket-name")
  .upload(filePath, fileData, {
    contentType: "application/pdf",
  });

if (error) throw error;
```

## Cron Job Configuration

Cron jobs are scheduled using `pg_cron` extension:

```sql
-- Schedule daily job at 08:00 UTC
SELECT cron.schedule(
  'check-overdue-payments',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/check-overdue-payments',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key')),
    body := '{}'::jsonb
  ) as request_id;
  $$
);
```

## Troubleshooting

### Function Not Responding

- Check function deployment status
- Verify environment variables
- Check function logs for errors
- Ensure CORS headers are set

### Database Connection Errors

- Verify Supabase URL and keys
- Check RLS policies
- Ensure user has permissions

### Timeout Errors

- Optimize query performance
- Use parallel processing
- Increase function timeout (if possible)
- Split into smaller functions

---

**Version**: 2.5.0
**Last Updated**: 2025-01-19
**Maintained By**: Kennedy — Landon Digital
