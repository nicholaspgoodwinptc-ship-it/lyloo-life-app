
import React, { useState, useEffect } from 'react';
import { WaveHeader, BackgroundPattern, WellnessCardImage, Tooltip, PhysicalIcon } from '../components/ui/LayoutComponents';
import { useNavigate } from 'react-router-dom';
import { MockService } from '../services/mockService';
import { Activity } from '../types';
import { ArrowUpRight, ChefHat, Dumbbell, Clock, Play, PlayCircle, BarChart3, Package } from 'lucide-react';
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
  }, []);

  const CATEGORIES = ['Tous', 'Yoga', 'Activité physique', 'Recettes'];

  const filtered = activities.filter(a => {
      // Category Filter
      let matchCat = true;
      if (filter === 'Tous') matchCat = true;
      else if (filter === 'Activité physique') matchCat = a.categorie !== 'Recettes';
      else matchCat = a.categorie === filter;

      // Level Filter
      let matchLevel = true;
      if (levelFilter !== 'all') {
          matchLevel = a.niveau === levelFilter;
      }

      // Equipment Filter
      let matchEquip = true;
      if (equipmentFilter !== 'all') {
          if (a.categorie === 'Recettes') {
              matchEquip = false; // Recipes don't filter by gym equipment usually
          } else {
              const equip = (a.equipment || '').toLowerCase();
              if (equipmentFilter === 'none') matchEquip = !equip || equip === 'aucun' || equip === 'sans matériel';
              else if (equipmentFilter === 'tapis') matchEquip = equip.includes('tapis');
              else if (equipmentFilter === 'halteres') matchEquip = equip.includes('haltères') || equip.includes('poids');
          }
      }

      return matchCat && matchLevel && matchEquip;
  });

  const featured = activities.find(a => a.categorie !== 'Recettes') || activities[0]; 

  return (
    <div className="min-h-screen bg-lyloo-beige dark:bg-lyloo-dark-bg pb-40 relative overflow-hidden">
      <BackgroundPattern opacity={0.08} className="text-lyloo-vertPale" />

      {/* Header with requested color #cce1b0 (Lyloo Vert Pâle) */}
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

      <div className="relative z-20 max-w-5xl mx-auto w-full pt-60 md:pt-72">
        
        {/* Categories */}
        <div className="px-4 mb-6">
            <h3 className="text-sm font-bold text-stone-600 uppercase tracking-wider mb-3 px-1">Choisis ta catégorie</h3>
            <div className="overflow-x-auto no-scrollbar pb-2">
                <div className="flex gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-5 py-3 rounded-full text-sm font-secondary font-bold whitespace-nowrap transition-all shadow-sm ${
                                filter === cat 
                                ? 'bg-lyloo-dore text-lyloo-anthracite shadow-md transform scale-105' 
                                : 'bg-white dark:bg-stone-800 text-lyloo-anthracite dark:text-stone-300 hover:scale-105'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Filters Row */}
        <div className="px-4 mb-6 flex flex-col gap-4">
            {/* Level Filters */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1 flex-shrink-0"><BarChart3 size={12}/> Niveau:</span>
                {(['all', 'débutant', 'intermédiaire', 'avancé'] as const).map(level => (
                    <button
                        key={level}
                        onClick={() => setLevelFilter(level)}
                        className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap ${levelFilter === level ? 'bg-lyloo-anthracite text-white shadow-sm' : 'bg-white/50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-transparent hover:bg-white'}`}
                    >
                        {level === 'all' ? 'Tous' : level}
                    </button>
                ))}
            </div>

            {/* Equipment Filters */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1 flex-shrink-0"><Package size={12}/> Matériel:</span>
                {[
                    { id: 'all', label: 'Tous' },
                    { id: 'tapis', label: 'Tapis de yoga' },
                    { id: 'halteres', label: 'Haltères' },
                    { id: 'none', label: 'Aucun matériel' }
                ].map(equip => (
                    <button
                        key={equip.id}
                        onClick={() => setEquipmentFilter(equip.id as any)}
                        className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap ${equipmentFilter === equip.id ? 'bg-lyloo-vertPale text-lyloo-anthracite shadow-sm' : 'bg-white/50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-transparent hover:bg-white'}`}
                    >
                        {equip.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="px-4 space-y-8">
          
          {/* Featured Content (Only show when 'Tous' is selected) */}
          {filter === 'Tous' && levelFilter === 'all' && equipmentFilter === 'all' && featured && (
              <div className="bg-[#f2efe4] dark:bg-stone-800 p-4 rounded-[40px] shadow-sm hover:scale-[1.01] transition-transform duration-300">
                  <h3 className="font-bold text-xl text-lyloo-anthracite dark:text-lyloo-beige mb-4 text-center">La sélection du jour</h3>
                  
                  <div className="bg-white dark:bg-stone-700 p-3 rounded-[32px] border border-stone-100 dark:border-stone-600">
                      <div className="relative h-56 md:h-80 rounded-[24px] overflow-hidden mb-4 group cursor-pointer" onClick={() => setSelectedActivity(featured)}>
                          <WellnessCardImage 
                             src={featured.imageUrl} 
                             alt={featured.titre}
                             category={featured.categorie}
                             className="w-full h-full"
                          />
                          <div className="absolute top-4 left-4">
                             <span className="bg-lyloo-orange text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider">
                                {featured.categorie}
                             </span>
                          </div>
                      </div>
                      <div className="px-2 pb-2">
                         <h2 className="text-2xl font-secondary font-bold text-lyloo-anthracite dark:text-lyloo-beige mb-2" title={featured.titre}>{featured.titre}</h2>
                         <div className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-300 font-medium mb-4">
                            <span className="flex items-center gap-1"><Clock size={16} /> {featured.dureeMinutes} min</span>
                            <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                            <span>{featured.niveau || 'Facile'}</span>
                         </div>
                         <button 
                            onClick={() => setSelectedActivity(featured)}
                            className="w-full bg-lyloo-anthracite dark:bg-lyloo-beige text-lyloo-beige dark:text-lyloo-anthracite font-bold py-4 rounded-full hover:opacity-90 transition-all shadow-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                         >
                            {featured.contentUrl ? (
                              <><Play size={20} fill="currentColor" /> Regarder la vidéo</>
                            ) : featured.categorie === 'Recettes' ? (
                              'Voir la recette'
                            ) : (
                              'Commencer la séance'
                            )}
                         </button>
                      </div>
                  </div>
              </div>
          )}

          {/* Grid List */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {filtered.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedActivity(item)}
                    className="relative aspect-[4/5] rounded-[24px] overflow-hidden group cursor-pointer shadow-sm hover:scale-[1.03] transition-transform duration-300 animate-in fade-in zoom-in"
                  >
                      <WellnessCardImage 
                         src={item.imageUrl} 
                         alt={item.titre}
                         category={item.categorie}
                         className="w-full h-full"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                      
                      {/* Category Pill */}
                      <div className="absolute top-3 left-3">
                           <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm ${item.categorie === 'Recettes' ? 'bg-lyloo-orange text-white' : 'bg-lyloo-vertPale text-lyloo-anthracite'}`}>
                              {item.categorie}
                           </span>
                      </div>

                      {/* Video Indicator */}
                      {item.contentUrl && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              <PlayCircle size={32} fill="rgba(0,0,0,0.2)" />
                          </div>
                      )}

                      {/* Title at Bottom - Styled matching MentalWellness aesthetic */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent pt-8 text-center">
                          <h4 className="font-bold text-white text-sm leading-tight mb-1 line-clamp-2" title={item.titre}>
                              {item.titre}
                          </h4>
                          
                          <div className="flex items-center justify-center gap-2 text-xs text-white/90 font-medium">
                              <span>{item.dureeMinutes} min</span>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
          
          {filtered.length === 0 && (
             <div className="text-center py-10 text-stone-400">Aucune activité trouvée.</div>
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
