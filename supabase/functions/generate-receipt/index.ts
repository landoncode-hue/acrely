import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReceiptData {
  payment_id: string;
  customer_name: string;
  plot_reference: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { payment_id } = await req.json();

    if (!payment_id) {
      throw new Error("payment_id is required");
    }

    // Fetch receipt record
    const { data: receipt, error: receiptError } = await supabaseClient
      .from("receipts")
      .select("*")
      .eq("payment_id", payment_id)
      .single();

    if (receiptError) throw receiptError;

    // Fetch payment details with related data
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .select(
        `
        *,
        allocation:allocations (
          *,
          customer:customers (*),
          plot:plots (*)
        )
      `
      )
      .eq("id", payment_id)
      .single();

    if (paymentError) throw paymentError;

    // Get company details from environment
    const companyName = Deno.env.get("COMPANY_NAME") || "Pinnacle Builders Homes & Properties";
    const companyEmail = Deno.env.get("COMPANY_EMAIL") || "info@pinnaclegroups.ng";
    const companyPhone = Deno.env.get("COMPANY_PHONE") || "+234XXXXXXXXXX";
    const companyAddress = Deno.env.get("COMPANY_ADDRESS") || "Edo, Nigeria";

    // Generate receipt HTML
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Payment Receipt - ${receipt.receipt_number}</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #0052CC; padding-bottom: 20px; }
          .header h1 { color: #0052CC; margin: 0; font-size: 28px; }
          .company-info { text-align: center; margin-bottom: 30px; color: #666; }
          .receipt-details { background: #e6f1ff; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #99c7ff; }
          .detail-label { font-weight: 600; color: #0052CC; }
          .detail-value { color: #333; }
          .amount-box { background: linear-gradient(135deg, #0052CC 0%, #0042a3 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; }
          .amount-box .label { font-size: 14px; opacity: 0.9; }
          .amount-box .value { font-size: 32px; font-weight: bold; margin-top: 10px; }
          .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 2px solid #cce3ff; color: #666; font-size: 12px; }
          .signature-section { margin-top: 60px; display: flex; justify-content: space-between; }
          .signature-box { text-align: center; width: 200px; }
          .signature-line { border-top: 2px solid #333; margin-top: 60px; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PAYMENT RECEIPT</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; color: #666;">Receipt #${receipt.receipt_number}</p>
        </div>

        <div class="company-info">
          <h2 style="margin: 0; color: #0052CC;">${companyName}</h2>
          <p style="margin: 5px 0; font-style: italic; color: #0ABF53; font-weight: 600;">Building Trust, One Estate at a Time</p>
          <p style="margin: 5px 0;">${companyAddress}</p>
          <p style="margin: 5px 0;">Email: ${companyEmail} | Phone: ${companyPhone}</p>
        </div>

        <div class="receipt-details">
          <div class="detail-row">
            <span class="detail-label">Customer Name:</span>
            <span class="detail-value">${payment.allocation.customer.full_name}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Phone:</span>
            <span class="detail-value">${payment.allocation.customer.phone}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Plot:</span>
            <span class="detail-value">${payment.allocation.plot.estate_code}-${payment.allocation.plot.plot_number} (${payment.allocation.plot.estate_name})</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Date:</span>
            <span class="detail-value">${new Date(payment.payment_date).toLocaleDateString()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Method:</span>
            <span class="detail-value">${payment.payment_method.replace("_", " ").toUpperCase()}</span>
          </div>
        </div>

        <div class="amount-box">
          <div class="label">Amount Paid</div>
          <div class="value">₦${payment.amount.toLocaleString()}</div>
        </div>

        <div class="receipt-details">
          <div class="detail-row">
            <span class="detail-label">Total Amount:</span>
            <span class="detail-value">₦${payment.allocation.total_amount.toLocaleString()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount Paid (cumulative):</span>
            <span class="detail-value">₦${payment.allocation.amount_paid.toLocaleString()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Balance Remaining:</span>
            <span class="detail-value">₦${payment.allocation.balance.toLocaleString()}</span>
          </div>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line">Received By</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">Customer Signature</div>
          </div>
        </div>

        <div class="footer">
          <p><strong>Thank you for your payment!</strong></p>
          <p>This is an official receipt from <strong>${companyName}</strong></p>
          <p style="font-style: italic; color: #0ABF53;">Building Trust, One Estate at a Time</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p style="margin-top: 15px; font-size: 11px;">Payment Ref: ${payment.reference}</p>
        </div>
      </body>
      </html>
    `;

    // Upload HTML to Supabase Storage
    const fileName = `${receipt.receipt_number}.html`;
    const filePath = `receipts/${fileName}`;
    
    // Convert HTML to Blob for storage
    const htmlBlob = new Blob([receiptHTML], { type: "text/html" });
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from("receipts")
      .upload(filePath, htmlBlob, {
        contentType: "text/html",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error(`Failed to upload receipt: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from("receipts")
      .getPublicUrl(filePath);

    const receiptUrl = urlData.publicUrl;

    // Update receipt record with file URL
    await supabaseClient
      .from("receipts")
      .update({ file_url: receiptUrl })
      .eq("id", receipt.id);

    // Update payment with receipt URL
    await supabaseClient
      .from("payments")
      .update({ receipt_url: receiptUrl })
      .eq("id", payment_id);

    // Update receipt queue status
    await supabaseClient
      .from("receipt_queue")
      .update({ 
        status: "generated",
        receipt_url: receiptUrl,
        generated_at: new Date().toISOString()
      })
      .eq("payment_id", payment_id);

    return new Response(
      JSON.stringify({
        success: true,
        receipt_id: receipt.id,
        receipt_number: receipt.receipt_number,
        receipt_url: receiptUrl,
        payment_id: payment_id,
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
