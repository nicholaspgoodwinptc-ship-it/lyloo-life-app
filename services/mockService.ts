import {
  Activity,
  Challenge,
  Comment,
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
export let MOCK_POSTS: CommunityPost[] = [
  {
    id: "1",
    author: "Sophie",
    date: new Date().toISOString(),
    content: "Le rituel du matin a changé ma journée !",
    likes: 12,
    type: "message",
    reactions: {},
    comments: [],
  },
];

export const MockService = {
  // ==========================================
  // LECTURE DES DONNÉES PUBLIQUES
  // ==========================================

  getActivities: async (): Promise<Activity[]> => {
    const { data: activities, error } = await supabase.from("activities")
      .select("*");
    if (error) return [];

    const { data: { user } } = await supabase.auth.getUser();
    let favoritedIds = new Set<string>();

    if (user) {
      const { data: favorites } = await supabase.from("favorites").select(
        "activity_id",
      );
      if (favorites) favorites.forEach((f) => favoritedIds.add(f.activity_id));
    }

    return (activities || []).map((item) => ({
      ...item,
      dureeMinutes: Number(item.duree_minutes) || 0,
      contentUrl: item.content_url || "",
      imageUrl: item.image_url || "",
      couleurPrincipale: item.couleur_principale || "",
      estFavori: favoritedIds.has(item.id),
      ingredients: [],
      instructions: [],
    })) as Activity[];
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

  // ---- LECTURE ET ÉCRITURE DES SESSIONS ----

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

    const { error } = await supabase.from("sessions").insert([{
      user_id: user.id,
      activity_id: sessionData.activityId,
      duration_minutes: sessionData.duration || 0,
      mood_before: sessionData.moodBefore || null,
      mood_after: sessionData.moodAfter || null,
      note: sessionData.note || null,
      statut: sessionData.statut || "terminee",
    }]);

    if (error) {
      console.error(
        "Erreur lors de l'enregistrement de la session:",
        error.message,
      );
    }
  },

  // ---- LECTURE ET ÉCRITURE DE L'HUMEUR ----

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

    const { error } = await supabase.from("mood_history").insert([{
      user_id: user.id,
      mood: entry.mood || "neutre",
      note: entry.note || null,
    }]);

    if (error) {
      console.error(
        "Erreur lors de l'enregistrement de l'humeur:",
        error.message,
      );
    }
  },

  // ==========================================
  // MODE LECTURE SEULE (Admin/Google Sheets)
  // ==========================================
  saveActivity: async () => console.warn("Lecture seule activée."),
  deleteActivity: async () => console.warn("Lecture seule activée."),
  saveProduct: async () => console.warn("Lecture seule activée."),
  deleteProduct: async () => console.warn("Lecture seule activée."),

  // ==========================================
  // DONNÉES TEMPORAIRES (POSTS)
  // ==========================================
  getPosts: async () => MOCK_POSTS,
  addPost: async () => {/* Gardé simple pour l'espace */},
  reactToPost: async () => {/* Gardé simple pour l'espace */},
  getNotifications: async () => MOCK_NOTIFICATIONS,
  getQuoteOfTheDay: (): QuoteOfTheDay =>
    MOCK_QUOTES[0] || { id: "0", texte: "Respirez.", auteur: "Lyloo" },
  getComments: async () => [],
};
