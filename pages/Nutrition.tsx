import React, { useState, useEffect } from 'react';
import { WaveHeader, BackgroundPattern, WellnessCardImage, Tooltip } from '../components/ui/LayoutComponents';
import { useNavigate } from 'react-router-dom';
import { MockService } from '../services/mockService';
import { Activity } from '../types';
import { ChefHat, Clock, Flame, Heart, Search, Utensils } from 'lucide-react';
import { ActivityDetail } from '../components/ActivityDetail';

export default function Nutrition() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [methodeFilter, setMethodeFilter] = useState('Toutes');
  const [saisonFilter, setSaisonFilter] = useState('Toutes');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Only load recipes!
    MockService.getActivities().then(data => 
      setActivities(data.filter(a => a.type === 'recette'))
    );
  }, [selectedActivity]);

  // Extract unique methods from the data (e.g., Végétarien, Keto, etc.)
  const allMethodes = Array.from(new Set(activities.flatMap(a => 
      a.methode ? a.methode.split(',').map(m => m.trim()) : []
  ))).filter(Boolean);

  const filtered = activities.filter(a => {
      let matchMethode = true;
      if (methodeFilter !== 'Toutes') {
          matchMethode = a.methode?.includes(methodeFilter) || false;
      }

      let matchSaison = true;
      if (saisonFilter !== 'Toutes') {
          matchSaison = a.saison === saisonFilter || a.saison === 'Toutes';
      }

      return matchMethode && matchSaison;
  });

  const toggleFavorite = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActivities(prev => prev.map(a => a.id === id ? { ...a, estFavori: !a.estFavori } : a));
    await MockService.toggleFavorite(id);
  };

  return (
    <div className="min-h-screen bg-lyloo-beige dark:bg-lyloo-dark-bg pb-40 relative overflow-hidden">
      <BackgroundPattern opacity={0.08} />

      <div className="relative z-30">
        <WaveHeader 
            title="Bien-être"
            subtitle="Nutrition" 
            icon={ChefHat}
            showLogo={true}
            onMenuClick={() => navigate('/profil')} 
            className="bg-lyloo-dore"
            subtitleClassName="text-4xl sm:text-5xl md:text-6xl italic ml-14"
        />
      </div>

      <div className="px-4 pt-60 md:pt-72 space-y-8 relative z-20 max-w-5xl mx-auto w-full">
        
        {/* Sub-filters (Dietary Method & Season) */}
        <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-stone-800 p-4 rounded-[24px] shadow-sm">
             <div className="flex-1">
                <h3 className="text-xs font-bold text-stone-500 uppercase mb-2 flex items-center gap-1"><Utensils size={12}/> Régime alimentaire</h3>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setMethodeFilter('Toutes')}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${methodeFilter === 'Toutes' ? 'bg-lyloo-dore text-lyloo-anthracite shadow-sm' : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'}`}
                    >
                        Toutes
                    </button>
                    {allMethodes.map(methode => (
                        <button
                            key={methode}
                            onClick={() => setMethodeFilter(methode)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${methodeFilter === methode ? 'bg-lyloo-dore text-lyloo-anthracite shadow-sm' : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'}`}
                        >
                            {methode}
                        </button>
                    ))}
                </div>
             </div>
        </div>

        {/* Recipes Grid */}
        <div className="bg-[#f2efe4] dark:bg-stone-800 rounded-[32px] p-6 shadow-sm min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-2xl font-secondary text-lyloo-anthracite dark:text-lyloo-beige">Recettes</h3>
              <span className="text-sm font-bold text-stone-400 bg-white dark:bg-stone-700 px-3 py-1 rounded-full">{filtered.length}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((item) => (
                  <div 
                      key={`rec-${item.id}`} 
                      onClick={() => setSelectedActivity(item)}
                      className="relative aspect-[4/5] rounded-[24px] overflow-hidden group cursor-pointer shadow-sm hover:shadow-lg transition-all duration-500 animate-in fade-in zoom-in duration-300 bg-white"
                  >
                      <div className="w-full h-full transition-transform duration-700 group-hover:scale-110">
                          <WellnessCardImage src={item.imageUrl} alt={item.titre} category={item.categorie} className="w-full h-full" />
                      </div>
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>

                      <Tooltip content={item.estFavori ? "Retirer des favoris" : "Ajouter aux favoris"}>
                          <button onClick={(e) => toggleFavorite(e, item.id)} className="absolute top-3 right-3 w-8 h-8 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300 z-10">
                              <Heart size={16} fill={item.estFavori ? "currentColor" : "none"} className={item.estFavori ? "text-red-500" : ""} />
                          </button>
                      </Tooltip>

                      <div className="absolute bottom-0 left-0 right-0 p-4 pt-8 text-center">
                          <h4 className="font-bold text-white text-sm leading-tight mb-1 line-clamp-2" title={item.titre}>
                              {item.titre}
                          </h4>
                          <div className="flex items-center justify-center gap-3 text-[10px] text-white/90 font-medium">
                              <span className="flex items-center gap-1"><Clock size={10} /> {item.dureeMinutes} min</span>
                              {item.calories > 0 && (
                                  <span className="flex items-center gap-1"><Flame size={10} className="text-lyloo-dore" /> {item.calories} kcal</span>
                              )}
                          </div>
                      </div>
                  </div>
              ))}
          </div>
          
          {filtered.length === 0 && (
             <div className="text-center py-10 text-stone-400 font-medium flex flex-col items-center">
                 <ChefHat size={48} className="mb-4 opacity-20" />
                 Aucune recette trouvée pour ces filtres.
             </div>
          )}
        </div>
      </div>

      {selectedActivity && (
         <ActivityDetail 
            activity={selectedActivity} 
            onClose={() => setSelectedActivity(null)} 
         />
      )}
    </div>
  );
}