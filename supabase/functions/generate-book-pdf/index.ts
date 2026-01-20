import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

interface OrderData {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  book_data: BookData;
}

// A4 Landscape is 297x210mm.
// 10mm bleed on each side means the total canvas is 317x230mm.
// In points (1mm = 2.83465pt):
// 317mm = 898.58pt
// 230mm = 651.97pt
const PAGE_WIDTH = 898.58;
const PAGE_HEIGHT = 651.97;

// Supabase Storage base URL for fetching images (set dynamically in serve)

// Helper to fetch image and split it in half
async function fetchAndSplitImage(url: string, fallbackUrl?: string): Promise<{ left: Uint8Array; right: Uint8Array } | null> {
  try {
    console.log("Fetching image for splitting:", url);
    let response = await fetch(url);
    
    // Try fallback URL if primary fails
    if (!response.ok && fallbackUrl) {
      console.log("Primary URL failed, trying fallback:", fallbackUrl);
      response = await fetch(fallbackUrl);
    }
    
    if (!response.ok) {
      console.error("Failed to fetch image:", url, response.status);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    const image = await Image.decode(bytes);
    const width = image.width;
    const height = image.height;
    
    // Split image in half
    const leftHalf = image.crop(0, 0, Math.floor(width / 2), height);
    const rightHalf = image.crop(Math.floor(width / 2), 0, Math.ceil(width / 2), height);
    
    const leftBytes = await leftHalf.encode();
    const rightBytes = await rightHalf.encode();
    
    return { left: leftBytes, right: rightBytes };
    
  } catch (error) {
    console.error("Error fetching/splitting image:", url, error);
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

    // Create PDF document
    const pdfDoc = await PDFDocument.create();

    // Build letter pages info
    const letters = bookData.childName.toUpperCase().split('').filter((l: string) => /[A-Z]/.test(l));
    const letterOccurrences: Map<string, number> = new Map();
    const characterFolder = getCharacterFolder(bookData.gender, bookData.skinTone);

    // === LETTER PAGES ===
    for (const letter of letters) {
      const occurrenceIndex = letterOccurrences.get(letter) || 0;
      const theme = getThemeForLetter(occurrenceIndex, bookData.gender);
      letterOccurrences.set(letter, occurrenceIndex + 1);

      const letterNum = letterToNumber(letter);

      // Fetch letter image from Supabase Storage
      const storageBaseUrl = `${SUPABASE_URL}/storage/v1/object/public/book-assets`;
      const imageUrl = `${storageBaseUrl}/${characterFolder}/${theme}/${letterNum}.jpg`;
      const fallbackUrl = `${storageBaseUrl}/${characterFolder}/${theme}/${letterNum}.webp`;
      
      const splitData = await fetchAndSplitImage(imageUrl, fallbackUrl);

      if (splitData) {
        try {
          // Add Left Page
          const leftPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
          const leftImage = await pdfDoc.embedPng(splitData.left);
          leftPage.drawImage(leftImage, {
            x: 0,
            y: 0,
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
          });

          // Add Right Page
          const rightPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
          const rightImage = await pdfDoc.embedPng(splitData.right);
          rightPage.drawImage(rightImage, {
            x: 0,
            y: 0,
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
          });
        } catch (embedError) {
          console.error("Error embedding image:", embedError);
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
          <p>The personalized book PDF is attached to this email. It is formatted in A4 landscape with 10mm bleed, with images split into single pages.</p>
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
