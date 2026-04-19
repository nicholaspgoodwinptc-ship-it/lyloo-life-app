import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Les trois liens officiels Google Sheets
const ACTIVITIES_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQH1LrtQULQ9FON_QKgG9tohAPpXunPNTBnawcxHAT8W_nUMXeUaagSWmD6fndtXu6Dk1zc54jNzo5J/pub?gid=518018541&single=true&output=csv";
const PRODUCTS_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQH1LrtQULQ9FON_QKgG9tohAPpXunPNTBnawcxHAT8W_nUMXeUaagSWmD6fndtXu6Dk1zc54jNzo5J/pub?gid=368489137&single=true&output=csv";
const CHALLENGES_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQH1LrtQULQ9FON_QKgG9tohAPpXunPNTBnawcxHAT8W_nUMXeUaagSWmD6fndtXu6Dk1zc54jNzo5J/pub?gid=337547159&single=true&output=csv";

// Fonction utilitaire pour lire et découper les CSV
async function fetchAndParseCsv(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  const lines = text.split("\n");
  return lines.slice(1).map((line) =>
    line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((v) =>
      v?.replace(/"/g, "").trim()
    )
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // 1. Téléchargement simultané des 3 fichiers CSV
    const [activitiesData, productsData, challengesData] = await Promise.all([
      fetchAndParseCsv(ACTIVITIES_URL),
      fetchAndParseCsv(PRODUCTS_URL),
      fetchAndParseCsv(CHALLENGES_URL),
    ]);

    // 2. Formatage des Activités
    const activitiesRecords = activitiesData.filter((v) => v[0]).map(
      (values) => ({
        id: values[0],
        type: values[1],
        categorie: values[2],
        titre: values[3],
        description: values[4],
        duree_minutes: parseInt(values[5]) || 0,
        image_url: values[6] || "",
        couleur_principale: values[7] || "",
        content_url: values[8] || "",
      })
    );

    // 3. Formatage des Produits (CORRIGÉ POUR CORRESPONDRE À VOTRE CSV)
    const productsRecords = productsData.filter((v) => v[0]).map((values) => ({
      id: values[0], // Colonne A: id
      name: values[1], // Colonne B: name
      price: parseFloat(values[2]) || 0, // Colonne C: price
      image_url: values[3] || "", // Colonne D: image
      category: values[4] || "", // Colonne E: category
      description: values[5] || "", // Colonne F: description
    }));

    // 4. Formatage des Challenges
    const challengesRecords = challengesData.filter((v) => v[0]).map(
      (values) => ({
        id: values[0],
        title: values[1],
        description: values[2],
        duration_days: parseInt(values[3]) || 0,
        start_date: values[4] || "",
        is_joined: values[5]?.toLowerCase() === "true",
        participants: parseInt(values[6]) || 0,
        image_url: values[7] || "",
      })
    );

    // 5. Sauvegarde dans la base de données Supabase
    const { error: actErr } = await supabaseClient.from("activities").upsert(
      activitiesRecords,
      { onConflict: "id" },
    );
    if (actErr) throw new Error(`Erreur Activités: ${actErr.message}`);

    const { error: prodErr } = await supabaseClient.from("products").upsert(
      productsRecords,
      { onConflict: "id" },
    );
    if (prodErr) throw new Error(`Erreur Produits: ${prodErr.message}`);

    const { error: chalErr } = await supabaseClient.from("challenges").upsert(
      challengesRecords,
      { onConflict: "id" },
    );
    if (chalErr) throw new Error(`Erreur Challenges: ${chalErr.message}`);

    // 6. Succès !
    return new Response(
      JSON.stringify({
        message:
          `Synchronisation réussie : ${activitiesRecords.length} act., ${productsRecords.length} prod., ${challengesRecords.length} chal.`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
