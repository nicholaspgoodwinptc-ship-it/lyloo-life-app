// services/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// We will store these variables securely in a .env.local file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// This exports the client we will use across the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);