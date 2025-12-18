import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    if (!yocoSecretKey) {
      throw new Error('YOCO_SECRET_KEY is not configured');
    }

    console.log('Registering webhook with Yoco...');

    const webhookUrl = 'https://udaudwkblphataokaexq.supabase.co/functions/v1/yoco-webhook';
    
    const response = await fetch('https://payments.yoco.com/api/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${yocoSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'littlesaintart-payment-webhook',
        url: webhookUrl,
      }),
    });

    const responseText = await response.text();
    console.log('Yoco API response status:', response.status);
    console.log('Yoco API response:', responseText);

    if (!response.ok) {
      throw new Error(`Yoco API error: ${response.status} - ${responseText}`);
    }

    const data = JSON.parse(responseText);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook registered successfully!',
        webhookId: data.id,
        webhookUrl: webhookUrl,
        note: 'If Yoco provided a webhook secret, add it as YOCO_WEBHOOK_SECRET in Supabase secrets',
        fullResponse: data,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error registering webhook:', errorMessage);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
