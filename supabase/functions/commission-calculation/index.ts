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

    const { allocation_id } = await req.json();

    // Fetch allocation with payment and agent details
    const { data: allocation, error: allocationError } = await supabaseClient
      .from("allocations")
      .select("*, agent:users(*)")
      .eq("id", allocation_id)
      .single();

    if (allocationError) throw allocationError;

    // Only calculate commission if agent exists
    if (!allocation.agent_id) {
      return new Response(
        JSON.stringify({ message: "No agent assigned to this allocation" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Get default commission rate from settings
    const { data: settings } = await supabaseClient
      .from("settings")
      .select("value")
      .eq("key", "default_commission_rate")
      .single();

    const commissionRate = parseFloat(settings?.value || "5");
    const commissionAmount = (allocation.total_amount * commissionRate) / 100;

    // Check if commission already exists
    const { data: existingCommission } = await supabaseClient
      .from("commissions")
      .select("id")
      .eq("allocation_id", allocation_id)
      .single();

    if (existingCommission) {
      return new Response(
        JSON.stringify({ message: "Commission already exists for this allocation" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Create commission record
    const { data: commission, error: commissionError } = await supabaseClient
      .from("commissions")
      .insert({
        agent_id: allocation.agent_id,
        allocation_id: allocation.id,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        status: "pending",
      })
      .select()
      .single();

    if (commissionError) throw commissionError;

    // Create notification for agent
    await supabaseClient.from("notifications").insert({
      user_id: allocation.agent_id,
      title: "New Commission Earned",
      message: `You have earned a commission of ₦${commissionAmount.toLocaleString()} from allocation ${allocation_id.substring(0, 8)}`,
      type: "success",
      link: `/commissions/${commission.id}`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        commission,
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
