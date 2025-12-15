import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const yocoSecretKey = Deno.env.get('YOCO_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!yocoSecretKey) {
      console.error('YOCO_SECRET_KEY not configured');
      throw new Error('Payment gateway not configured');
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { amount, currency, successUrl, cancelUrl, metadata } = await req.json();

    console.log('Creating Yoco checkout:', { amount, currency, successUrl, cancelUrl, metadata });

    // Validate required fields
    if (!amount || !successUrl || !cancelUrl) {
      throw new Error('Missing required fields: amount, successUrl, cancelUrl');
    }

    // First, create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: metadata?.customerName || 'Unknown',
        customer_email: metadata?.customerEmail || 'unknown@email.com',
        customer_phone: metadata?.customerPhone || '',
        delivery_address: metadata?.deliveryAddress || '',
        delivery_method: metadata?.deliveryMethod || 'fastway',
        order_notes: metadata?.orderNotes || null,
        subtotal: metadata?.subtotal ? metadata.subtotal * 100 : amount,
        delivery_cost: metadata?.deliveryCost ? metadata.deliveryCost * 100 : 0,
        total: amount,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('Failed to create order');
    }

    console.log('Order created:', order.id);

    // Create checkout session with Yoco API
    const response = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${yocoSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        currency: currency || 'ZAR',
        successUrl,
        cancelUrl,
        metadata: {
          ...metadata,
          orderId: order.id,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Yoco API error:', data);
      throw new Error(data.message || 'Failed to create checkout session');
    }

    console.log('Yoco checkout created successfully:', { id: data.id, redirectUrl: data.redirectUrl });

    // Update order with Yoco checkout ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({ yoco_checkout_id: data.id })
      .eq('id', order.id);

    if (updateError) {
      console.error('Error updating order with checkout ID:', updateError);
    }

    return new Response(JSON.stringify({
      id: data.id,
      redirectUrl: data.redirectUrl,
      orderId: order.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in create-yoco-checkout:', errorMessage);
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
