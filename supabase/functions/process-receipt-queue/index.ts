import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Processing receipt queue...");

    // Fetch pending receipts from queue
    const { data: pendingReceipts, error: queueError } = await supabaseClient
      .from("receipt_queue")
      .select("*")
      .eq("status", "pending")
      .limit(10);

    if (queueError) {
      console.error("Error fetching queue:", queueError);
      throw queueError;
    }

    if (!pendingReceipts || pendingReceipts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No pending receipts to process",
          processed: 0
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Found ${pendingReceipts.length} pending receipts`);

    const results = [];
    let successCount = 0;
    let failCount = 0;

    // Process each receipt
    for (const queueItem of pendingReceipts) {
      try {
        console.log(`Processing payment_id: ${queueItem.payment_id}`);

        // Call generate-receipt function
        const { data: receiptData, error: genError } = await supabaseClient.functions.invoke(
          "generate-receipt",
          {
            body: { payment_id: queueItem.payment_id },
          }
        );

        if (genError) {
          console.error(`Error generating receipt for ${queueItem.payment_id}:`, genError);
          
          // Mark as failed in queue
          await supabaseClient
            .from("receipt_queue")
            .update({ 
              status: "failed",
              error_message: genError.message || "Unknown error"
            })
            .eq("id", queueItem.id);

          failCount++;
          results.push({
            payment_id: queueItem.payment_id,
            status: "failed",
            error: genError.message,
          });
          continue;
        }

        console.log(`Successfully generated receipt for ${queueItem.payment_id}`);
        successCount++;
        results.push({
          payment_id: queueItem.payment_id,
          status: "success",
          receipt_url: receiptData.receipt_url,
        });

      } catch (error) {
        console.error(`Exception processing ${queueItem.payment_id}:`, error);
        
        // Mark as failed
        await supabaseClient
          .from("receipt_queue")
          .update({ 
            status: "failed",
            error_message: error.message || "Processing exception"
          })
          .eq("id", queueItem.id);

        failCount++;
        results.push({
          payment_id: queueItem.payment_id,
          status: "failed",
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${pendingReceipts.length} receipts`,
        summary: {
          total: pendingReceipts.length,
          successful: successCount,
          failed: failCount,
        },
        results: results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Fatal error in process-receipt-queue:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
