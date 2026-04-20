import React, { useState, useEffect } from 'react';
import { WaveHeader, BackgroundPattern, WellnessCardImage, Tooltip, PhysicalIcon } from '../components/ui/LayoutComponents';
import { useNavigate } from 'react-router-dom';
import { MockService } from '../services/mockService';
import { Activity } from '../types';
import { ArrowUpRight, ChefHat, Dumbbell, Clock, Play, PlayCircle, BarChart3, Package, Heart } from 'lucide-react';
import { ActivityDetail } from '../components/ActivityDetail';

export default function PhysicalWellness() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState('Tous');
  const [levelFilter, setLevelFilter] = useState<'all' | 'débutant' | 'intermédiaire' | 'avancé'>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<'all' | 'tapis' | 'halteres' | 'none'>('all');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    MockService.getActivities().then(data => 
      setActivities(data.filter(a => a.type === 'physique'))
    );
  }, [selectedActivity]); // Re-run if a favorite is toggled inside ActivityDetail

  const CATEGORIES = ['Tous', 'Yoga', 'Pilates', 'Renforcement musculaire', 'Marche'];

  const filtered = activities.filter(a => {
      // Category Filter
      let matchCat = true;
      if (filter !== 'Tous') {
          matchCat = a.categorie.toLowerCase() === filter.toLowerCase();
      }

      // Level Filter
      let matchLevel = true;
      if (levelFilter !== 'all') {
          matchLevel = a.niveau?.toLowerCase() === levelFilter.toLowerCase();
      }

      // Equipment Filter
      let matchEq = true;
      if (equipmentFilter !== 'all') {
          const eqStr = (a.equipment || '').toLowerCase();
          if (equipmentFilter === 'none') matchEq = eqStr.includes('sans');
          else matchEq = eqStr.includes(equipmentFilter);
      }

      return matchCat && matchLevel && matchEq;
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
            subtitle="Physique" 
            icon={PhysicalIcon}
            showLogo={true}
            onMenuClick={() => navigate('/profil')} 
            className="bg-lyloo-vertPale"
            subtitleClassName="text-4xl sm:text-5xl md:text-6xl italic ml-14"
        />
      </div>

      <div className="px-4 pt-60 md:pt-72 space-y-8 relative z-20 max-w-5xl mx-auto w-full">
        
        {/* Main Category Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 snap-x">
            {CATEGORIES.map(cat => (
                <button
                    key={`cat-${cat}`}
                    onClick={() => setFilter(cat)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm snap-start ${
                        filter === cat 
                        ? 'bg-lyloo-anthracite text-white scale-105' 
                        : 'bg-white dark:bg-stone-800 text-stone-500 hover:bg-stone-50'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Sub-filters (Level & Equipment) */}
        <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-stone-800 p-4 rounded-[24px] shadow-sm">
             <div className="flex-1">
                <h3 className="text-xs font-bold text-stone-500 uppercase mb-2 flex items-center gap-1"><BarChart3 size={12}/> Niveau</h3>
                <div className="flex flex-wrap gap-2">
                    {(['all', 'débutant', 'intermédiaire', 'avancé'] as const).map(level => (
                        <button
                            key={`level-${level}`}
                            onClick={() => setLevelFilter(level)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${levelFilter === level ? 'bg-lyloo-vertPale text-lyloo-anthracite shadow-sm' : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'}`}
                        >
                            {level === 'all' ? 'Tous' : level}
                        </button>
                    ))}
                </div>
             </div>
             <div className="w-px bg-stone-100 dark:bg-stone-700 hidden md:block"></div>
             <div className="flex-1">
                <h3 className="text-xs font-bold text-stone-500 uppercase mb-2 flex items-center gap-1"><Dumbbell size={12}/> Équipement</h3>
                <div className="flex flex-wrap gap-2">
                    {(['all', 'tapis', 'halteres', 'none'] as const).map(eq => (
                        <button
                            key={`eq-${eq}`}
                            onClick={() => setEquipmentFilter(eq)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${equipmentFilter === eq ? 'bg-lyloo-vertPale text-lyloo-anthracite shadow-sm' : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'}`}
                        >
                            {eq === 'all' ? 'Tous' : eq === 'none' ? 'Sans matériel' : eq === 'halteres' ? 'Haltères' : eq}
                        </button>
                    ))}
                </div>
             </div>
        </div>

        {/* Activities Grid */}
        <div className="bg-[#f2efe4] dark:bg-stone-800 rounded-[32px] p-6 shadow-sm min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-2xl font-secondary text-lyloo-anthracite dark:text-lyloo-beige">Séances</h3>
              <span className="text-sm font-bold text-stone-400 bg-white dark:bg-stone-700 px-3 py-1 rounded-full">{filtered.length}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((item) => (
                  <div 
                      key={`phys-${item.id}`} 
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
                      
                      {item.contentUrl && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <PlayCircle size={32} fill="rgba(0,0,0,0.2)" />
                          </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 p-4 pt-8 text-center">
                          <h4 className="font-bold text-white text-sm leading-tight mb-1 line-clamp-2" title={item.titre}>
                              {item.titre}
                          </h4>
                          <div className="flex items-center justify-center gap-2 text-[10px] text-white/80 font-medium">
                              <span className="bg-white/20 px-2 py-0.5 rounded-full">{item.niveau || 'Tous niveaux'}</span>
                              <span className="flex items-center gap-1"><Clock size={10} /> {item.dureeMinutes} min</span>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
          
          {filtered.length === 0 && (
             <div className="text-center py-10 text-stone-400 font-medium">Aucune activité trouvée pour ces filtres.</div>
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