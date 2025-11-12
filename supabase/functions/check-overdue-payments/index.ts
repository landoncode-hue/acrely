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

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Find allocations with overdue payments
    const { data: overdueAllocations, error: fetchError } = await supabaseClient
      .from("allocations")
      .select(
        `
        *,
        customer:customers(*),
        plot:plots(*),
        agent:users(*)
      `
      )
      .eq("status", "active")
      .eq("payment_plan", "installment")
      .lte("next_payment_date", todayStr);

    if (fetchError) throw fetchError;

    let notificationsCreated = 0;

    for (const allocation of overdueAllocations || []) {
      // Mark as defaulted if payment is more than 30 days overdue
      const nextPaymentDate = new Date(allocation.next_payment_date);
      const daysDiff = Math.floor((today.getTime() - nextPaymentDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff > 30) {
        await supabaseClient
          .from("allocations")
          .update({ status: "defaulted" })
          .eq("id", allocation.id);

        // Notify admin and agent
        if (allocation.agent_id) {
          await supabaseClient.from("notifications").insert({
            user_id: allocation.agent_id,
            title: "Allocation Defaulted",
            message: `Allocation for ${allocation.customer.full_name} on plot ${allocation.plot.estate_code}-${allocation.plot.plot_number} has been marked as defaulted due to non-payment.`,
            type: "error",
            link: `/allocations/${allocation.id}`,
          });
          notificationsCreated++;
        }
      } else {
        // Send overdue reminder
        if (allocation.agent_id) {
          await supabaseClient.from("notifications").insert({
            user_id: allocation.agent_id,
            title: "Payment Overdue",
            message: `Payment for ${allocation.customer.full_name} on plot ${allocation.plot.estate_code}-${allocation.plot.plot_number} is ${daysDiff} days overdue.`,
            type: "warning",
            link: `/allocations/${allocation.id}`,
          });
          notificationsCreated++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checked: overdueAllocations?.length || 0,
        notifications_created: notificationsCreated,
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
