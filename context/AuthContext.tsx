import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export interface AppUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role?: string;
  theme?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setTheme: (theme: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSetProfile = async (authUser: any) => {
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      // AUTO-HEALING : Si le profil n'existe pas, on le crée !
      if (error && error.code === 'PGRST116') {
        console.log("Profil manquant, création automatique en cours...");
        
        const newProfile = {
          id: authUser.id,
          first_name: authUser.user_metadata?.first_name || '',
          last_name: authUser.user_metadata?.last_name || '',
          role: 'user',
          theme: 'system'
        };

        const { data: createdProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (!insertError) {
          profile = createdProfile;
        }
      }

      const appUser: AppUser = {
        id: authUser.id,
        email: authUser.email,
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        avatar_url: profile?.avatar_url || '',
        role: profile?.role || 'user',
        theme: profile?.theme || 'system',
      };

      setUser(appUser);
      applyTheme(appUser.theme);
    } catch (err) {
      console.error("Erreur inattendue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchAndSetProfile(session?.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        fetchAndSetProfile(session?.user);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  const applyTheme = (theme: string) => {
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setTheme = async (newTheme: string) => {
    if (!user) return;
    
    setUser({ ...user, theme: newTheme });
    applyTheme(newTheme);

    const { error } = await supabase
      .from('profiles')
      .update({ theme: newTheme })
      .eq('id', user.id);
      
    if (error) console.error("Erreur lors de la sauvegarde du thème:", error.message);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, setTheme }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};