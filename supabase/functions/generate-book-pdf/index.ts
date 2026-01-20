import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";
import { Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Frontend app URL where assets are served
const APP_BASE_URL = "https://id-preview--458c56aa-94e0-4a2e-a88b-39f542ebabc3.lovable.app";

// Theme assignment based on gender and occurrence
const getThemeForLetter = (occurrenceIndex: number, gender: string): string => {
  const boyThemes = ['Superherotheme', 'Wildanimaltheme', 'Fairytaletheme'];
  const girlThemes = ['Fairytaletheme', 'Superherotheme', 'Wildanimaltheme'];
  const themes = gender === 'boy' ? boyThemes : girlThemes;
  return themes[occurrenceIndex % 3];
};

// Character folder mapping
const getCharacterFolder = (gender: string, skinTone: string): string => {
  if (gender === 'boy') {
    return skinTone === 'dark' ? 'Blackboy' : 'whiteboy';
  }
  return skinTone === 'dark' ? 'Blackgirl' : 'whitegirl';
};

// Convert letter to number (A=1, B=2, etc.)
const letterToNumber = (letter: string): number => {
  return letter.toUpperCase().charCodeAt(0) - 64;
};

interface BookData {
  childName: string;
  gender: string;
  skinTone: string;
  fromField?: string;
  personalMessage?: string;
  pageCount?: number;
}

// A4 Landscape dimensions in points (595pt x 842pt for standard A4 landscape)
const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;

// Helper to fetch image and convert WebP to PNG bytes for pdf-lib
async function fetchAndConvertImage(url: string): Promise<Uint8Array | null> {
  try {
    console.log("Fetching image:", url);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error("Failed to fetch image:", url, response.status);
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const imageBytes = new Uint8Array(arrayBuffer);
    
    // Use imagescript to decode WebP and encode as PNG
    const image = await Image.decode(imageBytes);
    const pngBytes = await image.encode();
    
    console.log("Converted image to PNG, size:", pngBytes.length, "bytes");
    return pngBytes;
  } catch (error) {
    console.error("Error fetching/converting image:", url, error);
    return null;
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

    console.log("Generating PDF for order:", order.order_number);
    console.log("Book data:", JSON.stringify(bookData));

    // Create PDF document
    const pdfDoc = await PDFDocument.create();

    // Get character folder based on gender and skin tone
    const characterFolder = getCharacterFolder(bookData.gender, bookData.skinTone);
    console.log("Character folder:", characterFolder);

    // Build letter pages info
    const letters = bookData.childName.toUpperCase().split('').filter((l: string) => /[A-Z]/.test(l));
    const letterOccurrences: Map<string, number> = new Map();

    // Process each letter
    for (const letter of letters) {
      const occurrenceIndex = letterOccurrences.get(letter) || 0;
      letterOccurrences.set(letter, occurrenceIndex + 1);

      // Get theme based on occurrence and gender
      const theme = getThemeForLetter(occurrenceIndex, bookData.gender);
      const letterNum = letterToNumber(letter);

      // Build URL to frontend asset
      const imageUrl = `${APP_BASE_URL}/src/assets/personalization/${characterFolder}/${theme}/${letterNum}.webp`;
      console.log("Fetching letter", letter, "from:", imageUrl);

      const pngBytes = await fetchAndConvertImage(imageUrl);

      if (pngBytes) {
        try {
          // Add page for this letter
          const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
          
          // Embed PNG image
          const embeddedImage = await pdfDoc.embedPng(pngBytes);
          
          // Scale image to fit page while maintaining aspect ratio
          const imgAspect = embeddedImage.width / embeddedImage.height;
          const pageAspect = PAGE_WIDTH / PAGE_HEIGHT;
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (imgAspect > pageAspect) {
            // Image is wider than page
            drawWidth = PAGE_WIDTH;
            drawHeight = PAGE_WIDTH / imgAspect;
            drawX = 0;
            drawY = (PAGE_HEIGHT - drawHeight) / 2;
          } else {
            // Image is taller than page
            drawHeight = PAGE_HEIGHT;
            drawWidth = PAGE_HEIGHT * imgAspect;
            drawX = (PAGE_WIDTH - drawWidth) / 2;
            drawY = 0;
          }
          
          page.drawImage(embeddedImage, {
            x: drawX,
            y: drawY,
            width: drawWidth,
            height: drawHeight,
          });
          
          console.log("Added page for letter:", letter, "theme:", theme);
        } catch (embedError) {
          console.error("Error embedding image for letter:", letter, embedError);
        }
      } else {
        console.error("Could not fetch image for letter:", letter);
      }
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    
    // Convert to base64 for email attachment
    let binary = '';
    const len = pdfBytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(pdfBytes[i]);
    }
    const pdfBase64 = btoa(binary);

    console.log("PDF generated, size:", pdfBytes.byteLength, "bytes");

    // Send email via Brevo with PDF attachment
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
        subject: `📚 Book Order ${order.order_number} - ${bookData.childName}'s Book PDF`,
        htmlContent: `
          <h2>New Personalized Book Order</h2>
          <p><strong>Order Number:</strong> ${order.order_number}</p>
          <p><strong>Customer:</strong> ${order.customer_name}</p>
          <p><strong>Child's Name:</strong> ${bookData.childName}</p>
          <p><strong>Character:</strong> ${bookData.gender === 'boy' ? 'Boy' : 'Girl'} (${bookData.skinTone} skin tone)</p>
          <p><strong>From:</strong> ${bookData.fromField || 'Not specified'}</p>
          <p><strong>Personal Message:</strong> ${bookData.personalMessage || 'None'}</p>
          <hr/>
          <p>The personalized book PDF is attached. Each letter page uses the appropriate theme rotation.</p>
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

    console.log("Book PDF email sent successfully for order:", order.order_number);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Book PDF generated and sent",
        orderNumber: order.order_number
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
