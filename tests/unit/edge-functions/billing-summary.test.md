# Unit Tests for Billing Edge Functions

This directory contains unit tests for Supabase Edge Functions related to billing.

## Test Structure

```
unit/edge-functions/
├── README.md
├── billing-summary.test.ts
└── test-utils.ts
```

## Running Tests

To run the Edge Function tests locally:

```bash
# Using Deno (required for Edge Functions)
deno test --allow-all tests/unit/edge-functions/billing-summary.test.ts

# Or using the test script
pnpm test:functions
```

## Test Coverage

### Billing Summary Function
- ✅ Generates billing summary for current month
- ✅ Generates billing summary for specific month/year
- ✅ Filters by estate code
- ✅ Handles force regeneration
- ✅ Aggregates payments correctly
- ✅ Calculates commissions accurately
- ✅ Computes collection rates
- ✅ Handles empty data gracefully
- ✅ Returns proper error messages

## Mock Data

Test utilities provide mock data for:
- Estates
- Payments
- Allocations
- Commissions
- Plots
- Customers

## Environment Variables

Tests require these environment variables:
```env
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your-test-service-role-key
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Reset mock data between tests
3. **Coverage**: Test both success and error paths
4. **Performance**: Monitor test execution time
5. **Documentation**: Comment complex test scenarios

## Debugging

Enable verbose logging:
```bash
DENO_ENV=development deno test --allow-all tests/unit/edge-functions/
```

## CI/CD Integration

These tests run automatically in GitHub Actions:
- On pull requests
- Before deployment
- Nightly regression tests

## Additional Resources

- [Deno Testing Guide](https://deno.land/manual/testing)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Acrely Testing Standards](../../docs/testing.md)
