import {
  Activity,
  Challenge,
  CommunityPost,
  MoodEntry,
  Notification,
  Product,
  QuoteOfTheDay,
  Session,
} from "../types";
import { supabase } from "./supabaseClient";

export let MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "community",
    message: 'Rejoignez le défi "Sommeil Réparateur" dès aujourd\'hui.',
    date: new Date().toISOString(),
    read: false,
    title: "Notification système",
  },
];
export let MOCK_QUOTES: QuoteOfTheDay[] = [];

export const MockService = {
  // ==========================================
  // LECTURE DES DONNÉES PUBLIQUES (ADAPTER PATTERN)
  // ==========================================

  getActivities: async (): Promise<Activity[]> => {
    // 1. Fetch from all 3 tables simultaneously for maximum speed
    const [physRes, mentRes, recRes] = await Promise.all([
      supabase.from("physical_activities").select("*"),
      supabase.from("mental_activities").select("*"),
      supabase.from("recipes").select("*"),
    ]);

    if (physRes.error) {
      console.error("Erreur activités physiques:", physRes.error.message);
    }
    if (mentRes.error) {
      console.error("Erreur activités mentales:", mentRes.error.message);
    }
    if (recRes.error) console.error("Erreur recettes:", recRes.error.message);

    // 2. Fetch User Favorites
    const { data: { user } } = await supabase.auth.getUser();
    let favoritedIds = new Set<string>();

    if (user) {
      const { data: favorites } = await supabase.from("favorites").select(
        "activity_id",
      );
      if (favorites) favorites.forEach((f) => favoritedIds.add(f.activity_id));
    }

    // 3. Map Physical Activities
    const physicalActivities = (physRes.data || []).map((item) => ({
      id: item.id,
      type: "physique",
      categorie: item.discipline || "Activité physique",
      titre: item.titre || "",
      description: "",
      dureeMinutes: Number(item.duree_minutes) || 0,
      imageUrl: item.image_url || "",
      contentUrl: item.video_url || "",
      estFavori: favoritedIds.has(item.id),
      niveau: item.niveau || "",
      equipment: item.equipment || "",
      objectif: item.objectif || "",
      ageCible: item.age_cible || "",
    }));

    // 4. Map Mental Activities
    const mentalActivities = (mentRes.data || []).map((item) => ({
      id: item.id,
      type: "mental",
      categorie: item.discipline || "Mental",
      titre: item.titre || "",
      description: item.description || "",
      dureeMinutes: Number(item.duree_minutes) || 0,
      imageUrl: item.image_url || "",
      contentUrl: item.media_url || "", // We pass media_url here so ActivityDetail video player still works
      estFavori: favoritedIds.has(item.id),
      formatMedia: item.format_media || "",
      estTheorie: Boolean(item.est_theorie),
      attributSpecial: item.attribut_special || "",
    }));

    // 5. Map Recipes
    const recipes = (recRes.data || []).map((item) => ({
      id: item.id,
      type: "recette",
      categorie: "Recettes", // Helps standard filters catch it easily
      titre: item.titre || "",
      description: "",
      dureeMinutes: Number(item.prep_minutes) || 0, // Using prep_minutes for the UI clock icon
      imageUrl: item.image_url || "",
      contentUrl: "",
      estFavori: favoritedIds.has(item.id),
      methode: item.methode || "",
      calories: Number(item.calories) || 0,
      saison: item.saison || "",
      // Convert semicolon-separated strings from Google Sheets into arrays for React
      ingredients: item.ingredients
        ? item.ingredients.split(";").map((i: string) => i.trim()).filter(
          Boolean,
        )
        : [],
      instructions: item.instructions
        ? item.instructions.split(";").map((i: string) => i.trim()).filter(
          Boolean,
        )
        : [],
    }));

    // 6. Combine everything into one master array
    return [
      ...physicalActivities,
      ...mentalActivities,
      ...recipes,
    ] as Activity[];
  },

  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) return [];
    return (data || []).map((item) => ({
      id: item.id || Math.random().toString(),
      name: item.name || "Produit",
      category: item.category || "Boutique",
      description: item.description || "",
      price: Number(item.price) || 0,
      image_url: item.image_url || "",
    })) as Product[];
  },

  getChallenges: async (): Promise<Challenge[]> => {
    const { data, error } = await supabase.from("challenges").select("*");
    if (error) return [];
    return (data || []).map((item) => ({
      id: item.id || Math.random().toString(),
      title: item.title || "Challenge",
      description: item.description || "",
      durationDays: Number(item.duration_days) || 0,
      startDate: item.start_date || "",
      isJoined: Boolean(item.is_joined),
      participants: Number(item.participants) || 0,
      image_url: item.image_url || "",
    })) as Challenge[];
  },

  // ==========================================
  // ACTIONS PERSONNALISÉES (Favoris, Sessions, Humeur)
  // ==========================================

  toggleFavorite: async (activityId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from("favorites").select("id").eq(
      "activity_id",
      activityId,
    ).single();

    if (data) {
      await supabase.from("favorites").delete().eq("id", data.id);
    } else {
      await supabase.from("favorites").insert([{
        user_id: user.id,
        activity_id: activityId,
      }]);
    }
  },

  getSessions: async (): Promise<Session[]> => {
    const { data, error } = await supabase.from("sessions").select("*").order(
      "created_at",
      { ascending: false },
    );
    if (error) return [];
    return (data || []).map((s) => ({
      id: s.id,
      activityId: s.activity_id,
      date: s.created_at,
      duration: s.duration_minutes,
      moodBefore: s.mood_before || "",
      moodAfter: s.mood_after || "",
      note: s.note || "",
      userId: s.user_id,
      statut: s.statut || "terminee",
    })) as Session[];
  },

  saveSession: async (sessionData: Partial<Session>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("sessions").insert([{
      user_id: user.id,
      activity_id: sessionData.activityId,
      duration_minutes: sessionData.duration || 0,
      mood_before: sessionData.moodBefore || null,
      mood_after: sessionData.moodAfter || null,
      note: sessionData.note || null,
      statut: sessionData.statut || "terminee",
    }]);
  },

  getMoodHistory: async (): Promise<MoodEntry[]> => {
    const { data, error } = await supabase.from("mood_history").select("*")
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data || []).map((m) => ({
      id: m.id,
      date: m.created_at,
      mood: m.mood,
      note: m.note || "",
    })) as any[];
  },

  addMoodEntry: async (entry: Partial<MoodEntry>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("mood_history").insert([{
      user_id: user.id,
      mood: entry.mood || "neutre",
      note: entry.note || null,
    }]);
  },

  // ==========================================
  // COMMUNAUTÉ
  // ==========================================

  getPosts: async (): Promise<CommunityPost[]> => {
    const { data: posts, error } = await supabase.from("posts").select("*")
      .order("created_at", { ascending: false });
    if (error) return [];

    const { data: profiles } = await supabase.from("profiles").select(
      "id, first_name, last_name",
    );

    return (posts || []).map((post) => {
      const authorProfile = profiles?.find((p) => p.id === post.user_id);
      const authorName = authorProfile?.first_name
        ? `${authorProfile.first_name} ${authorProfile.last_name || ""}`.trim()
        : "Membre de la communauté";

      return {
        id: post.id,
        author: authorName,
        content: post.content,
        type: post.type || "message",
        date: post.created_at,
        likes: 0,
        reactions: {},
        comments: [],
      };
    }) as CommunityPost[];
  },

  addPost: async (post: Partial<CommunityPost>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("posts").insert([{
      user_id: user.id,
      content: post.content || "",
      type: post.type || "message",
    }]);
  },

  reactToPost: async () => {
    console.log("Reactions à implémenter");
  },
  getComments: async () => [],

  // ==========================================
  // MODE LECTURE SEULE
  // ==========================================
  saveActivity: async () => console.warn("Lecture seule activée."),
  deleteActivity: async () => console.warn("Lecture seule activée."),
  saveProduct: async () => console.warn("Lecture seule activée."),
  deleteProduct: async () => console.warn("Lecture seule activée."),
  getNotifications: async () => MOCK_NOTIFICATIONS,
  getQuoteOfTheDay: (): QuoteOfTheDay =>
    MOCK_QUOTES[0] || { id: "0", texte: "Respirez.", auteur: "Lyloo" },
};
