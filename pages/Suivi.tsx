import React, { useState, useEffect } from 'react';
import { WaveHeader, Card, WellnessCardImage, Skeleton, SuiviIcon } from '../components/ui/LayoutComponents';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Smile, Meh, Frown, Calendar, CheckCircle2, Flame, Clock, History } from 'lucide-react';
import { MockService } from '../services/mockService';
import { Session, Activity } from '../types';

const Suivi: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const [isSavingMood, setIsSavingMood] = useState(false);
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);

    Promise.all([MockService.getSessions(), MockService.getActivities()]).then(([s, a]) => {
        setSessions(s);
        setActivities(a);
        setLoading(false);
    });

    return () => clearTimeout(timer);
  }, []);

  const getSessionActivity = (activityId: string) => activities.find(a => a.id === activityId);

  const totalMinutes = sessions.reduce((acc, curr) => {
      const act = getSessionActivity(curr.activityId);
      return acc + (act ? act.dureeMinutes : 0);
  }, 0);
  
  const streak = 3;

  const today = new Date();
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (29 - i));
      const hasMood = Math.random() > 0.6;
      const moodLevel = hasMood ? Math.floor(Math.random() * 5) + 1 : null;
      return { date: d, mood: moodLevel };
  });

  const getMoodColor = (level: number | null) => {
      if (!level) return 'bg-stone-100 dark:bg-stone-800';
      if (level <= 2) return 'bg-lyloo-terracotta';
      if (level === 3) return 'bg-lyloo-dore';
      return 'bg-lyloo-vertEau';
  };

  const weeklyData = [
    { day: 'L', count: 2 }, { day: 'M', count: 1 }, { day: 'M', count: 3 },
    { day: 'J', count: 0 }, { day: 'V', count: 2 }, { day: 'S', count: 4 }, { day: 'D', count: 1 },
  ];

  const balanceData = [
    { name: 'Mental', value: 60, color: '#a5cdbc' },
    { name: 'Physique', value: 40, color: '#cce1b0' },
  ];

  const recentSessions = sessions
    .filter(s => s.statut === 'terminee')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // === NOUVELLE FONCTION DE SAUVEGARDE ===
  const handleSaveMood = async () => {
    if (!selectedMood) return;
    setIsSavingMood(true);
    
    // Traduction du numéro en texte pour la base de données
    const moodNames = ['très mauvais', 'mauvais', 'neutre', 'bien', 'super'];
    const moodName = moodNames[selectedMood - 1];
    
    await MockService.addMoodEntry({ mood: moodName, note: moodNote });
    
    // Réinitialisation de l'interface après sauvegarde
    setSelectedMood(null);
    setMoodNote('');
    setIsSavingMood(false);
    alert("Votre humeur a été enregistrée avec succès !");
  };

  return (
    <div className="min-h-screen bg-lyloo-beige dark:bg-lyloo-dark-bg pb-40">
      <WaveHeader 
        title="Suivi" 
        subtitle="Visualise tes progrès"
        icon={SuiviIcon}
        onMenuClick={() => navigate('/profil')} 
      />

      <div className="px-4 space-y-6 pt-60 md:pt-72 relative z-20 max-w-5xl mx-auto w-full">
          
          <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-stone-800 p-4 rounded-[24px] shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mb-2">
                      <Flame size={20} fill="currentColor" />
                  </div>
                  <span className="text-3xl font-bold text-lyloo-anthracite dark:text-lyloo-beige">{streak}</span>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Jours de suite</span>
              </div>
              <div className="bg-white dark:bg-stone-800 p-4 rounded-[24px] shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mb-2">
                      <Clock size={20} />
                  </div>
                  <span className="text-3xl font-bold text-lyloo-anthracite dark:text-lyloo-beige">{totalMinutes}</span>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Minutes totales</span>
              </div>
          </div>

          {/* === MOOD TRACKER UPDATED === */}
          <Card className="text-center py-6 animate-in fade-in duration-500">
              <h3 className="font-bold text-lyloo-anthracite dark:text-lyloo-beige mb-4">Comment te sens-tu aujourd'hui ?</h3>
              <div className="flex justify-center gap-4 mb-4">
                  {[1, 2, 3, 4, 5].map((level) => (
                      <button 
                        key={level}
                        onClick={() => setSelectedMood(level)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-transform hover:scale-110 ${selectedMood === level ? 'bg-lyloo-vertEau scale-110 shadow-lg' : 'bg-stone-100 dark:bg-stone-700'}`}
                      >
                          {level === 1 ? '😫' : level === 2 ? '😔' : level === 3 ? '😐' : level === 4 ? '🙂' : '🤩'}
                      </button>
                  ))}
              </div>
              <textarea 
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="Quelques mots sur ta journée (optionnel)..." 
                className="w-full bg-stone-50 dark:bg-stone-900 rounded-xl p-3 text-sm border-none focus:ring-2 focus:ring-lyloo-vertEau outline-none resize-none h-20 dark:text-white transition-all"
              />
              
              {selectedMood && (
                  <div className="mt-4 flex justify-end animate-in fade-in slide-in-from-top-2">
                      <button 
                          onClick={handleSaveMood}
                          disabled={isSavingMood}
                          className="bg-lyloo-anthracite hover:bg-lyloo-anthracite/90 text-lyloo-beige px-6 py-2 rounded-full font-bold text-sm shadow-md transition-all disabled:opacity-50"
                      >
                          {isSavingMood ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                  </div>
              )}
          </Card>

          <div className="space-y-6">
              <Card>
                  <h3 className="font-bold text-lyloo-anthracite dark:text-lyloo-beige mb-4 text-sm flex items-center gap-2">
                      <Smile size={16} /> Historique d'humeur (30 jours)
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                      {calendarDays.map((d, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                              <div 
                                className={`w-8 h-8 rounded-lg ${getMoodColor(d.mood)} flex items-center justify-center text-xs font-bold text-lyloo-anthracite/50`}
                                title={new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(d.date)}
                              >
                                {d.mood && (d.mood > 3 ? '🙂' : '😐')}
                              </div>
                              {(i % 5 === 0 || i === 29) && (
                                  <span className="text-[10px] text-stone-300">{new Intl.DateTimeFormat('fr-FR', { day: '2-digit' }).format(d.date)}</span>
                              )}
                          </div>
                      ))}
                  </div>
              </Card>

              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <h3 className="font-bold text-lyloo-anthracite dark:text-lyloo-beige mb-3 flex items-center gap-2">
                      <History size={18} className="text-lyloo-vertEau" /> Dernières activités complétées
                  </h3>
                  <div className="space-y-3">
                      {loading ? (
                          [1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)
                      ) : recentSessions.length > 0 ? (
                          recentSessions.map(session => {
                              const activity = getSessionActivity(session.activityId);
                              if (!activity) return null;
                              return (
                                  <div key={session.id} className="bg-white dark:bg-stone-800 p-3 rounded-2xl flex items-center gap-4 shadow-sm border border-stone-50 dark:border-stone-700">
                                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                                          <WellnessCardImage src={activity.imageUrl} alt={activity.titre} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <h4 className="font-bold text-sm text-lyloo-anthracite dark:text-lyloo-beige truncate">{activity.titre}</h4>
                                          <p className="text-[10px] text-stone-500 mt-0.5">
                                              {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(session.date))}
                                          </p>
                                      </div>
                                      <div className="text-green-500 bg-green-50 dark:bg-green-900/20 p-2 rounded-full">
                                          <CheckCircle2 size={18} />
                                      </div>
                                  </div>
                              );
                          })
                      ) : (
                          <p className="text-center text-stone-400 text-sm py-4">Pas encore d'activités terminées.</p>
                      )}
                  </div>
              </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
               <Card className="flex-1 min-w-[280px]">
                  <h3 className="font-bold text-lyloo-anthracite dark:text-lyloo-beige mb-3 text-sm">Mon rythme (7 jours)</h3>
                  <div className="h-[200px] w-full relative">
                      {isMounted ? (
                          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                              <BarChart data={weeklyData}>
                                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                                  <Bar dataKey="count" radius={[4, 4, 4, 4]}>
                                      {weeklyData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.count >= 3 ? '#ec9b7b' : '#a5cdbc'} />
                                      ))}
                                  </Bar>
                              </BarChart>
                          </ResponsiveContainer>
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">Chargement du graphique...</div>
                      )}
                  </div>
              </Card>

              <Card className="flex-1 min-w-[280px] flex items-center gap-4">
                   <div className="h-[200px] w-1/2 relative flex-shrink-0">
                        {isMounted ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <PieChart>
                                    <Pie 
                                        data={balanceData} 
                                        innerRadius={45} 
                                        outerRadius={70} 
                                        paddingAngle={5} 
                                        dataKey="value"
                                    >
                                        {balanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">Chargement du graphique...</div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-stone-400">
                            %
                        </div>
                   </div>
                   <div className="w-1/2">
                       <h4 className="font-bold text-sm mb-4 dark:text-lyloo-beige">Mon équilibre</h4>
                       <div className="space-y-2 text-xs dark:text-stone-400">
                           <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-lyloo-vertEau"></div> Mental</span>
                           <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-lyloo-vertPale"></div> Physique</span>
                       </div>
                   </div>
              </Card>
          </div>

      </div>
    </div>
  );
};

export default Suivi;