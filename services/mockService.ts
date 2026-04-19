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

// Les fausses activités (MOCK_ACTIVITIES) ont été supprimées.
// L'application utilise maintenant la base de données en direct !

export let MOCK_PRODUCTS: Product[] = [
  {
    id: "prod1",
    name: "Tapis de Yoga Confort",
    price: 45,
    image_url: "",
    category: "Accessoires",
    description:
      "Tapis épais (6mm) et antidérapant en TPE écologique. Idéal pour vos séances de yoga et pilates à la maison.",
  },
  {
    id: "prod2",
    name: "Gourde Isotherme Lyloo",
    price: 25,
    image_url: "",
    category: "Lifestyle",
    description:
      "Gardez votre eau fraîche pendant 24h et votre tisane chaude 12h. Acier inoxydable.",
  },
  {
    id: "prod3",
    name: "Zafu de Méditation",
    price: 35,
    image_url: "",
    category: "Méditation",
    description:
      "Coussin de méditation ergonomique en coton bio, garnissage épeautre. Pour une posture parfaite.",
  },
  {
    id: "prod4",
    name: "Huile Essentielle Lavande",
    price: 12,
    image_url: "",
    category: "Aromathérapie",
    description:
      "Lavande vraie bio. Idéale pour la relaxation et favoriser l'endormissement.",
  },
  {
    id: "prod5",
    name: "Briques de Yoga (Lot de 2)",
    price: 22,
    image_url: "",
    category: "Accessoires",
    description:
      "Briques en liège naturel pour vous aider dans vos postures d'équilibre et de souplesse.",
  },
  {
    id: "prod6",
    name: "Diffuseur Ultrasonique",
    price: 39,
    image_url: "",
    category: "Aromathérapie",
    description:
      "Diffuseur d'huiles essentielles silencieux avec lumière d'ambiance douce.",
  },
  {
    id: "prod7",
    name: "Journal de Gratitude",
    price: 18,
    image_url: "",
    category: "Papeterie",
    description:
      "Carnet guidé pour noter vos pensées positives chaque jour. Couverture rigide recyclée.",
  },
  {
    id: "prod8",
    name: 'Infusion "Nuit Calme"',
    price: 9.5,
    image_url: "",
    category: "Nutrition",
    description: "Mélange de mélisse, verveine et tilleul. 100g vrac bio.",
  },
];

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
  {
    id: "s3",
    activityId: "m2",
    date: new Date().toISOString(),
    duration: 0,
    moodBefore: "",
    moodAfter: "",
    note: "",
    userId: "user_123",
    statut: "terminee",
  },
  {
    id: "s4",
    activityId: "m3",
    date: new Date().toISOString(),
    duration: 0,
    moodBefore: "",
    moodAfter: "",
    note: "",
    userId: "user_123",
    statut: "terminee",
  },
  {
    id: "s5",
    activityId: "p3",
    date: new Date().toISOString(),
    duration: 0,
    moodBefore: "",
    moodAfter: "",
    note: "",
    userId: "user_123",
    statut: "terminee",
  },
  {
    id: "s6",
    activityId: "p6",
    date: new Date().toISOString(),
    duration: 0,
    moodBefore: "",
    moodAfter: "",
    note: "",
    userId: "user_123",
    statut: "terminee",
  },
];

export let MOCK_CHALLENGES: Challenge[] = [
  {
    id: "c1",
    title: "",
    description:
      "Chaque jour, notez 3 choses pour lesquelles vous êtes reconnaissant.",
    durationDays: 0,
    startDate: new Date().toISOString(),
    isJoined: true,
    participants: 1240,
    image_url: "",
  },
  {
    id: "c2",
    title: "",
    description:
      "Boire 2L d'eau par jour pendant 2 semaines. Votre peau vous remerciera !",
    durationDays: 0,
    startDate: new Date().toISOString(),
    isJoined: false,
    participants: 856,
    image_url: "",
  },
  {
    id: "c3",
    title: "",
    description:
      "Aucun écran 1h avant de dormir pendant 5 jours. Retrouvez un sommeil réparateur.",
    durationDays: 0,
    startDate: new Date().toISOString(),
    isJoined: false,
    participants: 2300,
    image_url: "",
  },
  {
    id: "c4",
    title: "",
    description:
      "10 000 pas par jour pendant 1 mois. Bougez plus, vivez mieux.",
    durationDays: 0,
    startDate: new Date().toISOString(),
    isJoined: false,
    participants: 560,
    image_url: "",
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
  {
    id: "n2",
    type: "wellness",
    message: "Vous avez complété 3 séances cette semaine.",
    date: new Date().toISOString(),
    read: true,
    title: "Notification système",
  },
  {
    id: "n3",
    type: "community",
    message: '"Le rituel du matin..."',
    date: new Date().toISOString(),
    read: false,
    title: "Notification système",
  },
  {
    id: "n4",
    type: "system",
    message: "Prenez 5 minutes pour respirer avant de dormir.",
    date: new Date().toISOString(),
    read: true,
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
    content:
      "Le rituel du matin a changé ma journée ! Je me sens tellement plus apaisée.",
    likes: 12,
    type: "message",
    reactions: {},
    comments: [],
  },
  {
    id: "2",
    author: "Équipe LYLOO",
    date: new Date().toISOString(),
    content:
      "Conseil du jour : Prenez le temps de mâcher chaque bouchée pour une meilleure digestion.",
    likes: 45,
    type: "message",
    reactions: {},
    comments: [],
  },
  {
    id: "3",
    author: "Challenge",
    date: new Date().toISOString(),
    content:
      "Aujourd'hui : 3 respirations profondes à chaque fois que vous regardez votre téléphone.",
    likes: 89,
    type: "message",
    reactions: {},
    comments: [],
  },
  {
    id: "4",
    author: "Camille",
    date: new Date().toISOString(),
    content:
      "Qui a testé le nouveau cours de Pilates ? C'est intense pour les abdos ! 🔥",
    likes: 23,
    type: "message",
    reactions: {},
    comments: [],
  },
  {
    id: "5",
    author: "Lucas",
    date: new Date().toISOString(),
    content:
      "Petite victoire : j'ai réussi à méditer 10 minutes ce matin sans regarder ma montre.",
    likes: 56,
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
    const { data, error } = await supabase
      .from("activities")
      .select("*");

    if (error) {
      console.error("Erreur Supabase:", error.message);
      return [];
    }

    const formattedData = data.map((item) => ({
      ...item,
      dureeMinutes: item.duree_minutes || 0,
      contentUrl: item.content_url || "",
      imageUrl: item.image_url || "",
      couleurPrincipale: item.couleur_principale || "",
      ingredients: [],
      instructions: [],
    }));

    return formattedData as Activity[];
  },

  saveActivity: async (activity: Activity) => {
    // Transforme l'objet React en objet compréhensible par Supabase
    const activityToSave = {
      id: activity.id,
      type: activity.type,
      categorie: activity.categorie,
      titre: activity.titre,
      description: activity.description,
      duree_minutes: activity.dureeMinutes,
      image_url: activity.imageUrl,
      couleur_principale: activity.couleurPrincipale,
      content_url: activity.contentUrl,
    };

    const { error } = await supabase
      .from("activities")
      .upsert(activityToSave, { onConflict: "id" });

    if (error) {
      console.error("Erreur lors de la sauvegarde:", error.message);
      throw error;
    }
  },

  deleteActivity: async (id: string) => {
    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erreur lors de la suppression:", error.message);
      throw error;
    }
  },

  toggleFavorite: async (id: string) => {
    console.log(
      "La gestion des favoris sera implémentée plus tard avec une table Supabase dédiée.",
    );
  },

  // ==========================================
  // DONNÉES TEMPORAIRES (PRODUITS, POSTS, ETC.)
  // ==========================================

  getProducts: async () => MOCK_PRODUCTS,
  saveProduct: async (product: Product) => {
    const index = MOCK_PRODUCTS.findIndex((p) => p.id === product.id);
    if (index >= 0) MOCK_PRODUCTS[index] = product;
    else MOCK_PRODUCTS.push(product);
  },
  deleteProduct: async (id: string) => {
    const index = MOCK_PRODUCTS.findIndex((p) => p.id === id);
    if (index >= 0) MOCK_PRODUCTS.splice(index, 1);
  },

  getPosts: async () => MOCK_POSTS,
  addPost: async (post: Partial<CommunityPost>) => {
    const newPost: CommunityPost = {
      id: Math.random().toString(36).substr(2, 9),
      author: post.author || "Moi",
      content: post.content || "",
      type: post.type || "message",
      likes: 0,
      date: new Date().toISOString(),
      comments: [],
      reactions: {},
    };
    MOCK_POSTS.unshift(newPost);
  },
  reactToPost: async (id: string, reaction: string) => {
    const post = MOCK_POSTS.find((p) => p.id === id);
    if (post) {
      if (!post.reactions) post.reactions = {};
      if (post.userReaction === reaction) {
        post.reactions[reaction] = Math.max(
          0,
          (post.reactions[reaction] || 1) - 1,
        );
        post.userReaction = null;
      } else {
        if (post.userReaction && post.reactions[post.userReaction]) {
          post.reactions[post.userReaction]--;
        }
        post.reactions[reaction] = (post.reactions[reaction] || 0) + 1;
        post.userReaction = reaction;
      }
    }
  },

  getChallenges: async () => MOCK_CHALLENGES,
  getSessions: async () => MOCK_SESSIONS,
  getNotifications: async () => MOCK_NOTIFICATIONS,
  getMoodHistory: async () => MOCK_MOOD_HISTORY,
  getQuoteOfTheDay: (): QuoteOfTheDay =>
    MOCK_QUOTES[0] ||
    {
      id: "0",
      texte: "Le bonheur est parfois caché dans l'inconnu.",
      auteur: "Victor Hugo",
    },
  getComments: async () => [],
};
