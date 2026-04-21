import React, { useState, useEffect } from 'react';
import { Activity } from '../types';
import { X, Clock, Target, Heart, Play, BookOpen, Utensils, Sparkles, Share2, StopCircle, CheckCircle, Copy, ArrowRight, List, Info, Video } from 'lucide-react';
import { Button, WellnessCardImage, Tooltip } from './ui/LayoutComponents';
import { MockService } from '../services/mockService';
import Confetti from 'react-dom-confetti';

interface ActivityDetailProps {
  activity: Activity;
  onClose: () => void;
}

const confettiConfig = {
  angle: 90,
  spread: 360,
  startVelocity: 40,
  elementCount: 70,
  dragFriction: 0.12,
  duration: 3000,
  stagger: 3,
  width: "10px",
  height: "10px",
  perspective: "500px",
  colors: ["#a5cdbc", "#cce1b0", "#ec9b7b", "#f5e380"]
};

export const ActivityDetail: React.FC<ActivityDetailProps> = ({ activity, onClose }) => {
  const [isFavorite, setIsFavorite] = useState(activity.estFavori);
  const [sessionMode, setSessionMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(activity.dureeMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [favAnimate, setFavAnimate] = useState(false);
  
  const [relatedActivities, setRelatedActivities] = useState<Activity[]>([]);
  const [nextActivity, setNextActivity] = useState<Activity | null>(null);

  useEffect(() => {
    setIsFavorite(activity.estFavori);
    setSessionMode(false);
    setIsActive(false);
    setTimeLeft(activity.dureeMinutes * 60);
    
    MockService.getActivities().then(all => {
        const related = all
            .filter(a => 
                a.id !== activity.id && 
                a.type === activity.type && 
                // THE FIX: Added safe fallback arrays (|| []) to prevent crashes!
                (a.categorie === activity.categorie || (a.tags || []).some(t => (activity.tags || []).includes(t)))
            )
            .slice(0, 5);
        setRelatedActivities(related);
    });
  }, [activity]);

  const toggleFavorite = async () => {
    const newState = !isFavorite;
    setIsFavorite(newState);
    setFavAnimate(true);
    setTimeout(() => setFavAnimate(false), 500);
    await MockService.toggleFavorite(activity.id);
  };

  const handleShare = async () => {
    const text = `Découvre "${activity.titre}" sur Lyloo !`;
    const shareUrl = window.location.href.startsWith('http') ? window.location.href : 'https://lyloo.app';
    const shareData = { title: activity.titre, text: text, url: shareUrl };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try { await navigator.share(shareData); } catch (error) { console.log("Share skipped", error); }
    } else {
      try {
          await navigator.clipboard.writeText(`${text} ${shareUrl}`);
          alert(`Lien copié ! Partagez cette activité avec vos amis.`);
      } catch (e) {
          alert(`Partage simulé : ${text}`);
      }
    }
  };

  const startSession = () => {
    setSessionMode(true);
    setIsActive(true);
  };

  const stopSession = async () => {
    setIsActive(false);
    setSessionMode(false);
    
    const durationSpent = Math.round((activity.dureeMinutes * 60 - timeLeft) / 60);
    
    await MockService.saveSession({ 
        activityId: activity.id, 
        duration: durationSpent, 
        statut: 'interrompue' 
    });
    
    setTimeLeft(activity.dureeMinutes * 60);
  };

  const markAsComplete = async () => {
      setIsCompleted(true);
      await MockService.saveSession({ 
          activityId: activity.id, 
          duration: activity.dureeMinutes, 
          statut: 'terminee' 
      });
      setTimeout(() => setIsCompleted(false), 3000);
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      setSessionMode(false);
      setIsCompleted(true); 
      
      MockService.saveSession({ 
          activityId: activity.id, 
          duration: activity.dureeMinutes, 
          statut: 'terminee' 
      });
      
      setTimeout(() => setIsCompleted(false), 3000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, activity]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const totalTime = activity.dureeMinutes * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const dashOffset = 283 - (283 * progress) / 100;

  if (nextActivity) {
      return <ActivityDetail activity={nextActivity} onClose={onClose} />;
  }

  if (sessionMode) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-lyloo-anthracite text-lyloo-beige animate-in fade-in duration-500">
            <div className="absolute inset-0 opacity-20">
                <WellnessCardImage src={activity.imageUrl} alt="bg" className="w-full h-full object-cover blur-md" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-md p-6">
                 <h2 className="text-3xl font-bold text-center tracking-tight">{activity.titre}</h2>
                 
                 <div className="relative w-72 h-72 flex items-center justify-center">
                     <svg className="w-full h-full transform -rotate-90">
                         <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="none" className="text-white/10" />
                         <circle 
                            cx="50%" cy="50%" r="45%" stroke="#a5cdbc" strokeWidth="8" fill="none" 
                            strokeDasharray="283"
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-linear"
                         />
                     </svg>
                     <div className="absolute flex flex-col items-center justify-center">
                         <div className="text-6xl font-mono font-bold tracking-wider">
                             {formatTime(timeLeft)}
                         </div>
                         <div className="text-sm opacity-70 mt-2">Temps restant</div>
                     </div>
                 </div>
                 
                 <p className="text-center text-lg opacity-80 animate-pulse">Respirez calmement...</p>

                 <Button onClick={stopSession} className="bg-red-500/20 hover:bg-red-500/40 text-red-100 border border-red-500/30 backdrop-blur-md shadow-lg scale-110 px-8 py-4 text-lg">
                    <StopCircle size={24} className="mr-2" /> Terminer la séance
                 </Button>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white dark:bg-stone-800 w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar rounded-[32px] shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-colors">
            <X size={24} />
        </button>

        <div className="relative h-72 w-full flex-shrink-0">
            <WellnessCardImage src={activity.imageUrl} alt={activity.titre} category={activity.categorie} className="w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {activity.contentUrl && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white animate-pulse">
                        <Play size={32} fill="currentColor" />
                    </div>
                </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex justify-between items-end mb-3">
                    <span className="inline-block px-3 py-1 rounded-full bg-lyloo-vertEau text-lyloo-anthracite text-xs font-bold uppercase tracking-wide shadow-sm">{activity.categorie}</span>
                    <Tooltip content="Partager">
                        <button onClick={handleShare} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-md transition-colors"><Share2 size={20} /></button>
                    </Tooltip>
                </div>
                <h2 className="text-3xl font-secondary font-bold text-white leading-tight drop-shadow-md">{activity.titre}</h2>
            </div>
        </div>

        <div className="p-6 space-y-6 bg-white dark:bg-stone-800 flex-1">
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-700 px-4 py-2 rounded-full text-sm font-bold text-stone-600 dark:text-stone-300">
                    <Clock size={16} /> <span>{activity.dureeMinutes} min</span>
                </div>
                {activity.niveau && (
                    <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-700 px-4 py-2 rounded-full text-sm font-bold text-stone-600 dark:text-stone-300 capitalize">
                        <Target size={16} /> <span>{activity.niveau}</span>
                    </div>
                )}
                {(activity.instructions && activity.instructions.length > 0) && (
                    <div className="flex items-center gap-2 bg-lyloo-terracotta/10 px-4 py-2 rounded-full text-sm font-bold text-lyloo-terracotta">
                        <List size={16} /> <span>{activity.instructions.length} Étapes</span>
                    </div>
                )}
            </div>

            {activity.contentUrl && (
                <a href={activity.contentUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                    <Button className="w-full bg-red-500 hover:bg-red-600 text-white shadow-md">
                        <Video size={20} /> Regarder la vidéo
                    </Button>
                </a>
            )}

            <div className="space-y-2">
                <h3 className="font-bold text-lyloo-anthracite dark:text-lyloo-beige flex items-center gap-2 text-lg">
                    <Info size={20} /> À propos de cette activité
                </h3>
                <p className="text-lg text-lyloo-anthracite dark:text-lyloo-beige leading-relaxed font-medium opacity-90">
                    {activity.description}
                </p>
            </div>

            <div className="bg-lyloo-vertPale/20 dark:bg-lyloo-dark-vertPale/10 p-5 rounded-2xl border border-lyloo-vertPale/30">
                <h3 className="font-bold text-lyloo-anthracite dark:text-lyloo-beige flex items-center gap-2 mb-3">
                    <Sparkles size={18} /> Pourquoi ceci aide ?
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-300 mb-3">
                    Cette activité permet de réduire le stress, d'améliorer la concentration et de favoriser un état de bien-être général grâce à des techniques éprouvées.
                </p>
                {activity.tags && (
                    <div className="flex flex-wrap gap-2">
                        {activity.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-white dark:bg-stone-700 rounded-lg text-sm text-stone-600 dark:text-stone-300 shadow-sm">{tag}</span>
                        ))}
                    </div>
                )}
            </div>

            {activity.ingredients && activity.ingredients.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                    <h3 className="font-bold text-lyloo-orange mb-3 flex items-center gap-2"><Utensils size={18} /> Ingrédients</h3>
                    <ul className="space-y-2">
                        {activity.ingredients.map((ing, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-lyloo-marron dark:text-lyloo-terracotta">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-lyloo-orange flex-shrink-0" />
                                <span>{ing}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {activity.instructions && activity.instructions.length > 0 && (
                <div className="space-y-4 pt-2">
                    <h3 className="font-bold text-lyloo-anthracite dark:text-lyloo-beige flex items-center gap-2 text-lg"><BookOpen size={20} /> Instructions</h3>
                    <div className="space-y-4">
                        {activity.instructions.map((step, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lyloo-anthracite text-white flex items-center justify-center font-bold text-sm">{i + 1}</div>
                                <p className="pt-1 text-stone-600 dark:text-stone-300 leading-relaxed font-medium">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {relatedActivities.length > 0 && (
                 <div className="pt-6 border-t border-stone-100 dark:border-stone-700">
                    <h3 className="font-bold text-lyloo-anthracite dark:text-lyloo-beige mb-4 text-sm">Cela pourrait vous plaire</h3>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-1 snap-x flex-nowrap">
                        {relatedActivities.map(related => (
                             <div 
                                key={related.id} 
                                onClick={() => setNextActivity(related)}
                                className="min-w-[140px] w-[140px] flex-shrink-0 cursor-pointer group snap-start"
                             >
                                  <div className="aspect-square rounded-2xl overflow-hidden mb-2 relative bg-stone-100 shadow-sm">
                                      <WellnessCardImage src={related.imageUrl} alt={related.titre} className="w-full h-full transition-transform group-hover:scale-105 duration-500" />
                                  </div>
                                  <h4 className="font-bold text-xs text-lyloo-anthracite dark:text-lyloo-beige truncate">{related.titre}</h4>
                                  <span className="text-[10px] text-stone-500">{related.dureeMinutes} min</span>
                             </div>
                        ))}
                    </div>
                 </div>
            )}

            <div className="flex gap-4 pt-4 sticky bottom-0 bg-white dark:bg-stone-800 pb-2 z-10 items-center border-t border-stone-50 dark:border-stone-700 mt-4">
                 {['Méditation', 'Respiration', 'Sophrologie', 'Sommeil'].includes(activity.categorie) ? (
                    <Button onClick={startSession} className="flex-1 shadow-xl bg-lyloo-anthracite text-lyloo-beige hover:scale-[1.02] active:scale-95 transition-transform" size="lg">
                        <Play size={20} fill="currentColor" /> Lancer la séance
                    </Button>
                 ) : (
                    <div className="flex-1 relative flex justify-center">
                        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2">
                            <Confetti active={isCompleted} config={confettiConfig} />
                        </div>
                        <Button 
                            onClick={markAsComplete} 
                            className={`w-full shadow-xl transition-all duration-300 ${isCompleted ? 'bg-green-500 text-white' : 'bg-lyloo-anthracite text-lyloo-beige'}`} 
                            size="lg"
                        >
                            {isCompleted ? <><CheckCircle size={20} /> Terminé !</> : 'Marquer comme terminé'}
                        </Button>
                    </div>
                 )}

                <Tooltip content={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}>
                    <button 
                        onClick={toggleFavorite}
                        className={`
                            w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-full border-2 transition-all duration-300
                            ${favAnimate ? 'scale-125' : 'scale-100'}
                            ${isFavorite ? 'border-red-200 bg-red-50 text-red-500' : 'border-stone-200 dark:border-stone-700 text-stone-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50'}
                        `}
                    >
                        <Heart size={24} fill={isFavorite ? "currentColor" : "none"} className={favAnimate ? "animate-pulse" : ""} />
                    </button>
                </Tooltip>
            </div>
        </div>
      </div>
    </div>
  );
};