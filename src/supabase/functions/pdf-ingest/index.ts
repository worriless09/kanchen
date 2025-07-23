import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// ?dts suffix optional; helps with TypeScript in Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?dts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { fileName, bucketName } = await req.json();

    if (!fileName || !bucketName) {
      return new Response(JSON.stringify({ error: "fileName and bucketName are required!" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Download PDF from storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from(bucketName)
      .download(fileName);

    if (downloadError) {
      throw new Error(`Failed to download PDF: ${downloadError.message}`);
    }

    // Convert PDF to text (for real-world: use pdfjs or similar)
    const arrayBuffer = await fileData.arrayBuffer();
    const text = new TextDecoder().decode(arrayBuffer);

    const chunks = text.split("\n\n").filter((chunk) => chunk.trim().length > 50);

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: "OpenAI API Key not set" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const flashcards = [];
    for (const chunk of chunks.slice(0, 10)) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Create a flashcard question and answer from this text for UPSC preparation. Return only JSON with "question" and "answer" fields:\n\n${chunk}`,
            },
          ],
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        try {
          const flashcard = JSON.parse(result.choices[0].message.content);
          flashcards.push({
            question: flashcard.question,
            answer: flashcard.answer,
            subject: "General Studies",
            source_file: fileName,
          });
        } catch (parseError) {
          console.error("Failed to parse flashcard JSON:", parseError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        flashcardsGenerated: flashcards.length,
        flashcards,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
