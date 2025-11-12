import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "supabase";

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

    const { commission_id, agent_id } = await req.json();

    // Fetch commission
    const { data: commission, error: commissionError } = await supabaseClient
      .from("commissions")
      .select("*")
      .eq("id", commission_id)
      .eq("agent_id", agent_id)
      .eq("status", "approved")
      .single();

    if (commissionError) {
      return new Response(
        JSON.stringify({ error: "Commission not found or not approved" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    // Update commission status to paid
    const { error: updateError } = await supabaseClient
      .from("commissions")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", commission_id);

    if (updateError) throw updateError;

    // Create notification
    await supabaseClient.from("notifications").insert({
      user_id: agent_id,
      title: "Commission Claimed",
      message: `Your commission of ₦${commission.commission_amount.toLocaleString()} has been marked as paid.`,
      type: "success",
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Commission claimed successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
