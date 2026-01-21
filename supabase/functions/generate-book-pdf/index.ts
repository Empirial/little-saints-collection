import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Supabase Storage public URL for book-assets bucket
const STORAGE_URL = 'https://udaudwkblphataokaexq.supabase.co/storage/v1/object/public/book-assets';

// Theme assignment based on gender and occurrence
const getThemeForLetter = (occurrenceIndex: number, gender: string): string => {
  const boyThemes = ['Superhero', 'Wild Animal', 'Fairytale'];
  const girlThemes = ['Fairytale', 'Superhero', 'Wild Animal'];
  const themes = gender === 'boy' ? boyThemes : girlThemes;
  return themes[occurrenceIndex % 3];
};

// Get character folder based on gender and skin tone - matches storage folder structure
const getCharacterFolder = (gender: string, skinTone: string): string => {
  if (gender === 'boy') {
    return skinTone === 'dark' ? 'Blackboy' : 'Whiteboy';
  }
  return skinTone === 'dark' ? 'Blackgirl' : 'Whitegirl';
};

// Map theme name to storage folder name
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

// Helper function to fetch and embed a spread image, splitting it into two PDF pages
async function embedSpreadImage(
  pdfDoc: PDFDocument, 
  imageUrl: string, 
  label: string
): Promise<boolean> {
  try {
    console.log(`Fetching ${label}: ${imageUrl}`);
    const imageResponse = await fetch(imageUrl);
    const contentType = imageResponse.headers.get('content-type');
    
    if (!imageResponse.ok) {
      console.error(`Failed to fetch ${label}: ${imageResponse.status}`);
      return false;
    }
    
    if (!contentType || !contentType.includes('image')) {
      const textPreview = await imageResponse.text();
      console.error(`Got non-image response for ${label}: ${textPreview.substring(0, 200)}`);
      return false;
    }
    
    const imageBytes = await imageResponse.arrayBuffer();
    const jpgImage = await pdfDoc.embedJpg(imageBytes);
    
    const { width, height } = jpgImage.scale(1);
    const halfWidth = width / 2;
    
    // Left page of spread
    const leftPage = pdfDoc.addPage([halfWidth, height]);
    leftPage.drawImage(jpgImage, {
      x: 0,
      y: 0,
      width: width,
      height: height,
    });
    
    // Right page of spread
    const rightPage = pdfDoc.addPage([halfWidth, height]);
    rightPage.drawImage(jpgImage, {
      x: -halfWidth,
      y: 0,
      width: width,
      height: height,
    });
    
    console.log(`Added 2 pages for ${label} (split spread)`);
    return true;
  } catch (error) {
    console.error(`Error processing ${label}:`, error);
    return false;
  }
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

    // ============ 1. COVER PAGE ============
    // Cover spread: left = back cover, right = front cover
    // We add it at the start, but the RIGHT side is the front cover (first visible page)
    const coverUrl = `${STORAGE_URL}/${characterFolder}/Cover/cover.jpg`;
    const coverSuccess = await embedSpreadImage(pdfDoc, coverUrl, "Cover");
    if (!coverSuccess) {
      console.warn("Cover image not found, continuing without cover");
    }

    // ============ 2. INTRO PAGES ============
    // Intro page 1
    const intro1Url = `${STORAGE_URL}/${characterFolder}/Intro/1.jpg`;
    await embedSpreadImage(pdfDoc, intro1Url, "Intro 1");

    // Intro page 2
    const intro2Url = `${STORAGE_URL}/${characterFolder}/Intro/2.jpg`;
    await embedSpreadImage(pdfDoc, intro2Url, "Intro 2");

    // ============ 3. LETTER PAGES ============
    for (const letter of letters) {
      const occurrenceIndex = letterOccurrences.get(letter) || 0;
      letterOccurrences.set(letter, occurrenceIndex + 1);
      
      const theme = getThemeForLetter(occurrenceIndex, bookData.gender);
      const themeFolder = getThemeFolder(theme);
      const letterNum = letter.charCodeAt(0) - 64; // A=1, B=2, etc.
      
      const imageUrl = `${STORAGE_URL}/${characterFolder}/${themeFolder}/${letterNum}.jpg`;
      await embedSpreadImage(pdfDoc, imageUrl, `Letter ${letter}`);
    }

    // ============ 4. ENDING PAGES ============
    // Ending page 1
    const ending1Url = `${STORAGE_URL}/${characterFolder}/Ending/1.jpg`;
    await embedSpreadImage(pdfDoc, ending1Url, "Ending 1");

    // Ending page 2
    const ending2Url = `${STORAGE_URL}/${characterFolder}/Ending/2.jpg`;
    await embedSpreadImage(pdfDoc, ending2Url, "Ending 2");

    const pdfBytes = await pdfDoc.save();

    // Convert to base64 in chunks to avoid stack overflow
    const uint8Array = new Uint8Array(pdfBytes);
    const chunkSize = 8192; // Process 8KB at a time
    let binaryString = '';

    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }

    const pdfBase64 = btoa(binaryString);
    
    console.log(`PDF generated with ${pdfDoc.getPageCount()} pages`);

    // Send production email with PDF attachment
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
        subject: `Book Order ${order.order_number} - ${bookData.childName}'s Book`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #5c4d9a; border-bottom: 2px solid #5c4d9a; padding-bottom: 10px;">
              New Personalized Book Order
            </h1>
            
            <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #5c4d9a;">Order Details</h2>
              <p><strong>Order Number:</strong> ${order.order_number}</p>
              <p><strong>Customer:</strong> ${order.customer_name}</p>
              <p><strong>Email:</strong> ${order.customer_email}</p>
              <p><strong>Phone:</strong> ${order.customer_phone}</p>
              <p><strong>Delivery:</strong> ${order.delivery_method}</p>
              <p><strong>Address:</strong> ${order.delivery_address}</p>
            </div>

            <div style="background: #fff8e6; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f5a623;">
              <h2 style="margin-top: 0; color: #5c4d9a;">Book Specifications</h2>
              <p><strong>Child's Name:</strong> <span style="font-size: 24px; color: #5c4d9a;">${bookData.childName}</span></p>
              <p><strong>Character:</strong> ${getCharacterDescription(bookData.gender, bookData.skinTone)}</p>
              <p><strong>Total Pages:</strong> ${pdfDoc.getPageCount()} pages</p>
              <p><strong>From:</strong> ${bookData.fromField || 'Not specified'}</p>
              ${bookData.personalMessage ? `<p><strong>Personal Message:</strong> ${bookData.personalMessage}</p>` : ''}
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
