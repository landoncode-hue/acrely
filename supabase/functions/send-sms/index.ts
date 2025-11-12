import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "supabase";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TERMII_API_KEY = Deno.env.get("TERMII_API_KEY") ?? "";
const TERMII_BASE_URL = Deno.env.get("TERMII_BASE_URL") ?? "https://v3.api.termii.com";
const COMPANY_NAME = "Pinnacle Builders Homes & Properties";
const TERMII_SENDER_ID = "PinnacleBuilders";
const SMS_SIGNATURE = "\n\n-- Pinnacle Builders Homes & Properties";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, message, type, sender_id, receipt_url, metadata } = await req.json();

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: "Phone and message are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Format message with Pinnacle Builders signature
    let formattedMessage = message;
    
    // Add receipt link if provided (from direct param or metadata)
    const receiptLink = receipt_url || metadata?.receipt_url;
    if (receiptLink) {
      formattedMessage = `${message}\n\nDownload receipt: ${receiptLink}`;
    }
    
    formattedMessage = `${formattedMessage}${SMS_SIGNATURE}`;

    // Send SMS via Termii
    const termiiResponse = await fetch(`${TERMII_BASE_URL}/api/sms/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: phone,
        from: sender_id || TERMII_SENDER_ID,
        sms: formattedMessage,
        type: "plain",
        channel: "generic",
        api_key: TERMII_API_KEY,
      }),
    });

    const termiiData = await termiiResponse.json();

    if (!termiiResponse.ok) {
      throw new Error(termiiData.message || "Failed to send SMS");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message_id: termiiData.message_id,
        phone: phone,
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
