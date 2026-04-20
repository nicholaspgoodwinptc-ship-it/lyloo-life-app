import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/LayoutComponents';
import { Moon, Sun, Smartphone, LogOut, ChevronRight, Info, User, Bell, X, Shield, Edit2, Save } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, signOut, setTheme, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Nouveaux états pour le mode édition
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialisation des champs texte
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
    }
  }, [user]);

  if (!user) return null;

  // Fonction de sauvegarde
  const handleSave = async () => {
    setIsSaving(true);
    await updateProfile({ first_name: firstName, last_name: lastName });
    setIsEditing(false);
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-lyloo-beige dark:bg-lyloo-dark-bg pb-40">
      <div className="bg-lyloo-vertEau p-6 pt-safe-top pb-12 rounded-b-[40px] mb-[-20px] relative z-10 transition-all">
          <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-lyloo-anthracite">Profil & Paramètres</h1>
              <button onClick={() => navigate(-1)} className="p-2 bg-white/20 rounded-full text-lyloo-anthracite hover:bg-white/40 transition-colors">
                  <X size={24} />
              </button>
          </div>
          
          <div className="flex items-center gap-4 relative">
              {user.avatar_url ? (
                  <img src={user.avatar_url} className="w-16 h-16 rounded-full border-4 border-white/30 object-cover" alt="Avatar" />
              ) : (
                  <div className="w-16 h-16 rounded-full border-4 border-white/30 bg-white/20 flex items-center justify-center text-lyloo-anthracite font-bold text-xl uppercase">
                      {(user.first_name?.[0] || '')}{(user.last_name?.[0] || '?')}
                  </div>
              )}
              
              <div className="flex-1">
                  {/* MODE ÉDITION VS MODE AFFICHAGE */}
                  {isEditing ? (
                      <div className="flex flex-col gap-2 animate-in fade-in zoom-in duration-300">
                          <input 
                              type="text" 
                              value={firstName} 
                              onChange={(e) => setFirstName(e.target.value)} 
                              placeholder="Prénom"
                              className="px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-lyloo-anthracite bg-white/50 text-lyloo-anthracite font-bold placeholder:text-lyloo-anthracite/40 w-full"
                          />
                          <input 
                              type="text" 
                              value={lastName} 
                              onChange={(e) => setLastName(e.target.value)} 
                              placeholder="Nom"
                              className="px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-lyloo-anthracite bg-white/50 text-lyloo-anthracite font-bold placeholder:text-lyloo-anthracite/40 w-full"
                          />
                      </div>
                  ) : (
                      <div>
                          <h2 className="text-2xl font-bold text-lyloo-anthracite">
                              {user.first_name || 'Anonyme'} {user.last_name || ''}
                          </h2>
                          <p className="text-lyloo-anthracite/70 text-sm">{user.email}</p>
                      </div>
                  )}
              </div>

              {/* BOUTON D'ÉDITION / SAUVEGARDE */}
              <div className="self-start">
                  {isEditing ? (
                      <button 
                          onClick={handleSave} 
                          disabled={isSaving}
                          className="bg-lyloo-anthracite text-white p-2.5 rounded-full shadow-md hover:scale-105 transition-transform disabled:opacity-50"
                      >
                          <Save size={18} />
                      </button>
                  ) : (
                      <button 
                          onClick={() => setIsEditing(true)} 
                          className="bg-white/30 text-lyloo-anthracite p-2.5 rounded-full hover:bg-white/50 transition-colors"
                      >
                          <Edit2 size={18} />
                      </button>
                  )}
              </div>
          </div>
      </div>

      <div className="px-4 space-y-4 pt-10 max-w-2xl mx-auto">
          
          {user.role === 'admin' && (
             <div className="bg-lyloo-anthracite rounded-3xl overflow-hidden shadow-lg mb-6">
                  <button 
                    onClick={() => navigate('/admin')} 
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                  >
                      <span className="font-bold text-lyloo-beige flex items-center gap-3 text-base">
                          <Shield size={20} className="text-lyloo-dore" /> Administration
                      </span>
                      <ChevronRight size={20} className="text-lyloo-beige/50" />
                  </button>
             </div>
          )}

          <div className="bg-white dark:bg-stone-800 rounded-3xl overflow-hidden shadow-sm">
               <div className="p-4 border-b border-stone-100 dark:border-stone-700">
                   <h3 className="font-bold text-lyloo-anthracite dark:text-lyloo-beige mb-3 flex items-center gap-2">
                       <Smartphone size={16} /> Apparence
                   </h3>
                   <div className="flex bg-stone-100 dark:bg-stone-900 p-1 rounded-full">
                       <button onClick={() => setTheme('light')} className={`flex-1 py-2 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-all ${user.theme === 'light' ? 'bg-white text-lyloo-anthracite shadow-sm' : 'text-stone-500'}`}>
                           <Sun size={16} /> Clair
                       </button>
                       <button onClick={() => setTheme('dark')} className={`flex-1 py-2 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-all ${user.theme === 'dark' ? 'bg-stone-700 text-white shadow-sm' : 'text-stone-500'}`}>
                           <Moon size={16} /> Sombre
                       </button>
                       <button onClick={() => setTheme('system')} className={`flex-1 py-2 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-all ${user.theme === 'system' ? 'bg-white text-lyloo-anthracite shadow-sm' : 'text-stone-500'}`}>
                           <Smartphone size={16} /> Auto
                       </button>
                   </div>
               </div>
          </div>

          <div className="bg-white dark:bg-stone-800 rounded-3xl overflow-hidden shadow-sm">
               <div className="flex flex-col divide-y divide-stone-100 dark:divide-stone-700">
                   <button className="flex items-center justify-between p-4 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">
                       <span className="font-medium text-lyloo-anthracite dark:text-lyloo-beige flex items-center gap-3">
                           <User size={18} className="text-stone-400" /> Modifier mes objectifs
                       </span>
                       <ChevronRight size={20} className="text-stone-300" />
                   </button>
                   <button className="flex items-center justify-between p-4 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">
                       <span className="font-medium text-lyloo-anthracite dark:text-lyloo-beige flex items-center gap-3">
                           <Bell size={18} className="text-stone-400" /> Configurer mes rappels
                       </span>
                       <div className="flex items-center gap-2">
                           <span className="text-xs text-stone-400 bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded-full">Matin, Soir</span>
                           <ChevronRight size={20} className="text-stone-300" />
                       </div>
                   </button>
               </div>
          </div>

          <Button onClick={signOut} variant="outline" className="w-full mt-8 border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
              <LogOut size={18} /> Se déconnecter
          </Button>

          <p className="text-center text-xs text-stone-300 mt-4 pb-8">Compte ID: {user.id}</p>
      </div>
    </div>
  );
};

export default Profile;