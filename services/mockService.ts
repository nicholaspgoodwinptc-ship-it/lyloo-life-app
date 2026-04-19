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

export let MOCK_SESSIONS: Session[] = [
  {
    id: "s1",
    activityId: "m1",
    date: new Date().toISOString(),
    duration: 0,
    moodBefore: "",
    moodAfter: "",
    note: "",
    userId: "user_123",
    statut: "terminee",
  },
  {
    id: "s2",
    activityId: "p1",
    date: new Date().toISOString(),
    duration: 0,
    moodBefore: "",
    moodAfter: "",
    note: "",
    userId: "user_123",
    statut: "terminee",
  },
];

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

export let MOCK_MOOD_HISTORY: MoodEntry[] = [];
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
  // LOGIQUE SUPABASE (DONNÉES RÉELLES)
  // ==========================================

  getActivities: async (): Promise<Activity[]> => {
    const { data, error } = await supabase.from("activities").select("*");
    if (error) {
      console.error("Erreur Supabase (Activités):", error.message);
      return [];
    }

    // PROTECTION ANTI-CRASH : On garantit un tableau (|| []) et on force les types
    return (data || []).map((item) => ({
      ...item,
      dureeMinutes: Number(item.duree_minutes) || 0,
      contentUrl: item.content_url || "",
      imageUrl: item.image_url || "",
      couleurPrincipale: item.couleur_principale || "",
      ingredients: [],
      instructions: [],
    })) as Activity[];
  },

  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from("products").select("*");

    // ADD THIS TRACE LINE:
    console.log("Trace Supabase Produits:", data, "Erreur:", error);

    if (error) {
      console.error("Erreur Supabase (Produits):", error.message);
      return [];
    }

    // PROTECTION ANTI-CRASH : On force "price" à être un nombre pour éviter les erreurs .toFixed()
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
    if (error) {
      console.error("Erreur Supabase (Challenges):", error.message);
      return [];
    }

    // PROTECTION ANTI-CRASH : On force "durationDays" et "participants" à être des nombres
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
  // MODE LECTURE SEULE
  // ==========================================
  saveActivity: async (activity: Activity) =>
    console.warn("Lecture seule activée."),
  deleteActivity: async (id: string) => console.warn("Lecture seule activée."),
  saveProduct: async (product: Product) =>
    console.warn("Lecture seule activée."),
  deleteProduct: async (id: string) => console.warn("Lecture seule activée."),
  toggleFavorite: async (id: string) => console.log("Favoris non implémentés."),

  // ==========================================
  // DONNÉES TEMPORAIRES (POSTS)
  // ==========================================
  getPosts: async () => MOCK_POSTS,
  addPost: async (post: Partial<CommunityPost>) => {
    MOCK_POSTS.unshift({
      id: Math.random().toString(36).substr(2, 9),
      author: post.author || "Moi",
      content: post.content || "",
      type: post.type || "message",
      likes: 0,
      date: new Date().toISOString(),
      comments: [],
      reactions: {},
    });
  },
  reactToPost: async (
    id: string,
    reaction: string,
  ) => {/* Gardé simple pour l'espace */},
  getSessions: async () => MOCK_SESSIONS,
  getNotifications: async () => MOCK_NOTIFICATIONS,
  getMoodHistory: async () => MOCK_MOOD_HISTORY,
  getQuoteOfTheDay: (): QuoteOfTheDay =>
    MOCK_QUOTES[0] || { id: "0", texte: "Respirez.", auteur: "Lyloo" },
  getComments: async () => [],
};
