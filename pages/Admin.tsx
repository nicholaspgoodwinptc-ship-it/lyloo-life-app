import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Badge, WellnessCardImage } from '../components/ui/LayoutComponents';
import { X, Dumbbell, Smile, Tag, ChefHat, RefreshCw, Database } from 'lucide-react';
import { MockService } from '../services/mockService';
import { Activity, Product } from '../types';

type Tab = 'mental' | 'physique' | 'recettes' | 'boutique';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<Tab>('mental');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // États pour la synchronisation Google Sheets
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    MockService.getActivities().then(setActivities);
    MockService.getProducts().then(setProducts);
  }, [refreshTrigger, activeTab]);

  const getList = () => {
    switch(activeTab) {
      case 'mental': return activities.filter(a => a.type === 'mental');
      case 'physique': return activities.filter(a => a.type === 'physique' && a.categorie !== 'Recettes');
      case 'recettes': return activities.filter(a => a.type === 'physique' && a.categorie === 'Recettes');
      case 'boutique': return products;
      default: return [];
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lyloo-beige flex-col gap-4 p-4 text-center">
        <h2 className="text-2xl font-bold text-lyloo-anthracite">Accès refusé</h2>
        <p className="text-stone-500 max-w-md">Veuillez vous connecter pour accéder à cette page.</p>
        <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
      </div>
    );
  }

  // FONCTION DE SYNCHRONISATION (DIRECT FETCH)
  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage('');
    try {
      const response = await fetch("https://hjhoooiluuymaxaipdth.supabase.co/functions/v1/sync-sheets", {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaG9vb2lsdXV5bWF4YWlwZHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MTk3MzksImV4cCI6MjA5MjA5NTczOX0.jinBOJhP8kh7H6zYBtQ3PEzlzsJIfbaJjFLVeIZJXp4',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur serveur');
      }
      
      setSyncMessage(`✅ ${data.message}`);
      setRefreshTrigger(prev => prev + 1);
      
      // Fait disparaître le message de succès après 4 secondes
      setTimeout(() => setSyncMessage(''), 4000);
    } catch (error: any) {
      setSyncMessage(`❌ Erreur : ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-lyloo-beige dark:bg-lyloo-dark-bg pb-40">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-stone-800 border-b border-stone-100 dark:border-stone-700 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg text-lyloo-anthracite dark:text-lyloo-beige ml-2 flex items-center gap-2">
                <Database size={20} className="text-lyloo-primary" />
                Tableau de bord des données
            </h1>
          </div>
          <button onClick={() => navigate(-1)} className="p-2 -mr-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full transition-colors">
              <X size={20} className="text-lyloo-anthracite dark:text-lyloo-beige" />
          </button>
      </div>
      
      <div className="sticky top-[60px] z-20 bg-lyloo-beige/95 dark:bg-lyloo-dark-bg/95 backdrop-blur py-4 border-b border-stone-200 dark:border-stone-700">
          <div className="flex justify-start md:justify-center gap-2 px-4 overflow-x-auto no-scrollbar">
              {[ { id: 'mental', label: 'Mental', icon: Smile }, { id: 'physique', label: 'Physique', icon: Dumbbell }, { id: 'recettes', label: 'Recettes', icon: ChefHat }, { id: 'boutique', label: 'Boutique', icon: Tag } ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 flex-shrink-0 ${activeTab === tab.id ? 'bg-lyloo-anthracite text-lyloo-beige shadow-lg scale-105' : 'bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 hover:scale-105'}`}>
                      <tab.icon size={16} /> {tab.label}
                  </button>
              ))}
          </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8 pt-2">
          
          <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 mb-6 mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                  <h2 className="text-xl font-bold text-lyloo-anthracite dark:text-lyloo-beige">Pipeline de données</h2>
                  <p className="text-sm text-stone-500 mt-1">
                      Mode lecture seule. Les modifications doivent être effectuées dans Google Sheets.
                  </p>
              </div>
              
              <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                  <Button 
                      onClick={handleSync} 
                      disabled={isSyncing} 
                      className={`w-full sm:w-auto shadow-sm transition-all ${isSyncing ? 'bg-stone-300 text-stone-500' : 'bg-lyloo-primary text-white hover:bg-lyloo-secondary'}`}
                  >
                      <RefreshCw size={18} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Synchronisation...' : 'Synchroniser Google Sheets'}
                  </Button>
                  
                  {syncMessage && (
                      <span className={`text-sm font-bold animate-fade-in ${syncMessage.includes('❌') ? 'text-red-500' : 'text-lyloo-vertPale'}`}>
                          {syncMessage}
                      </span>
                  )}
              </div>
          </div>

          <h3 className="font-semibold text-lg text-stone-700 dark:text-stone-300 mb-4 ml-2">
              {getList().length} éléments synchronisés
          </h3>

          <div className="grid grid-cols-1 gap-4">
              {getList().map((item: any) => (
                  <Card key={item.id} className="flex gap-4 p-4 border border-stone-100 dark:border-stone-700 transition-shadow animate-in slide-in-from-bottom-2 duration-300">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-stone-200 overflow-hidden flex-shrink-0 border border-stone-100 dark:border-stone-700">
                          <WellnessCardImage src={item.imageUrl || item.image_url} alt={item.titre || item.name} category={item.categorie || item.category} className="w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                         <div className="min-w-0 pr-2">
                             <h3 className="font-bold text-base sm:text-lg text-lyloo-anthracite dark:text-lyloo-beige truncate leading-tight" title={item.titre || item.name}>
                                 {item.titre || item.name}
                             </h3>
                             <div className="flex gap-2 mt-2 flex-wrap">
                                <Badge className="bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-300">
                                    {item.categorie || item.category}
                                </Badge>
                                {(item.dureeMinutes || item.duree_minutes) ? (
                                    <Badge className="bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-300">
                                        {item.dureeMinutes || item.duree_minutes} min
                                    </Badge>
                                ) : null}
                             </div>
                         </div>
                         <div className="mt-2 text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium">
                             <span className="line-clamp-2 opacity-80" title={item.description}>{item.description}</span>
                         </div>
                      </div>
                  </Card>
              ))}
          </div>
          
          <div className="mt-12 text-center text-xs text-stone-400 font-mono">
             Lyloo Sync Dashboard v2.0
          </div>
      </div>
    </div>
  );
};

export default Admin;