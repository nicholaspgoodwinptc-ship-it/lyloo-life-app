export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  objectifs: string[];
  tempsParJourMinutes: number;
  notifications: {
    matin: boolean;
    midi: boolean;
    soir: boolean;
  };
  theme: "light" | "dark" | "system";
  role: "user" | "admin";
}

export type WellnessType = "mental" | "physique";

export interface Activity {
  id: string;
  type: string;
  categorie: string;
  titre: string;
  description?: string;
  dureeMinutes: number;
  imageUrl: string;
  contentUrl?: string;
  couleurPrincipale?: string;
  estFavori?: boolean;
  ingredients?: string[];
  instructions?: string[];

  // Nouveaux champs : Physiques
  niveau?: string;
  equipment?: string;
  objectif?: string;
  ageCible?: string;

  // Nouveaux champs : Mentaux
  formatMedia?: string;
  estTheorie?: boolean;
  attributSpecial?: string;

  // Nouveaux champs : Recettes
  methode?: string;
  calories?: number;
  saison?: string;
}

export interface Session {
  id: string;
  activityId: string;
  userId: string;
  date: string; // ISO date
  statut: "terminee" | "en cours" | "abandonnee";
  duration?: number;
  moodBefore?: string;
  moodAfter?: string;
  note?: string;
}

export interface MoodEntry {
  id: string;
  userId: string;
  date: string; // ISO date
  niveau: 1 | 2 | 3 | 4 | 5;
  noteTexte?: string;
}

export interface QuoteOfTheDay {
  id: string;
  texte: string;
  auteur: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  content: string;
  type: "message" | "conseil" | "challenge";
  likes: number;
  date: string; // ISO date
  isLiked?: boolean;
  comments: Comment[];
  reactions: Record<string, number>; // e.g. { '❤️': 5, '👏': 2 }
  userReaction?: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  participants: number;
  durationDays: number;
  startDate: string;
  image_url: string;
  isJoined: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "community" | "wellness" | "system";
}
