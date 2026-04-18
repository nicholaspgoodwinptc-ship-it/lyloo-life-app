
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
    setQuote(MockService.getQuoteOfTheDay());
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
      <div className="px-4 pt-60 md:pt-72 pb-40 relative z-20 space-y-8 max-w-5xl mx-auto w-full">
        {quote && (
            <div className="relative bg-lyloo-vertEau dark:bg-lyloo-dark-vertEau rounded-[32px] p-6 shadow-sm overflow-hidden hover:scale-[1.01] transition-transform duration-300">
                <div className="absolute -right-6 -bottom-6 text-white opacity-20 transform rotate-12">
                   <div className="text-[120px] leading-none font-secondary font-bold">Y</div>
                </div>
                <p className="text-center font-secondary font-bold text-lyloo-anthracite dark:text-lyloo-anthracite text-sm mb-3 opacity-70 uppercase tracking-widest">Pensée positive du jour</p>
                <div className="flex flex-col items-center text-center relative z-10">
                    <p className="font-serif italic text-xl md:text-2xl text-lyloo-anthracite mb-4 leading-relaxed">"{quote.texte}"</p>
                    <span className="font-secondary font-bold text-lyloo-anthracite text-lg">{quote.auteur}</span>
                </div>
            </div>
        )}

        <div>
            <div className="mb-4 text-center">
                <h2 className="text-lg text-lyloo-anthracite dark:text-lyloo-beige font-medium">Bonjour {user?.first_name},</h2>
                <h3 className="text-2xl font-secondary font-bold text-lyloo-anthracite dark:text-lyloo-beige">La sélection du jour</h3>
            </div>
            
            {/* Main Carousel */}
            {featuredActivities.length > 0 ? (
                <Carousel 
                    items={featuredActivities} 
                    onItemClick={setSelectedActivity} 
                    autoPlayInterval={4000}
                />
            ) : (
                <div className="h-[320px] flex items-center justify-center text-stone-400">Chargement...</div>
            )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
             <button onClick={() => navigate('/mental')} className="bg-lyloo-vertEau/30 dark:bg-lyloo-dark-vertEau/20 p-5 rounded-[24px] flex flex-col items-center justify-center gap-2 hover:bg-lyloo-vertEau/40 hover:scale-105 active:scale-95 transition-all border border-transparent dark:border-lyloo-vertEau/30">
                 <div className="w-12 h-12 bg-lyloo-vertEau rounded-full flex items-center justify-center text-lyloo-anthracite shadow-sm mb-1"><Smile size={24} /></div>
                 <span className="font-secondary font-bold text-lyloo-anthracite dark:text-lyloo-beige text-center leading-tight">Bien-être<br/>Mental</span>
             </button>
             <button onClick={() => navigate('/physique')} className="bg-lyloo-vertPale/30 dark:bg-lyloo-dark-vertPale/20 p-5 rounded-[24px] flex flex-col items-center justify-center gap-2 hover:bg-lyloo-vertPale/40 hover:scale-105 active:scale-95 transition-all border border-transparent dark:border-lyloo-vertPale/30">
                 <div className="w-12 h-12 bg-lyloo-vertPale rounded-full flex items-center justify-center text-lyloo-anthracite shadow-sm mb-1"><ActivityIcon size={24} /></div>
                 <span className="font-secondary font-bold text-lyloo-anthracite dark:text-lyloo-beige text-center leading-tight">Bien-être<br/>Physique</span>
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
