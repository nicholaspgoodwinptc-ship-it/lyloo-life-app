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
  
  const [cartAnimation, setCartAnimation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    MockService.getProducts().then(setProducts);
  }, []);

  const trackProductView = (product: Product) => {
    setRecentlyViewed(prev => {
        const filtered = prev.filter(p => p.id !== product.id);
        return [product, ...filtered].slice(0, 4);
    });
  };

  const openProduct = (product: Product) => {
      setSelectedProduct(product);
      trackProductView(product);
  };

  const addToCart = (product: Product, e?: React.MouseEvent) => {
    if(e) e.stopPropagation();
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    setCartAnimation(true);
    setTimeout(() => setCartAnimation(false), 300);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
      setIsCheckingOut(true);
      setTimeout(() => {
          setIsCheckingOut(false);
          setOrderComplete(true);
          setCart([]);
          setTimeout(() => {
              setOrderComplete(false);
              setIsCartOpen(false);
          }, 3000);
      }, 2000);
  };

  const sortedProducts = [...products].sort((a, b) => {
      if (sortOption === 'price-asc') return a.price - b.price;
      if (sortOption === 'price-desc') return b.price - a.price;
      return a.name.localeCompare(b.name);
  });

  return (
    <div className="min-h-screen bg-lyloo-beige dark:bg-lyloo-dark-bg pb-40">
      <WaveHeader 
        title="Boutique" 
        subtitle="Découvre nos produits"
        icon={ShopIcon}
        onMenuClick={() => navigate('/profil')} 
        rightAction={
            <button 
                onClick={() => setIsCartOpen(true)} 
                className={`relative p-2 bg-white/20 rounded-full text-lyloo-anthracite hover:bg-white/40 transition-all ${cartAnimation ? 'scale-125' : 'scale-100'}`}
            >
                <ShoppingCart size={24} />
                {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-lyloo-terracotta text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm animate-in zoom-in">
                        {cartItemCount}
                    </span>
                )}
            </button>
        }
      />

      <div className="px-4 space-y-6 pt-60 md:pt-72 relative z-20 max-w-5xl mx-auto w-full">
        
        <div className="flex justify-end mb-2">
            <div className="flex items-center gap-2 bg-white dark:bg-stone-800 px-3 py-1.5 rounded-full shadow-sm">
                <ArrowDownUp size={14} className="text-stone-400" />
                <select 
                    value={sortOption} 
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="bg-transparent text-xs font-bold text-lyloo-anthracite dark:text-lyloo-beige outline-none border-none focus:ring-0 cursor-pointer"
                >
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="alpha">Alphabétique</option>
                </select>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedProducts.map((product) => (
            <Card 
                key={`prod-${product.id}`} 
                className="overflow-hidden flex flex-col p-0 cursor-pointer group hover:shadow-lg transition-all"
                onClick={() => openProduct(product)}
            >
              <div className="relative h-48 bg-white dark:bg-stone-900 p-4 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/5 transition-opacity z-10 pointer-events-none"></div>
                  {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                      <ShopIcon size={48} className="text-stone-200 dark:text-stone-700 group-hover:scale-110 transition-transform duration-500" />
                  )}
                  <Badge className="absolute top-2 left-2 bg-lyloo-vertEau/90 text-lyloo-anthracite backdrop-blur-sm z-20">{product.category}</Badge>
              </div>
              <div className="p-4 flex flex-col flex-1 bg-white dark:bg-stone-800">
                <h3 className="font-bold text-lyloo-anthracite dark:text-lyloo-beige text-sm mb-1 line-clamp-2 flex-1 group-hover:text-lyloo-vertEau transition-colors">{product.name}</h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-lg text-lyloo-terracotta">{product.price.toFixed(2)} €</span>
                  <button 
                    onClick={(e) => addToCart(product, e)}
                    className="w-8 h-8 rounded-full bg-lyloo-anthracite text-lyloo-beige flex items-center justify-center hover:bg-lyloo-vertEau hover:text-lyloo-anthracite transition-colors shadow-sm"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}></div>
              <div className="relative bg-white dark:bg-stone-800 w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 flex flex-col max-h-[90vh]">
                  
                  <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-20 w-8 h-8 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-lyloo-anthracite shadow-sm">
                      <X size={18} />
                  </button>

                  <div className="h-64 bg-stone-50 dark:bg-stone-900 p-6 flex items-center justify-center relative">
                      {selectedProduct.image_url ? (
                          <img src={selectedProduct.image_url} alt={selectedProduct.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                          <ShopIcon size={80} className="text-stone-200 dark:text-stone-700" />
                      )}
                      <Badge className="absolute bottom-4 left-4 bg-lyloo-vertEau text-lyloo-anthracite shadow-sm">{selectedProduct.category}</Badge>
                  </div>
                  
                  <div className="p-6 flex-1 overflow-y-auto no-scrollbar">
                      <h2 className="text-2xl font-bold text-lyloo-anthracite dark:text-lyloo-beige mb-2">{selectedProduct.name}</h2>
                      <span className="text-3xl font-bold text-lyloo-terracotta block mb-6">{selectedProduct.price.toFixed(2)} €</span>
                      
                      <h3 className="font-bold text-sm text-stone-500 uppercase tracking-wide mb-2">Description</h3>
                      <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-sm mb-8">{selectedProduct.description || "Aucune description disponible pour ce produit."}</p>
                      
                      <Button className="w-full shadow-lg h-14 text-lg" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>
                          Ajouter au panier - {selectedProduct.price.toFixed(2)} €
                      </Button>
                  </div>
              </div>
          </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white dark:bg-stone-800 h-full shadow-2xl flex flex-col animate-in slide-in-from-right sm:rounded-l-[32px]">
            <div className="p-6 border-b border-stone-100 dark:border-stone-700 flex justify-between items-center bg-stone-50 dark:bg-stone-900 rounded-tl-[32px]">
              <h2 className="text-xl font-bold text-lyloo-anthracite dark:text-lyloo-beige flex items-center gap-2">
                  <ShoppingCart size={20} /> Mon Panier
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full transition-colors"><X size={20} className="text-stone-500" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {orderComplete ? (
                  <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                      <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
                          <ShoppingCart size={40} />
                      </div>
                      <h3 className="text-2xl font-bold text-lyloo-anthracite dark:text-lyloo-beige mb-2">Commande confirmée !</h3>
                      <p className="text-stone-500">Merci pour votre achat. Vous recevrez un email de confirmation très bientôt.</p>
                  </div>
              ) : cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400">
                  <ShoppingCart size={48} className="mb-4 opacity-50" />
                  <p>Votre panier est vide</p>
                </div>
              ) : (
                <>
                    <div className="space-y-4">
                        {cart.map((item) => (
                            <div key={`cart-${item.id}`} className="flex gap-4 bg-stone-50 dark:bg-stone-900/50 p-3 rounded-2xl animate-in slide-in-from-right-4">
                            <div className="w-20 h-20 bg-white dark:bg-stone-800 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm p-2">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} className="max-h-full max-w-full object-contain" />
                                ) : (
                                    <ShopIcon size={24} className="text-stone-300 dark:text-stone-600" />
                                )}
                            </div>
                            <div className="flex-1 flex flex-col py-1">
                                <h3 className="font-bold text-sm text-lyloo-anthracite dark:text-lyloo-beige line-clamp-1">{item.name}</h3>
                                <span className="text-lyloo-terracotta font-bold text-sm mb-auto">{(item.price * item.quantity).toFixed(2)} €</span>
                                <div className="flex items-center gap-3 bg-white dark:bg-stone-800 self-start rounded-full p-1 shadow-sm border border-stone-100 dark:border-stone-700">
                                <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-stone-100 dark:bg-stone-700 rounded-full text-stone-600 dark:text-stone-300 hover:bg-stone-200"><Minus size={12} /></button>
                                <span className="text-sm font-bold w-4 text-center dark:text-lyloo-beige">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-stone-100 dark:bg-stone-700 rounded-full text-stone-600 dark:text-stone-300 hover:bg-stone-200"><Plus size={12} /></button>
                                </div>
                            </div>
                            </div>
                        ))}
                    </div>

                    {recentlyViewed.length > 0 && (
                        <div className="pt-6 border-t border-stone-100 dark:border-stone-700">
                             <h3 className="text-sm font-bold text-stone-500 mb-4 flex items-center gap-2"><Eye size={16}/> Vus récemment</h3>
                             <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                {recentlyViewed.map(item => (
                                    <div 
                                        key={`viewed-${item.id}`} 
                                        onClick={() => { setIsCartOpen(false); openProduct(item); }}
                                        className="w-24 flex-shrink-0 cursor-pointer group"
                                    >
                                        <div className="h-24 bg-stone-50 dark:bg-stone-900 rounded-xl mb-2 flex items-center justify-center p-2 group-hover:shadow-md transition-shadow">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} className="max-h-full max-w-full object-contain" />
                                            ) : (
                                                <ShopIcon size={20} className="text-stone-300" />
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-lyloo-anthracite dark:text-lyloo-beige line-clamp-2 leading-tight">{item.name}</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </>
              )}
            </div>

            {!orderComplete && cart.length > 0 && (
              <div className="p-6 border-t border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 rounded-b-[32px] sm:rounded-bl-[32px] sm:rounded-br-none">
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