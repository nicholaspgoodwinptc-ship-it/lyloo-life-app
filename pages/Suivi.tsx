import React, { useState, useEffect } from 'react';
import { WaveHeader, Card, WellnessCardImage, Skeleton, SuiviIcon } from '../components/ui/LayoutComponents';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Smile, Calendar, CheckCircle2, Flame, Clock, History } from 'lucide-react';
import { MockService } from '../services/mockService';
import { Session, Activity, MoodEntry } from '../types';
import { useAuth } from '../context/AuthContext';

const Suivi: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const [isSavingMood, setIsSavingMood] = useState(false);
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activitiesMap, setActivitiesMap] = useState<Record<string, Activity>>({});
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  
  const [streak, setStreak] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [weeklyData, setWeeklyData] = useState<{day: string, count: number}[]>([]);
  const [balanceData, setBalanceData] = useState<{name: string, value: number, color: string}[]>([]);
  const [calendarDays, setCalendarDays] = useState<{date: Date, mood: number | null}[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    loadDashboardData();
    return () => clearTimeout(timer);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const [fetchedActivities, fetchedSessions, fetchedMoods] = await Promise.all([
      MockService.getActivities(),
      MockService.getSessions(),
      MockService.getMoodHistory()
    ]);

    // Create a dictionary for quick activity lookups
    const actMap: Record<string, Activity> = {};
    fetchedActivities.forEach(a => actMap[a.id] = a);
    setActivitiesMap(actMap);

    // Only keep completed sessions
    const completedSessions = fetchedSessions.filter(s => s.statut === 'terminee');
    setSessions(completedSessions);
    setMoods(fetchedMoods);

    calculateStats(completedSessions, actMap);
    calculateCharts(completedSessions, actMap);
    buildCalendar(fetchedMoods);
    checkTodayMood(fetchedMoods);
    
    setLoading(false);
  };

  const calculateStats = (sess: Session[], actMap: Record<string, Activity>) => {
    // 1. Total Time
    const total = sess.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    setTotalMinutes(total);

    // 2. Streak Calculator
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeDates = [...new Set(sess.map(s => {
      const d = new Date(s.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }))].sort((a, b) => b - a);

    if (activeDates.length === 0) {
        setStreak(0);
        return;
    }

    let currentStreak = 0;
    let expectedTime = today.getTime();

    if (activeDates[0] === expectedTime) {
        currentStreak++;
        expectedTime -= 86400000;
    } else if (activeDates[0] === expectedTime - 86400000) {
        expectedTime -= 86400000;
        currentStreak++;
        expectedTime -= 86400000;
    } else {
        setStreak(0);
        return;
    }

    for (let i = 1; i < activeDates.length; i++) {
        if (activeDates[i] === expectedTime) {
            currentStreak++;
            expectedTime -= 86400000;
        } else {
            break;
        }
    }
    setStreak(currentStreak);
  };

  const calculateCharts = (sess: Session[], actMap: Record<string, Activity>) => {
    // 1. Weekly Bar Chart Data
    const days = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    const weekCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    sess.forEach(s => {
        const sessionDate = new Date(s.date);
        if (sessionDate > sevenDaysAgo) {
            weekCounts[sessionDate.getDay()]++;
        }
    });

    // Reorder so today is at the end of the chart
    const todayDayIndex = new Date().getDay();
    const orderedWeeklyData = [];
    for (let i = 6; i >= 0; i--) {
        const dIndex = (todayDayIndex - i + 7) % 7;
        orderedWeeklyData.push({ day: days[dIndex], count: weekCounts[dIndex] });
    }
    setWeeklyData(orderedWeeklyData);

    // 2. Balance Pie Chart Data
    let mentalTime = 0;
    let physiqueTime = 0;
    sess.forEach(s => {
        const act = actMap[s.activityId];
        if (act?.type === 'mental') mentalTime += (s.duration || 1);
        if (act?.type === 'physique') physiqueTime += (s.duration || 1);
    });

    // Default to 50/50 if no data
    if (mentalTime === 0 && physiqueTime === 0) {
        setBalanceData([
            { name: 'Mental', value: 50, color: '#a5cdbc' },
            { name: 'Physique', value: 50, color: '#cce1b0' }
        ]);
    } else {
        setBalanceData([
            { name: 'Mental', value: mentalTime, color: '#a5cdbc' },
            { name: 'Physique', value: physiqueTime, color: '#cce1b0' }
        ]);
    }
  };

  const buildCalendar = (mds: MoodEntry[]) => {
      const last30 = Array.from({ length: 30 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (29 - i));
          d.setHours(0, 0, 0, 0);
          
          const found = mds.find(m => {
              const md = new Date(m.date);
              md.setHours(0, 0, 0, 0);
              return md.getTime() === d.getTime();
          });

          let level = null;
          if (found) {
              const moodStr = found.mood.toLowerCase();
              if (moodStr.includes('très mauvais') || moodStr.includes('tres_mal')) level = 1;
              else if (moodStr.includes('mauvais') || moodStr.includes('mal')) level = 2;
              else if (moodStr.includes('neutre')) level = 3;
              else if (moodStr.includes('bien')) level = 4;
              else if (moodStr.includes('super') || moodStr.includes('tres_bien')) level = 5;
          }
          return { date: d, mood: level };
      });
      setCalendarDays(last30);
  };

  const checkTodayMood = (mds: MoodEntry[]) => {
    const todayStr = new Date().toLocaleDateString();
    const found = mds.find(m => new Date(m.date).toLocaleDateString() === todayStr);
    setTodayMood(found || null);
  };

  const handleSaveMood = async () => {
    if (!selectedMood || isSavingMood) return;
    setIsSavingMood(true);
    
    const moodNames = ['très mauvais', 'mauvais', 'neutre', 'bien', 'super'];
    const moodName = moodNames[selectedMood - 1];
    
    await MockService.addMoodEntry({ mood: moodName, note: moodNote });
    
    setSelectedMood(null);
    setMoodNote('');
    setIsSavingMood(false);
    loadDashboardData(); // Refresh calendar and UI!
  };

  const getMoodColor = (level: number | null) => {
      if (!level) return 'bg-stone-100 dark:bg-stone-800';
      if (level <= 2) return 'bg-lyloo-terracotta';
      if (level === 3) return 'bg-lyloo-dore';
      return 'bg-lyloo-vertEau';
  };

  const recentSessions = sessions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-lyloo-beige dark:bg-lyloo-dark-bg pb-40">
      <WaveHeader 
        title="Suivi" 
        subtitle="Visualise tes progrès"
        icon={SuiviIcon}
        onMenuClick={() => navigate('/profil')} 
      />

      <div className="px-4 space-y-6 pt-60 md:pt-72 relative z-20 max-w-5xl mx-auto w-full">
          
          {/* STATS HIGHLIGHTS */}
          <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-stone-800 p-4 rounded-[24px] shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mb-2">
                      <Flame size={20} fill="currentColor" />
                  </div>
                  <span className="text-3xl font-bold text-lyloo-anthracite dark:text-lyloo-beige">
                      {loading ? <Skeleton className="h-8 w-12" /> : streak}
                  </span>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Jours de suite</span>
              </div>
              <div className="bg-white dark:bg-stone-800 p-4 rounded-[24px] shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mb-2">
                      <Clock size={20} />
                  </div>
                  <span className="text-3xl font-bold text-lyloo-anthracite dark:text-lyloo-beige">
                      {loading ? <Skeleton className="h-8 w-16" /> : totalMinutes}
                  </span>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Minutes totales</span>
              </div>
          </div>

          {/* MOOD TRACKER */}
          <Card className="text-center py-6 animate-in fade-in duration-500">
              <div className="flex items-center justify-center gap-2 mb-4">
                  <h3 className="font-bold text-lyloo-anthracite dark:text-lyloo-beige">Comment te sens-tu aujourd'hui ?</h3>
              </div>

              {todayMood ? (
                  <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-2xl flex items-center justify-center gap-4 animate-in fade-in zoom-in">
                      <span className="text-4xl">
                          {todayMood.mood.includes('super') ? '🤩' : 
                           todayMood.mood.includes('bien') ? '🙂' : 
                           todayMood.mood.includes('neutre') ? '😐' : 
                           todayMood.mood.includes('très') ? '😫' : '😔'}
                      </span>
                      <div className="text-left">
                          <p className="font-bold text-lyloo-anthracite dark:text-lyloo-beige flex items-center gap-2">
                              Humeur enregistrée ! <CheckCircle2 size={16} className="text-lyloo-vertEau" />
                          </p>
                          <p className="text-sm text-stone-500">Merci d'avoir pris le temps de faire le point.</p>
                      </div>
                  </div>
              ) : (
                  <>
                      <div className="flex justify-center gap-2 sm:gap-4 mb-4">
                          {[1, 2, 3, 4, 5].map((level) => (
                              <button 
                                key={level}
                                onClick={() => setSelectedMood(level)}
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-transform hover:scale-110 ${selectedMood === level ? 'bg-lyloo-vertEau scale-110 shadow-lg' : 'bg-stone-100 dark:bg-stone-700'}`}
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
                  </>
              )}
          </Card>

          <div className="space-y-6">
              {/* CALENDAR (30 DAYS) */}
              <Card>
                  <h3 className="font-bold text-lyloo-anthracite dark:text-lyloo-beige mb-4 text-sm flex items-center gap-2">
                      <Smile size={16} /> Historique d'humeur (30 jours)
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                      {calendarDays.map((d, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                              <div 
                                className={`w-8 h-8 rounded-lg ${getMoodColor(d.mood)} flex items-center justify-center text-xs font-bold text-lyloo-anthracite/50 transition-colors`}
                                title={new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(d.date)}
                              >
                                {d.mood && (d.mood >= 4 ? '🙂' : d.mood === 3 ? '😐' : '😔')}
                              </div>
                              {(i % 5 === 0 || i === 29) && (
                                  <span className="text-[10px] text-stone-400">{new Intl.DateTimeFormat('fr-FR', { day: '2-digit' }).format(d.date)}</span>
                              )}
                          </div>
                      ))}
                  </div>
              </Card>

              {/* RECENT ACTIVITIES */}
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <h3 className="font-bold text-lyloo-anthracite dark:text-lyloo-beige mb-3 flex items-center gap-2">
                      <History size={18} className="text-lyloo-vertEau" /> Dernières activités complétées
                  </h3>
                  <div className="space-y-3">
                      {loading ? (
                          [1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)
                      ) : recentSessions.length > 0 ? (
                          recentSessions.map(session => {
                              const activity = activitiesMap[session.activityId];
                              if (!activity) return null;
                              return (
                                  <div key={session.id} className="bg-white dark:bg-stone-800 p-3 rounded-2xl flex items-center gap-4 shadow-sm border border-stone-50 dark:border-stone-700">
                                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                                          <WellnessCardImage src={activity.imageUrl} alt={activity.titre} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <h4 className="font-bold text-sm text-lyloo-anthracite dark:text-lyloo-beige truncate">{activity.titre}</h4>
                                          <div className="flex items-center gap-3 text-[10px] text-stone-500 mt-0.5">
                                              <span>{new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(session.date))}</span>
                                              {session.duration > 0 && <span className="flex items-center gap-1"><Clock size={10} /> {session.duration} min</span>}
                                          </div>
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

          {/* RECHARTS SECTION */}
          <div className="flex flex-col md:flex-row gap-4">
               <Card className="flex-1 min-w-[280px]">
                  <h3 className="font-bold text-lyloo-anthracite dark:text-lyloo-beige mb-3 text-sm">Mon rythme (7 jours)</h3>
                  <div className="h-[200px] w-full relative">
                      {isMounted ? (
                          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                              <BarChart data={weeklyData}>
                                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: '#333', color: '#fff'}} />
                                  <Bar dataKey="count" radius={[4, 4, 4, 4]}>
                                      {weeklyData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.count >= 1 ? '#a5cdbc' : '#e5e7eb'} />
                                      ))}
                                  </Bar>
                              </BarChart>
                          </ResponsiveContainer>
                      ) : (
                          <div className="w-full h-full flex items-center justify-center"><Skeleton className="w-full h-full" /></div>
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
                            <div className="w-full h-full flex items-center justify-center"><Skeleton className="w-full h-full rounded-full" /></div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-stone-400">
                            %
                        </div>
                   </div>
                   <div className="w-1/2">
                       <h4 className="font-bold text-sm mb-4 dark:text-lyloo-beige">Mon équilibre</h4>
                       <div className="space-y-2 text-xs dark:text-stone-400 font-medium">
                           <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#a5cdbc]"></div> Mental</span>
                           <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#cce1b0]"></div> Physique</span>
                       </div>
                   </div>
              </Card>
          </div>

      </div>
    </div>
  );
};

export default Suivi;