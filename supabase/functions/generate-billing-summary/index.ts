import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

interface BillingSummaryRequest {
  month?: number; // 1-12
  year?: number;
  estate_code?: string;
  force_regenerate?: boolean;
}

interface EstateSummary {
  estate_id: string | null;
  estate_code: string;
  estate_name: string;
  total_payments: number;
  total_amount_collected: number;
  confirmed_payments: number;
  pending_payments: number;
  total_commissions: number;
  pending_commissions: number;
  approved_commissions: number;
  paid_commissions: number;
  total_customers: number;
  active_allocations: number;
  completed_allocations: number;
  outstanding_balance: number;
  collection_rate: number;
}

serve(async (req: Request) => {
  try {
    // CORS headers
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "authorization, content-type",
        },
      });
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body or query params
    let month: number;
    let year: number;
    let estate_code: string | undefined;
    let force_regenerate = false;

    if (req.method === "POST") {
      const body: BillingSummaryRequest = await req.json();
      month = body.month || new Date().getMonth() + 1;
      year = body.year || new Date().getFullYear();
      estate_code = body.estate_code;
      force_regenerate = body.force_regenerate || false;
    } else {
      // GET request - allow manual trigger via cron
      const now = new Date();
      month = now.getMonth() + 1;
      year = now.getFullYear();
    }

    console.log(`Generating billing summary for ${year}-${month.toString().padStart(2, '0')}`);

    // Fetch all estates
    const { data: estates, error: estatesError } = await supabaseClient
      .from("estates")
      .select("id, estate_code, estate_name")
      .eq("status", "active");

    if (estatesError) {
      throw new Error(`Failed to fetch estates: ${estatesError.message}`);
    }

    if (!estates || estates.length === 0) {
      throw new Error("No active estates found");
    }

    // Filter estates if specific estate_code provided
    const targetEstates = estate_code
      ? estates.filter(e => e.estate_code === estate_code)
      : estates;

    console.log(`Processing ${targetEstates.length} estates`);

    const summaries: EstateSummary[] = [];
    const errors: string[] = [];

    // Generate summary for each estate
    for (const estate of targetEstates) {
      try {
        const summary = await generateEstateSummary(
          supabaseClient,
          estate.id,
          estate.estate_code,
          estate.estate_name,
          month,
          year
        );

        summaries.push(summary);

        // Check if summary already exists
        const { data: existing } = await supabaseClient
          .from("billing_summary")
          .select("id")
          .eq("month", month)
          .eq("year", year)
          .eq("estate_code", estate.estate_code)
          .single();

        if (existing && !force_regenerate) {
          // Update existing record
          const { error: updateError } = await supabaseClient
            .from("billing_summary")
            .update({
              estate_id: summary.estate_id,
              estate_name: summary.estate_name,
              total_payments: summary.total_payments,
              total_amount_collected: summary.total_amount_collected,
              confirmed_payments: summary.confirmed_payments,
              pending_payments: summary.pending_payments,
              total_commissions: summary.total_commissions,
              pending_commissions: summary.pending_commissions,
              approved_commissions: summary.approved_commissions,
              paid_commissions: summary.paid_commissions,
              total_customers: summary.total_customers,
              active_allocations: summary.active_allocations,
              completed_allocations: summary.completed_allocations,
              outstanding_balance: summary.outstanding_balance,
              collection_rate: summary.collection_rate,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);

          if (updateError) {
            errors.push(`Failed to update ${estate.estate_code}: ${updateError.message}`);
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabaseClient
            .from("billing_summary")
            .insert({
              month,
              year,
              estate_id: summary.estate_id,
              estate_code: summary.estate_code,
              estate_name: summary.estate_name,
              total_payments: summary.total_payments,
              total_amount_collected: summary.total_amount_collected,
              confirmed_payments: summary.confirmed_payments,
              pending_payments: summary.pending_payments,
              total_commissions: summary.total_commissions,
              pending_commissions: summary.pending_commissions,
              approved_commissions: summary.approved_commissions,
              paid_commissions: summary.paid_commissions,
              total_customers: summary.total_customers,
              active_allocations: summary.active_allocations,
              completed_allocations: summary.completed_allocations,
              outstanding_balance: summary.outstanding_balance,
              collection_rate: summary.collection_rate,
            });

          if (insertError) {
            errors.push(`Failed to insert ${estate.estate_code}: ${insertError.message}`);
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        errors.push(`Error processing ${estate.estate_code}: ${errorMsg}`);
        console.error(`Error processing estate ${estate.estate_code}:`, error);
      }
    }

    // Calculate totals across all estates
    const totals = summaries.reduce(
      (acc, summary) => ({
        total_revenue: acc.total_revenue + summary.total_amount_collected,
        total_commissions: acc.total_commissions + summary.total_commissions,
        total_payments: acc.total_payments + summary.total_payments,
        total_customers: acc.total_customers + summary.total_customers,
        total_outstanding: acc.total_outstanding + summary.outstanding_balance,
      }),
      {
        total_revenue: 0,
        total_commissions: 0,
        total_payments: 0,
        total_customers: 0,
        total_outstanding: 0,
      }
    );

    const responseData = {
      success: true,
      period: `${year}-${month.toString().padStart(2, '0')}`,
      estates_processed: summaries.length,
      totals,
      summaries,
      errors: errors.length > 0 ? errors : undefined,
      generated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(responseData), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error generating billing summary:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

// Generate billing summary for a specific estate
async function generateEstateSummary(
  client: any,
  estateId: string,
  estateCode: string,
  estateName: string,
  month: number,
  year: number
): Promise<EstateSummary> {
  // Calculate date range for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  // Fetch payments for the estate in the given month
  const { data: payments, error: paymentsError } = await client
    .from("payments")
    .select(`
      id,
      amount,
      status,
      payment_date,
      allocations!inner (
        plot_id,
        customer_id,
        total_amount,
        balance,
        agent_id,
        status,
        plots!inner (
          estate_code,
          estate_name
        )
      )
    `)
    .gte("payment_date", startDateStr)
    .lte("payment_date", endDateStr)
    .eq("allocations.plots.estate_code", estateCode);

  if (paymentsError) {
    throw new Error(`Failed to fetch payments for ${estateCode}: ${paymentsError.message}`);
  }

  // Calculate payment metrics
  const totalPayments = payments?.length || 0;
  const confirmedPayments = payments?.filter(p => p.status === 'confirmed').length || 0;
  const pendingPayments = payments?.filter(p => p.status === 'pending').length || 0;
  const totalAmountCollected = payments
    ?.filter(p => p.status === 'confirmed')
    .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  // Fetch allocations for the estate
  const { data: allocations, error: allocationsError } = await client
    .from("allocations")
    .select(`
      id,
      customer_id,
      total_amount,
      balance,
      status,
      agent_id,
      plots!inner (
        estate_code
      )
    `)
    .eq("plots.estate_code", estateCode);

  if (allocationsError) {
    throw new Error(`Failed to fetch allocations for ${estateCode}: ${allocationsError.message}`);
  }

  // Calculate allocation metrics
  const activeAllocations = allocations?.filter(a => a.status === 'active').length || 0;
  const completedAllocations = allocations?.filter(a => a.status === 'completed').length || 0;
  const totalCustomers = new Set(allocations?.map(a => a.customer_id)).size || 0;
  const outstandingBalance = allocations
    ?.filter(a => a.status === 'active')
    .reduce((sum, a) => sum + Number(a.balance), 0) || 0;

  // Fetch commissions for the estate's agents in the given month
  const agentIds = [...new Set(allocations?.map(a => a.agent_id).filter(Boolean))];
  let totalCommissions = 0;
  let pendingCommissions = 0;
  let approvedCommissions = 0;
  let paidCommissions = 0;

  if (agentIds.length > 0) {
    const { data: commissions, error: commissionsError } = await client
      .from("commissions")
      .select(`
        commission_amount,
        status,
        created_at,
        allocations!inner (
          plots!inner (
            estate_code
          )
        )
      `)
      .in("agent_id", agentIds)
      .eq("allocations.plots.estate_code", estateCode)
      .gte("created_at", startDateStr)
      .lte("created_at", endDateStr);

    if (!commissionsError && commissions) {
      totalCommissions = commissions.reduce((sum, c) => sum + Number(c.commission_amount), 0);
      pendingCommissions = commissions
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + Number(c.commission_amount), 0);
      approvedCommissions = commissions
        .filter(c => c.status === 'approved')
        .reduce((sum, c) => sum + Number(c.commission_amount), 0);
      paidCommissions = commissions
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + Number(c.commission_amount), 0);
    }
  }

  // Calculate collection rate
  const expectedAmount = allocations
    ?.filter(a => a.status === 'active')
    .reduce((sum, a) => sum + Number(a.total_amount), 0) || 0;
  const collectionRate = expectedAmount > 0
    ? ((totalAmountCollected / expectedAmount) * 100)
    : 0;

  return {
    estate_id: estateId,
    estate_code: estateCode,
    estate_name: estateName,
    total_payments: totalPayments,
    total_amount_collected: totalAmountCollected,
    confirmed_payments: confirmedPayments,
    pending_payments: pendingPayments,
    total_commissions: totalCommissions,
    pending_commissions: pendingCommissions,
    approved_commissions: approvedCommissions,
    paid_commissions: paidCommissions,
    total_customers: totalCustomers,
    active_allocations: activeAllocations,
    completed_allocations: completedAllocations,
    outstanding_balance: outstandingBalance,
    collection_rate: Math.round(collectionRate * 100) / 100,
  };
}

/* Deno KV for caching and rate limiting */
const kv = await Deno.openKv();

// Cache billing summary results for 1 hour
async function getCachedSummary(key: string): Promise<any | null> {
  const result = await kv.get(["billing_cache", key]);
  return result.value;
}

async function setCachedSummary(key: string, data: any): Promise<void> {
  await kv.set(["billing_cache", key], data, { expireIn: 3600000 }); // 1 hour
}
