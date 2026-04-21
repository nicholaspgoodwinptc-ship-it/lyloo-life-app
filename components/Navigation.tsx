import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChefHat } from 'lucide-react';
import { Tooltip, MentalIcon, PhysicalIcon, HomeIcon, CommunityIcon, SuiviIcon, ShopIcon } from './ui/LayoutComponents';

// Ajout du menu Nutrition avec l'icône ChefHat
const NAV_ITEMS = [
  { path: '/mental', label: 'Mental', icon: MentalIcon },
  { path: '/physique', label: 'Physique', icon: PhysicalIcon },
  { path: '/nutrition', label: 'Nutrition', icon: ChefHat },
  { path: '/', label: 'Accueil', icon: HomeIcon },
  { path: '/boutique', label: 'Boutique', icon: ShopIcon },
  { path: '/communaute', label: 'Communauté', icon: CommunityIcon },
  { path: '/suivi', label: 'Suivi', icon: SuiviIcon },
];

export const BottomTabBar: React.FC = () => {
  return (
    <>
      <div className="fixed bottom-3 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="bg-lyloo-anthracite/95 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-all duration-300 pointer-events-auto
                        flex justify-between items-center relative border border-white/10
                        w-[92%] max-w-lg h-16 px-4 md:px-8 group rounded-full
        ">
          
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'scale-110 -translate-y-4 bg-lyloo-anthracite shadow-[0_8px_16px_rgba(0,0,0,0.5)] border-2 border-lyloo-vertEau z-10'
                    : 'hover:scale-110 hover:-translate-y-1 hover:bg-white/10 text-white/50'
                }`
              }
            >
              {({ isActive }) => {
                 const iconColor = '#f5f2e6';
                 return (
                  <Tooltip content={item.label} position="top">
                    <div className="flex flex-col items-center justify-center relative">
                       {isActive && (
                          <div className="absolute inset-0 bg-white/10 rounded-full blur-lg scale-150"></div>
                       )}
                       <item.icon size={isActive ? 28 : 24} color={iconColor} />
                    </div>
                  </Tooltip>
                );
              }}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
};

export const Sidebar: React.FC = () => {
  return null; 
};

export const Header: React.FC<{ title: string; rightAction?: React.ReactNode }> = ({ title, rightAction }) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-stone-800 border-b border-stone-100 dark:border-stone-700 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-lyloo-anthracite dark:text-lyloo-beige" />
        </button>
        <h1 className="font-bold text-lg text-lyloo-anthracite dark:text-lyloo-beige">{title}</h1>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </div>
  );
};