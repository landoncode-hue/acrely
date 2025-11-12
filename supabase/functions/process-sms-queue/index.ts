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

    console.log("Processing SMS queue...");

    // Fetch pending SMS from queue
    const { data: pendingSMS, error: queueError } = await supabaseClient
      .from("sms_queue")
      .select("*")
      .eq("status", "pending")
      .limit(20); // Process 20 at a time

    if (queueError) {
      console.error("Error fetching SMS queue:", queueError);
      throw queueError;
    }

    if (!pendingSMS || pendingSMS.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No pending SMS to process",
          processed: 0
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Found ${pendingSMS.length} pending SMS`);

    const results = [];
    let successCount = 0;
    let failCount = 0;

    // Process each SMS
    for (const smsItem of pendingSMS) {
      try {
        console.log(`Sending SMS to ${smsItem.phone}`);

        // Call send-sms function
        const { data: smsData, error: sendError } = await supabaseClient.functions.invoke(
          "send-sms",
          {
            body: { 
              phone: smsItem.phone,
              message: smsItem.message,
              type: smsItem.type,
              metadata: smsItem.metadata
            },
          }
        );

        if (sendError) {
          console.error(`Error sending SMS to ${smsItem.phone}:`, sendError);
          
          // Update attempts and mark as failed if max attempts reached
          const newAttempts = (smsItem.attempts || 0) + 1;
          const status = newAttempts >= 3 ? "failed" : "pending";
          
          await supabaseClient
            .from("sms_queue")
            .update({ 
              attempts: newAttempts,
              status: status,
              error_message: sendError.message || "Unknown error"
            })
            .eq("id", smsItem.id);

          failCount++;
          results.push({
            phone: smsItem.phone,
            status: "failed",
            error: sendError.message,
          });
          continue;
        }

        // Mark as sent
        await supabaseClient
          .from("sms_queue")
          .update({ 
            status: "sent",
            sent_at: new Date().toISOString()
          })
          .eq("id", smsItem.id);

        console.log(`Successfully sent SMS to ${smsItem.phone}`);
        successCount++;
        results.push({
          phone: smsItem.phone,
          status: "success",
        });

      } catch (error) {
        console.error(`Exception sending SMS to ${smsItem.phone}:`, error);
        
        // Update attempts
        const newAttempts = (smsItem.attempts || 0) + 1;
        const status = newAttempts >= 3 ? "failed" : "pending";
        
        await supabaseClient
          .from("sms_queue")
          .update({ 
            attempts: newAttempts,
            status: status,
            error_message: error.message || "Processing exception"
          })
          .eq("id", smsItem.id);

        failCount++;
        results.push({
          phone: smsItem.phone,
          status: "failed",
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${pendingSMS.length} SMS`,
        summary: {
          total: pendingSMS.length,
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
    console.error("Fatal error in process-sms-queue:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
