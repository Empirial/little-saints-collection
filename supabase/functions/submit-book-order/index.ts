import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookData {
  childName: string;
  gender: string;
  skinTone: string;
  fromField: string;
  personalMessage: string;
  pageCount: number;
}

interface OrderRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryMethod: string;
  deliveryCost: number;
  subtotal: number;
  orderNotes?: string;
  bookData: BookData;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: OrderRequest = await req.json();
    console.log("Received book order request:", JSON.stringify(body));

    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      deliveryMethod,
      deliveryCost,
      subtotal,
      orderNotes,
      bookData,
    } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !bookData) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const total = subtotal + deliveryCost;

    // Create order in database with status 'completed' for testing
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress || "Pickup",
        delivery_method: deliveryMethod,
        delivery_cost: deliveryCost,
        subtotal: subtotal,
        total: total,
        order_notes: orderNotes,
        order_type: "book",
        book_data: bookData,
        status: "completed",
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    console.log("Created book order:", order.id);

    // Call generate-book-pdf to send the email
    const functionsUrl = supabaseUrl.replace(".supabase.co", ".supabase.co/functions/v1");
    
    console.log("Calling generate-book-pdf for order:", order.id);
    
    const pdfResponse = await fetch(`${functionsUrl}/generate-book-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ orderId: order.id }),
    });

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      console.error("Error calling generate-book-pdf:", errorText);
      // Don't fail the order, just log the error
    } else {
      console.log("Successfully triggered book PDF generation");
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in submit-book-order:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
