import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const bucketName = "book-assets";
    const characterFolders = ["Blackboy", "Blackgirl", "Whiteboy", "Whitegirl"];
    const themeFolders = ["Cover", "Intro", "Ending", "Superherotheme", "Wildanimaltheme", "Fairytaletheme"];
    
    const deletedFiles: string[] = [];
    const errors: string[] = [];

    for (const character of characterFolders) {
      for (const theme of themeFolders) {
        const folderPath = `${character}/${theme}`;
        
        // List all files in the folder
        const { data: files, error: listError } = await supabase.storage
          .from(bucketName)
          .list(folderPath);

        if (listError) {
          errors.push(`Error listing ${folderPath}: ${listError.message}`);
          continue;
        }

        if (files && files.length > 0) {
          const filePaths = files.map(file => `${folderPath}/${file.name}`);
          
          const { error: deleteError } = await supabase.storage
            .from(bucketName)
            .remove(filePaths);

          if (deleteError) {
            errors.push(`Error deleting files in ${folderPath}: ${deleteError.message}`);
          } else {
            deletedFiles.push(...filePaths);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        deletedCount: deletedFiles.length,
        deletedFiles,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
