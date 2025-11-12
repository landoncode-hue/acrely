# Analytics Suite - Predict Trends Function Unit Tests

## Test Suite: Revenue Prediction Edge Function

### Test Case 1: Linear Regression Calculation
**Description**: Verify linear regression model calculates correctly  
**Input Data**:
```json
[
  { "month": "2024-01", "total_revenue": 5000000, "month_index": 0 },
  { "month": "2024-02", "total_revenue": 5500000, "month_index": 1 },
  { "month": "2024-03", "total_revenue": 6000000, "month_index": 2 },
  { "month": "2024-04", "total_revenue": 6500000, "month_index": 3 }
]
```

**Expected Output**:
- Slope: ~500000 (consistent monthly growth)
- Intercept: ~5000000 (starting point)
- R²: Close to 1.0 (perfect linear fit)

**Validation**:
```javascript
const result = calculateLinearRegression(data);
expect(result.slope).toBeCloseTo(500000, -3);
expect(result.intercept).toBeCloseTo(5000000, -3);
expect(result.r_squared).toBeGreaterThan(0.95);
```

---

### Test Case 2: Confidence Level Calculation
**Description**: Verify confidence calculation based on R² and data points

**Scenario A: High confidence (good fit, many data points)**
- R²: 0.95
- Data points: 12
- Expected confidence: 66.5% + 30% = ~96%

**Scenario B: Low confidence (poor fit, few data points)**
- R²: 0.5
- Data points: 3
- Expected confidence: 35% + 7.5% = ~42%

**Validation**:
```javascript
expect(calculateConfidence(0.95, 12)).toBeGreaterThan(90);
expect(calculateConfidence(0.5, 3)).toBeLessThan(50);
```

---

### Test Case 3: Prediction Generation
**Description**: Verify predictions for next 3 months

**Input**: Last month is "2024-04-01"

**Expected Output**:
- Prediction 1: "2024-05-01"
- Prediction 2: "2024-06-01"
- Prediction 3: "2024-07-01"
- Each with predicted_revenue > 0
- Each with confidence_level between 0-100

**Validation**:
```javascript
const predictions = generatePredictions(historicalData);
expect(predictions.length).toBe(3);
expect(predictions[0].predicted_month).toBe('2024-05-01');
expect(predictions[0].predicted_revenue).toBeGreaterThan(0);
expect(predictions[0].confidence_level).toBeGreaterThanOrEqual(0);
expect(predictions[0].confidence_level).toBeLessThanOrEqual(100);
```

---

### Test Case 4: Insufficient Data Handling
**Description**: Ensure function handles insufficient historical data

**Input**: Only 2 months of data

**Expected Behavior**: Throw error "Insufficient historical data (minimum 3 months required)"

**Validation**:
```javascript
const insufficientData = [
  { month: "2024-01", total_revenue: 5000000 },
  { month: "2024-02", total_revenue: 5500000 }
];

expect(() => calculateLinearRegression(insufficientData))
  .toThrow('Insufficient data for prediction');
```

---

### Test Case 5: Database Storage
**Description**: Verify predictions are stored correctly in revenue_predictions table

**Process**:
1. Generate predictions
2. Insert into database
3. Query database
4. Verify data matches

**Expected Database Record**:
```sql
SELECT * FROM revenue_predictions 
WHERE prediction_date = CURRENT_DATE 
LIMIT 1;
```

**Validation**:
- `predicted_month` matches generated prediction
- `predicted_revenue` > 0
- `confidence_level` between 0-100
- `prediction_method` = 'linear_regression'
- `historical_data_points` >= 3

---

### Test Case 6: Accuracy Update
**Description**: Verify accuracy calculation after month completes

**Setup**:
- Predicted revenue for March: ₦6,000,000
- Actual revenue for March: ₦5,800,000

**Expected Accuracy**: 100 - |((6000000 - 5800000) / 5800000) * 100| = ~96.55%

**Validation**:
```javascript
await updatePredictionAccuracy();
const updated = await fetchPrediction('2024-03-01');
expect(updated.actual_revenue).toBe(5800000);
expect(updated.accuracy_percentage).toBeCloseTo(96.55, 1);
```

---

### Test Case 7: Edge Function Response Format
**Description**: Verify Edge Function returns correct JSON structure

**Expected Response**:
```json
{
  "success": true,
  "predictions": [
    {
      "predicted_month": "2024-05-01",
      "predicted_revenue": 7000000,
      "confidence_level": 85,
      "model_parameters": {
        "slope": 500000,
        "intercept": 5000000,
        "r_squared": 0.95
      }
    }
  ],
  "model": {
    "r_squared": 0.95,
    "data_points": 12,
    "method": "linear_regression"
  },
  "message": "Generated 3 monthly predictions"
}
```

**Validation**:
```javascript
const response = await invokePredictTrends();
expect(response.success).toBe(true);
expect(response.predictions).toHaveLength(3);
expect(response.model.method).toBe('linear_regression');
```

---

### Test Case 8: Failure Alert Integration
**Description**: Verify alert is sent to SysAdmin on failure

**Scenario**: Database connection fails

**Expected Behavior**:
1. Edge Function catches error
2. Calls `alert-notification` function
3. Alert contains job name and error message

**Validation**:
```javascript
// Mock database error
mockSupabaseError();

const response = await invokePredictTrends();
expect(response.success).toBe(false);

// Verify alert was sent
const alerts = await fetchRecentAlerts();
expect(alerts[0].job_name).toBe('predict-trends');
expect(alerts[0].severity).toBe('high');
```

---

## Test Execution Instructions

### Local Testing:
```bash
# Run unit tests
pnpm test:unit tests/unit/edge-functions/predict-trends.test.ts

# Run integration test with local Supabase
supabase functions serve predict-trends
curl -X POST http://localhost:54321/functions/v1/predict-trends \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Production Testing:
```bash
# Deploy function
supabase functions deploy predict-trends

# Invoke function
supabase functions invoke predict-trends --method POST

# Check logs
supabase functions logs predict-trends --tail
```

---

## Performance Benchmarks

| Data Points | Expected Processing Time | Memory Usage |
|-------------|-------------------------|--------------|
| 3 months    | < 100ms                | < 10MB       |
| 12 months   | < 200ms                | < 15MB       |
| 24 months   | < 300ms                | < 20MB       |

---

## Test Coverage Goals

- **Function Coverage**: 100%
- **Branch Coverage**: 95%
- **Error Handling**: All error paths tested
- **Integration**: Database, API, Alert system

---

## Notes

- Tests should run in isolated environment
- Use test database with sample data
- Mock external API calls (alerts)
- Verify no side effects on production data
