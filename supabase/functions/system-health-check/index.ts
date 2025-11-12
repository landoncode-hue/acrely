/**
 * System Health Check Edge Function
 * Author: Kennedy — Landon Digital
 * Version: 1.8.0
 * Quest: acrely-v2-system-maintenance
 * 
 * Runs hourly to check system health:
 * - Database connectivity and response time
 * - Storage accessibility
 * - Error counts from recent logs
 * - System uptime percentage
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  database: {
    connected: boolean;
    response_time_ms: number;
  };
  storage: {
    accessible: boolean;
  };
  metrics: {
    error_count_24h: number;
    uptime_percentage: number;
    failed_cron_jobs_24h: number;
  };
  warnings: string[];
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const startTime = Date.now();
    const warnings: string[] = [];

    // 1. Check database connectivity and response time
    const dbStartTime = Date.now();
    const { data: dbTest, error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();
    
    const dbResponseTime = Date.now() - dbStartTime;
    const databaseConnected = !dbError;

    if (dbResponseTime > 500) {
      warnings.push(`Database response time high: ${dbResponseTime}ms`);
    }

    // 2. Check storage accessibility
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    const storageAccessible = !storageError && buckets !== null;

    if (!storageAccessible) {
      warnings.push('Storage buckets not accessible');
    }

    // 3. Get error count from last 24 hours (audit logs)
    const { count: errorCount } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .eq('action', 'error');

    // 4. Get failed cron jobs count from last 24 hours
    const { count: failedCronCount } = await supabase
      .from('cron_logs')
      .select('*', { count: 'exact', head: true })
      .gte('executed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .eq('status', 'failed');

    if (failedCronCount && failedCronCount > 0) {
      warnings.push(`${failedCronCount} cron job(s) failed in last 24h`);
    }

    // 5. Calculate uptime percentage (based on successful health checks vs total)
    const { data: recentHealthChecks } = await supabase
      .from('system_health')
      .select('*')
      .gte('checked_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('checked_at', { ascending: false });

    let uptimePercentage = 100;
    if (recentHealthChecks && recentHealthChecks.length > 0) {
      const healthyChecks = recentHealthChecks.filter(
        (check) => check.database_response_ms < 1000 && check.storage_accessible
      );
      uptimePercentage = (healthyChecks.length / recentHealthChecks.length) * 100;
    }

    if (uptimePercentage < 99) {
      warnings.push(`Uptime below 99%: ${uptimePercentage.toFixed(2)}%`);
    }

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (!databaseConnected || !storageAccessible) {
      status = 'unhealthy';
    } else if (warnings.length > 0 || dbResponseTime > 500) {
      status = 'degraded';
    }

    const result: HealthCheckResult = {
      status,
      timestamp: new Date().toISOString(),
      database: {
        connected: databaseConnected,
        response_time_ms: dbResponseTime,
      },
      storage: {
        accessible: storageAccessible,
      },
      metrics: {
        error_count_24h: errorCount || 0,
        uptime_percentage: parseFloat(uptimePercentage.toFixed(2)),
        failed_cron_jobs_24h: failedCronCount || 0,
      },
      warnings,
    };

    // Store health check result
    await supabase.from('system_health').insert({
      database_response_ms: dbResponseTime,
      storage_accessible: storageAccessible,
      error_count: errorCount || 0,
      uptime_percentage: uptimePercentage,
      metadata: {
        status,
        warnings,
        failed_cron_jobs: failedCronCount || 0,
      },
    });

    // Log to cron_logs
    const duration = Date.now() - startTime;
    await supabase.from('cron_logs').insert({
      job_name: 'system-health-check',
      duration_ms: duration,
      status: status === 'unhealthy' ? 'failed' : status === 'degraded' ? 'warning' : 'success',
      metadata: result,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Health check failed:', error);

    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
