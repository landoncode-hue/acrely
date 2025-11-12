/**
 * Storage Cleanup Edge Function
 * Author: Kennedy — Landon Digital
 * Version: 1.8.0
 * Quest: acrely-v2-system-maintenance
 * 
 * Cleans up orphaned receipts older than 12 months
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate cutoff date (12 months ago)
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 12);

    console.log(`Starting storage cleanup for receipts older than ${cutoffDate.toISOString()}`);

    // Find old receipts
    const { data: oldReceipts, error: fetchError } = await supabase
      .from('receipts')
      .select('id, receipt_url, generated_at')
      .lt('generated_at', cutoffDate.toISOString())
      .eq('status', 'generated');

    if (fetchError) {
      throw new Error(`Failed to fetch old receipts: ${fetchError.message}`);
    }

    if (!oldReceipts || oldReceipts.length === 0) {
      console.log('No old receipts found for cleanup');
      
      const duration = Date.now() - startTime;
      await supabase.from('cron_logs').insert({
        job_name: 'storage-cleanup',
        duration_ms: duration,
        status: 'success',
        metadata: { receipts_deleted: 0 },
      });

      return new Response(
        JSON.stringify({
          success: true,
          receipts_deleted: 0,
          message: 'No old receipts to clean up',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    let deletedCount = 0;
    const errors: string[] = [];

    // Delete each receipt from storage
    for (const receipt of oldReceipts) {
      try {
        // Extract file path from receipt_url
        const urlParts = receipt.receipt_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `receipts/${fileName}`;

        // Delete from storage
        const { error: deleteError } = await supabase.storage
          .from('receipts')
          .remove([filePath]);

        if (deleteError) {
          console.error(`Failed to delete ${filePath}:`, deleteError);
          errors.push(`Receipt ${receipt.id}: ${deleteError.message}`);
          continue;
        }

        // Update receipt status to 'archived'
        await supabase
          .from('receipts')
          .update({ status: 'archived' })
          .eq('id', receipt.id);

        deletedCount++;
      } catch (err) {
        console.error(`Error processing receipt ${receipt.id}:`, err);
        errors.push(`Receipt ${receipt.id}: ${err.message}`);
      }
    }

    const duration = Date.now() - startTime;

    // Log to cron_logs
    await supabase.from('cron_logs').insert({
      job_name: 'storage-cleanup',
      duration_ms: duration,
      status: errors.length > 0 ? 'warning' : 'success',
      error_message: errors.length > 0 ? errors.join('; ') : null,
      metadata: {
        receipts_found: oldReceipts.length,
        receipts_deleted: deletedCount,
        errors_count: errors.length,
      },
    });

    console.log(`Storage cleanup completed: ${deletedCount}/${oldReceipts.length} receipts cleaned up`);

    return new Response(
      JSON.stringify({
        success: true,
        receipts_found: oldReceipts.length,
        receipts_deleted: deletedCount,
        errors_count: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Storage cleanup failed:', error);

    const duration = Date.now() - startTime;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log failure
    await supabase.from('cron_logs').insert({
      job_name: 'storage-cleanup',
      duration_ms: duration,
      status: 'failed',
      error_message: error.message,
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
