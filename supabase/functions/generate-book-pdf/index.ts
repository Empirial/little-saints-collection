import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const APP_BASE_URL = 'https://id-preview--458c56aa-94e0-4a2e-a88b-39f542ebabc3.lovable.app';

// Theme assignment based on gender and occurrence
const getThemeForLetter = (occurrenceIndex: number, gender: string): string => {
  const boyThemes = ['Superhero', 'Wild Animal', 'Fairytale'];
  const girlThemes = ['Fairytale', 'Superhero', 'Wild Animal'];
  const themes = gender === 'boy' ? boyThemes : girlThemes;
  return themes[occurrenceIndex % 3];
};

// Get character folder based on gender and skin tone
const getCharacterFolder = (gender: string, skinTone: string): string => {
  if (gender === 'boy') {
    return skinTone === 'dark' ? 'Blackboy' : 'whiteboy';
  }
  return skinTone === 'dark' ? 'Blackgirl' : 'whitegirl';
};

// Map theme name to folder name
const getThemeFolder = (theme: string): string => {
  const themeMap: Record<string, string> = {
    'Superhero': 'Superherotheme',
    'Wild Animal': 'Wildanimaltheme',
    'Fairytale': 'Fairytaletheme'
  };
  return themeMap[theme] || 'Superherotheme';
};

// Character description
const getCharacterDescription = (gender: string, skinTone: string): string => {
  const genderLabel = gender === 'boy' ? 'Boy' : 'Girl';
  const skinLabel = skinTone === 'dark' ? 'Dark skin' : 'Light skin';
  return `${genderLabel} (${skinLabel})`;
};

interface BookData {
  childName: string;
  gender: string;
  skinTone: string;
  fromField?: string;
  personalMessage?: string;
  pageCount?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!BREVO_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "Missing orderId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Failed to fetch order:", orderError);
      throw new Error("Order not found");
    }

    const bookData = order.book_data as BookData;
    if (!bookData) {
      throw new Error("No book data found for this order");
    }

    console.log("Processing book order:", order.order_number);

    // Build letter breakdown with themes
    const letters = bookData.childName.toUpperCase().split('').filter((l: string) => /[A-Z]/.test(l));
    const letterOccurrences: Map<string, number> = new Map();
    const characterFolder = getCharacterFolder(bookData.gender, bookData.skinTone);

    // Generate PDF
    console.log("Starting PDF generation...");
    const pdfDoc = await PDFDocument.create();

    for (const letter of letters) {
      const occurrenceIndex = letterOccurrences.get(letter) || 0;
      letterOccurrences.set(letter, occurrenceIndex + 1);
      
      const theme = getThemeForLetter(occurrenceIndex, bookData.gender);
      const themeFolder = getThemeFolder(theme);
      const letterNum = letter.charCodeAt(0) - 64; // A=1, B=2, etc.
      
      const imageUrl = `${APP_BASE_URL}/src/assets/personalizationjpg/${characterFolder}/${themeFolder}/${letterNum}.jpg`;
      console.log(`Fetching image: ${imageUrl}`);
      
      try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          console.error(`Failed to fetch image for letter ${letter}: ${imageResponse.status}`);
          continue;
        }
        
        const imageBytes = await imageResponse.arrayBuffer();
        const jpgImage = await pdfDoc.embedJpg(imageBytes);
        
        // Get original image dimensions
        const { width, height } = jpgImage.scale(1);
        const halfWidth = width / 2;
        
        // Page 1: Left half of the spread (landscape orientation)
        const page1 = pdfDoc.addPage([halfWidth, height]);
        page1.drawImage(jpgImage, {
          x: 0,
          y: 0,
          width: width,
          height: height,
        });
        
        // Page 2: Right half of the spread (landscape orientation)
        const page2 = pdfDoc.addPage([halfWidth, height]);
        page2.drawImage(jpgImage, {
          x: -halfWidth,  // Shift image left to show right half
          y: 0,
          width: width,
          height: height,
        });
        
        console.log(`Added 2 pages for letter ${letter} with theme ${theme} (split spread)`);
      } catch (imageError) {
        console.error(`Error processing image for letter ${letter}:`, imageError);
      }
    }

    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
    
    console.log(`PDF generated with ${pdfDoc.getPageCount()} pages`);

    // Reset letter occurrences for email breakdown
    letterOccurrences.clear();
    
    const letterBreakdown = letters.map((letter) => {
      const occurrenceIndex = letterOccurrences.get(letter) || 0;
      letterOccurrences.set(letter, occurrenceIndex + 1);
      const theme = getThemeForLetter(occurrenceIndex, bookData.gender);
      const letterNum = letter.charCodeAt(0) - 64;
      return `<tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${letter}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${letterNum}.jpg</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${theme}</td>
      </tr>`;
    }).join('');

    // Send detailed email with PDF attachment
    const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: "Little Saint Art",
          email: "orders@littlesaintart.co.za"
        },
        to: [
          {
            email: "mphelalufuno1.0@gmail.com",
            name: "Production Team"
          }
        ],
        subject: `📚 Book Order ${order.order_number} - ${bookData.childName}'s Book`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; border-bottom: 2px solid #5c4d9a; padding-bottom: 10px;">
              📚 New Personalized Book Order
            </h1>
            
            <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #5c4d9a;">Order Details</h2>
              <p><strong>Order Number:</strong> ${order.order_number}</p>
              <p><strong>Customer:</strong> ${order.customer_name}</p>
              <p><strong>Email:</strong> ${order.customer_email}</p>
              <p><strong>Phone:</strong> ${order.customer_phone}</p>
              <p><strong>Delivery:</strong> ${order.delivery_method} - ${order.delivery_address}</p>
            </div>

            <div style="background: #fff8e6; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f5a623;">
              <h2 style="margin-top: 0; color: #5c4d9a;">Book Specifications</h2>
              <p><strong>Child's Name:</strong> <span style="font-size: 24px; color: #5c4d9a;">${bookData.childName}</span></p>
              <p><strong>Character:</strong> ${getCharacterDescription(bookData.gender, bookData.skinTone)}</p>
              <p><strong>Asset Folder:</strong> <code style="background: #eee; padding: 2px 6px; border-radius: 4px;">personalizationjpg/${characterFolder}/</code></p>
              <p><strong>From:</strong> ${bookData.fromField || 'Not specified'}</p>
              <p><strong>Personal Message:</strong> ${bookData.personalMessage || 'None'}</p>
            </div>

            <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #2e7d32;">Letter Pages (${letters.length} pages)</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #2e7d32; color: white;">
                    <th style="padding: 8px; border: 1px solid #ddd;">Letter</th>
                    <th style="padding: 8px; border: 1px solid #ddd;">Image File</th>
                    <th style="padding: 8px; border: 1px solid #ddd;">Theme</th>
                  </tr>
                </thead>
                <tbody>
                  ${letterBreakdown}
                </tbody>
              </table>
            </div>

            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #1565c0;">📎 PDF Attached</h2>
              <p>The generated book PDF is attached to this email.</p>
            </div>

            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Order placed on ${new Date(order.created_at).toLocaleString('en-ZA')}
            </p>
          </div>
        `,
        attachment: [
          {
            content: pdfBase64,
            name: `${bookData.childName}-book-${order.order_number}.pdf`
          }
        ]
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Brevo API error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    console.log("Book order email with PDF sent successfully for order:", order.order_number);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Book PDF generated and sent to production",
        orderNumber: order.order_number,
        pageCount: pdfDoc.getPageCount()
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in generate-book-pdf:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
