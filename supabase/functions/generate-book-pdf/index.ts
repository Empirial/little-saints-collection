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

// Page dimensions in points (1 point = 1/72 inch)
// 18.5cm x 21cm = ~524pt x 595pt
const PAGE_WIDTH = 524;
const PAGE_HEIGHT = 595;

// App base URL for fetching images
const APP_BASE_URL = "https://id-preview--458c56aa-94e0-4a2e-a88b-39f542ebabc3.lovable.app";

// Helper to fetch WebP image and convert to PNG bytes for pdf-lib
async function fetchAndConvertImage(url: string): Promise<{ bytes: Uint8Array; type: 'png' } | null> {
  try {
    console.log("Fetching image:", url);
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Failed to fetch image:", url, response.status);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Check if it's already a JPG or PNG
    const isJpg = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
    
    if (isPng) {
      console.log("Image is already PNG:", url);
      return { bytes, type: 'png' };
    }
    
    if (isJpg) {
      // For JPG, we need to convert to PNG since we're using ImageScript
      console.log("Converting JPG to PNG:", url);
      const image = await Image.decode(bytes);
      const pngBytes = await image.encode();
      return { bytes: pngBytes, type: 'png' };
    }
    
    // Assume WebP and convert to PNG using ImageScript
    console.log("Converting WebP to PNG:", url);
    const image = await Image.decode(bytes);
    const pngBytes = await image.encode();
    return { bytes: pngBytes, type: 'png' };
    
  } catch (error) {
    console.error("Error fetching/converting image:", url, error);
    return null;
  }
}

// Helper to wrap text into multiple lines
function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  // Approximate characters per line based on font size and width
  const avgCharWidth = fontSize * 0.5;
  const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);
  
  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  
  return lines;
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
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Build letter pages info
    const letters = bookData.childName.toUpperCase().split('').filter((l: string) => /[A-Z]/.test(l));
    const letterOccurrences: Map<string, number> = new Map();

    const characterFolder = getCharacterFolder(bookData.gender, bookData.skinTone);

    // === TITLE PAGE ===
    const titlePage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    titlePage.drawText(`${bookData.childName}'s`, {
      x: PAGE_WIDTH / 2 - (bookData.childName.length * 12),
      y: PAGE_HEIGHT / 2 + 50,
      size: 32,
      font: boldFont,
      color: rgb(0.486, 0.227, 0.929), // Purple
    });
    titlePage.drawText("Great Name Chase", {
      x: PAGE_WIDTH / 2 - 100,
      y: PAGE_HEIGHT / 2,
      size: 28,
      font: boldFont,
      color: rgb(0.486, 0.227, 0.929),
    });

    // === LETTER PAGES ===
    for (const letter of letters) {
      const occurrenceIndex = letterOccurrences.get(letter) || 0;
      const theme = getThemeForLetter(occurrenceIndex, bookData.gender);
      letterOccurrences.set(letter, occurrenceIndex + 1);

      const letterNum = letterToNumber(letter);

      // Fetch letter image from app assets (try .jpg first, then .webp)
      let imageUrl = `${APP_BASE_URL}/src/assets/personalization/${characterFolder}/${theme}/${letterNum}.jpg`;
      let imageData = await fetchAndConvertImage(imageUrl);
      
      // If .jpg fails, try .webp
      if (!imageData) {
        imageUrl = `${APP_BASE_URL}/src/assets/personalization/${characterFolder}/${theme}/${letterNum}.webp`;
        imageData = await fetchAndConvertImage(imageUrl);
      }

      const letterPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

      if (imageData) {
        try {
          const image = await pdfDoc.embedPng(imageData.bytes);
          
          // Calculate dimensions to fit the page (full bleed)
          const imgDims = image.scale(1);
          const scaleX = PAGE_WIDTH / imgDims.width;
          const scaleY = PAGE_HEIGHT / imgDims.height;
          const scale = Math.max(scaleX, scaleY); // Cover the page
          
          const scaledWidth = imgDims.width * scale;
          const scaledHeight = imgDims.height * scale;
          
          // Center the image
          const x = (PAGE_WIDTH - scaledWidth) / 2;
          const y = (PAGE_HEIGHT - scaledHeight) / 2;
          
          letterPage.drawImage(image, {
            x,
            y,
            width: scaledWidth,
            height: scaledHeight,
          });
        } catch (embedError) {
          console.error("Error embedding image:", embedError);
          // Draw placeholder text if image fails
          letterPage.drawText(`Letter ${letter}`, {
            x: PAGE_WIDTH / 2 - 30,
            y: PAGE_HEIGHT / 2,
            size: 48,
            font: boldFont,
            color: rgb(0.486, 0.227, 0.929),
          });
        }
      } else {
        // Draw placeholder if no image
        letterPage.drawText(`Letter ${letter}`, {
          x: PAGE_WIDTH / 2 - 30,
          y: PAGE_HEIGHT / 2,
          size: 48,
          font: boldFont,
          color: rgb(0.486, 0.227, 0.929),
        });
      }
    }

    // === CLIMAX PAGE ===
    const climaxPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const climaxText = `The chase was all over! The letters were found. They zipped and they zoomed with a magical sound. Each one was a piece of what makes YOU so you! Your name is a marvel, a joy, and a prize.`;
    
    climaxPage.drawText("The End of the Chase!", {
      x: PAGE_WIDTH / 2 - 100,
      y: PAGE_HEIGHT - 80,
      size: 24,
      font: boldFont,
      color: rgb(0.486, 0.227, 0.929),
    });

    const climaxLines = wrapText(climaxText, PAGE_WIDTH - 60, 14);
    let climaxY = PAGE_HEIGHT - 140;
    for (const line of climaxLines) {
      climaxPage.drawText(line, {
        x: 30,
        y: climaxY,
        size: 14,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      climaxY -= 20;
    }

    // === DEDICATION PAGE ===
    const dedicationPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    
    dedicationPage.drawText("With Love", {
      x: PAGE_WIDTH / 2 - 50,
      y: PAGE_HEIGHT - 100,
      size: 24,
      font: boldFont,
      color: rgb(0.486, 0.227, 0.929),
    });

    let dedicationY = PAGE_HEIGHT - 160;
    
    dedicationPage.drawText(`To ${bookData.childName},`, {
      x: 40,
      y: dedicationY,
      size: 16,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    dedicationY -= 30;

    if (bookData.fromField) {
      dedicationPage.drawText(`With love from ${bookData.fromField}`, {
        x: 40,
        y: dedicationY,
        size: 14,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      dedicationY -= 40;
    }

    if (bookData.personalMessage) {
      const messageLines = wrapText(bookData.personalMessage, PAGE_WIDTH - 80, 12);
      for (const line of messageLines) {
        dedicationPage.drawText(line, {
          x: 40,
          y: dedicationY,
          size: 12,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
        dedicationY -= 18;
      }
    } else {
      dedicationPage.drawText("You are loved beyond measure.", {
        x: 40,
        y: dedicationY,
        size: 12,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    
    // Convert to base64 for email attachment
    // Using btoa with string conversion for Deno
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
          <p>The personalized book PDF is attached to this email.</p>
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
