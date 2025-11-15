import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QueueHealth {
  pending_count: number;
  processing_count: number;
  failed_count: number;
  completed_count: number;
  avg_processing_time: number | null;
  last_queued_at: string | null;
}

interface HealthReport {
  timestamp: string;
  status: "healthy" | "warning" | "critical";
  sms_queue: QueueHealth & { alerts: string[] };
  receipt_queue: QueueHealth & { alerts: string[] };
  recommendations: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check SMS Queue Health
    const { data: smsQueueData, error: smsError } = await supabase
      .from("sms_queue")
      .select("status, created_at, processed_at")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (smsError) {
      throw new Error(`SMS Queue query failed: ${smsError.message}`);
    }

    // Calculate SMS queue metrics
    const smsMetrics = calculateQueueMetrics(smsQueueData || []);
    const smsAlerts = checkSmsAlerts(smsMetrics);

    // Check Receipt Queue Health
    const { data: receiptQueueData, error: receiptError } = await supabase
      .from("receipt_queue")
      .select("status, created_at, processed_at")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (receiptError) {
      throw new Error(`Receipt Queue query failed: ${receiptError.message}`);
    }

    // Calculate receipt queue metrics
    const receiptMetrics = calculateQueueMetrics(receiptQueueData || []);
    const receiptAlerts = checkReceiptAlerts(receiptMetrics);

    // Determine overall system health
    const overallStatus = determineOverallStatus(smsAlerts, receiptAlerts);

    // Generate recommendations
    const recommendations = generateRecommendations(smsMetrics, receiptMetrics, smsAlerts, receiptAlerts);

    // Build health report
    const report: HealthReport = {
      timestamp: new Date().toISOString(),
      status: overallStatus,
      sms_queue: {
        ...smsMetrics,
        alerts: smsAlerts,
      },
      receipt_queue: {
        ...receiptMetrics,
        alerts: receiptAlerts,
      },
      recommendations,
    };

    // Log critical alerts
    if (overallStatus === "critical") {
      console.error("🚨 CRITICAL ALERT:", report);
      await sendCriticalAlert(supabase, report);
    } else if (overallStatus === "warning") {
      console.warn("⚠️ WARNING:", report);
    }

    return new Response(JSON.stringify(report, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in queue-health-monitor:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function calculateQueueMetrics(queueData: any[]): QueueHealth {
  const pending = queueData.filter((item) => item.status === "pending");
  const processing = queueData.filter((item) => item.status === "processing");
  const failed = queueData.filter((item) => item.status === "failed");
  const completed = queueData.filter(
    (item) => item.status === "sent" || item.status === "completed"
  );

  // Calculate average processing time (in seconds)
  const processingTimes = queueData
    .filter((item) => item.processed_at && item.created_at)
    .map((item) => {
      const created = new Date(item.created_at).getTime();
      const processed = new Date(item.processed_at).getTime();
      return (processed - created) / 1000;
    });

  const avgProcessingTime = processingTimes.length > 0
    ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
    : null;

  const lastQueued = queueData.length > 0
    ? queueData.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0].created_at
    : null;

  return {
    pending_count: pending.length,
    processing_count: processing.length,
    failed_count: failed.length,
    completed_count: completed.length,
    avg_processing_time: avgProcessingTime,
    last_queued_at: lastQueued,
  };
}

function checkSmsAlerts(metrics: QueueHealth): string[] {
  const alerts: string[] = [];

  if (metrics.pending_count > 100) {
    alerts.push(`High pending SMS count: ${metrics.pending_count}`);
  }

  if (metrics.failed_count > 10) {
    alerts.push(`Excessive failed SMS: ${metrics.failed_count}`);
  }

  if (metrics.processing_count > 20) {
    alerts.push(`Too many SMS in processing state: ${metrics.processing_count}`);
  }

  if (metrics.avg_processing_time && metrics.avg_processing_time > 60) {
    alerts.push(`Slow SMS processing: ${metrics.avg_processing_time.toFixed(2)}s average`);
  }

  return alerts;
}

function checkReceiptAlerts(metrics: QueueHealth): string[] {
  const alerts: string[] = [];

  if (metrics.pending_count > 50) {
    alerts.push(`High pending receipt count: ${metrics.pending_count}`);
  }

  if (metrics.failed_count > 10) {
    alerts.push(`Excessive failed receipts: ${metrics.failed_count}`);
  }

  if (metrics.processing_count > 15) {
    alerts.push(`Too many receipts in processing state: ${metrics.processing_count}`);
  }

  if (metrics.avg_processing_time && metrics.avg_processing_time > 30) {
    alerts.push(`Slow receipt processing: ${metrics.avg_processing_time.toFixed(2)}s average`);
  }

  return alerts;
}

function determineOverallStatus(
  smsAlerts: string[],
  receiptAlerts: string[]
): "healthy" | "warning" | "critical" {
  const totalAlerts = smsAlerts.length + receiptAlerts.length;

  if (totalAlerts === 0) return "healthy";
  if (totalAlerts <= 2) return "warning";
  return "critical";
}

function generateRecommendations(
  smsMetrics: QueueHealth,
  receiptMetrics: QueueHealth,
  smsAlerts: string[],
  receiptAlerts: string[]
): string[] {
  const recommendations: string[] = [];

  // SMS recommendations
  if (smsMetrics.pending_count > 100) {
    recommendations.push("Increase SMS queue processing frequency or parallelism");
  }

  if (smsMetrics.failed_count > 10) {
    recommendations.push("Review failed SMS logs and check Termii API status");
  }

  if (smsMetrics.avg_processing_time && smsMetrics.avg_processing_time > 60) {
    recommendations.push("Optimize SMS sending logic or check network connectivity");
  }

  // Receipt recommendations
  if (receiptMetrics.pending_count > 50) {
    recommendations.push("Increase receipt generation capacity or batch processing");
  }

  if (receiptMetrics.failed_count > 10) {
    recommendations.push("Check receipt template and PDF generation service");
  }

  // General recommendations
  if (smsAlerts.length === 0 && receiptAlerts.length === 0) {
    recommendations.push("All queues are healthy - no action required");
  }

  return recommendations;
}

async function sendCriticalAlert(supabase: any, report: HealthReport) {
  try {
    // Log critical alert to audit log
    await supabase.from("audit_logs").insert({
      action: "system_alert",
      entity_type: "queue_monitor",
      details: report,
      severity: "critical",
      created_at: new Date().toISOString(),
    });

    // You can add additional alerting mechanisms here:
    // - Send SMS to admin
    // - Send email
    // - Post to Slack/Telegram
    // - Trigger PagerDuty

    console.log("Critical alert logged successfully");
  } catch (error) {
    console.error("Failed to send critical alert:", error);
  }
}
