import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Send order confirmation email via Brevo
async function sendOrderConfirmationEmail(order: any) {
  const brevoApiKey = Deno.env.get('BREVO_API_KEY');
  
  if (!brevoApiKey) {
    console.error('BREVO_API_KEY not configured');
    return false;
  }

  const deliveryMethodNames: Record<string, string> = {
    'pickup': 'Collection (Pretoria East)',
    'paxi': 'Paxi PEP Store',
    'courier': 'Courier Delivery',
    'postnet': 'PostNet to PostNet'
  };

  const deliveryMethodDisplay = deliveryMethodNames[order.delivery_method] || order.delivery_method;
  const totalFormatted = `R${(order.total / 100).toFixed(2)}`;
  const subtotalFormatted = `R${(order.subtotal / 100).toFixed(2)}`;
  const deliveryCostFormatted = `R${(order.delivery_cost / 100).toFixed(2)}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">✨ Thank You for Your Order!</h1>
                  <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Little Saint Art</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Hi <strong>${order.customer_name}</strong>,
                  </p>
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    We've received your order and payment. Thank you for supporting Little Saint Art! 🎨
                  </p>
                  
                  <!-- Order Details Card -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; border-radius: 8px; margin-bottom: 30px;">
                    <tr>
                      <td style="padding: 25px;">
                        <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 20px 0; border-bottom: 2px solid #8B5CF6; padding-bottom: 10px;">Order Details</h2>
                        
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Order Number:</td>
                            <td style="color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${order.order_number || order.id}</td>
                          </tr>
                          <tr>
                            <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Delivery Method:</td>
                            <td style="color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${deliveryMethodDisplay}</td>
                          </tr>
                          <tr>
                            <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Delivery Address:</td>
                            <td style="color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${order.delivery_address}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="border-top: 1px solid #d1d5db; padding-top: 15px; margin-top: 10px;"></td>
                          </tr>
                          <tr>
                            <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Subtotal:</td>
                            <td style="color: #1f2937; font-size: 14px; text-align: right; padding: 8px 0;">${subtotalFormatted}</td>
                          </tr>
                          <tr>
                            <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Delivery:</td>
                            <td style="color: #1f2937; font-size: 14px; text-align: right; padding: 8px 0;">${deliveryCostFormatted}</td>
                          </tr>
                          <tr>
                            <td style="color: #1f2937; font-size: 16px; font-weight: 700; padding: 15px 0 8px 0;">Total Paid:</td>
                            <td style="color: #8B5CF6; font-size: 18px; font-weight: 700; text-align: right; padding: 15px 0 8px 0;">${totalFormatted}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- What's Next -->
                  <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 15px 0;">What happens next?</h3>
                  <ul style="color: #374151; font-size: 14px; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
                    <li>We'll prepare your personalized book with care</li>
                    <li>You'll receive tracking info once shipped</li>
                    <li>Estimated delivery: 5-7 business days</li>
                  </ul>
                  
                  ${order.order_notes ? `
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 30px;">
                    <p style="color: #92400e; font-size: 14px; margin: 0;"><strong>Your note:</strong> ${order.order_notes}</p>
                  </div>
                  ` : ''}
                  
                  <!-- Contact -->
                  <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0;">
                    Questions? Contact us on WhatsApp: <a href="https://wa.me/27609549877" style="color: #8B5CF6; text-decoration: none; font-weight: 600;">+27 60 954 9877</a>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 13px; margin: 0;">
                    © ${new Date().getFullYear()} Little Saint Art. Made with ❤️ in South Africa
                  </p>
                  <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                    <a href="https://littlesaintart.co.za" style="color: #8B5CF6; text-decoration: none;">littlesaintart.co.za</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          name: 'Little Saint Art',
          email: 'orders@littlesaintart.co.za'
        },
        to: [
          {
            email: order.customer_email,
            name: order.customer_name
          }
        ],
        subject: `Order Confirmed! 🎉 ${order.order_number || ''}`,
        htmlContent: emailHtml
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Brevo API error:', response.status, errorData);
      return false;
    }

    const result = await response.json();
    console.log('Customer confirmation email sent:', result);
    return true;
  } catch (error) {
    console.error('Error sending email via Brevo:', error);
    return false;
  }
}

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

          // Send customer confirmation email via Brevo
          const emailSent = await sendOrderConfirmationEmail(order);
          console.log('Customer email sent:', emailSent);

          // Submit to Netlify Forms for business notification
          const netlifyFormUrl = Deno.env.get('NETLIFY_SITE_URL') || 'https://littlesaintart.co.za';
          
          try {
            const formData = new URLSearchParams();
            formData.append('form-name', 'order-notification');
            formData.append('order_id', order.order_number || order.id);
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
