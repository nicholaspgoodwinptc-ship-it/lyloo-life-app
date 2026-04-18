
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, Badge, WellnessCardImage, Tooltip } from '../components/ui/LayoutComponents';
import { Plus, Trash2, Edit, X, Save, Image as ImageIcon, Clock, DollarSign, Dumbbell, Smile, Tag, AlignLeft, ChefHat, Sparkles, Loader2, List, FileText, MonitorPlay, Box, Shield } from 'lucide-react';
import { MockService } from '../services/mockService';
import { Activity, Product } from '../types';
import { GoogleGenAI } from "@google/genai";

type Tab = 'mental' | 'physique' | 'recettes' | 'boutique';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<Tab>('mental');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

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

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lyloo-beige flex-col gap-4 p-4 text-center">
        <h2 className="text-2xl font-bold text-lyloo-anthracite">Accès refusé</h2>
        <p className="text-stone-500 max-w-md">Vous n'avez pas les droits d'administration pour accéder à cette page.</p>
        <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
      </div>
    );
  }

  const handleEdit = (item: any) => {
    setEditItem({ ...item });
    setIsEditing(true);
  };

  const handleCreate = () => {
    const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: activeTab === 'boutique' ? undefined : (activeTab === 'recettes' ? 'physique' : activeTab),
        imageUrl: '',
        image_url: '',
        tags: [],
        price: activeTab === 'boutique' ? 0 : undefined,
        dureeMinutes: 10,
        couleurPrincipale: '#a5cdbc',
        niveau: activeTab === 'physique' ? 'débutant' : undefined,
        categorie: activeTab === 'recettes' ? 'Recettes' : '',
        ingredients: activeTab === 'recettes' ? [] : undefined,
        instructions: activeTab === 'recettes' ? [] : undefined,
        equipment: '',
        contentUrl: ''
    };
    setEditItem(newItem);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
    if (activeTab === 'boutique') {
        await MockService.deleteProduct(id);
    } else {
        await MockService.deleteActivity(id);
    }
    setRefreshTrigger(prev => prev + 1);
  };

  const handleGenerateImage = async () => {
    if (!process.env.API_KEY) {
        alert("API Key manquante.");
        return;
    }
    const title = editItem.name || editItem.titre;
    const desc = editItem.description;
    if (!title) {
        alert("Veuillez entrer un titre.");
        return;
    }
    setGeneratingImage(true);
    try {
        // Correct initialization of GoogleGenAI as per guidelines
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let itemContext = '';
        if (activeTab === 'recettes') itemContext = 'food, recipe, culinary, plate, healthy';
        else if (activeTab === 'physique') itemContext = 'fitness, yoga, exercise, gym';
        else if (activeTab === 'mental') itemContext = 'meditation, calm, serenity, nature';
        else itemContext = 'product, wellness object, minimal';
        
        const prompt = `Generate a photorealistic, high quality image of: ${title}. ${desc || ''}. Context: ${itemContext}. Style: Aesthetic, soft lighting, minimalist, wellness-oriented, no text overlay.`;
        
        // Correct model choice for general image generation tasks
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] }
        });
        
        // Guideline: iterate through all parts to find the image part; do not assume the first part is an image part.
        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    // Correctly extract the image part data and use type annotation to ensure type safety
                    const base64EncodeString: string = part.inlineData.data;
                    const mimeType: string = part.inlineData.mimeType;
                    const imageUrl = `data:${mimeType};base64,${base64EncodeString}`;
                    const isProduct = activeTab === 'boutique';
                    setEditItem((prev: any) => ({ ...prev, [isProduct ? 'image_url' : 'imageUrl']: imageUrl }));
                    break;
                }
            }
        }
    } catch (error) {
        console.error("Error generating image:", error);
    } finally {
        setGeneratingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setSaving(true);
    try {
        if (activeTab === 'boutique') {
            const productToSave: Product = {
                id: editItem.id,
                name: editItem.name || editItem.titre || 'Nouveau Produit',
                category: editItem.category || editItem.categorie || 'Divers',
                description: editItem.description || '',
                price: Number(editItem.price) || 0,
                image_url: editItem.image_url || editItem.imageUrl || '',
            };
            await MockService.saveProduct(productToSave);
        } else {
             const ingredientsArray = Array.isArray(editItem.ingredients) ? editItem.ingredients : typeof editItem.ingredients === 'string' ? editItem.ingredients.split('\n').filter((s: string) => s.trim() !== '') : [];
             const instructionsArray = Array.isArray(editItem.instructions) ? editItem.instructions : typeof editItem.instructions === 'string' ? editItem.instructions.split('\n').filter((s: string) => s.trim() !== '') : [];

             const activityToSave: Activity = {
                 ...editItem,
                 titre: editItem.titre || editItem.name || 'Nouvelle Activité',
                 categorie: editItem.categorie || editItem.category || 'Général',
                 imageUrl: editItem.imageUrl || editItem.image_url || '',
                 type: activeTab === 'recettes' ? 'physique' : activeTab,
                 ingredients: activeTab === 'recettes' ? ingredientsArray : undefined,
                 instructions: activeTab === 'recettes' ? instructionsArray : undefined,
                 equipment: editItem.equipment || '',
                 contentUrl: editItem.contentUrl || ''
             };
             await MockService.saveActivity(activityToSave);
        }
        setRefreshTrigger(prev => prev + 1);
        setIsEditing(false);
        setEditItem(null);
    } catch (error) {
        console.error("Error saving", error);
    } finally {
        setSaving(false);
    }
  };

  const renderForm = () => {
      if (!editItem) return null;
      const isProduct = activeTab === 'boutique';
      const isPhysiqueTab = activeTab === 'physique';
      const isRecipeTab = activeTab === 'recettes';
      const headerColor = isProduct ? 'bg-lyloo-terracotta' : isRecipeTab ? 'bg-lyloo-orange' : isPhysiqueTab ? 'bg-lyloo-vertPale' : 'bg-lyloo-vertEau';
      const currentImage = isProduct ? editItem.image_url : editItem.imageUrl;

      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-stone-800 w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200">
                  <div className={`p-6 border-b border-stone-100 dark:border-stone-700 flex justify-between items-center sticky top-0 ${headerColor} z-10 text-white rounded-t-3xl shadow-md`}>
                      <h2 className="text-xl font-bold">{editItem.id ? 'Modifier' : 'Créer'} {isProduct ? 'Produit' : 'Activité'}</h2>
                      <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleSave} className="p-6 space-y-6">
                      <div className="flex flex-col items-center gap-4 bg-stone-50 dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-700 border-dashed">
                          <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden bg-stone-200 dark:bg-stone-800 shadow-inner flex items-center justify-center group">
                                {currentImage ? <WellnessCardImage src={currentImage} className="w-full h-full object-cover" alt="Preview" /> : <ImageIcon size={48} className="text-stone-400 opacity-50"/>}
                                {generatingImage && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center flex-col gap-3 text-white z-20"><Loader2 size={32} className="animate-spin" /><span className="font-bold text-sm">Génération IA...</span></div>}
                          </div>
                          <div className="flex gap-2 w-full">
                              <Input className="text-xs" value={currentImage || ''} onChange={e => setEditItem({ ...editItem, [isProduct ? 'image_url' : 'imageUrl']: e.target.value })} placeholder="Image URL" />
                              <Button type="button" onClick={handleGenerateImage} disabled={generatingImage} className="bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white whitespace-nowrap"><Sparkles size={16} className={`mr-2 ${generatingImage ? "animate-pulse" : ""}`} /> IA</Button>
                          </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input value={isProduct ? (editItem.name || '') : (editItem.titre || '')} onChange={e => setEditItem({ ...editItem, [isProduct ? 'name' : 'titre']: e.target.value })} placeholder="Titre" required />
                          <Input value={isProduct ? (editItem.category || '') : (editItem.categorie || '')} onChange={e => setEditItem({ ...editItem, [isProduct ? 'category' : 'categorie']: e.target.value })} placeholder="Catégorie" required disabled={isRecipeTab} />
                      </div>
                      <textarea className="w-full px-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-lyloo-vertEau dark:text-white transition-all" rows={3} value={editItem.description || ''} onChange={e => setEditItem({ ...editItem, description: e.target.value })} placeholder="Description" />
                      
                      {isRecipeTab && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                              <textarea className="w-full px-4 py-3 rounded-2xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-lyloo-orange dark:text-white" rows={6} placeholder="Ingrédients" value={Array.isArray(editItem.ingredients) ? editItem.ingredients.join('\n') : editItem.ingredients || ''} onChange={e => setEditItem({ ...editItem, ingredients: e.target.value })} />
                              <textarea className="w-full px-4 py-3 rounded-2xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-lyloo-orange dark:text-white" rows={6} placeholder="Instructions" value={Array.isArray(editItem.instructions) ? editItem.instructions.join('\n') : editItem.instructions || ''} onChange={e => setEditItem({ ...editItem, instructions: e.target.value })} />
                          </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-50 dark:bg-stone-900 p-4 rounded-2xl border border-stone-100 dark:border-stone-700">
                           {!isProduct && <Input type="number" value={editItem.dureeMinutes || 0} onChange={e => setEditItem({ ...editItem, dureeMinutes: parseInt(e.target.value) })} placeholder="Durée (min)" />}
                           {isProduct && <Input type="number" step="0.01" value={editItem.price || 0} onChange={e => setEditItem({ ...editItem, price: parseFloat(e.target.value) })} placeholder="Prix (€)" />}
                           {isPhysiqueTab && <Input value={editItem.contentUrl || ''} onChange={e => setEditItem({ ...editItem, contentUrl: e.target.value })} placeholder="Video URL" />}
                      </div>

                      <div className="pt-4 flex gap-3 sticky bottom-0 bg-white dark:bg-stone-800 pb-2">
                          <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsEditing(false)}>Annuler</Button>
                          <Button type="submit" disabled={saving} className={`flex-1 text-white shadow-lg ${headerColor}`}>{saving ? '...' : <><Save size={18} /> Enregistrer</>}</Button>
                      </div>
                  </form>
              </div>
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-lyloo-beige dark:bg-lyloo-dark-bg pb-40">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-stone-800 border-b border-stone-100 dark:border-stone-700 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg text-lyloo-anthracite dark:text-lyloo-beige ml-2">Administration</h1>
          </div>
          <button onClick={() => navigate('/')} className="p-2 -mr-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full transition-colors">
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
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-lyloo-anthracite dark:text-lyloo-beige">{getList().length} éléments trouvés</h2>
              <Button onClick={handleCreate} className="shadow-lg"><Plus size={18} /> Ajouter</Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
              {getList().map((item: any) => (
                  <Card key={item.id} hoverable className="flex gap-4 p-4 hover:shadow-md transition-shadow group animate-in slide-in-from-bottom-2 duration-300">
                      <div className="w-24 h-24 rounded-2xl bg-stone-200 overflow-hidden flex-shrink-0 border border-stone-100 dark:border-stone-700 relative group-hover:scale-105 transition-transform">
                          <WellnessCardImage src={item.imageUrl || item.image_url} alt={item.titre || item.name} category={item.categorie || item.category} className="w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex justify-between items-start">
                             <div className="min-w-0 pr-2">
                                 <h3 className="font-bold text-lg text-lyloo-anthracite dark:text-lyloo-beige truncate leading-tight" title={item.titre || item.name}>{item.titre || item.name}</h3>
                                 <div className="flex gap-2 mt-1 flex-wrap">
                                    <Badge className="bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-300">{item.categorie || item.category}</Badge>
                                 </div>
                             </div>
                             <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                 <Tooltip content="Modifier"><button onClick={() => handleEdit(item)} className="p-2 bg-stone-100 dark:bg-stone-700 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 text-stone-600 dark:text-stone-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:scale-110"><Edit size={16} /></button></Tooltip>
                                 <Tooltip content="Supprimer"><button onClick={() => handleDelete(item.id)} className="p-2 bg-stone-100 dark:bg-stone-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 text-stone-600 dark:text-stone-300 hover:text-red-600 dark:hover:text-red-400 transition-colors hover:scale-110"><Trash2 size={16} /></button></Tooltip>
                             </div>
                          </div>
                          <div className="mt-auto pt-2 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
                              <span className="truncate max-w-[200px] hidden sm:block opacity-70" title={item.description}>{item.description}</span>
                          </div>
                      </div>
                  </Card>
              ))}
          </div>
          
          <div className="mt-12 text-center text-xs text-stone-400 font-mono">
             Lyloo Admin Dashboard v1.0.4
          </div>
      </div>
      {isEditing && renderForm()}
    </div>
  );
};

export default Admin;
