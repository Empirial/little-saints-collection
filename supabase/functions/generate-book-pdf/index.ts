import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Story blocks for each letter
const storyBlocks: Record<string, string> = {
  A: "The A was with an Aardvark, digging up ants. 'It's for Awesome!' he said, 'Now, go on! Take a chance!'",
  B: "A Big, Booming Baboon was balancing B. 'It's for Being so Brave! Now, take it from me!'",
  C: "A Castle of clouds held the letter C high. 'It's for Caring!' a kind, clever pixie flew by.",
  D: "A Dassie was Dozing, all snug on the D. 'It's for Dreaming,' he yawned, 'of all you can be!'",
  E: "An Enormous Elephant, Ever-so-gentle and grand, held E in his trunk, right for your little hand.",
  F: "A Fennec Fox, fluffy and Fast, hurried past. 'This F is for Faith! Hold it tight, make it last!'",
  G: "A Giant Giraffe, with his head in the sky, was nibbling a cloud where the G drifted by.",
  H: "A Happy-hippo-hero, named Harry-the-Brave, was using the H to make a big splashy wave!",
  I: "An Impala was leaping, so nimble and high, 'This I is for Inspire! Like stars in the sky!'",
  J: "A Jumping Jackal juggled the J with great glee. 'It's for Joy!' he yipped, 'It's the best thing to be!'",
  K: "A Kingfisher, quick! with a click-clack-ka-cheer! dived down for the K and said, 'Keep Kindness right here!'",
  L: "A Lazy Lion was Lounging on L. 'It's for Love,' he purred softly, 'and Living so well.'",
  M: "A Marching Meerkat was holding the M. 'It's for Mercy!' he chirped, 'A most magical gem!'",
  N: "A Nimble Nyala, stepped out from the trees. 'This N is for Nice! You're a breeze-on-a-breeze!'",
  O: "An Ostrich, so tall, peeked his head from the ground. 'This O is for Open! To all that's around!'",
  P: "A Pangolin, covered in plates, held the P. 'It's for Patience,' he mumbled, 'as all grown-ups should be.'",
  Q: "A Quiet Quelea (a small finch) in a flock found the Q on a Quiver tree, high on a rock.",
  R: "A Resting Rhino was Resting, right on the R. 'It's for Respect!' he snorted, 'You'll surely go far!'",
  S: "A Springbok was Sleeping right under the S. 'It's for Strong!' he awoke, 'and for Saying your \"Yes!\"'",
  T: "A Tortoise, so slow, was Trudging on T. 'It's for Thoughtful,' he mused, 'and Taking-your-time, you see.'",
  U: "A Uni-Zebra (a Unicorn, it's true!) was guarding the U and said, 'It's for Unique-You!'",
  V: "A Vervet monkey, with a voom and a vash, found the V in a Vine in a lightning-quick flash!",
  W: "A Warthog was Wallowing, Watching the W. 'It's for Wonderful! Worthy! And Wise!'",
  X: "An 'eXtra' special boX held the X just right. 'It's for eXtra Love! And eXtra bright light!'",
  Y: "The Y was held by a hero, 'Mega-Yellow-Mongoose!' 'It's for YOU!' he announced, 'Now let's put it to use!'",
  Z: "A Zebra, all Zig-Zagged and Zippy, you see, was Zooming right past with the letter Z!"
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

    // Build book structure
    const letters = bookData.childName.toUpperCase().split('').filter((l: string) => /[A-Z]/.test(l));
    const letterOccurrences: Map<string, number> = new Map();

    const pages: Array<{
      type: string;
      content: string;
      letter?: string;
      characterFolder?: string;
      themeFolder?: string;
      letterNum?: number;
    }> = [];

    // Title page
    pages.push({
      type: "title",
      content: `${bookData.childName}'s Great Name Chase`
    });

    // Letter pages
    for (const letter of letters) {
      const occurrenceIndex = letterOccurrences.get(letter) || 0;
      const theme = getThemeForLetter(occurrenceIndex, bookData.gender);
      letterOccurrences.set(letter, occurrenceIndex + 1);

      pages.push({
        type: "letter",
        content: storyBlocks[letter] || `The letter ${letter} appears in your name!`,
        letter: letter,
        characterFolder: getCharacterFolder(bookData.gender, bookData.skinTone),
        themeFolder: theme,
        letterNum: letterToNumber(letter)
      });
    }

    // Climax page
    pages.push({
      type: "climax",
      content: `The chase was all over! The letters were found. They zipped and they zoomed with a magical sound. Each one was a piece of what makes YOU so you! Your name is a marvel, a joy, and a prize.`
    });

    // Dedication page
    pages.push({
      type: "dedication",
      content: `To ${bookData.childName}, with love${bookData.fromField ? ` from ${bookData.fromField}` : ''}.\n\n${bookData.personalMessage || 'You are loved beyond measure.'}`
    });

    // Create email content with book details for printing
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #7c3aed; }
          h2 { color: #6366f1; margin-top: 30px; }
          .order-info { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .page { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          .page-header { font-weight: bold; color: #7c3aed; margin-bottom: 10px; }
          .image-info { background: #fef3c7; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; }
          .spread-note { background: #dbeafe; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>📚 New Personalized Book Order</h1>
        
        <div class="order-info">
          <p><strong>Order Number:</strong> ${order.order_number}</p>
          <p><strong>Customer:</strong> ${order.customer_name}</p>
          <p><strong>Email:</strong> ${order.customer_email}</p>
          <p><strong>Child's Name:</strong> ${bookData.childName}</p>
          <p><strong>Character:</strong> ${bookData.gender === 'boy' ? 'Boy' : 'Girl'} (${bookData.skinTone} skin tone)</p>
          <p><strong>Total Pages:</strong> ${pages.length}</p>
        </div>

        <div class="spread-note">
          <strong>📐 Print Specifications:</strong><br>
          Each spread below should be printed at <strong>37cm × 21cm (landscape)</strong>.<br>
          For final book assembly, cut each spread in half vertically to create two <strong>18.5cm × 21cm</strong> pages.
        </div>

        <h2>Book Pages</h2>
        
        ${pages.map((page, index) => {
          let imageInfo = '';
          if (page.type === 'letter' && page.characterFolder && page.themeFolder && page.letterNum) {
            imageInfo = `
              <div class="image-info">
                <strong>Image Path:</strong> /personalization/${page.characterFolder}/${page.themeFolder}/${page.letterNum}.webp (or .jpg)<br>
                Letter: ${page.letter} | Theme: ${page.themeFolder}
              </div>
            `;
          }
          
          return `
            <div class="page">
              <div class="page-header">Page ${index + 1}: ${page.type.toUpperCase()}</div>
              <p>${page.content.replace(/\n/g, '<br>')}</p>
              ${imageInfo}
            </div>
          `;
        }).join('')}

        <h2>Dedication Message</h2>
        <div class="page">
          ${bookData.fromField ? `<p><strong>From:</strong> ${bookData.fromField}</p>` : ''}
          <p>${bookData.personalMessage || 'You are loved beyond measure.'}</p>
        </div>
      </body>
      </html>
    `;

    // Send email via Brevo
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
        subject: `📚 Book Order ${order.order_number} - ${bookData.childName}'s Great Name Chase`,
        htmlContent: emailHtml
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
        message: "Book details sent to production",
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
