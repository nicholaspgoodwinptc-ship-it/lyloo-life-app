import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 1. Browser Security Headers (CORS)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// 2. Your actual published Google Sheet URL
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQH1LrtQULQ9FON_QKgG9tohAPpXunPNTBnawcxHAT8W_nUMXeUaagSWmD6fndtXu6Dk1zc54jNzo5J/pub?gid=518018541&single=true&output=csv";

serve(async (req) => {
  // 3. Answer the browser's security "preflight" check
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const response = await fetch(CSV_URL);
    const csvText = await response.text();

    const lines = csvText.split("\n");

    const records = lines.slice(1).map((line) => {
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      if (values.length < 9) return null;

      return {
        id: values[0]?.replace(/"/g, ""),
        type: values[1]?.replace(/"/g, ""),
        categorie: values[2]?.replace(/"/g, ""),
        titre: values[3]?.replace(/"/g, ""),
        description: values[4]?.replace(/"/g, ""),
        duree_minutes: parseInt(values[5]) || 0,
        image_url: values[6]?.replace(/"/g, ""),
        couleur_principale: values[7]?.replace(/"/g, ""),
        content_url: values[8]?.replace(/"/g, ""),
      };
    }).filter(Boolean);

    const { error } = await supabaseClient
      .from("activities")
      .upsert(records, { onConflict: "id" });

    if (error) throw error;

    // 4. Return success WITH the CORS headers attached
    return new Response(
      JSON.stringify({
        message: `Successfully synced ${records.length} activities`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    // 5. Return error WITH the CORS headers attached
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
