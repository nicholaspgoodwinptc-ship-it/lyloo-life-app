import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/LayoutComponents';
import { Moon, Sun, Smartphone, LogOut, ChevronRight, User, Bell, X, Shield, Edit2, Save, Camera, CheckCircle2 } from 'lucide-react';

// 15 Curated Neutral Avatars (Friendly, non-human minimalist robots)
const AVATAR_OPTIONS = [
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Felix&backgroundColor=f5f2e6",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Aneka&backgroundColor=cce1b0",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Jasper&backgroundColor=a5cdbc",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Lola&backgroundColor=ec9b7b",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Oliver&backgroundColor=f5f2e6",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Sophie&backgroundColor=cce1b0",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Max&backgroundColor=a5cdbc",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Cleo&backgroundColor=ec9b7b",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Sam&backgroundColor=f5f2e6",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Mia&backgroundColor=cce1b0",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Leo&backgroundColor=a5cdbc",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Zoe&backgroundColor=ec9b7b",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Nala&backgroundColor=f5f2e6",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Oscar&backgroundColor=cce1b0",
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Ruby&backgroundColor=a5cdbc"
];

const Profile: React.FC = () => {
  const { user, signOut, setTheme, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Name Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Avatar Editing State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
    }
  }, [user]);

  if (!user) return null;

  const handleSaveName = async () => {
    setIsSaving(true);
    await updateProfile({ first_name: firstName, last_name: lastName });
    setIsEditing(false);
    setIsSaving(false);
  };

  const handleSaveAvatar = async (avatarUrl: string) => {
    setIsSavingAvatar(true);
    await updateProfile({ avatar_url: avatarUrl });
    setIsAvatarModalOpen(false);
    setIsSavingAvatar(false);
  };

  return (
    <div className="min-h-screen bg-lyloo-beige dark:bg-lyloo-dark-bg pb-40">
      
      {/* --- AVATAR SELECTION MODAL --- */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsAvatarModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-stone-800 w-full max-w-md rounded-[32px] sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[85vh]">
             <div className="p-6 border-b border-stone-100 dark:border-stone-700 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-stone-800/90 backdrop-blur-md z-10">
                 <h2 className="text-xl font-bold text-lyloo-anthracite dark:text-lyloo-beige">Choisir un avatar</h2>
                 <button onClick={() => setIsAvatarModalOpen(false)} className="p-2 bg-stone-100 dark:bg-stone-700 rounded-full text-stone-500 hover:bg-stone-200 transition-colors">
                     <X size={20} />
                 </button>
             </div>
             
             <div className="p-6 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-3 gap-4">
                   {AVATAR_OPTIONS.map((url, index) => (
                      <button 
                        key={index}
                        onClick={() => handleSaveAvatar(url)}
                        disabled={isSavingAvatar}
                        className="relative aspect-square rounded-2xl overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-sm hover:shadow-md border-2 border-transparent hover:border-lyloo-vertEau focus:border-lyloo-vertEau group"
                      >
                         <img src={url} alt={`Avatar option ${index + 1}`} className="w-full h-full object-cover" />
                         
                         {/* Show checkmark if it's the currently selected avatar */}
                         {user.avatar_url === url && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                               <CheckCircle2 size={32} className="text-white drop-shadow-md" />
                            </div>
                         )}
                      </button>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* --- HEADER & PROFILE INFO --- */}
      <div className="bg-lyloo-vertEau p-6 pt-safe-top pb-12 rounded-b-[40px] mb-[-20px] relative z-10 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-lyloo-anthracite">Profil & Paramètres</h1>
              <button onClick={() => navigate(-1)} className="p-2 bg-white/20 rounded-full text-lyloo-anthracite hover:bg-white/40 transition-colors shadow-sm">
                  <X size={24} />
              </button>
          </div>
          
          <div className="flex items-center gap-5 relative">
              {/* INTERACTIVE AVATAR BUTTON */}
              <button 
                onClick={() => setIsAvatarModalOpen(true)}
                className="relative group w-20 h-20 rounded-full border-4 border-white/40 shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                  {user.avatar_url ? (
                      <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" alt="Avatar" />
                  ) : (
                      <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center text-lyloo-anthracite font-bold text-2xl uppercase">
                          {(user.first_name?.[0] || '')}{(user.last_name?.[0] || '?')}
                      </div>
                  )}
                  {/* Edit Camera Icon Overlay */}
                  <div className="absolute bottom-0 right-0 bg-lyloo-anthracite text-white p-1.5 rounded-full shadow-lg border-2 border-white group-hover:bg-lyloo-terracotta transition-colors">
                      <Camera size={14} />
                  </div>
              </button>
              
              <div className="flex-1">
                  {isEditing ? (
                      <div className="flex flex-col gap-2 animate-in fade-in zoom-in duration-300">
                          <input 
                              type="text" 
                              value={firstName} 
                              onChange={(e) => setFirstName(e.target.value)} 
                              placeholder="Prénom"
                              className="px-4 py-2 rounded-xl border-none focus:ring-2 focus:ring-lyloo-anthracite bg-white/60 text-lyloo-anthracite font-bold placeholder:text-lyloo-anthracite/40 w-full shadow-inner"
                          />
                          <input 
                              type="text" 
                              value={lastName} 
                              onChange={(e) => setLastName(e.target.value)} 
                              placeholder="Nom"
                              className="px-4 py-2 rounded-xl border-none focus:ring-2 focus:ring-lyloo-anthracite bg-white/60 text-lyloo-anthracite font-bold placeholder:text-lyloo-anthracite/40 w-full shadow-inner"
                          />
                      </div>
                  ) : (
                      <div>
                          <h2 className="text-2xl font-bold text-lyloo-anthracite drop-shadow-sm">
                              {user.first_name || 'Anonyme'} {user.last_name || ''}
                          </h2>
                          <p className="text-lyloo-anthracite/80 text-sm font-medium">{user.email}</p>
                      </div>
                  )}
              </div>

              <div className="self-start">
                  {isEditing ? (
                      <button 
                          onClick={handleSaveName} 
                          disabled={isSaving}
                          className="bg-lyloo-anthracite text-white p-3 rounded-full shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
                      >
                          <Save size={20} />
                      </button>
                  ) : (
                      <button 
                          onClick={() => setIsEditing(true)} 
                          className="bg-white/40 text-lyloo-anthracite p-3 rounded-full shadow-sm hover:bg-white/60 transition-colors"
                      >
                          <Edit2 size={20} />
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

          <Button onClick={signOut} variant="outline" className="w-full mt-8 border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm">
              <LogOut size={18} /> Se déconnecter
          </Button>

          <p className="text-center text-xs text-stone-300 mt-4 pb-8">Compte ID: {user.id}</p>
      </div>
    </div>
  );
};

export default Profile;