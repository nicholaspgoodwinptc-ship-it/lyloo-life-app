
import React, { useState, useEffect } from 'react';
import { WaveHeader, BackgroundPattern, WellnessCardImage, Badge, Tooltip, Input, Skeleton, MentalIcon } from '../components/ui/LayoutComponents';
import { Carousel } from '../components/ui/Carousel';
import { useNavigate } from 'react-router-dom';
import { MockService } from '../services/mockService';
import { Activity } from '../types';
import { ChevronRight, Wind, Moon, Brain, Flower2, Heart, Clock, Search, BarChart3, Headphones, PlayCircle, X, Tag, Smile, Coffee, Eye, Mic2, Music, XCircle, Zap } from 'lucide-react';
import { ActivityDetail } from '../components/ActivityDetail';

const MentalWellness: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  
  // Filters
  const [durationValue, setDurationValue] = useState<number>(0);
  const [levelFilter, setLevelFilter] = useState<'all' | 'débutant' | 'intermédiaire' | 'avancé'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // Changed to array for multiple selection
  const [localSearch, setLocalSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadActivities();
  }, [selectedActivity]);

  const loadActivities = async () => {
      const data = await MockService.getActivities();
      setActivities(data.filter(a => a.type === 'mental'));
      setIsLoading(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const getFilteredActivities = () => {
      return activities.filter(a => {
          let matchDuration = true;
          if (durationValue === 1) matchDuration = a.dureeMinutes < 10;
          if (durationValue === 2) matchDuration = a.dureeMinutes >= 10 && a.dureeMinutes <= 20;
          if (durationValue === 3) matchDuration = a.dureeMinutes > 20;
          
          let matchLevel = true;
          if (levelFilter !== 'all') {
             matchLevel = a.niveau === levelFilter;
          }

          // Match ANY selected tag (OR logic)
          let matchTag = true;
          if (selectedTags.length > 0) {
              matchTag = selectedTags.some(tag => 
                  a.tags.includes(tag) || a.categorie.toLowerCase().includes(tag.toLowerCase())
              );
          }

          let matchSearch = true;
          if (localSearch) {
              const q = localSearch.toLowerCase();
              matchSearch = a.titre.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.categorie.toLowerCase().includes(q);
          }

          return matchDuration && matchLevel && matchSearch && matchTag;
      });
  };

  const filteredList = getFilteredActivities();
  const featured = filteredList; 
  const favoriteActivities = activities.filter(a => a.estFavori);
  const allTags: string[] = Array.from(new Set(activities.flatMap(a => a.tags)));

  const CAROUSEL_CATEGORIES = [
    { id: 'meditation', label: 'Méditation', icon: Brain, color: 'bg-lyloo-vertEau' },
    { id: 'respiration', label: 'Respiration', icon: Wind, color: 'bg-lyloo-terracotta' },
    { id: 'eft', label: 'EFT', icon: Zap, color: 'bg-lyloo-terracotta' },
    { id: 'sophrologie', label: 'Sophrologie', icon: Flower2, color: 'bg-lyloo-orange' },
    { id: 'relaxation', label: 'Relaxation', icon: Headphones, color: 'bg-lyloo-vertPale' },
    { id: 'sommeil', label: 'Sommeil', icon: Moon, color: 'bg-lyloo-anthracite' },
    { id: 'nature', label: 'Nature', icon: Music, color: 'bg-lyloo-marron' },
    { id: 'pause', label: 'Pause Bureau', icon: Coffee, color: 'bg-lyloo-dore' },
    { id: 'yeux', label: 'Yoga des yeux', icon: Eye, color: 'bg-lyloo-vertEau' },
    { id: 'asmr', label: 'ASMR', icon: Mic2, color: 'bg-lyloo-vertPale' },
    { id: 'confiance', label: 'Confiance', icon: Smile, color: 'bg-lyloo-terracotta' },
  ];

  // Fix: Explicitly handle 'id' as string to resolve 'unknown' type inference issues that can occur in async closures
  const toggleFavorite = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const activityId: string = String(id);
    setActivities(prev => prev.map(a => a.id === activityId ? { ...a, estFavori: !a.estFavori } : a));
    await MockService.toggleFavorite(activityId);
  };

  const handleCategorySelect = (category: any) => {
      setLocalSearch(category.label);
  };

  const getDurationLabel = (val: number) => {
      switch(val) {
          case 0: return 'Toutes les durées';
          case 1: return 'Rapide (< 10 min)';
          case 2: return 'Moyen (10-20 min)';
          case 3: return 'Long (> 20 min)';
          default: return '';
      }
  };

  return (
    <div className="min-h-screen bg-lyloo-beige dark:bg-lyloo-dark-bg pb-40 relative overflow-hidden">
      <BackgroundPattern opacity={0.08} />
      
      {/* Vibration Animation Style */}
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: translateY(-50%) rotate(0deg); }
          25% { transform: translateY(-50%) rotate(-10deg); }
          75% { transform: translateY(-50%) rotate(10deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.3s ease-in-out;
        }
      `}</style>

      <div className="relative z-30">
        <WaveHeader 
            title="Bien-être"
            subtitle="Mental" 
            icon={MentalIcon}
            showLogo={true}
            onMenuClick={() => navigate('/profil')} 
            className="bg-lyloo-vertEau"
            subtitleClassName="text-4xl sm:text-5xl md:text-6xl italic ml-14"
        />
      </div>

      <div className="px-4 pt-60 md:pt-72 space-y-8 relative z-20 max-w-5xl mx-auto w-full">
        
        {/* Search & Filters */}
        <div className="space-y-6">
             <div className="relative">
                 <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                 <Input 
                    placeholder="Filtrer par mots-clés..." 
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="pl-12 bg-white dark:bg-stone-800 border-none shadow-sm transition-all focus:shadow-md"
                 />
                 {localSearch && (
                     <button 
                        onClick={() => setLocalSearch('')} 
                        className="absolute right-4 top-1/2 text-stone-400 hover:text-lyloo-anthracite transition-colors animate-wiggle"
                     >
                         <X size={18} />
                     </button>
                 )}
             </div>

             {/* Tag Filter (Multiple Selection) */}
             <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1"><Tag size={12}/> Tags (Sélection multiple)</h3>
                    {selectedTags.length > 0 && (
                        <button onClick={() => setSelectedTags([])} className="text-xs text-lyloo-terracotta font-bold flex items-center gap-1 hover:underline">
                            <XCircle size={12} /> Effacer filtres
                        </button>
                    )}
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button
                        onClick={() => setSelectedTags([])}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${selectedTags.length === 0 ? 'bg-lyloo-anthracite text-white shadow-md' : 'bg-white dark:bg-stone-800 text-stone-500 border border-transparent'}`}
                    >
                        Tous
                    </button>
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                                selectedTags.includes(tag)
                                ? 'bg-lyloo-vertEau text-lyloo-anthracite border-lyloo-vertEau shadow-md scale-105' 
                                : 'bg-white dark:bg-stone-800 text-stone-500 border-transparent hover:border-lyloo-vertEau/50'
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
             </div>

             {/* Level Filter */}
             <div>
                <h3 className="text-xs font-bold text-stone-500 uppercase mb-2 flex items-center gap-1"><BarChart3 size={12}/> Niveau</h3>
                <div className="flex flex-wrap gap-2">
                    {(['all', 'débutant', 'intermédiaire', 'avancé'] as const).map(level => (
                        <button
                            key={level}
                            onClick={() => setLevelFilter(level)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${levelFilter === level ? 'bg-lyloo-anthracite text-white shadow-md' : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-transparent'}`}
                        >
                            {level === 'all' ? 'Tous' : level}
                        </button>
                    ))}
                </div>
             </div>

             {/* Interactive Duration Slider */}
             <div className="bg-white dark:bg-stone-800 p-4 rounded-3xl shadow-sm">
                 <div className="flex justify-between items-center mb-2">
                     <span className="text-sm font-bold text-lyloo-anthracite dark:text-lyloo-beige flex items-center gap-2">
                         <Clock size={16} /> Durée
                     </span>
                     <span className="text-xs font-bold text-lyloo-vertEau uppercase tracking-wide transition-all duration-300">
                         {getDurationLabel(durationValue)}
                     </span>
                 </div>
                 <div className="relative h-10 flex items-center px-2">
                     <div className="absolute left-0 right-0 h-2 bg-stone-100 dark:bg-stone-700 rounded-full mx-3"></div>
                     <div className="absolute left-3 right-3 flex justify-between pointer-events-none">
                        {[0, 1, 2, 3].map(step => (
                            <div key={step} className={`w-3 h-3 rounded-full transition-colors duration-300 ${step <= durationValue ? 'bg-lyloo-anthracite dark:bg-lyloo-beige' : 'bg-stone-300 dark:bg-stone-600'}`}></div>
                        ))}
                     </div>
                     <input 
                        type="range" 
                        min="0" 
                        max="3" 
                        step="1" 
                        value={durationValue} 
                        onChange={(e) => setDurationValue(Number(e.target.value))}
                        className="w-full absolute inset-0 opacity-0 cursor-pointer z-10"
                     />
                     <div 
                        className="absolute w-6 h-6 bg-lyloo-anthracite dark:bg-lyloo-beige border-2 border-white dark:border-stone-800 rounded-full shadow-md pointer-events-none transition-all duration-200"
                        style={{ left: `calc(${durationValue * 33.33}% + 12px - ${durationValue * 8}px)` }} 
                     />
                 </div>
                 <div className="flex justify-between text-[10px] font-bold mt-1 px-1">
                     <span className={durationValue === 0 ? "text-lyloo-anthracite dark:text-lyloo-beige" : "text-stone-400"}>Tout</span>
                     <span className={durationValue === 1 ? "text-lyloo-anthracite dark:text-lyloo-beige" : "text-stone-400"}>&lt; 10m</span>
                     <span className={durationValue === 2 ? "text-lyloo-anthracite dark:text-lyloo-beige" : "text-stone-400"}>10-20m</span>
                     <span className={durationValue === 3 ? "text-lyloo-anthracite dark:text-lyloo-beige" : "text-stone-400"}>&gt; 20m</span>
                 </div>
             </div>
        </div>

        {/* Mes Favoris Section */}
        {favoriteActivities.length > 0 && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500 pt-4">
                <h3 className="font-bold text-lg text-lyloo-anthracite dark:text-lyloo-beige mb-3 flex items-center gap-2">
                    <Heart size={18} className="text-lyloo-terracotta fill-lyloo-terracotta" /> Mes Favoris
                </h3>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x">
                    {favoriteActivities.map(item => (
                        <div 
                            key={item.id}
                            onClick={() => setSelectedActivity(item)}
                            className="min-w-[200px] w-[200px] snap-start bg-white dark:bg-stone-800 rounded-[28px] p-3 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer relative group flex gap-3 items-center"
                        >
                            <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 relative">
                                <WellnessCardImage src={item.imageUrl} alt={item.titre} category={item.categorie} className="w-full h-full" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-lyloo-anthracite dark:text-lyloo-beige leading-tight truncate mb-1" title={item.titre}>{item.titre}</h4>
                                <span className="text-[10px] bg-stone-100 dark:bg-stone-700 px-2 py-0.5 rounded-full text-stone-500 mb-1 inline-block">{item.categorie}</span>
                                <div className="text-[10px] text-stone-400 flex items-center gap-1"><Clock size={10} /> {item.dureeMinutes} min</div>
                            </div>
                            <Tooltip content="Retirer des favoris">
                                <button 
                                    onClick={(e) => toggleFavorite(e, item.id)}
                                    className="absolute -top-1 -right-1 w-7 h-7 bg-white dark:bg-stone-700 shadow-md rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 hover:scale-110 transition-all z-10"
                                >
                                    <X size={14} />
                                </button>
                            </Tooltip>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="bg-[#f2efe4] dark:bg-stone-800 rounded-[32px] p-6 shadow-sm min-h-[400px]">
            <h3 className="font-bold text-2xl font-secondary text-lyloo-anthracite dark:text-lyloo-beige mb-6 text-center">Découvrir</h3>
            
            {/* Category Carousel - Adjusted for fluidity and responsiveness */}
            <div className="mb-8">
                <Carousel 
                    items={CAROUSEL_CATEGORIES} 
                    onItemClick={handleCategorySelect}
                    autoPlayInterval={3000}
                    className="md:h-[260px]" // Increase height slightly for larger screens
                    renderItem={(item, isActive) => (
                        <div className={`
                            w-[140px] md:w-[160px] h-[160px] md:h-[180px] rounded-[32px] flex flex-col items-center justify-center gap-4 shadow-lg
                            transition-all duration-500 ease-out mx-auto
                            ${isActive ? item.color + ' scale-100 opacity-100 z-30' : 'bg-white dark:bg-stone-700 opacity-50 scale-90 z-10'}
                        `}>
                            <div className={`p-4 rounded-full bg-white/20 backdrop-blur-md ${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-500`}>
                                <item.icon size={32} className={isActive ? 'text-white' : 'text-stone-400'} />
                            </div>
                            <span className={`font-secondary font-bold text-sm text-center px-2 transition-colors duration-300 ${isActive ? 'text-white' : 'text-stone-500'}`}>
                                {item.label}
                            </span>
                        </div>
                    )}
                />
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-[4/5] rounded-[24px]" />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {filteredList.length > 0 ? filteredList.map((item, index) => (
                        <div 
                            key={item.id} 
                            onClick={() => setSelectedActivity(item)}
                            className="relative aspect-[4/5] rounded-[24px] overflow-hidden group cursor-pointer shadow-sm hover:shadow-lg transition-all duration-500 animate-in fade-in zoom-in duration-300 bg-white"
                        >
                            {/* Hover Effacement Effect: Scale up image and fade slightly to reveal gradient or details */}
                            <div className="w-full h-full transition-transform duration-700 group-hover:scale-110">
                                <WellnessCardImage src={item.imageUrl} alt={item.titre} category={item.categorie} className="w-full h-full" />
                            </div>
                            
                            {/* Gradient Overlay - Becomes stronger on hover to make text pop, simulating focus */}
                            <div className="absolute inset-0 bg-gradient-to-t from-lyloo-anthracite/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                            
                            {/* Content Slide Up Animation */}
                            <Tooltip content={item.estFavori ? "Retirer" : "Ajouter aux favoris"}>
                                 <button onClick={(e) => toggleFavorite(e, item.id)} className="absolute top-2 right-2 w-8 h-8 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300">
                                    <Heart size={16} fill={item.estFavori ? "currentColor" : "none"} className={item.estFavori ? "text-red-500" : ""} />
                                </button>
                            </Tooltip>

                            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-0 group-hover:-translate-y-1 transition-transform duration-300">
                                <span className={`inline-block px-2 py-0.5 mb-2 rounded-full text-[9px] font-bold uppercase tracking-wide shadow-sm bg-white/90 text-lyloo-anthracite`}>
                                    {item.categorie}
                                </span>
                                <h4 className="font-bold text-white text-sm leading-tight mb-1 group-hover:text-lyloo-vertEau transition-colors">{item.titre}</h4>
                                <div className="flex items-center gap-2 text-[10px] text-white/80">
                                    <Clock size={10} /> {item.dureeMinutes} min
                                </div>
                            </div>
                        </div>
                    )) : (
                       <div className="col-span-2 md:col-span-4 text-center py-12 flex flex-col items-center">
                           <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mb-4"><Search size={24} className="text-stone-400" /></div>
                           <p className="text-stone-500 font-medium">Aucune activité ne correspond aux filtres.</p>
                           <button onClick={() => { setDurationValue(0); setLevelFilter('all'); setLocalSearch(''); setSelectedTags([]); }} className="text-lyloo-vertEau font-bold mt-2 hover:underline">Réinitialiser</button>
                       </div>
                    )}
                </div>
            )}
        </div>
      </div>

      {selectedActivity && (
         <ActivityDetail activity={selectedActivity} onClose={() => setSelectedActivity(null)} />
      )}
    </div>
  );
};

export default MentalWellness;
