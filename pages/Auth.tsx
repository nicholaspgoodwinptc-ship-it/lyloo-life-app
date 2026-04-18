import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, LylooLogo } from '../components/ui/LayoutComponents';
import { Lock, Mail } from 'lucide-react';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState(''); // Added to display Supabase errors
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(''); // Clear any previous errors when trying again

    try {
      if (isLogin) {
        // --- REAL SUPABASE LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) throw error;

        // Success! Go to dashboard
        navigate('/');
      } else {
        // --- REAL SUPABASE SIGNUP ---
        const { error } = await supabase.auth.signUp({
          email: email,
          password: password,
        });

        if (error) throw error;

        // Success! Go to the onboarding tunnel for new users
        navigate('/onboarding');
      }
    } catch (error: any) {
      console.error(error);
      // Display the error message from Supabase to the user
      setErrorMsg(error.message || 'Une erreur est survenue lors de l\'authentification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-lyloo-bg relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-lyloo-vertEau/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-lyloo-vertPale/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

      <Card className="w-full max-w-md p-8 z-10 relative">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-4">
            <LylooLogo className="h-28 w-auto text-lyloo-anthracite" />
          </div>
          <h1 className="text-2xl font-bold text-lyloo-anthracite">Bienvenue chez Lyloo</h1>
          <p className="text-stone-500 mt-2">Votre compagnon de bien-être holistique</p>
        </div>

        {/* --- NEW ERROR MESSAGE DISPLAY --- */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-stone-400" size={20} />
            <Input
              type="email"
              placeholder="Adresse email"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-stone-400" size={20} />
            <Input
              type="password"
              placeholder="Mot de passe"
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6} // Supabase requires at least 6 characters by default
            />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="terms" required className="accent-lyloo-vertEau" />
            <label htmlFor="terms" className="text-xs text-stone-500">
              J'accepte les Conditions d'utilisation et la Politique de confidentialité
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Traitement...' : (isLogin ? 'Se connecter' : 'Créer un compte')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg(''); // Clear errors when switching modes
            }}
            className="text-sm text-lyloo-anthracite font-bold hover:underline"
          >
            {isLogin ? "Nouveau sur Lyloo ? Rejoindre maintenant" : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;