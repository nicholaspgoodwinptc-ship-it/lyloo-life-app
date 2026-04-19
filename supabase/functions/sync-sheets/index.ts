import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQH1LrtQULQ9FON_QKgG9tohAPpXunPNTBnawcxHAT8W_nUMXeUaagSWmD6fndtXu6Dk1zc54jNzo5J/pub?gid=518018541&single=true&output=csv";

serve(async (req) => {
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
      // We check for 9 columns based on your provided CSV structure
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

    // --- DEBUGGING BLOCK ---
    // If it finds 0 records, send back exactly what it saw so we can fix it!
    if (records.length === 0) {
      return new Response(
        JSON.stringify({
          message: "0 activities parsed. Debug info attached.",
          totalLinesReceived: lines.length,
          firstLineHeader: lines[0],
          sampleRow: lines[1] || "No second line found",
          rawSample: csvText.substring(0, 200),
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    // --- END DEBUGGING BLOCK ---

    const { error } = await supabaseClient
      .from("activities")
      .upsert(records, { onConflict: "id" });

    if (error) throw error;

    return new Response(
      JSON.stringify({
        message: `Successfully synced ${records.length} activities`,
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
