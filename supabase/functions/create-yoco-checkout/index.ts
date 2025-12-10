import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
      console.error('YOCO_SECRET_KEY not configured');
      throw new Error('Payment gateway not configured');
    }

    const { amount, currency, successUrl, cancelUrl, metadata } = await req.json();

    console.log('Creating Yoco checkout:', { amount, currency, successUrl, cancelUrl, metadata });

    // Validate required fields
    if (!amount || !successUrl || !cancelUrl) {
      throw new Error('Missing required fields: amount, successUrl, cancelUrl');
    }

    // Create checkout session with Yoco API
    const response = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${yocoSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount, // Amount in cents
        currency: currency || 'ZAR',
        successUrl,
        cancelUrl,
        metadata: metadata || {},
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Yoco API error:', data);
      throw new Error(data.message || 'Failed to create checkout session');
    }

    console.log('Yoco checkout created successfully:', { id: data.id, redirectUrl: data.redirectUrl });

    return new Response(JSON.stringify({
      id: data.id,
      redirectUrl: data.redirectUrl,
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
