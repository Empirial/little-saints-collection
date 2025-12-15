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
    const webhookSecret = Deno.env.get('YOCO_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log('Yoco webhook received:', JSON.stringify(body, null, 2));

    const { type, payload } = body;

    // Handle payment succeeded event
    if (type === 'payment.succeeded') {
      const checkoutId = payload?.metadata?.checkoutId || payload?.checkoutId;
      const paymentId = payload?.id;

      console.log('Payment succeeded for checkout:', checkoutId, 'payment:', paymentId);

      if (checkoutId) {
        // Update order status in database
        const { data: order, error: updateError } = await supabase
          .from('orders')
          .update({ 
            status: 'paid', 
            yoco_payment_id: paymentId,
            paid_at: new Date().toISOString()
          })
          .eq('yoco_checkout_id', checkoutId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating order:', updateError);
        } else {
          console.log('Order updated successfully:', order);

          // Submit to Netlify Forms for business notification
          const netlifyFormUrl = Deno.env.get('NETLIFY_SITE_URL') || 'https://littlesaintart.co.za';
          
          try {
            const formData = new URLSearchParams();
            formData.append('form-name', 'order-notification');
            formData.append('order_id', order.id);
            formData.append('customer_name', order.customer_name);
            formData.append('customer_email', order.customer_email);
            formData.append('customer_phone', order.customer_phone);
            formData.append('delivery_address', order.delivery_address);
            formData.append('delivery_method', order.delivery_method);
            formData.append('order_notes', order.order_notes || '');
            formData.append('total', `R${(order.total / 100).toFixed(2)}`);
            formData.append('paid_at', order.paid_at);

            const netlifyResponse = await fetch(netlifyFormUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: formData.toString(),
            });

            console.log('Netlify form submission response:', netlifyResponse.status);
          } catch (netlifyError) {
            console.error('Error submitting to Netlify Forms:', netlifyError);
            // Don't fail the webhook if Netlify submission fails
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in yoco-webhook:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
