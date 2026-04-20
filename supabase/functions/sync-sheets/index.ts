import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Les 5 liens Google Sheets (Physique, Mental, Recettes, Produits, Challenges)
const URLS = {
  physique:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQH1LrtQULQ9FON_QKgG9tohAPpXunPNTBnawcxHAT8W_nUMXeUaagSWmD6fndtXu6Dk1zc54jNzo5J/pub?gid=351802395&single=true&output=csv",
  mental:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQH1LrtQULQ9FON_QKgG9tohAPpXunPNTBnawcxHAT8W_nUMXeUaagSWmD6fndtXu6Dk1zc54jNzo5J/pub?gid=562610296&single=true&output=csv",
  recettes:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQH1LrtQULQ9FON_QKgG9tohAPpXunPNTBnawcxHAT8W_nUMXeUaagSWmD6fndtXu6Dk1zc54jNzo5J/pub?gid=942313329&single=true&output=csv",
  produits:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQH1LrtQULQ9FON_QKgG9tohAPpXunPNTBnawcxHAT8W_nUMXeUaagSWmD6fndtXu6Dk1zc54jNzo5J/pub?gid=368489137&single=true&output=csv",
  challenges:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQH1LrtQULQ9FON_QKgG9tohAPpXunPNTBnawcxHAT8W_nUMXeUaagSWmD6fndtXu6Dk1zc54jNzo5J/pub?gid=337547159&single=true&output=csv",
};

// Fonction intelligente : lit les noms des colonnes pour s'adapter à n'importe quel ordre !
async function fetchAndParseCsvDynamic(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  const lines = text.split("\n").filter((line) => line.trim() !== "");
  if (lines.length === 0) return [];

  const headers = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((h) =>
    h.replace(/"/g, "").trim().toLowerCase()
  );

  return lines.slice(1).map((line) => {
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((v) =>
      v?.replace(/"/g, "").trim()
    );
    const obj: any = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] || "";
    });
    return obj;
  }).filter((obj) => obj.id && obj.id !== ""); // Ne garder que les lignes avec un ID
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

    // 1. Téléchargement des 5 fichiers CSV en parallèle (Ultra rapide)
    const [physique, mental, recettes, produits, challenges] = await Promise
      .all([
        fetchAndParseCsvDynamic(URLS.physique),
        fetchAndParseCsvDynamic(URLS.mental),
        fetchAndParseCsvDynamic(URLS.recettes),
        fetchAndParseCsvDynamic(URLS.produits),
        fetchAndParseCsvDynamic(URLS.challenges),
      ]);

    // 2. Formatage dynamique basé sur les entêtes
    const physRecords = physique.map((p) => ({
      id: p.id,
      discipline: p.discipline,
      equipment: p.equipment || p.equipements,
      niveau: p.niveau,
      objectif: p.objectif,
      age_cible: p.age_cible || p.age,
      titre: p.titre,
      duree_minutes: parseInt(p.duree_minutes) || 0,
      video_url: p.video_url,
      image_url: p.image_url || p.image,
    }));

    const mentRecords = mental.map((m) => ({
      id: m.id,
      grand_domaine: m.grand_domaine,
      discipline: m.discipline,
      titre: m.titre,
      description: m.description,
      est_theorie: m.est_theorie?.toLowerCase() === "vrai" ||
        m.est_theorie?.toLowerCase() === "true",
      duree_minutes: parseInt(m.duree_minutes) || 0,
      format_media: m.format_media,
      media_url: m.media_url,
      image_url: m.image_url || m.image,
      attribut_special: m.attribut_special,
    }));

    const recRecords = recettes.map((r) => ({
      id: r.id,
      methode: r.methode,
      calories: parseInt(r.calories) || 0,
      saison: r.saison,
      type_repas: r.type_repas,
      titre: r.titre,
      prep_minutes: parseInt(r.prep_minutes) || 0,
      ingredients: r.ingredients,
      instructions: r.instructions,
      is_nouveaute: r.is_nouveaute?.toLowerCase() === "vrai" ||
        r.is_nouveaute?.toLowerCase() === "true",
      image_url: r.image_url || r.image,
    }));

    const prodRecords = produits.map((p) => ({
      id: p.id,
      name: p.name || p.nom,
      price: parseFloat(p.price || p.prix) || 0,
      category: p.category || p.categorie,
      description: p.description,
      image_url: p.image_url || p.image,
    }));

    const chalRecords = challenges.map((c) => ({
      id: c.id,
      title: c.title || c.titre,
      description: c.description,
      duration_days: parseInt(c.duration_days || c.duree_jours) || 0,
      start_date: c.start_date || c.date_debut,
      is_joined: c.is_joined?.toLowerCase() === "true",
      participants: parseInt(c.participants) || 0,
      image_url: c.image_url || c.image,
    }));

    // 3. Sauvegarde dans Supabase
    await Promise.all([
      supabaseClient.from("physical_activities").upsert(physRecords, {
        onConflict: "id",
      }),
      supabaseClient.from("mental_activities").upsert(mentRecords, {
        onConflict: "id",
      }),
      supabaseClient.from("recipes").upsert(recRecords, { onConflict: "id" }),
      supabaseClient.from("products").upsert(prodRecords, { onConflict: "id" }),
      supabaseClient.from("challenges").upsert(chalRecords, {
        onConflict: "id",
      }),
    ]);

    return new Response(
      JSON.stringify({
        message:
          `Sync OK : ${physRecords.length} Phys, ${mentRecords.length} Ment, ${recRecords.length} Recettes, ${prodRecords.length} Prod, ${chalRecords.length} Chal.`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
