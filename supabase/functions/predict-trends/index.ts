/**
 * Predict Trends Edge Function
 * 
 * Generates revenue predictions using linear regression on historical data
 * Forecasts next 3 months and stores results in revenue_predictions table
 * 
 * Scheduled to run: Daily at 00:00 UTC
 * Manual trigger: POST /functions/v1/predict-trends
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Types
interface RevenueDataPoint {
  month: string;
  total_revenue: number;
  month_index: number;
}

interface PredictionResult {
  predicted_month: string;
  predicted_revenue: number;
  confidence_level: number;
  model_parameters: {
    slope: number;
    intercept: number;
    r_squared: number;
  };
}

// Linear regression calculation
function calculateLinearRegression(data: RevenueDataPoint[]): {
  slope: number;
  intercept: number;
  r_squared: number;
} {
  const n = data.length;
  
  if (n < 3) {
    throw new Error('Insufficient data for prediction (minimum 3 months required)');
  }

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

  data.forEach((point) => {
    const x = point.month_index;
    const y = point.total_revenue;
    
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  });

  // Calculate slope (m) and intercept (b) for y = mx + b
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared (coefficient of determination)
  const meanY = sumY / n;
  let ssTotal = 0, ssResidual = 0;
  
  data.forEach((point) => {
    const predictedY = slope * point.month_index + intercept;
    ssTotal += Math.pow(point.total_revenue - meanY, 2);
    ssResidual += Math.pow(point.total_revenue - predictedY, 2);
  });

  const rSquared = 1 - (ssResidual / ssTotal);

  return { slope, intercept, r_squared: rSquared };
}

// Calculate confidence level based on R-squared and data consistency
function calculateConfidence(rSquared: number, dataPoints: number): number {
  // Base confidence on R-squared (0-70%)
  const baseConfidence = Math.max(0, Math.min(70, rSquared * 70));
  
  // Bonus for more data points (0-30%)
  const dataBonus = Math.min(30, (dataPoints / 12) * 30);
  
  return Math.round(baseConfidence + dataBonus);
}

// Main handler
Deno.serve(async (req: Request) => {
  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch historical revenue data (last 12 months)
    const { data: revenueData, error: fetchError } = await supabase
      .from('revenue_trends_summary')
      .select('month, total_revenue')
      .order('month', { ascending: true })
      .limit(12);

    if (fetchError) {
      throw new Error(`Failed to fetch revenue data: ${fetchError.message}`);
    }

    if (!revenueData || revenueData.length < 3) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Insufficient historical data (minimum 3 months required)',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare data with month indices
    const preparedData: RevenueDataPoint[] = revenueData.map((item, index) => ({
      month: item.month,
      total_revenue: parseFloat(item.total_revenue) || 0,
      month_index: index,
    }));

    // Calculate regression model
    const { slope, intercept, r_squared } = calculateLinearRegression(preparedData);

    // Generate predictions for next 3 months
    const predictions: PredictionResult[] = [];
    const lastMonthDate = new Date(preparedData[preparedData.length - 1].month);
    const nextMonthIndex = preparedData.length;

    for (let i = 0; i < 3; i++) {
      const futureMonthIndex = nextMonthIndex + i;
      const predictedRevenue = Math.max(0, slope * futureMonthIndex + intercept);
      
      // Calculate predicted month date
      const predictedDate = new Date(lastMonthDate);
      predictedDate.setMonth(predictedDate.getMonth() + i + 1);
      const predictedMonth = predictedDate.toISOString().split('T')[0].substring(0, 7) + '-01';

      predictions.push({
        predicted_month: predictedMonth,
        predicted_revenue: Math.round(predictedRevenue * 100) / 100,
        confidence_level: calculateConfidence(r_squared, preparedData.length),
        model_parameters: {
          slope: Math.round(slope * 100) / 100,
          intercept: Math.round(intercept * 100) / 100,
          r_squared: Math.round(r_squared * 1000) / 1000,
        },
      });
    }

    // Store predictions in database
    const predictionRecords = predictions.map((pred) => ({
      prediction_date: new Date().toISOString().split('T')[0],
      predicted_month: pred.predicted_month,
      predicted_revenue: pred.predicted_revenue,
      confidence_level: pred.confidence_level,
      prediction_method: 'linear_regression',
      historical_data_points: preparedData.length,
      avg_historical_revenue:
        preparedData.reduce((sum, d) => sum + d.total_revenue, 0) / preparedData.length,
      model_parameters: pred.model_parameters,
    }));

    // Upsert predictions (update if exists for same month)
    const { error: insertError } = await supabase
      .from('revenue_predictions')
      .upsert(predictionRecords, {
        onConflict: 'predicted_month,prediction_date',
        ignoreDuplicates: false,
      });

    if (insertError) {
      console.error('Failed to insert predictions:', insertError);
      throw new Error(`Failed to store predictions: ${insertError.message}`);
    }

    // Update accuracy for completed months
    await supabase.rpc('update_prediction_accuracy');

    // Log success
    console.log(`✅ Predictions generated successfully for ${predictions.length} months`);
    console.log(`📊 Model R²: ${r_squared.toFixed(3)}, Data points: ${preparedData.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        predictions,
        model: {
          r_squared,
          data_points: preparedData.length,
          method: 'linear_regression',
        },
        message: `Generated ${predictions.length} monthly predictions`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Prediction error:', error);

    // Send alert to SysAdmin on failure
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.functions.invoke('alert-notification', {
          body: {
            job_name: 'predict-trends',
            error_message: error.message,
            severity: 'high',
          },
        });
      } catch (alertError) {
        console.error('Failed to send alert:', alertError);
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
