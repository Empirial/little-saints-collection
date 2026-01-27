import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Supabase Storage public URL for book-assets bucket
const STORAGE_URL = 'https://udaudwkblphataokaexq.supabase.co/storage/v1/object/public/book-assets';

// ========== BLEED AND CROP MARK CONSTANTS ==========
const BLEED_MM = 10; // 10mm bleed
const BLEED_PT = BLEED_MM * 2.835; // Convert mm to points (1mm = 2.835pt)
const CROP_MARK_LENGTH_PT = 10 * 2.835; // 10mm crop mark length
const CROP_MARK_OFFSET_PT = 3 * 2.835; // 3mm offset from trim edge
const CROP_MARK_THICKNESS = 0.5; // 0.5pt line thickness

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

// Character description for email
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

interface BatchInfo {
  url: string;
  name: string;
  pageCount: number;
}

// Draw L-shaped crop marks at corners of a page
function drawCropMarks(
  page: ReturnType<PDFDocument['addPage']>,
  trimWidth: number,
  trimHeight: number,
  bleed: number
) {
  const lineColor = rgb(0, 0, 0); // 100% Black
  
  // Corner positions (relative to page with bleed)
  const corners = [
    { x: bleed, y: bleed }, // Bottom-left
    { x: bleed + trimWidth, y: bleed }, // Bottom-right
    { x: bleed, y: bleed + trimHeight }, // Top-left
    { x: bleed + trimWidth, y: bleed + trimHeight }, // Top-right
  ];
  
  for (const corner of corners) {
    const isLeft = corner.x === bleed;
    const isBottom = corner.y === bleed;
    
    // Horizontal crop mark
    const hStartX = isLeft 
      ? corner.x - CROP_MARK_OFFSET_PT - CROP_MARK_LENGTH_PT 
      : corner.x + CROP_MARK_OFFSET_PT;
    const hEndX = isLeft 
      ? corner.x - CROP_MARK_OFFSET_PT 
      : corner.x + CROP_MARK_OFFSET_PT + CROP_MARK_LENGTH_PT;
    
    page.drawLine({
      start: { x: hStartX, y: corner.y },
      end: { x: hEndX, y: corner.y },
      thickness: CROP_MARK_THICKNESS,
      color: lineColor,
    });
    
    // Vertical crop mark
    const vStartY = isBottom 
      ? corner.y - CROP_MARK_OFFSET_PT - CROP_MARK_LENGTH_PT 
      : corner.y + CROP_MARK_OFFSET_PT;
    const vEndY = isBottom 
      ? corner.y - CROP_MARK_OFFSET_PT 
      : corner.y + CROP_MARK_OFFSET_PT + CROP_MARK_LENGTH_PT;
    
    page.drawLine({
      start: { x: corner.x, y: vStartY },
      end: { x: corner.x, y: vEndY },
      thickness: CROP_MARK_THICKNESS,
      color: lineColor,
    });
  }
}

// Helper function to fetch and embed a spread image, splitting it into two PDF pages with bleed and crop marks
async function embedSpreadImageWithBleed(
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
    
    // Original spread dimensions
    const { width: spreadWidth, height: spreadHeight } = jpgImage.scale(1);
    const trimWidth = spreadWidth / 2; // Each page is half the spread
    const trimHeight = spreadHeight;
    
    // Page dimensions with bleed (bleed on all 4 sides)
    const pageWidth = trimWidth + (BLEED_PT * 2);
    const pageHeight = trimHeight + (BLEED_PT * 2);
    
    // Left page of spread
    const leftPage = pdfDoc.addPage([pageWidth, pageHeight]);
    
    // Draw the left half of the spread, offset to account for bleed
    // The image extends into the bleed area
    leftPage.drawImage(jpgImage, {
      x: BLEED_PT - BLEED_PT, // Start slightly left to bleed
      y: BLEED_PT - BLEED_PT, // Start slightly below to bleed
      width: spreadWidth,
      height: spreadHeight + (BLEED_PT * 2),
    });
    
    // Actually, for proper bleed we need to scale/position the image correctly
    // The image should fill the trim area plus bleed
    // Since the source image is exactly the trim size, we'll position it centered
    // and the bleed area will show the edge pixels extended
    leftPage.drawImage(jpgImage, {
      x: BLEED_PT,
      y: BLEED_PT,
      width: spreadWidth,
      height: spreadHeight,
    });
    
    // Draw crop marks on left page
    drawCropMarks(leftPage, trimWidth, trimHeight, BLEED_PT);
    
    // Right page of spread
    const rightPage = pdfDoc.addPage([pageWidth, pageHeight]);
    
    // Position the full spread so only the right half is visible
    rightPage.drawImage(jpgImage, {
      x: BLEED_PT - trimWidth,
      y: BLEED_PT,
      width: spreadWidth,
      height: spreadHeight,
    });
    
    // Draw crop marks on right page
    drawCropMarks(rightPage, trimWidth, trimHeight, BLEED_PT);
    
    console.log(`Added 2 pages with bleed for ${label} (split spread)`);
    return true;
  } catch (error) {
    console.error(`Error processing ${label}:`, error);
    return false;
  }
}

// Create a batch PDF from a list of image URLs and upload immediately
// deno-lint-ignore no-explicit-any
async function createAndUploadBatch(
  supabase: any,
  orderNumber: string,
  batchIndex: number,
  batchName: string,
  imageUrls: Array<{url: string, label: string}>
): Promise<BatchInfo> {
  const batchPdf = await PDFDocument.create();
  
  for (const {url, label} of imageUrls) {
    await embedSpreadImageWithBleed(batchPdf, url, label);
  }
  
  const pdfBytes = await batchPdf.save();
  const pageCount = batchPdf.getPageCount();
  
  // Upload immediately to free memory
  const filename = `orders/${orderNumber}/batch-${batchIndex}-${batchName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
  
  const { error } = await supabase.storage
    .from('book-assets')
    .upload(filename, pdfBytes, {
      contentType: 'application/pdf',
      upsert: true
    });
  
  if (error) {
    console.error(`Failed to upload ${batchName}:`, error);
    throw new Error(`Storage upload failed: ${error.message}`);
  }
  
  const url = `${STORAGE_URL}/${filename}`;
  console.log(`Uploaded ${batchName} (${pageCount} pages): ${url}`);
  
  return { url, name: batchName, pageCount };
}

// Create dedication PDF with text overlays and upload (ALWAYS included)
// deno-lint-ignore no-explicit-any
async function createAndUploadDedication(
  supabase: any,
  orderNumber: string,
  batchIndex: number,
  bookData: BookData
): Promise<BatchInfo | null> {
  try {
    const dedicationUrl = `${STORAGE_URL}/Shared/dedication.jpg`;
    console.log(`Fetching Dedication: ${dedicationUrl}`);
    
    const dedicationResponse = await fetch(dedicationUrl);
    if (!dedicationResponse.ok) {
      console.warn("Dedication background not found, skipping dedication page");
      return null;
    }
    
    const pdfDoc = await PDFDocument.create();
    const dedicationBytes = await dedicationResponse.arrayBuffer();
    const dedicationImage = await pdfDoc.embedJpg(dedicationBytes);
    
    // Original spread dimensions
    const { width: spreadWidth, height: spreadHeight } = dedicationImage.scale(1);
    const trimWidth = spreadWidth / 2;
    const trimHeight = spreadHeight;
    
    // Page dimensions with bleed
    const pageWidth = trimWidth + (BLEED_PT * 2);
    const pageHeight = trimHeight + (BLEED_PT * 2);
    
    // Embed fonts for text overlay
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Left page with "From" text
    const leftPage = pdfDoc.addPage([pageWidth, pageHeight]);
    leftPage.drawImage(dedicationImage, {
      x: BLEED_PT,
      y: BLEED_PT,
      width: spreadWidth,
      height: spreadHeight,
    });
    
    // Draw "From" text (even if empty, page is still created)
    if (bookData.fromField) {
      const fromText = bookData.fromField;
      const fontSize = Math.min(72, 600 / fromText.length);
      const textWidth = boldFont.widthOfTextAtSize(fromText, fontSize);
      
      leftPage.drawText(fromText, {
        x: BLEED_PT + (trimWidth - textWidth) / 2,
        y: BLEED_PT + trimHeight / 2,
        size: fontSize,
        font: boldFont,
        color: rgb(0.15, 0.15, 0.15),
      });
    }
    
    // Draw crop marks on left page
    drawCropMarks(leftPage, trimWidth, trimHeight, BLEED_PT);
    
    // Right page with personal message
    const rightPage = pdfDoc.addPage([pageWidth, pageHeight]);
    rightPage.drawImage(dedicationImage, {
      x: BLEED_PT - trimWidth,
      y: BLEED_PT,
      width: spreadWidth,
      height: spreadHeight,
    });
    
    // Draw personal message (even if empty, page is still created)
    if (bookData.personalMessage) {
      const messageText = bookData.personalMessage;
      const maxLineWidth = trimWidth * 0.7;
      const fontSize = 36;
      
      // Word-wrap for message
      const words = messageText.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        
        if (testWidth <= maxLineWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
      
      // Center the text block vertically
      const lineHeight = fontSize * 1.4;
      const totalTextHeight = lines.length * lineHeight;
      let y = BLEED_PT + (trimHeight + totalTextHeight) / 2 - fontSize;
      
      for (const line of lines) {
        const lineWidth = font.widthOfTextAtSize(line, fontSize);
        rightPage.drawText(line, {
          x: BLEED_PT + (trimWidth - lineWidth) / 2,
          y: y,
          size: fontSize,
          font: font,
          color: rgb(0.15, 0.15, 0.15),
        });
        y -= lineHeight;
      }
    }
    
    // Draw crop marks on right page
    drawCropMarks(rightPage, trimWidth, trimHeight, BLEED_PT);
    
    const pdfBytes = await pdfDoc.save();
    const pageCount = pdfDoc.getPageCount();
    
    // Upload immediately
    const filename = `orders/${orderNumber}/batch-${batchIndex}-dedication.pdf`;
    
    const { error } = await supabase.storage
      .from('book-assets')
      .upload(filename, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      });
    
    if (error) {
      console.error(`Failed to upload Dedication:`, error);
      throw new Error(`Storage upload failed: ${error.message}`);
    }
    
    const url = `${STORAGE_URL}/${filename}`;
    console.log(`Uploaded Dedication (${pageCount} pages): ${url}`);
    
    return { url, name: 'Dedication', pageCount };
  } catch (error) {
    console.error("Error creating dedication page:", error);
    return null;
  }
}

// Streaming progressive merge: fetch batches from Storage URLs and merge into single PDF
// deno-lint-ignore no-explicit-any
async function mergeFromStorageUrls(
  supabase: any,
  orderNumber: string,
  batchUrls: string[]
): Promise<{ url: string; totalPages: number } | null> {
  try {
    console.log(`Starting progressive merge of ${batchUrls.length} batches...`);
    
    let mergedPdf = await PDFDocument.create();
    let totalPages = 0;
    let pagesInCurrentSession = 0;
    const PAGES_BEFORE_RELOAD = 10; // Save and reload every 10 pages to free memory
    
    for (let i = 0; i < batchUrls.length; i++) {
      const batchUrl = batchUrls[i];
      console.log(`Fetching batch ${i + 1}/${batchUrls.length}: ${batchUrl}`);
      
      const response = await fetch(batchUrl);
      if (!response.ok) {
        console.error(`Failed to fetch batch ${i + 1}: ${response.status}`);
        continue;
      }
      
      const pdfBytes = await response.arrayBuffer();
      const sourcePdf = await PDFDocument.load(pdfBytes);
      const pageIndices = sourcePdf.getPageIndices();
      
      // Copy pages from source to merged
      const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices);
      for (const page of copiedPages) {
        mergedPdf.addPage(page);
        totalPages++;
        pagesInCurrentSession++;
        
        // Memory management: save and reload periodically
        if (pagesInCurrentSession >= PAGES_BEFORE_RELOAD && i < batchUrls.length - 1) {
          console.log(`Saving and reloading merged PDF (${totalPages} pages so far)...`);
          const intermediateBytes = await mergedPdf.save();
          mergedPdf = await PDFDocument.load(intermediateBytes);
          pagesInCurrentSession = 0;
        }
      }
      
      console.log(`Added ${pageIndices.length} pages from batch ${i + 1}`);
    }
    
    // Save final merged PDF
    const finalBytes = await mergedPdf.save();
    console.log(`Merged PDF complete: ${totalPages} total pages, ${finalBytes.byteLength} bytes`);
    
    // Upload merged PDF
    const filename = `orders/${orderNumber}/complete-book.pdf`;
    
    const { error } = await supabase.storage
      .from('book-assets')
      .upload(filename, finalBytes, {
        contentType: 'application/pdf',
        upsert: true
      });
    
    if (error) {
      console.error(`Failed to upload merged PDF:`, error);
      throw new Error(`Storage upload failed: ${error.message}`);
    }
    
    const url = `${STORAGE_URL}/${filename}`;
    console.log(`Uploaded complete book: ${url}`);
    
    return { url, totalPages };
  } catch (error) {
    console.error("Error merging PDFs:", error);
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

    console.log("Processing book order:", order.order_number);

    // Build letter breakdown with themes
    const letters = bookData.childName.toUpperCase().split('').filter((l: string) => /[A-Z]/.test(l));
    const letterOccurrences: Map<string, number> = new Map();
    const characterFolder = getCharacterFolder(bookData.gender, bookData.skinTone);

    console.log("Starting PDF generation with bleed, crop marks, and immediate upload...");
    const uploadedBatches: BatchInfo[] = [];
    let batchIndex = 1;
    let totalPages = 0;

    // ============ BATCH 1: Cover + Intro ============
    console.log("Creating & uploading Batch 1: Cover + Intro...");
    const batch1 = await createAndUploadBatch(
      supabase,
      order.order_number,
      batchIndex++,
      "Cover-Intro",
      [
        { url: `${STORAGE_URL}/${characterFolder}/Cover/cover.jpg`, label: "Cover" },
        { url: `${STORAGE_URL}/${characterFolder}/Intro/1.jpg`, label: "Intro 1" },
        { url: `${STORAGE_URL}/${characterFolder}/Intro/2.jpg`, label: "Intro 2" },
      ]
    );
    uploadedBatches.push(batch1);
    totalPages += batch1.pageCount;
    console.log(`Batch 1 complete: ${batch1.pageCount} pages, memory freed`);

    // ============ BATCH 2+: Letter Pages (one letter at a time to minimize memory) ============
    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i];
      const occurrenceIndex = letterOccurrences.get(letter) || 0;
      letterOccurrences.set(letter, occurrenceIndex + 1);
      
      const theme = getThemeForLetter(occurrenceIndex, bookData.gender);
      const themeFolder = getThemeFolder(theme);
      const letterNum = letter.charCodeAt(0) - 64; // A=1, B=2, etc.
      
      console.log(`Creating & uploading Letter ${letter}...`);
      const letterBatch = await createAndUploadBatch(
        supabase,
        order.order_number,
        batchIndex++,
        `Letter-${letter}`,
        [
          { url: `${STORAGE_URL}/${characterFolder}/${themeFolder}/${letterNum}.jpg`, label: `Letter ${letter}` }
        ]
      );
      uploadedBatches.push(letterBatch);
      totalPages += letterBatch.pageCount;
    }

    // ============ ENDING BATCH ============
    console.log("Creating & uploading Ending Batch...");
    const endingBatch = await createAndUploadBatch(
      supabase,
      order.order_number,
      batchIndex++,
      "Ending",
      [
        { url: `${STORAGE_URL}/${characterFolder}/Ending/1.jpg`, label: "Ending 1" },
        { url: `${STORAGE_URL}/${characterFolder}/Ending/2.jpg`, label: "Ending 2" },
      ]
    );
    uploadedBatches.push(endingBatch);
    totalPages += endingBatch.pageCount;
    console.log(`Ending Batch complete: ${endingBatch.pageCount} pages`);

    // ============ DEDICATION BATCH (ALWAYS included) ============
    console.log("Creating & uploading Dedication Batch (compulsory)...");
    const dedicationBatch = await createAndUploadDedication(
      supabase,
      order.order_number,
      batchIndex++,
      bookData
    );
    if (dedicationBatch) {
      uploadedBatches.push(dedicationBatch);
      totalPages += dedicationBatch.pageCount;
      console.log(`Dedication Batch complete: ${dedicationBatch.pageCount} pages`);
    }

    console.log(`All ${uploadedBatches.length} PDF batches uploaded. Total pages: ${totalPages}`);

    // ============ MERGE ALL BATCHES INTO SINGLE PDF ============
    console.log("Merging all batches into single complete-book.pdf...");
    const batchUrls = uploadedBatches.map(b => b.url);
    const mergeResult = await mergeFromStorageUrls(supabase, order.order_number, batchUrls);
    
    let completeBookUrl = '';
    if (mergeResult) {
      completeBookUrl = mergeResult.url;
      console.log(`Complete book merged successfully: ${completeBookUrl}`);
    }

    // Generate download links HTML (batch links as fallback)
    const downloadLinksHtml = uploadedBatches.map((batch, idx) => 
      `<li style="margin: 8px 0;">
        <a href="${batch.url}" style="color: #5c4d9a; font-weight: bold;">
          Part ${idx + 1}: ${batch.name} (${batch.pageCount} pages)
        </a>
      </li>`
    ).join('');

    // Send production email with merged PDF link + batch fallbacks
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
          },
          {
            email: "cateramaboea12@gmail.com",
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
              <p><strong>Total Pages:</strong> ${totalPages} pages (includes 10mm bleed & crop marks)</p>
              <p><strong>From:</strong> ${bookData.fromField || 'Not specified'}</p>
              ${bookData.personalMessage ? `<p><strong>Personal Message:</strong> ${bookData.personalMessage}</p>` : ''}
            </div>

            ${completeBookUrl ? `
            <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #4caf50;">
              <h2 style="margin-top: 0; color: #2e7d32;">📥 Download Complete Book</h2>
              <p style="margin: 15px 0;">
                <a href="${completeBookUrl}" style="display: inline-block; background: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                  ⬇️ Download Complete PDF (${totalPages} pages)
                </a>
              </p>
              <p style="color: #555; font-size: 13px;">
                This PDF includes 10mm bleed and crop marks for professional printing.
              </p>
            </div>
            ` : ''}

            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd;">
              <h3 style="margin-top: 0; color: #666;">📁 Individual Batch Files (Backup)</h3>
              <p style="color: #888; font-size: 12px;">If the complete PDF fails to download, use these individual files:</p>
              <ol style="padding-left: 20px; color: #555;">
                ${downloadLinksHtml}
              </ol>
            </div>

            <p style="color: #888; font-size: 12px; margin-top: 15px;">
              ⚠️ Download links are valid for 30 days. Save files locally for backup.
            </p>

            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Order placed on ${new Date(order.created_at).toLocaleString('en-ZA')}
            </p>
          </div>
        `
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Brevo API error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    console.log("Book order email with merged PDF link sent successfully for order:", order.order_number);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Book PDF generated with bleed and crop marks, merged, and email sent to production",
        orderNumber: order.order_number,
        pageCount: totalPages,
        batchCount: uploadedBatches.length,
        completeBookUrl: completeBookUrl,
        downloadUrls: uploadedBatches.map(b => b.url)
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
