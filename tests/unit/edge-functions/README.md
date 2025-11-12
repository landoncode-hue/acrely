# Unit Testing Guide for Supabase Edge Functions

## Overview

Edge Functions run on Deno runtime and can be tested locally using Deno's testing framework.

## Setup

```bash
# Install Deno (if not already installed)
curl -fsSL https://deno.land/install.sh | sh

# Or use Homebrew on macOS
brew install deno
```

## Running Tests

```bash
# Test all edge functions
deno test --allow-net --allow-env tests/unit/edge-functions/

# Test specific function
deno test --allow-net --allow-env tests/unit/edge-functions/send-sms.test.ts

# With coverage
deno test --allow-net --allow-env --coverage=coverage/ tests/unit/edge-functions/
```

## Test Structure

Each Edge Function should have:
1. **Input validation tests** - Test request body validation
2. **Success cases** - Test happy path scenarios
3. **Error handling** - Test edge cases and failures
4. **Integration tests** - Test with mocked Supabase client

## Environment Variables for Testing

Create a `.env.test` file:

```bash
SUPABASE_URL=https://test.supabase.co
SUPABASE_SERVICE_ROLE_KEY=test-key
TERMII_API_KEY=test-termii-key
COMPANY_NAME=Test Company
COMPANY_EMAIL=test@example.com
COMPANY_PHONE=+234800000000
```

## Example Test

```typescript
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

Deno.test("send-sms validates phone number", async () => {
  const request = new Request("http://localhost", {
    method: "POST",
    body: JSON.stringify({
      phone: "invalid",
      message: "Test",
    }),
  });

  // const response = await handler(request);
  // assertEquals(response.status, 400);
});
```

## Mock Data

Use fixtures for consistent test data:

```typescript
export const mockCustomer = {
  id: "test-id",
  full_name: "Test Customer",
  phone: "+2348012345678",
  email: "test@example.com",
};
```

## Testing Edge Functions Locally

```bash
# Start Supabase local development
supabase start

# Serve function locally
supabase functions serve send-sms --env-file .env.local

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-sms' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"phone":"+2348012345678","message":"Test SMS"}'
```

## CI/CD Integration

Tests are automatically run in GitHub Actions:

```yaml
- name: Test Edge Functions
  run: |
    deno test --allow-net --allow-env tests/unit/edge-functions/
```

## Best Practices

1. **Mock external APIs** - Don't call real Termii API in tests
2. **Use test database** - Point to test Supabase project
3. **Clean up** - Reset test data after each test
4. **Isolate tests** - Each test should be independent
5. **Test edge cases** - Invalid inputs, timeouts, rate limits

## Debugging

```typescript
// Enable verbose logging
Deno.env.set("DEBUG", "true");

// Use Deno debugger
deno test --inspect-brk --allow-all test.ts
```

## Coverage Reports

```bash
# Generate coverage
deno test --allow-all --coverage=coverage/

# View coverage report
deno coverage coverage/
```

## Resources

- [Deno Testing](https://deno.land/manual/testing)
- [Supabase Edge Functions Testing](https://supabase.com/docs/guides/functions/unit-test)
- [Deno Standard Library Testing](https://deno.land/std/testing)
