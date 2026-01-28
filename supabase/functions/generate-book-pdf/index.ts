import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Supabase Storage public URL for book-assets bucket
const STORAGE_URL = 'https://udaudwkblphataokaexq.supabase.co/storage/v1/object/public/book-assets';

// ========== PRINT SPECIFICATIONS ==========
// Canvas dimensions: 63.4cm x 23cm spread (full open book)
const SPREAD_WIDTH_CM = 63.4;
const SPREAD_HEIGHT_CM = 23;
const CM_TO_PT = 28.35; // 1cm = 28.35 points

// Derived spread dimensions in points
const SPREAD_WIDTH_PT = SPREAD_WIDTH_CM * CM_TO_PT; // 1797.39pt
const SPREAD_HEIGHT_PT = SPREAD_HEIGHT_CM * CM_TO_PT; // 652.05pt

// Each page is half the spread
const PAGE_WIDTH_CM = 31.7; // 63.4 / 2
const PAGE_WIDTH_PT = PAGE_WIDTH_CM * CM_TO_PT; // 898.695pt
const PAGE_HEIGHT_PT = SPREAD_HEIGHT_PT; // 652.05pt

// Bleed: 10mm on all sides
const BLEED_MM = 10;
const BLEED_PT = BLEED_MM * 2.835; // 28.35pt

// Crop marks: offset by 10mm from trim edge, 10mm length
const CROP_MARK_OFFSET_PT = 10 * 2.835; // 28.35pt offset from trim
const CROP_MARK_LENGTH_PT = 10 * 2.835; // 28.35pt length
const CROP_MARK_THICKNESS = 0.5; // 0.5pt line thickness

// Dedication text positioning (in cm from left edge of respective page)
const LEFT_PAGE_TEXT_CENTER_CM = 15.85; // Center of left page (31.7 / 2)
const RIGHT_PAGE_TEXT_CENTER_CM = 15.85; // Center of right page (relative to right page origin)

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
  dedicationMessage?: string;
  pageCount?: number;
}

interface BatchInfo {
  url: string;
  name: string;
  pageCount: number;
}

// Draw L-shaped crop marks at corners of a page
// Crop marks are positioned 10mm OUTSIDE the trim edge (in the bleed area)
function drawCropMarks(
  page: ReturnType<PDFDocument['addPage']>,
  trimWidth: number,
  trimHeight: number,
  bleed: number
) {
  const lineColor = rgb(0, 0, 0); // 100% Black (registration color)

  // Trim box corners (where the paper will be cut)
  // These are relative to the full page including bleed
  const trimLeft = bleed;
  const trimRight = bleed + trimWidth;
  const trimBottom = bleed;
  const trimTop = bleed + trimHeight;

  // Corner positions for crop marks
  const corners = [
    { x: trimLeft, y: trimBottom, isLeft: true, isBottom: true },   // Bottom-left
    { x: trimRight, y: trimBottom, isLeft: false, isBottom: true }, // Bottom-right
    { x: trimLeft, y: trimTop, isLeft: true, isBottom: false },     // Top-left
    { x: trimRight, y: trimTop, isLeft: false, isBottom: false },   // Top-right
  ];

  for (const corner of corners) {
    // Horizontal crop mark - drawn 10mm offset from trim edge, extending outward
    const hStartX = corner.isLeft
      ? corner.x - CROP_MARK_OFFSET_PT - CROP_MARK_LENGTH_PT
      : corner.x + CROP_MARK_OFFSET_PT;
    const hEndX = corner.isLeft
      ? corner.x - CROP_MARK_OFFSET_PT
      : corner.x + CROP_MARK_OFFSET_PT + CROP_MARK_LENGTH_PT;

    page.drawLine({
      start: { x: hStartX, y: corner.y },
      end: { x: hEndX, y: corner.y },
      thickness: CROP_MARK_THICKNESS,
      color: lineColor,
    });

    // Vertical crop mark - drawn 10mm offset from trim edge, extending outward
    const vStartY = corner.isBottom
      ? corner.y - CROP_MARK_OFFSET_PT - CROP_MARK_LENGTH_PT
      : corner.y + CROP_MARK_OFFSET_PT;
    const vEndY = corner.isBottom
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
// Uses fixed canvas dimensions: 63.4cm x 23cm spread, each page 31.7cm x 23cm
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

    // Use fixed canvas dimensions (31.7cm x 23cm per page)
    const trimWidth = PAGE_WIDTH_PT;
    const trimHeight = PAGE_HEIGHT_PT;

    // Full page dimensions including 10mm bleed on all 4 sides
    const pageWidthWithBleed = trimWidth + (BLEED_PT * 2);
    const pageHeightWithBleed = trimHeight + (BLEED_PT * 2);

    // Calculate image scaling to fill the entire area including bleed
    // The image should extend into the bleed area
    const imageScaleWidth = (trimWidth + BLEED_PT * 2) / (SPREAD_WIDTH_PT / 2);
    const imageScaleHeight = (trimHeight + BLEED_PT * 2) / SPREAD_HEIGHT_PT;
    const imageScale = Math.max(imageScaleWidth, imageScaleHeight);

    const scaledSpreadWidth = SPREAD_WIDTH_PT * imageScale;
    const scaledSpreadHeight = SPREAD_HEIGHT_PT * imageScale;

    // ========== LEFT PAGE ==========
    const leftPage = pdfDoc.addPage([pageWidthWithBleed, pageHeightWithBleed]);

    // Position image so left half fills the page including bleed
    // Image origin is at (0, 0), we offset to center and extend into bleed
    leftPage.drawImage(jpgImage, {
      x: 0, // Start at left edge (bleed area)
      y: 0, // Start at bottom edge (bleed area)
      width: scaledSpreadWidth,
      height: scaledSpreadHeight,
    });

    // Draw crop marks indicating trim lines
    drawCropMarks(leftPage, trimWidth, trimHeight, BLEED_PT);

    // ========== RIGHT PAGE ==========
    const rightPage = pdfDoc.addPage([pageWidthWithBleed, pageHeightWithBleed]);

    // Position the full spread so only the right half is visible
    // Offset by negative half-spread width plus bleed
    rightPage.drawImage(jpgImage, {
      x: -(scaledSpreadWidth / 2) + BLEED_PT,
      y: 0,
      width: scaledSpreadWidth,
      height: scaledSpreadHeight,
    });

    // Draw crop marks on right page
    drawCropMarks(rightPage, trimWidth, trimHeight, BLEED_PT);

    console.log(`Added 2 pages (${trimWidth.toFixed(1)}pt x ${trimHeight.toFixed(1)}pt + ${BLEED_PT.toFixed(1)}pt bleed) for ${label}`);
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
  imageUrls: Array<{ url: string, label: string }>
): Promise<BatchInfo> {
  const batchPdf = await PDFDocument.create();

  for (const { url, label } of imageUrls) {
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
// Text placement:
//   - Left page: "From" name centered at 15.85cm (horizontal center of left page)
//   - Right page: Message centered at 15.85cm from right page origin (47.55cm from spread left)
//   - Both texts vertically centered
//   - No text crosses the spine at 31.7cm
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
      console.warn("Dedication background not found, creating blank dedication pages");
    }

    const pdfDoc = await PDFDocument.create();

    // Use fixed canvas dimensions
    const trimWidth = PAGE_WIDTH_PT; // 31.7cm = 898.695pt
    const trimHeight = PAGE_HEIGHT_PT; // 23cm = 652.05pt

    // Full page dimensions including 10mm bleed on all 4 sides
    const pageWidthWithBleed = trimWidth + (BLEED_PT * 2);
    const pageHeightWithBleed = trimHeight + (BLEED_PT * 2);

    // Text center position: 15.85cm from left of each page (in points)
    const textCenterX = LEFT_PAGE_TEXT_CENTER_CM * CM_TO_PT; // ~449.3pt from page origin

    // Embed fonts for text overlay
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // ========== LEFT PAGE (Dedication Message) ==========
    const leftPage = pdfDoc.addPage([pageWidthWithBleed, pageHeightWithBleed]);

    // Draw background image if available
    if (dedicationResponse.ok) {
      const dedicationBytes = await dedicationResponse.arrayBuffer();
      const dedicationImage = await pdfDoc.embedJpg(dedicationBytes);

      // Scale image to fill page including bleed
      const imageScaleWidth = pageWidthWithBleed / (SPREAD_WIDTH_PT / 2);
      const imageScaleHeight = pageHeightWithBleed / SPREAD_HEIGHT_PT;
      const imageScale = Math.max(imageScaleWidth, imageScaleHeight);

      const scaledSpreadWidth = SPREAD_WIDTH_PT * imageScale;
      const scaledSpreadHeight = SPREAD_HEIGHT_PT * imageScale;

      // Left half of spread
      leftPage.drawImage(dedicationImage, {
        x: 0,
        y: 0,
        width: scaledSpreadWidth,
        height: scaledSpreadHeight,
      });
    }

    // Draw Dedication Message - Left Page
    if (bookData.dedicationMessage && bookData.dedicationMessage.trim()) {
      const dedicationText = bookData.dedicationMessage.trim();
      const maxLineWidth = trimWidth * 0.75; // 75% of page width
      // Available height for text: 70% of page height (centered)
      const maxTextHeight = trimHeight * 0.7;

      let fontSize = 32;
      let lineHeight = fontSize * 1.5;
      let lines: string[] = [];
      let totalTextHeight = 0;

      // Auto-shrink loop
      // Minimum font size 18pt
      while (fontSize >= 18) {
        lineHeight = fontSize * 1.5;
        lines = [];
        let currentLine = '';
        const words = dedicationText.split(/\s+/);

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);

          if (testWidth <= maxLineWidth) {
            currentLine = testLine;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);

        totalTextHeight = lines.length * lineHeight;

        if (totalTextHeight <= maxTextHeight) {
          break; // Fits!
        }

        fontSize -= 2; // Try smaller font
      }

      // Start Y position: vertically centered
      let y = BLEED_PT + (trimHeight / 2) + (totalTextHeight / 2) - lineHeight;

      // Draw lines
      for (const line of lines) {
        const lineWidth = font.widthOfTextAtSize(line, fontSize);
        const xPosition = BLEED_PT + textCenterX - (lineWidth / 2);

        leftPage.drawText(line, {
          x: xPosition,
          y: y,
          size: fontSize,
          font: font,
          color: rgb(0.15, 0.15, 0.15),
        });
        y -= lineHeight;
      }

      console.log(`Dedication (Left): ${lines.length} lines, fontSize=${fontSize}pt`);
    }

    // Draw crop marks on left page
    drawCropMarks(leftPage, trimWidth, trimHeight, BLEED_PT);

    // ========== RIGHT PAGE (Personal Message + From) ==========
    const rightPage = pdfDoc.addPage([pageWidthWithBleed, pageHeightWithBleed]);

    // Draw background image if available (right half of spread)
    if (dedicationResponse.ok) {
      // Need to re-fetch since we consumed the response (streams are one-time use)
      const dedicationResponse2 = await fetch(dedicationUrl);
      if (dedicationResponse2.ok) {
        const dedicationBytes2 = await dedicationResponse2.arrayBuffer();
        const dedicationImage2 = await pdfDoc.embedJpg(dedicationBytes2);

        const imageScaleWidth = pageWidthWithBleed / (SPREAD_WIDTH_PT / 2);
        const imageScaleHeight = pageHeightWithBleed / SPREAD_HEIGHT_PT;
        const imageScale = Math.max(imageScaleWidth, imageScaleHeight);

        const scaledSpreadWidth = SPREAD_WIDTH_PT * imageScale;
        const scaledSpreadHeight = SPREAD_HEIGHT_PT * imageScale;

        // Right half of spread - offset by half
        rightPage.drawImage(dedicationImage2, {
          x: -(scaledSpreadWidth / 2) + BLEED_PT,
          y: 0,
          width: scaledSpreadWidth,
          height: scaledSpreadHeight,
        });
      }
    }

    // Draw Personal Message (Right Page)
    if (bookData.personalMessage && bookData.personalMessage.trim()) {
      const msgText = bookData.personalMessage.trim();
      const maxLineWidth = trimWidth * 0.75;
      const maxTextHeight = trimHeight * 0.6; // Use 60% height to leave room for 'From'

      let fontSize = 32;
      let lineHeight = fontSize * 1.5;
      let lines: string[] = [];
      let totalTextHeight = 0;

      while (fontSize >= 18) {
        lineHeight = fontSize * 1.5;
        lines = [];
        let currentLine = '';
        const words = msgText.split(/\s+/);

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);

          if (testWidth <= maxLineWidth) {
            currentLine = testLine;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);

        totalTextHeight = lines.length * lineHeight;

        if (totalTextHeight <= maxTextHeight) {
          break;
        }
        fontSize -= 2;
      }

      // Position: Center vertically within top 70% of page (approx)
      // Visual center shifted up slightly to make room for name below
      const visualCenterY = BLEED_PT + (trimHeight * 0.55);
      let y = visualCenterY + (totalTextHeight / 2) - lineHeight;

      for (const line of lines) {
        const lineWidth = font.widthOfTextAtSize(line, fontSize);
        const xPosition = BLEED_PT + textCenterX - (lineWidth / 2);

        rightPage.drawText(line, {
          x: xPosition,
          y: y,
          size: fontSize,
          font: font,
          color: rgb(0.15, 0.15, 0.15),
        });
        y -= lineHeight;
      }

      console.log(`Personal Note (Right): ${lines.length} lines, fontSize=${fontSize}pt`);
    }

    // Draw "From" Text (Right Page - Bottom)
    if (bookData.fromField && bookData.fromField.trim()) {
      const fromText = bookData.fromField.trim();
      const fontSize = 24; // Smaller/Fixed for 'From'
      const textWidth = boldFont.widthOfTextAtSize(fromText, fontSize);

      const xPosition = BLEED_PT + textCenterX - (textWidth / 2);
      // Position at bottom 20% area
      const yPosition = BLEED_PT + (trimHeight * 0.2);

      rightPage.drawText(fromText, {
        x: xPosition,
        y: yPosition,
        size: fontSize,
        font: boldFont,
        color: rgb(0.15, 0.15, 0.15),
      });

      console.log(`From (Right): ${fromText}`);
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
    console.log(`Uploaded Dedication (${pageCount} pages, ${trimWidth.toFixed(1)}pt x ${trimHeight.toFixed(1)}pt + bleed): ${url}`);

    return { url, name: 'Dedication', pageCount };
  } catch (error) {
    console.error("Error creating dedication page:", error);
    return null;
  }
}

// Merge function removed to avoid memory limit issues
// Batch PDFs are sent directly to production via email

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

    // ============ BATCH 1: Cover ============
    console.log("Creating & uploading Batch 1: Cover...");
    const coverBatch = await createAndUploadBatch(
      supabase,
      order.order_number,
      batchIndex++,
      "Cover",
      [
        { url: `${STORAGE_URL}/${characterFolder}/Cover/cover.jpg`, label: "Cover" }
      ]
    );
    uploadedBatches.push(coverBatch);
    totalPages += coverBatch.pageCount;
    console.log(`Batch 1 (Cover) complete: ${coverBatch.pageCount} pages`);

    // ============ BATCH 2: Intro ============
    console.log("Creating & uploading Batch 2: Intro...");
    const introBatch = await createAndUploadBatch(
      supabase,
      order.order_number,
      batchIndex++,
      "Intro",
      [
        { url: `${STORAGE_URL}/${characterFolder}/Intro/1.jpg`, label: "Intro 1" },
        { url: `${STORAGE_URL}/${characterFolder}/Intro/2.jpg`, label: "Intro 2" },
      ]
    );
    uploadedBatches.push(introBatch);
    totalPages += introBatch.pageCount;
    console.log(`Batch 2 (Intro) complete: ${introBatch.pageCount} pages`);

    // ============ BATCH 3: DEDICATION (Moved to before letters) ============
    console.log("Creating & uploading Batch 3: Dedication...");
    const dedicationBatch = await createAndUploadDedication(
      supabase,
      order.order_number,
      batchIndex++,
      bookData
    );
    if (dedicationBatch) {
      uploadedBatches.push(dedicationBatch);
      totalPages += dedicationBatch.pageCount;
      console.log(`Batch 3 (Dedication) complete: ${dedicationBatch.pageCount} pages`);
    }

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



    console.log(`All ${uploadedBatches.length} PDF batches uploaded. Total pages: ${totalPages}`);

    // Generate download links HTML for all batches
    const downloadLinksHtml = uploadedBatches.map((batch, idx) =>
      `<li style="margin: 8px 0;">
        <a href="${batch.url}" style="color: #5c4d9a; font-weight: bold;">
          Part ${idx + 1}: ${batch.name} (${batch.pageCount} pages)
        </a>
      </li>`
    ).join('');

    // Send production email with batch download links
    console.log("Sending production email with batch links...");
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
              ${bookData.personalMessage ? `<p><strong>Personal Note (Right Page):</strong> ${bookData.personalMessage}</p>` : ''}
              ${bookData.dedicationMessage ? `<p><strong>Dedication (Left Page):</strong> ${bookData.dedicationMessage}</p>` : ''}
            </div>

            <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #4caf50;">
              <h2 style="margin-top: 0; color: #2e7d32;">📥 Download Book PDF Files</h2>
              <p style="color: #555; font-size: 14px;">Download all parts below and combine them for printing:</p>
              <ol style="padding-left: 20px; color: #555;">
                ${downloadLinksHtml}
              </ol>
              <p style="color: #555; font-size: 13px; margin-top: 15px;">
                Each PDF includes 10mm bleed and crop marks for professional printing.
              </p>
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

    console.log("Book order email sent successfully for order:", order.order_number);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Book PDF generated and email sent to production",
        orderNumber: order.order_number,
        pageCount: totalPages,
        batchCount: uploadedBatches.length,
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
