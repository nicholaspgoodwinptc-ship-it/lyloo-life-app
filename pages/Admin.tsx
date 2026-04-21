import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Badge, WellnessCardImage } from '../components/ui/LayoutComponents';
import { X, Dumbbell, Smile, Tag, ChefHat, RefreshCw, Database } from 'lucide-react';
import { MockService } from '../services/mockService';
import { Activity, Product } from '../types';
import { supabase } from '../services/supabaseClient'; // <-- L'IMPORT EST ICI

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
      case 'physique': return activities.filter(a => a.type === 'physique');
      case 'recettes': return activities.filter(a => a.type === 'recette');
      case 'boutique': return products;
      default: return [];
    }
  };

  // <-- LA FONCTION CORRIGÉE EST ICI
  const syncGoogleSheets = async () => {
    setIsSyncing(true);
    setSyncMessage('Synchronisation en cours...');
    
    try {
      // Utilisation du client Supabase officiel (qui connaît votre vraie URL !)
      const { data, error } = await supabase.functions.invoke('sync-sheets', {
        method: 'POST',
      });
      
      if (error) throw error;
      
      setSyncMessage('✅ Succès: ' + (data?.message || 'Synchronisation terminée'));
      setRefreshTrigger(prev => prev + 1); // Recharge les listes
    } catch (error: any) {
      setSyncMessage('❌ Erreur de connexion: ' + error.message);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(''), 8000); 
    }
  };

  const list = getList();

  const TABS = [
    { id: 'mental', label: 'Mental', icon: Smile, count: activities.filter(a => a.type === 'mental').length },
    { id: 'physique', label: 'Physique', icon: Dumbbell, count: activities.filter(a => a.type === 'physique').length },
    { id: 'recettes', label: 'Recettes', icon: ChefHat, count: activities.filter(a => a.type === 'recette').length },
    { id: 'boutique', label: 'Boutique', icon: Tag, count: products.length },
  ];

  return (
    <div className="min-h-screen bg-[#f2efe4] dark:bg-stone-900 pb-40">
      <div className="bg-lyloo-anthracite p-6 pt-safe-top pb-8 rounded-b-[40px] shadow-lg sticky top-0 z-50">
          <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-lyloo-beige flex items-center gap-2">
                  <Database size={24} className="text-lyloo-dore" /> Admin Dashboard
              </h1>
              <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full text-lyloo-beige hover:bg-white/20 transition-colors">
                  <X size={24} />
              </button>
          </div>
          
          {/* BOUTON DE SYNCHRONISATION */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mt-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div>
                      <h3 className="text-white font-bold text-sm mb-1">Google Sheets</h3>
                      <p className="text-white/60 text-xs">Mettre à jour la base de données (Produits & Activités)</p>
                  </div>
                  <Button 
                    onClick={syncGoogleSheets} 
                    disabled={isSyncing}
                    className="w-full sm:w-auto bg-lyloo-vertEau text-lyloo-anthracite shadow-lg whitespace-nowrap"
                  >
                      <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} /> 
                      {isSyncing ? 'Synchro...' : 'Synchroniser'}
                  </Button>
              </div>
              {syncMessage && (
                  <div className={`mt-3 p-3 rounded-lg text-xs font-bold ${syncMessage.includes('✅') ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'} animate-in fade-in`}>
                      {syncMessage}
                  </div>
              )}
          </div>
      </div>

      <div className="px-4 pt-6 max-w-5xl mx-auto">
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 snap-x">
             {TABS.map(tab => (
                 <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl whitespace-nowrap font-bold text-sm transition-all snap-start shadow-sm border ${
                        activeTab === tab.id 
                        ? 'bg-white dark:bg-stone-800 text-lyloo-anthracite dark:text-white border-transparent scale-105' 
                        : 'bg-white/50 dark:bg-stone-800/50 text-stone-500 border-stone-200 dark:border-stone-700 hover:bg-white'
                    }`}
                 >
                     <tab.icon size={18} className={activeTab === tab.id ? "text-lyloo-dore" : ""} />
                     {tab.label}
                     <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-lyloo-beige text-lyloo-anthracite' : 'bg-stone-200 dark:bg-stone-700 text-stone-500'}`}>
                         {tab.count}
                     </span>
                 </button>
             ))}
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((item: any) => (
                  <Card key={item.id} className="p-3 flex gap-4 items-center bg-white dark:bg-stone-800 hover:shadow-md transition-shadow group">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 relative">
                           <WellnessCardImage src={item.imageUrl || item.image_url} alt={item.titre || item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-start">
                             <h3 className="font-bold text-sm sm:text-lg text-lyloo-anthracite dark:text-lyloo-beige truncate leading-tight" title={item.titre || item.name}>
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