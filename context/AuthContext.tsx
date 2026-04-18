import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

// 1. Define the shape of our Context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// 2. Create the Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create the Provider Component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an active session when the app first loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for real-time login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Clean up the listener when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  // Helper function to handle logouts
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {/* Only render the app once we know if the user is logged in or not */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 4. Create a simple Hook to use this context anywhere in the app
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};