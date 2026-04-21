import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
  quotes:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQH1LrtQULQ9FON_QKgG9tohAPpXunPNTBnawcxHAT8W_nUMXeUaagSWmD6fndtXu6Dk1zc54jNzo5J/pub?gid=1493949505&single=true&output=csv",
  notifications:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQH1LrtQULQ9FON_QKgG9tohAPpXunPNTBnawcxHAT8W_nUMXeUaagSWmD6fndtXu6Dk1zc54jNzo5J/pub?gid=129984928&single=true&output=csv",
};

// --- GOOGLE DRIVE IMAGE CONVERTER WITH TRACING ---
const convertDriveImageLink = (url: string | undefined | null): string => {
  if (!url) return "";

  if (url.includes("drive.google.com/file/d/")) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);

    if (match && match[1]) {
      const driveId = match[1];

      // HERE is the crucial $ that I kept forgetting!
      const newUrl = `https://lh3.googleusercontent.com/d/${driveId}`;

      return newUrl;
    } else {
      console.log(`[IMAGE TRACE ERROR] Could not extract ID from: ${url}`);
    }
  }
  return url;
};

async function fetchAndParseCsvDynamic(url: string) {
  const response = await fetch(url);
  let text = await response.text();
  text = text.replace(/^\uFEFF/, ""); // BOM Fix
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
  }).filter((obj) => obj.id && obj.id !== "");
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

    const [
      physique,
      mental,
      recettes,
      produits,
      challenges,
      quotes,
      notifications,
    ] = await Promise.all([
      fetchAndParseCsvDynamic(URLS.physique),
      fetchAndParseCsvDynamic(URLS.mental),
      fetchAndParseCsvDynamic(URLS.recettes),
      fetchAndParseCsvDynamic(URLS.produits),
      fetchAndParseCsvDynamic(URLS.challenges),
      fetchAndParseCsvDynamic(URLS.quotes),
      fetchAndParseCsvDynamic(URLS.notifications),
    ]);

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
      image_url: convertDriveImageLink(p.image_url || p.image), // <-- Converted!
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
      image_url: convertDriveImageLink(m.image_url || m.image), // <-- Converted!
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
      image_url: convertDriveImageLink(r.image_url || r.image), // <-- Converted!
    }));

    const prodRecords = produits.map((p) => ({
      id: p.id,
      name: p.name || p.nom,
      price: parseFloat(p.price || p.prix) || 0,
      category: p.category || p.categorie,
      description: p.description,
      image_url: convertDriveImageLink(p.image_url || p.image), // <-- Converted!
    }));

    const chalRecords = challenges.map((c) => ({
      id: c.id,
      title: c.title || c.titre,
      description: c.description,
      duration_days: parseInt(c.duration_days || c.dureejours) || 0,
      start_date: c.start_date || c.datedebut,
      is_joined: c.is_joined?.toLowerCase() === "true" ||
        c.isjoined?.toLowerCase() === "true",
      participants: parseInt(c.participants) || 0,
      image_url: convertDriveImageLink(c.image_url || c.image), // <-- Converted!
    }));

    const quoRecords = quotes.map((q) => ({
      id: q.id,
      texte: q.texte,
      auteur: q.auteur,
    }));

    const notRecords = notifications.map((n) => ({
      id: n.id,
      type: n.type,
      message: n.message,
      date: n.date,
      read: n.read?.toLowerCase() === "vrai" ||
        n.read?.toLowerCase() === "true",
    }));

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
      supabaseClient.from("quotes").upsert(quoRecords, { onConflict: "id" }),
      supabaseClient.from("notifications").upsert(notRecords, {
        onConflict: "id",
      }),
    ]);

    return new Response(
      JSON.stringify({
        message: `Sync OK: 7 Tables mises à jour avec succès !`,
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
