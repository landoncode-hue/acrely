import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "supabase";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TERMII_API_KEY = Deno.env.get("TERMII_API_KEY") ?? "";
const TERMII_BASE_URL = Deno.env.get("TERMII_BASE_URL") ?? "https://v3.api.termii.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { campaign_id } = await req.json();

    // Fetch campaign details
    const { data: campaign, error: campaignError } = await supabaseClient
      .from("sms_campaigns")
      .select("*")
      .eq("id", campaign_id)
      .single();

    if (campaignError) throw campaignError;

    // Update campaign status to sending
    await supabaseClient
      .from("sms_campaigns")
      .update({ status: "sending" })
      .eq("id", campaign_id);

    // Fetch recipients
    const { data: recipients, error: recipientsError } = await supabaseClient
      .from("campaign_recipients")
      .select("*")
      .eq("campaign_id", campaign_id)
      .eq("status", "pending");

    if (recipientsError) throw recipientsError;

    let successCount = 0;
    let failCount = 0;

    // Send SMS to each recipient
    for (const recipient of recipients || []) {
      try {
        const termiiResponse = await fetch(`${TERMII_BASE_URL}/api/sms/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: recipient.phone,
            from: campaign.sender_id,
            sms: campaign.message,
            type: "plain",
            channel: "generic",
            api_key: TERMII_API_KEY,
          }),
        });

        const termiiData = await termiiResponse.json();

        if (termiiResponse.ok) {
          // Update recipient status to sent
          await supabaseClient
            .from("campaign_recipients")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
            })
            .eq("id", recipient.id);
          successCount++;
        } else {
          // Update recipient status to failed
          await supabaseClient
            .from("campaign_recipients")
            .update({
              status: "failed",
              error_message: termiiData.message || "Unknown error",
            })
            .eq("id", recipient.id);
          failCount++;
        }

        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        // Update recipient status to failed
        await supabaseClient
          .from("campaign_recipients")
          .update({
            status: "failed",
            error_message: error.message,
          })
          .eq("id", recipient.id);
        failCount++;
      }
    }

    // Update campaign with results
    await supabaseClient
      .from("sms_campaigns")
      .update({
        status: "completed",
        successful_sends: successCount,
        failed_sends: failCount,
        sent_at: new Date().toISOString(),
      })
      .eq("id", campaign_id);

    return new Response(
      JSON.stringify({
        success: true,
        campaign_id,
        successful_sends: successCount,
        failed_sends: failCount,
        total: recipients?.length || 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    // Mark campaign as failed
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    try {
      await supabaseClient
        .from("sms_campaigns")
        .update({ status: "failed" })
        .eq("id", (await req.json()).campaign_id);
    } catch {}

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
