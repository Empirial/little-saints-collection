import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const YOCO_SECRET_KEY = Deno.env.get("YOCO_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!YOCO_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const {
      amount,
      currency = "ZAR",
      successUrl,
      cancelUrl,
      failureUrl,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      deliveryMethod,
      deliveryCost,
      subtotal,
      orderNotes,
      bookData
    } = await req.json();

    if (!amount || !customerName || !customerEmail || !customerPhone || !deliveryAddress || !deliveryMethod) {
      return new Response(
        JSON.stringify({ error: "Missing required checkout fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create order in database with order_type = 'book'
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        delivery_method: deliveryMethod,
        delivery_cost: deliveryCost,
        subtotal: subtotal,
        total: amount,
        order_notes: orderNotes || null,
        status: "pending",
        order_type: "book",
        book_data: bookData
      })
      .select()
      .single();

    if (orderError) {
      console.error("Failed to create order:", orderError);
      throw new Error("Failed to create order in database");
    }

    console.log("Created book order:", order.id);

    // Create Yoco checkout
    const yocoResponse = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${YOCO_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: amount,
        currency: currency,
        successUrl: successUrl,
        cancelUrl: cancelUrl,
        failureUrl: failureUrl,
        metadata: {
          orderId: order.id,
          orderType: "book",
          childName: bookData?.childName || ""
        }
      }),
    });

    if (!yocoResponse.ok) {
      const errorText = await yocoResponse.text();
      console.error("Yoco API error:", errorText);
      throw new Error(`Yoco API error: ${errorText}`);
    }

    const yocoData = await yocoResponse.json();
    console.log("Yoco checkout created:", yocoData.id);

    // Update order with Yoco checkout ID
    const { error: updateError } = await supabase
      .from("orders")
      .update({ yoco_checkout_id: yocoData.id })
      .eq("id", order.id);

    if (updateError) {
      console.error("Failed to update order with checkout ID:", updateError);
    }

    return new Response(
      JSON.stringify({
        checkoutId: yocoData.id,
        redirectUrl: yocoData.redirectUrl,
        orderId: order.id
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in create-book-checkout:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
