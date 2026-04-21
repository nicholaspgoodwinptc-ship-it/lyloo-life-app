import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { WaveHeader, BackgroundPattern } from '../components/ui/LayoutComponents';
import { Carousel } from '../components/ui/Carousel';
import { useNavigate } from 'react-router-dom';
import { MockService } from '../services/mockService';
import { QuoteOfTheDay, Activity } from '../types';
import { ArrowRight, Activity as ActivityIcon, Smile } from 'lucide-react';
import { ActivityDetail } from '../components/ActivityDetail';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<QuoteOfTheDay | null>(null);
  const [featuredActivities, setFeaturedActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  useEffect(() => {
    // 1. Fetch quote asynchronously
    MockService.getQuoteOfTheDay().then(setQuote);

    // 2. Fetch activities
    MockService.getActivities().then(activities => {
      // Select about 10 diverse activities for the carousel
      const mixed = activities
        .sort(() => 0.5 - Math.random()) // Shuffle
        .slice(0, 10);
      setFeaturedActivities(mixed);
    });
  }, []);

  return (
    <div className="min-h-screen bg-lyloo-beige dark:bg-lyloo-dark-bg relative">
      <BackgroundPattern />
      <WaveHeader title="L'équilibre" subtitle="commence en douceur" onMenuClick={() => navigate('/profil')} />
      <div className="px-4 pt-48 pb-32 relative z-10 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-lyloo-anthracite dark:text-lyloo-beige mb-6">Bonjour {user?.first_name || ''} !</h2>

        {quote && (
          <div className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-md p-6 rounded-[32px] shadow-sm mb-6 border border-white/40 dark:border-stone-700/50">
            <p className="italic text-lyloo-anthracite dark:text-stone-300 mb-3 leading-relaxed">"{quote.texte}"</p>
            <p className="text-sm font-bold text-lyloo-terracotta dark:text-lyloo-orange text-right">— {quote.auteur}</p>
          </div>
        )}

        <h3 className="font-bold text-lyloo-anthracite dark:text-lyloo-beige mb-4 px-2">À la une</h3>
        <Carousel
          items={featuredActivities}
          className="h-[300px] mb-8"
          onItemClick={setSelectedActivity}
          renderItem={(item, isActive) => (
            <div
              key={item.id}
              className={`
                        relative w-[220px] h-[280px] rounded-[32px] overflow-hidden shadow-lg 
                        transition-all duration-500 ease-out cursor-pointer
                        ${isActive ? 'scale-100 opacity-100' : 'scale-90 opacity-60'}
                    `}
            >
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.titre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center">
                  <ActivityIcon size={32} className="text-stone-400 opacity-50" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider mb-1 block opacity-90">{item.categorie}</span>
                <h4 className="text-white font-bold leading-tight line-clamp-2">{item.titre}</h4>
              </div>
            </div>
          )}
        />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <button onClick={() => navigate('/mental')} className="bg-white dark:bg-stone-800 p-6 rounded-[32px] shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-lyloo-vertEau/40 hover:scale-105 active:scale-95 transition-all border border-transparent dark:border-lyloo-vertEau/30">
            <div className="w-12 h-12 bg-lyloo-vertEau rounded-full flex items-center justify-center text-lyloo-anthracite shadow-sm mb-1"><Smile size={24} /></div>
            <span className="font-secondary font-bold text-lyloo-anthracite dark:text-lyloo-beige text-center leading-tight">Bien-être<br />Mental</span>
          </button>
          <button onClick={() => navigate('/physique')} className="bg-white dark:bg-stone-800 p-6 rounded-[32px] shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-lyloo-vertPale/40 hover:scale-105 active:scale-95 transition-all border border-transparent dark:border-lyloo-vertPale/30">
            <div className="w-12 h-12 bg-lyloo-vertPale rounded-full flex items-center justify-center text-lyloo-anthracite shadow-sm mb-1"><ActivityIcon size={24} /></div>
            <span className="font-secondary font-bold text-lyloo-anthracite dark:text-lyloo-beige text-center leading-tight">Bien-être<br />Physique</span>
          </button>
        </div>

        <button onClick={() => navigate('/suivi')} className="w-full bg-gradient-to-r from-lyloo-terracotta to-lyloo-orange dark:from-lyloo-dark-terracotta dark:to-lyloo-dark-orange p-5 rounded-[24px] flex items-center justify-between shadow-lg group text-white mb-6 hover:scale-[1.02] active:scale-95 transition-all">
          <div className="flex flex-col items-start"><span className="font-secondary font-bold text-lg">Voir mes progrès</span><span className="text-xs opacity-90">Suis ton évolution jour après jour</span></div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-lyloo-orange transition-all"><ArrowRight size={20} /></div>
        </button>

      </div>

      {selectedActivity && (
        <ActivityDetail activity={selectedActivity} onClose={() => setSelectedActivity(null)} />
      )}
    </div>
  );
};

export default Home;