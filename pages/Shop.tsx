
import React, { useState, useEffect } from 'react';
import { WaveHeader, Card, Button, Badge, WellnessCardImage, Tooltip, ShopIcon } from '../components/ui/LayoutComponents';
import { ShoppingCart, Plus, Minus, X, CreditCard, User, ArrowDownUp, Eye } from 'lucide-react';
import { MockService } from '../services/mockService';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';

interface CartItem extends Product {
  quantity: number;
}

type SortOption = 'price-asc' | 'price-desc' | 'alpha';

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('price-asc');
  
  // Animation state
  const [cartAnimation, setCartAnimation] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    MockService.getProducts().then(setProducts);
  }, []);

  const trackProductView = (product: Product) => {
    setRecentlyViewed(prev => {
        const filtered = prev.filter(p => p.id !== product.id);
        return [product, ...filtered].slice(0, 5); // Keep last 5
    });
  };

  const handleProductClick = (product: Product) => {
      trackProductView(product);
      setSelectedProduct(product);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    // trackProductView(product); // Already tracked on click, don't double track if just adding
    
    // Trigger animation
    setCartAnimation(true);
    setTimeout(() => setCartAnimation(false), 800);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(p => p.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(p => {
      if (p.id === id) {
        const newQty = Math.max(1, p.quantity + delta);
        return { ...p, quantity: newQty };
      }
      return p;
    }));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderComplete(true);
      setCart([]);
    }, 3000); // Simulate longer API call for progress bar
  };

  const getSortedProducts = () => {
    return [...products].sort((a, b) => {
        if (sortOption === 'price-asc') return a.price - b.price;
        if (sortOption === 'price-desc') return b.price - a.price;
        if (sortOption === 'alpha') return a.name.localeCompare(b.name);
        return 0;
    });
  };

  return (
    <div className="pb-40 relative bg-lyloo-beige dark:bg-lyloo-dark-bg min-h-screen">
      <WaveHeader 
        title="Boutique" 
        subtitle="Équipements & Bien-être"
        onMenuClick={() => navigate('/profil')}
        icon={ShopIcon}
        rightAction={
          <Tooltip content="Voir le panier">
            <button 
                onClick={() => setIsCartOpen(true)} 
                className={`relative p-3 bg-white/30 hover:bg-white/50 rounded-full transition-all duration-300 hover:scale-110 ${cartAnimation ? 'bg-white/60 scale-110' : ''}`}
            >
              <ShoppingCart size={24} className={`transition-colors ${cartAnimation ? 'text-lyloo-vertEau' : 'text-lyloo-anthracite'}`} />
              
              {/* Flying +1 Animation */}
              {cartAnimation && (
                  <span className="absolute -top-4 right-0 text-lyloo-vertEau font-bold text-lg animate-bounce pointer-events-none transition-opacity duration-700 ease-out opacity-0" style={{ animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }}>
                      +1
                  </span>
              )}
              {cartAnimation && (
                  <span className="absolute -top-6 right-0 text-lyloo-vertEau font-bold text-lg pointer-events-none animate-[bounce_0.5s_infinite]">
                      +1
                  </span>
              )}

              {cart.length > 0 && (
                <span className={`absolute -top-1 -right-1 w-5 h-5 bg-lyloo-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white transition-transform ${cartAnimation ? 'scale-125' : 'scale-100'}`}>
                  {cart.length}
                </span>
              )}
            </button>
          </Tooltip>
        } 
      />
      
      <div className="p-4 md:p-8 max-w-5xl mx-auto pt-60 md:pt-72 relative z-20 w-full">
        
        {/* Sort Controls */}
        <div className="flex justify-end mb-6">
            <div className="flex items-center gap-2 bg-white dark:bg-stone-800 p-2 rounded-full shadow-sm">
                <span className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1 pl-2"><ArrowDownUp size={12}/> Trier par:</span>
                <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 dark:bg-stone-700 text-lyloo-anthracite dark:text-lyloo-beige border-none outline-none cursor-pointer hover:bg-stone-200 transition-colors"
                >
                    <option value="price-asc">Prix Croissant</option>
                    <option value="price-desc">Prix Décroissant</option>
                    <option value="alpha">A-Z</option>
                </select>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {getSortedProducts().map(product => (
            <Card 
                key={product.id}
                hoverable 
                className="p-0 flex flex-col h-full group relative overflow-visible rounded-[32px] cursor-pointer"
                onClick={() => handleProductClick(product)}
            >
            <div className="aspect-square bg-stone-100 relative overflow-hidden rounded-t-[32px]">
                <WellnessCardImage 
                src={product.image_url} 
                alt={product.name} 
                category={product.category}
                className="w-full h-full" 
                />
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <Badge className="w-fit mb-2 text-[10px] uppercase tracking-wider">{product.category}</Badge>
                <h3 className="font-bold text-lyloo-anthracite dark:text-lyloo-beige leading-tight mb-1" title={product.name}>{product.name}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-3 flex-1 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mt-auto">
                <span className="font-bold text-lg dark:text-lyloo-beige">{product.price} €</span>
                <Tooltip content="Ajouter au panier">
                    <button 
                        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                        className="w-8 h-8 rounded-full bg-lyloo-anthracite text-white flex items-center justify-center hover:bg-stone-700 transition-colors hover:scale-110 active:scale-95"
                    >
                        <Plus size={18} />
                    </button>
                </Tooltip>
                </div>
            </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
              <div className="relative w-full max-w-lg bg-white dark:bg-stone-800 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                  <div className="relative h-64 w-full flex-shrink-0">
                      <WellnessCardImage src={selectedProduct.image_url} alt={selectedProduct.name} category={selectedProduct.category} className="w-full h-full" />
                      <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 bg-white/30 backdrop-blur-md p-2 rounded-full hover:bg-white/50 transition-colors">
                          <X size={20} className="text-lyloo-anthracite" />
                      </button>
                  </div>
                  <div className="p-6 overflow-y-auto">
                      <div className="flex justify-between items-start mb-2">
                          <Badge className="bg-lyloo-terracotta text-white">{selectedProduct.category}</Badge>
                          <span className="text-2xl font-bold text-lyloo-anthracite dark:text-lyloo-beige">{selectedProduct.price} €</span>
                      </div>
                      <h2 className="text-2xl font-bold text-lyloo-anthracite dark:text-lyloo-beige mb-4">{selectedProduct.name}</h2>
                      <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-6">
                          {selectedProduct.description}
                      </p>
                      <Button 
                        onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} 
                        className="w-full shadow-lg"
                      >
                          Ajouter au panier <ShoppingCart size={18} className="ml-2" />
                      </Button>
                  </div>
              </div>
          </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-stone-800 rounded-[32px] shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-300">
            
            <div className="p-6 border-b border-stone-100 dark:border-stone-700 flex items-center justify-between bg-lyloo-bg dark:bg-stone-800 rounded-t-[32px]">
              <h2 className="text-xl font-bold dark:text-lyloo-beige">Votre Panier</h2>
              <button onClick={() => setIsCartOpen(false)} className="hover:scale-110 transition-transform p-2 bg-stone-100 dark:bg-stone-700 rounded-full"><X className="text-stone-400" size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              {orderComplete ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
                    <Plus className="rotate-45" size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-lyloo-anthracite dark:text-lyloo-beige">Commande Confirmée !</h3>
                  <p className="text-stone-500 mt-2">Merci pour votre achat. Un email de confirmation a été envoyé.</p>
                  <Button className="mt-6" onClick={() => { setOrderComplete(false); setIsCartOpen(false); }}>Fermer</Button>
                </div>
              ) : (
                <>
                    <div className="space-y-4">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 text-stone-400">
                            <ShoppingCart size={48} className="mb-4 opacity-50" />
                            <p>Votre panier est vide.</p>
                            </div>
                        ) : (
                            cart.map(item => (
                            <div key={item.id} className="flex gap-4 items-center animate-in slide-in-from-right-2">
                                <div className="w-16 h-16 flex-shrink-0">
                                    <WellnessCardImage 
                                    src={item.image_url} 
                                    alt={item.name}
                                    className="w-full h-full rounded-2xl"
                                    />
                                </div>
                                <div className="flex-1">
                                <h4 className="font-semibold text-sm dark:text-lyloo-beige" title={item.name}>{item.name}</h4>
                                <p className="text-stone-500 text-xs">{item.price} €</p>
                                </div>
                                <div className="flex items-center gap-3">
                                <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:scale-110 transition-transform"><Minus size={14}/></button>
                                <span className="text-sm font-medium w-4 text-center dark:text-lyloo-beige">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:scale-110 transition-transform"><Plus size={14}/></button>
                                </div>
                            </div>
                            ))
                        )}
                    </div>

                    {recentlyViewed.length > 0 && (
                        <div className="pt-4 border-t border-stone-100 dark:border-stone-700">
                             <h3 className="font-bold text-sm text-lyloo-anthracite dark:text-lyloo-beige mb-3 flex items-center gap-2">
                                <Eye size={16} className="text-stone-400" /> Récemment consultés
                             </h3>
                             <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                {recentlyViewed.map(item => (
                                    <div 
                                        key={item.id}
                                        onClick={() => handleProductClick(item)}
                                        className="min-w-[100px] w-[100px] cursor-pointer group"
                                    >
                                        <div className="aspect-square bg-stone-100 rounded-xl overflow-hidden mb-1 relative">
                                            <WellnessCardImage src={item.image_url} alt={item.name} className="w-full h-full" />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Eye className="text-white" size={24} />
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-lyloo-anthracite dark:text-lyloo-beige truncate">{item.name}</p>
                                        <p className="text-[10px] text-stone-500">{item.price} €</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </>
              )}
            </div>

            {!orderComplete && cart.length > 0 && (
              <div className="p-6 border-t border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 rounded-b-[32px]">
                <div className="flex justify-between mb-4 text-lg font-bold dark:text-lyloo-beige">
                  <span>Total</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
                {isCheckingOut ? (
                  <div className="space-y-4 py-2">
                     <p className="text-sm font-bold text-lyloo-anthracite dark:text-stone-300 text-center animate-pulse">Paiement en cours...</p>
                     <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden w-full relative">
                       <div className="absolute inset-0 bg-lyloo-vertEau rounded-full animate-[wiggle_2s_linear_infinite]" style={{width: '30%'}}></div>
                     </div>
                  </div>
                ) : (
                  <Button className="w-full shadow-lg" onClick={handleCheckout}>
                    Payer <CreditCard size={18} />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
