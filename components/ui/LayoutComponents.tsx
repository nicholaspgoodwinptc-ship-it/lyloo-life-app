
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, ImageOff, User, Search, Bell, X, ChevronRight, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MockService } from '../../services/mockService';
import { Activity, Product, Notification } from '../../types';

// --- ICONS ---

export const MentalIcon: React.FC<{ size?: number; color?: string; className?: string }> = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 283.46 283.46" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g id="MentalIcon-Bien_Etre_Mental_Anthracite">
      <path d="M165,54.05c30.92,1.81,59.3,27.16,64.52,57.7-11.72-27.82-35.56-49.17-64.52-57.7h0Z" fill={color} />
      <path d="M54.39,189.56c9.49,17.71,24.8,33.06,44.17,39.37,0,0-.15.48-.15.48-16.28.08-30.99-11.11-39-24.72-2.67-4.59-4.69-9.57-5.47-14.9l.44-.23h0Z" fill={color} />
      <path d="M125.6,69.66c-43.54,7.68-72.81,48.02-65.39,90.1,7.42,42.08,48.73,69.98,92.27,62.3,43.54-7.68,72.81-48.02,65.39-90.1-7.42-42.08-48.73-69.98-92.27-62.3ZM131.81,92.19c5.25,0,10.5,2.13,15.13,6.09,1.96,1.74,4.01,4.39,5.42,6.3l.28.46c.96,1.55,2.28,3.67,2.87,4.97l.13.28c4.74,9.74,7.51,21.27,9.91,31.26,2.42,11.72,4.93,23.85,4.44,35.32-.08.68-.19,1.6-.3,2.51l-.26,2.13c-.13.59-.3,1.36-.52,2.32-.19.81-.37,1.61-.51,2.25-3.43,11.14-11.66,17.78-22.03,17.78-8.52,0-16.36-4.68-21.46-12.75-.34-.57-.86-1.46-1.37-2.33l-1.18-2.01c-1.47-3.02-2.23-5.02-3.51-8.34l-.06-.15c-5.37-17.05-8.59-33.81-9.86-51.24,0-.75-.02-1.55-.03-2.41-.03-1.54-.05-3.12.04-4.24l.49-5.04c1.48-13.4,10.91-23.13,22.38-23.13Z" fill={color} />
    </g>
  </svg>
);

export const PhysicalIcon: React.FC<{ size?: number; color?: string; className?: string }> = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 283.46 283.46" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g id="PhysicalIcon-Bien_Etre_Physique_Anthracite">
      <path d="M145.95,98.81c12.34,0,22.38-10.04,22.38-22.38s-10.04-22.38-22.38-22.38-22.38,10.04-22.38,22.38,10.04,22.38,22.38,22.38Z" fill={color} />
      <path d="M71.74,84.61c2.76-3.49,5.89-5.07,8.91-6.6,3.07-1.55,5.96-3.02,8.47-6.38,1.35-1.81,2.35-3.93,3.04-6.31-.04-.02-.07-.05-.11-.08-2.04-1.38-4.45-2.11-6.97-2.11h-29.86c-3.15,0-5.86,2.03-6.74,5.04-.89,3.01.3,6.18,2.94,7.87,6.22,4,12.44,8.44,17.73,12.64.68-1.4,1.51-2.73,2.59-4.1Z" fill={color} />
      <path d="M85.91,97.18c2.76-3.49,5.89-5.07,8.92-6.6,3.07-1.55,5.96-3.02,8.47-6.38,1.57-2.1,2.66-4.64,3.34-7.5-2.29-2-4.55-3.92-6.77-5.69-.6,2.72-1.6,4.86-3.28,7.12-2.63,3.53-5.79,5.13-8.83,6.67l-.27.14c-2.86,1.45-5.82,2.94-8.38,6.18-1.03,1.3-1.79,2.65-2.45,4.03,1.84,1.73,4.1,3.93,6.56,6.38.69-1.48,1.56-2.9,2.69-4.34Z" fill={color} />
      <path d="M235.07,68.31c-.77-3.05-3.5-5.17-6.64-5.17h-26.47c-3.17,0-6.22,1.34-8.38,3.67l-41.24,44.68c-1.37,1.39-2.6,2.93-3.66,4.57-.42.66-.82,1.33-1.18,2.02-6.73-8.25-15.37-17.04-23.95-25.5-3.3-3.25-6.42-6.25-9.47-9.11-.59,2.77-1.6,4.94-3.31,7.23-2.63,3.53-5.79,5.13-8.83,6.67l-.27.14c-2.86,1.45-5.82,2.94-8.38,6.18-1.28,1.61-2.18,3.28-2.9,5.04,8.15,8.31,16.51,17.18,19.34,20.72l.71.89c11.42,14.17,18.14,24.58,19.98,30.96,1.75,6.08,1.6,15.72-.44,28.66-1.38,8.73-3.3,18.47-5.72,28.94-.59,2.56,0,5.22,1.65,7.28,1.64,2.06,4.09,3.25,6.73,3.25h27.83c2.54,0,4.93-1.11,6.57-3.04,1.63-1.92,2.33-4.45,1.91-6.94-1.17-7.03-3.29-21.26-4.14-27.54-.19-1.36-.4-2.77-.61-4.23-.9-6.01-1.92-12.82-1.75-20.8.04-1.76.06-3.36.07-4.8.04-3.16.07-6.43.37-7.42,6.82-22.86,25.89-45.32,40.13-57.61,11.61-10.01,21-16.89,28.69-21.05,2.75-1.48,4.13-4.64,3.36-7.67Z" fill={color} />
    </g>
  </svg>
);

export const HomeIcon: React.FC<{ size?: number; color?: string; className?: string }> = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 283.46 283.46" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path id="HomeIcon-Accueil_Anthracite" d="M230.81,140.71l-85.12-85.12c-2.05-2.05-5.86-2.05-7.9,0l-85.12,85.12c-1.05,1.06-1.64,2.46-1.64,3.96s.59,2.89,1.64,3.95c2.18,2.19,5.73,2.17,7.91,0l13.32-13.33v88.54c0,3.08,2.51,5.59,5.59,5.59h41.07c3.08,0,5.59-2.51,5.59-5.59v-55.65h31.19v55.65c0,3.08,2.51,5.59,5.59,5.59h41.07c3.08,0,5.59-2.51,5.59-5.59v-88.53l13.32,13.32c2.11,2.11,5.81,2.11,7.91,0,1.05-1.06,1.64-2.46,1.64-3.95s-.59-2.9-1.64-3.96Z" fill={color} />
  </svg>
);

export const CommunityIcon: React.FC<{ size?: number; color?: string; className?: string }> = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 283.46 283.46" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <clipPath id="CommunityIcon-clippath">
        <circle cx="141.73" cy="141.73" r="87.68" stroke={color} strokeMiterlimit="10" fill="none" />
      </clipPath>
    </defs>
    <g id="CommunityIcon-Communauté_Anthracite">
      <g clipPath="url(#CommunityIcon-clippath)">
        <path d="M141.73,61.28c44.36,0,80.45,36.09,80.45,80.45s-36.09,80.45-80.45,80.45-80.45-36.09-80.45-80.45,36.09-80.45,80.45-80.45M141.73,54.05c-48.43,0-87.68,39.26-87.68,87.68s39.26,87.68,87.68,87.68,87.68-39.26,87.68-87.68-39.26-87.68-87.68-87.68h0Z" fill={color} />
        <path d="M117.5,62.88c.5,5.3,1.57,9.55,2.48,12.49,1.85,5.98,3.18,10.06,7.14,12.78.69.48,2.78,1.87,5.59,2.23,2.34.3,7.33.13,18.32-10.95,4.1-4.14,9.56-10.32,14.92-18.82-5.89-1.73-15.18-3.67-26.55-2.8-9.26.7-16.75,3.03-21.91,5.09Z" stroke={color} strokeMiterlimit="10" fill={color} />
        <path d="M206.17,89.37c-5.72.19-15.16,1.33-25.08,6.74-12.43,6.78-18.22,16.21-21.79,22.03-3.56,5.8-3.86,8.65-3.28,10.88.92,3.53,3.94,5.08,3.45,8.12-.29,1.75-1.54,2.74-3.69,4.59-.71.61-7.2,6.19-9.11,8.36-5.55,6.29-4.82,20.37,1.61,26.12,3.44,3.08,6.38,1.86,12.87,6.85,1.03.79,3.55,2.82,6.16,6.01,1.91,2.34,6.33,7.89,7.78,16.33.41,2.41.79,6.26,0,11.01,7.56-2.82,25.26-10.67,37.52-29.48,15.89-24.36,11.58-50.09,10.18-58.43-3.15-18.8-11.57-32.23-16.62-39.13Z" stroke={color} strokeMiterlimit="10" fill={color} />
        <path d="M92.52,73.29c10.64,8.65,12.44,16.98,12.87,20.37,1.76,13.96-8.56,32.92-21.98,40.74-2.43,1.42-6.48,3.35-7.5,7.34-1.32,5.13,3.18,10.44,5.9,13.57,9.7,11.16,16.7,8.48,23.48,17.14,1.33,1.69,2.63,3.8,7.07,22.35,2.39,9.98,4.16,18.34,5.36,24.31-6.12-1.55-33.64-9.21-49.32-36.03-11.84-20.27-10.41-40.33-9.65-49.2.61-7.09,2.24-23.84,13.94-40.74,6.79-9.82,14.53-16.14,19.83-19.83Z" stroke={color} strokeMiterlimit="10" fill={color} />
      </g>
      <circle cx="141.73" cy="141.73" r="87.68" stroke={color} strokeMiterlimit="10" fill="none" />
    </g>
  </svg>
);

export const SuiviIcon: React.FC<{ size?: number; color?: string; className?: string }> = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 283.46 283.46" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g id="SuiviIcon-Suivi_Beige">
    <path  d="M87.86,190.46c-.4.08-1.62.53-2.78,1.54-1.65,1.45-1.7,3.9-1.71,4.85-.07,3.47,1.54,12,10.28,21.56,3.9,4.27,7.22,7.81,12.99,9.71,2.05.67,6.88,2.19,12.71.57,5.84-1.63,9.21-5.44,10.42-6.85,4.44-5.17,5.14-10.75,6-17.56,0,0,.97-7.76-2-18.27-.24-.86-.65-1.78-1.43-2.57-.72-.73-1.47-1.05-1.71-1.14-1.67-.66,3.69-.51-4.18-.34-20.97,5-34.94,7.72-38.59,8.5Z" fill={color}/>
    <path  d="M92.3,179.43c-1.04.17-3.74.12-5.57-.18,0,0-2.95-.47-5.71-2.28-4.73-3.1-7.01-9.3-7.71-11.28-3.01-8.49-6.31-17.78-6.71-32.12-.27-9.78.97-15.8,1.43-17.85,1.1-4.91,2.1-9.16,5.28-13.85,1.34-1.98,5.05-7.28,12.14-10.42,1.67-.74,5.13-2.28,9.42-2.28,10.37-.02,17.77,8.89,20.7,12.42,6.13,7.38,8.02,14.66,10.71,24.98,2.58,9.93,3.85,20.68,4.14,25.27,1,15.99-6.36,19.85-7,20.13-7.42,3.28-20.42,6.46-31.12,7.46Z" fill={color}/>
    <path  d="M195.61,155.34c.4.08,1.62.53,2.78,1.54,1.65,1.45,1.7,3.9,1.71,4.85.07,3.47-1.54,12-10.28,21.56-3.9,4.27-7.22,7.81-12.99,9.71,2.05.67-6.88,2.19-12.71.57-5.84-1.63-9.21-5.44-10.42-6.85-4.44-5.17-5.14-10.75-6-17.56,0,0-.97-7.76,2-18.27.24-.86.65-1.78,1.43-2.57.72-.73,1.47-1.05,1.71-1.14,1.67-.66,3.69-.51,4.18-.34,20.97,5,34.94,7.72,38.59,8.5Z" fill={color}/>
    <path  d="M191.16,144.31c1.04.17,3.74.12,5.57-.18,0,0,2.95-.47,5.71-2.28,4.73-3.1,7.01-9.3,7.71-11.28,3.01-8.49,6.31-17.78,6.71-32.12.27-9.78-.97-15.8-1.43-17.85-1.1-4.91-2.1-9.16-5.28-13.85-1.34-1.98-5.05-7.28-12.14-10.42-1.67-.74-5.13-2.28-9.42-2.28-10.37-.02-17.77,8.89-20.7,12.42-6.13,7.38-8.02,14.66-10.71,24.98-2.58,9.93-3.85,20.68-4.14,25.27-1,15.99,6.36,19.85,7,20.13,7.42,3.28,20.42,6.46,31.12,7.46Z" fill={color}/>    </g>
  </svg>
);

export const ShopIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 10H18L19.5 22H4.5L6 10Z" fill={color} />
    <path d="M9 10V8C9 6.5 10.5 5 12 5C13.5 5 15 6.5 15 8V10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M9 14H15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// --- COMPONENTS ---

export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost', size?: 'sm' | 'md' | 'lg' }> = 
  ({ className = '', variant = 'primary', size = 'md', ...props }) => {
  
  const baseStyle = "font-sans font-bold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 rounded-full hover:scale-105 active:scale-95";
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const variants = {
    primary: "bg-lyloo-anthracite text-lyloo-beige hover:bg-stone-800 dark:bg-lyloo-beige dark:text-lyloo-anthracite",
    secondary: "bg-lyloo-vertEau text-lyloo-anthracite hover:opacity-90",
    outline: "border-2 border-lyloo-anthracite text-lyloo-anthracite hover:bg-lyloo-anthracite/5 dark:border-lyloo-beige dark:text-lyloo-beige",
    ghost: "text-lyloo-anthracite hover:bg-black/5 dark:text-lyloo-beige dark:hover:bg-white/10"
  };

  return <button className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />;
};

export const Card: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void, hoverable?: boolean }> = ({ children, className = '', onClick, hoverable }) => {
  const isInteractive = onClick || hoverable;
  
  return (
    <div 
      onClick={onClick} 
      className={`
        bg-white dark:bg-lyloo-dark-bg rounded-[32px] shadow-sm border border-transparent dark:border-lyloo-beige p-4 group/card
        ${isInteractive ? 'cursor-pointer hover:scale-[1.01] hover:shadow-md transition-all duration-300' : ''} 
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input 
    className={`w-full px-6 py-3 rounded-full border border-stone-200 dark:border-stone-600 focus:border-lyloo-vertEau focus:ring-2 focus:ring-lyloo-vertEau/20 outline-none transition-all bg-white dark:bg-stone-800 dark:text-white ${className}`} 
    {...props} 
  />
);

export const Badge: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold font-secondary bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-200 ${className}`}>
    {children}
  </span>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`animate-pulse bg-stone-200 dark:bg-stone-700 rounded-2xl ${className}`}></div>
);

export const Tooltip: React.FC<{ content: string; children: React.ReactNode; position?: 'top' | 'bottom'; align?: 'start' | 'center' | 'end' }> = ({ content, children, position = 'top', align = 'center' }) => {
  
  const getPositionClasses = () => {
    let classes = "absolute z-[9999] px-3 py-2 bg-lyloo-anthracite text-lyloo-beige text-xs font-bold rounded-lg shadow-xl pointer-events-none transition-all duration-200 opacity-0 group-hover/tooltip:opacity-100 invisible group-hover/tooltip:visible transform min-w-max max-w-[200px] whitespace-normal text-center";
    
    if (position === 'top') {
        classes += " bottom-full mb-2 origin-bottom";
    } else {
        classes += " top-full mt-2 origin-top";
    }

    if (align === 'center') {
        classes += " left-1/2 -translate-x-1/2";
    } else if (align === 'start') {
        classes += " left-0";
    } else if (align === 'end') {
        classes += " right-0";
    }

    return classes;
  };

  return (
    <div className="group/tooltip relative inline-flex items-center justify-center hover:z-50">
      {children}
      <div className={getPositionClasses()}>
        {content}
        <div className={`absolute ${position === 'top' ? 'top-full border-t-lyloo-anthracite' : 'bottom-full border-b-lyloo-anthracite'} border-4 border-transparent ${align === 'center' ? 'left-1/2 -translate-x-1/2' : align === 'start' ? 'left-4' : 'right-4'}`} />
      </div>
    </div>
  );
};

export const BackgroundPattern: React.FC<{ className?: string, opacity?: number }> = ({ className = '', opacity = 0.05 }) => (
  <div className={`absolute inset-0 z-0 pointer-events-none overflow-hidden ${className}`}>
      <svg className="absolute top-10 right-[-20px] w-64 h-64 text-lyloo-anthracite dark:text-lyloo-beige" style={{ opacity }} viewBox="0 0 100 100" fill="currentColor">
         <path d="M50 50 L30 10 L40 10 L55 45 L70 10 L80 10 L55 60 L55 90 L45 90 L45 60 Z" />
      </svg>
      <svg className="absolute bottom-20 left-[-30px] w-80 h-80 text-lyloo-vertEau" style={{ opacity }} viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="40" />
      </svg>
      <svg className="absolute top-[40%] left-[20%] w-32 h-32 text-lyloo-terracotta" style={{ opacity: opacity * 0.8 }} viewBox="0 0 100 100" fill="currentColor">
         <path d="M50 50 L30 10 L40 10 L55 45 L70 10 L80 10 L55 60 L55 90 L45 90 L45 60 Z" transform="rotate(-45 50 50)" />
      </svg>
  </div>
);

export const LylooIcon: React.FC<{ className?: string }> = ({ className = "" }) => (

  <svg viewBox="0 0 100 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">

     <defs>

        <mask id="y-stripes-icon">

          <rect width="100%" height="100%" fill="white" />

          <path d="M12 25 Q 16 23 20 19" stroke="black" strokeWidth="2.5" fill="none" />

          <path d="M15 29 Q 19 27 23 23" stroke="black" strokeWidth="2.5" fill="none" />

        </mask>

     </defs>

     <g transform="translate(10, 0)">

        <g mask="url(#y-stripes-icon)">

            <circle cx="30" cy="22" r="7" fill="currentColor" />

            <path d="M30 60 C 30 50 30 40 30 35 C 30 35 25 25 12 18" stroke="currentColor" strokeWidth="11" strokeLinecap="round" />

            <path d="M30 35 C 35 25 48 18 48 18" stroke="currentColor" strokeWidth="11" strokeLinecap="round" />

        </g>

        <circle cx="70" cy="38" r="16" stroke="currentColor" strokeWidth="11" />

     </g>

  </svg>

);

export const LylooLogo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    id="LylooLogo-Fichiers_images"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 566.93 566.93"
    className={`h-12 w-auto text-lyloo-anthracite ${className}`}
    fill="none"
  >
    <g id="LylooLogo-Logo_Noir">
      <g id="LylooLogo-LYLOO">
        <path fill="currentColor" d="M227.27,470.31v-109.42h24.16c2.06,0,3.73,1.54,3.73,3.45v85.48h50.82c2.06,0,3.73,1.54,3.73,3.45v20.5h-78.71c-2.06,0-3.73-1.54-3.73-3.45Z" />
        <path fill="currentColor" d="M43.21,470.31v-109.42h24.16c2.06,0,3.73,1.54,3.73,3.45v85.48h50.82c2.06,0,3.73,1.54,3.73,3.45v20.5H46.94c-2.06,0-3.73-1.54-3.73-3.45Z" />
        <path fill="currentColor" d="M191.03,360.89l-22.06,41.49-19.26-39.71c-.53-1.09-1.63-1.78-2.83-1.78h-26.82l33.84,67.16v42.79c0,1.62,1.31,2.92,2.93,2.92h26.5v-45.77s33.86-62.45,33.86-62.45c1.14-2.1-.38-4.65-2.77-4.65h-23.4Z" />
        <path fill="currentColor" d="M351.12,361.75c-28.59,5.04-47.38,34.01-41.97,64.71,5.41,30.7,32.98,51.49,61.57,46.45s47.38-34.01,41.97-64.71c-5.41-30.7-32.98-51.49-61.57-46.45ZM385.27,440.62c-.04.52-.11,1.27-.18,2-.06.63-.12,1.24-.16,1.71-.09.52-.23,1.22-.36,1.92-.12.64-.24,1.27-.33,1.74-2.51,9.74-9.28,15.68-17.7,15.53-6.86-.13-13.21-4.34-17.38-11.49-.28-.51-.73-1.34-1.15-2.11-.25-.47-.5-.92-.69-1.27-1.12-2.45-1.71-4.09-2.6-6.56l-.08-.23c-3.87-12.84-6.28-25.45-7.36-38.54,0-.57-.03-1.18-.05-1.8-.04-1.22-.08-2.49-.02-3.5v-.06s0-.06,0-.06l.05-1.79.2-1.74v-.07s.01-.07.01-.07c.97-11.75,8.52-20.15,17.94-19.97,4.32.08,8.63,2.05,12.43,5.65,1.57,1.55,3.09,3.68,4.25,5.39l.27.47c.75,1.31,1.69,2.93,2.17,4.1l.02.06.03.06c3.4,7.5,5.43,16.15,7.22,23.78,1.8,8.85,3.66,18,3.45,26.83Z" />
        <path fill="currentColor" d="M461.91,361.75c-28.59,5.04-47.38,34.01-41.97,64.71,5.41,30.7,32.98,51.49,61.57,46.45,28.59-5.04,47.38-34.01,41.97-64.71-5.41-30.7-32.98-51.49-61.57-46.45ZM496.05,440.62c-.04.52-.11,1.27-.18,2-.06.63-.12,1.24-.16,1.71-.09.52-.23,1.22-.36,1.92-.12.64-.24,1.27-.33,1.74-2.51,9.74-9.28,15.68-17.7,15.53-6.86-.13-13.21-4.34-17.38-11.49-.28-.51-.73-1.34-1.15-2.11-.25-.47-.5-.92-.69-1.27-1.12-2.45-1.71-4.09-2.6-6.56l-.08-.23c-3.87-12.84-6.28-25.45-7.36-38.54,0-.57-.03-1.18-.05-1.8-.04-1.22-.08-2.49-.02-3.5v-.06s0-.06,0-.06l.05-1.79.2-1.74v-.07s.01-.07.01-.07c.97-11.75,8.52-20.15,17.94-19.97,4.32.08,8.63,2.05,12.43,5.65,1.57,1.55,3.09,3.68,4.25,5.39l.27.47c.75,1.31,1.69,2.93,2.17,4.1l.02.06.03.06c3.4,7.5,5.43,16.15,7.22,23.78,1.8,8.85,3.66,18,3.45,26.83Z" />
      </g>
      <g>
        <path fill="currentColor" d="M188.29,283.3c9.76,18.21,25.51,34.01,45.43,40.5,0,0-.15.49-.15.49-16.75.09-31.88-11.43-40.11-25.42-2.75-4.72-4.82-9.84-5.63-15.33l.46-.24h0Z" />
        <g>
          <path fill="currentColor" d="M169.51,151.31c16.03,0,29.07-13.04,29.07-29.07s-13.04-29.07-29.07-29.07-29.07,13.04-29.07,29.07,13.04,29.07,29.07,29.07Z" />
          <g>
            <path fill="currentColor" d="M73.11,132.86c3.59-4.54,7.65-6.59,11.58-8.58,3.99-2.02,7.74-3.92,11-8.28,1.75-2.35,3.05-5.1,3.95-8.19-.05-.03-.09-.07-.14-.1-2.65-1.79-5.78-2.74-9.06-2.74h-38.78c-4.09,0-7.61,2.63-8.76,6.55-1.15,3.91.39,8.02,3.82,10.23,8.08,5.19,16.16,10.96,23.03,16.42.88-1.81,1.96-3.55,3.36-5.32Z" />
            <image width="255" height="158" transform="translate(40.68 103.1) scale(.24)" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAP4AAACeCAYAAAASYrcLAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAsklEQVR4nO3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAvBlzzAAB1iir8QAAAABJRU5ErkJggg==" />
          </g>
          <g>
            <path fill="currentColor" d="M91.39,149.38c3.58-4.54,7.64-6.61,11.56-8.6,3.98-2.03,7.74-3.93,10.98-8.3,2.03-2.73,3.44-6.03,4.32-9.75-2.98-2.59-5.91-5.09-8.8-7.37-.77,3.53-2.06,6.32-4.24,9.25-3.41,4.59-7.5,6.67-11.46,8.68l-.36.18c-3.71,1.89-7.55,3.84-10.86,8.05-1.33,1.69-2.32,3.44-3.17,5.24,2.4,2.24,5.34,5.1,8.54,8.26.9-1.93,2.01-3.77,3.49-5.64Z" />
            <image width="180" height="192" transform="translate(77.16 111.98) scale(.24)" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALEAAAC/CAYAAACxIz21AAAACXBIWXMAAC4jAAAuIwF4pT92AAAAmklEQVR4nO3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAvQERGQABbZgjNQAAAABJRU5ErkJggg==" />
          </g>
          <g>
            <path fill="currentColor" d="M285.06,111.49c-1.01-3.96-4.56-6.71-8.64-6.7l-34.38.07c-4.12,0-8.08,1.75-10.87,4.79l-53.45,58.15c-1.78,1.81-3.37,3.81-4.74,5.95-.55.86-1.06,1.74-1.53,2.63-8.76-10.7-20.01-22.09-31.18-33.06-4.3-4.22-8.36-8.1-12.32-11.81-.76,3.6-2.07,6.42-4.28,9.4-3.41,4.59-7.5,6.67-11.46,8.68l-.36.18c-3.71,1.89-7.55,3.84-10.86,8.05-1.65,2.1-2.82,4.27-3.76,6.55,10.61,10.78,21.49,22.27,25.17,26.86l.93,1.15c14.87,18.37,23.63,31.88,26.03,40.17,2.29,7.89,2.13,20.42-.49,37.22-1.77,11.35-4.24,24-7.36,37.61-.76,3.33.02,6.78,2.16,9.45,2.14,2.68,5.33,4.21,8.75,4.2l36.15-.07c3.3,0,6.4-1.45,8.53-3.97,2.11-2.5,3.01-5.79,2.47-9.02-1.54-9.13-4.33-27.61-5.46-35.76-.25-1.77-.52-3.6-.81-5.49-1.18-7.8-2.53-16.64-2.32-27.02.05-2.28.07-4.36.08-6.24.04-4.11.08-8.36.46-9.64,8.8-29.72,33.5-58.94,51.98-74.94,15.05-13.03,27.23-22,37.22-27.42,3.56-1.93,5.35-6.03,4.35-9.97Z" />
            <image width="800" height="917" transform="translate(95.16 102.86) scale(.24)" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAx0AAAOUCAYAAADHJl6DAAAACXBIWXMAAC4jAAAuIwF4pT92AAALJUlEQVR4nO3BMQEAAADCoPVPbQZ/oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgM5U4AAHJ1dpdAAAAAElFTkSuQmCC" />
          </g>
        </g>
        <path fill="currentColor" d="M521.18,193.88c-10.43-59.15-68.49-98.35-129.68-87.56-42.2,7.44-74.86,36.72-87.65,73.58,20.62,11.45,35.98,31.35,40.31,55.9,3.61,20.45-1.15,40.45-11.75,56.88,24.83,22.86,60.28,34.29,96.86,27.84,61.19-10.79,102.34-67.48,91.91-126.63ZM453.9,256.99c-.11.96-.27,2.25-.42,3.53l-.36,2.99c-.18.84-.43,1.92-.74,3.26-.26,1.14-.52,2.26-.72,3.16-4.82,15.65-16.38,24.99-30.97,24.99-11.98,0-22.99-6.57-30.16-17.92-.49-.81-1.21-2.05-1.93-3.28l-1.65-2.83c-2.06-4.24-3.14-7.06-4.93-11.72l-.08-.22c-7.54-23.96-12.08-47.52-13.86-72.02,0-1.06-.02-2.17-.04-3.39-.04-2.16-.07-4.39.05-5.96l.69-7.09c2.07-18.83,15.33-32.51,31.45-32.5,7.38,0,14.76,2.99,21.26,8.56,2.76,2.45,5.64,6.17,7.62,8.86l.4.64c1.36,2.18,3.21,5.16,4.03,6.98l.18.39c6.66,13.7,10.55,29.89,13.93,43.94,3.4,16.48,6.92,33.52,6.24,49.64Z" />
        <path fill="currentColor" d="M241.31,170.99c15.92-8.95,51.45-10.91,78.92,13.32l-7.75,1.16c-30.48-22.09-71.16-14.49-71.16-14.49Z" />
        <path fill="currentColor" d="M254.11,194.18c5.49,0,10.99,2.23,15.83,6.37,2.05,1.82,4.2,4.59,5.68,6.59l.3.48c1.01,1.62,2.39,3.84,3,5.2l.14.29c4.96,10.2,7.85,22.25,10.37,32.71,2.53,12.27,5.15,24.95,4.65,36.96-.08.71-.2,1.67-.32,2.63l-.27,2.23c-.13.62-.32,1.43-.55,2.43-.2.85-.38,1.68-.53,2.35-3.59,11.65-12.2,18.61-23.05,18.6-8.92,0-17.12-4.9-22.46-13.34-.36-.6-.9-1.52-1.43-2.44l-1.23-2.11c-1.53-3.16-2.34-5.26-3.67-8.73l-.06-.16c-5.62-17.84-8.99-35.38-10.32-53.62,0-.79-.02-1.62-.03-2.52-.03-1.61-.05-3.27.04-4.44l.51-5.28c1.54-14.02,11.42-24.21,23.42-24.2Z" />
      </g>
    </g>
  </svg>
);

export const WaveHeader: React.FC<{ 
  title: React.ReactNode; 
  subtitle?: string; 
  onMenuClick?: () => void; 
  showLogo?: boolean;
  className?: string;
  rightAction?: React.ReactNode; 
  icon?: React.FC<{ size?: number; color?: string }>;
  subtitleClassName?: string;
}> = ({ title, subtitle, onMenuClick, showLogo = true, className, rightAction, icon: Icon, subtitleClassName = "text-base sm:text-lg md:text-3xl italic tracking-wide opacity-90" }) => {
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const bgClass = className || "bg-lyloo-vertEau";
  const getFillColor = () => {
    if (bgClass.includes('vertPale')) return '#cce1b0';
    if (bgClass.includes('vertEau')) return '#a5cdbc';
    if (bgClass.includes('beige')) return '#f5f2e6';
    return '#a5cdbc';
  };

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
        setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Notification & Click Outside Logic
    const handleClickOutside = (event: MouseEvent) => {
        if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
            setIsSearchOpen(false);
        }
        if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
            setShowNotifications(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    MockService.getNotifications().then(setNotifications);
    
    return () => {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const scrollToTop = () => {
      if (isScrolled) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-in-out ${isScrolled ? 'h-20 cursor-pointer' : 'h-56 md:h-64'}`}
        onClick={scrollToTop}
    >
      
      {/* BACKGROUND LAYER - Asymmetric curve: High Left, Low Right */}
      {/* Container must be h-[100%] or taller relative to the *initial* header size to show the full wave */}
      <div 
        className={`absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-500`}
        style={{ height: '100%', opacity: isScrolled ? 0 : 1 }}
      >
          <svg 
            className="w-full h-full block overflow-visible" 
            viewBox="0 0 374.1732 210.8743" 
            preserveAspectRatio="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
              <path 
                d="M374.0976,161.477V0H0v194.5477s.7461-.2197.7461-.2197l.0108,1.9396c30.8761-9.9402,62.2675-15.1476,93.3009-15.4758,37.4056-.4013,64.0937,6.1738,92.3457,13.132,27.5497,6.785,56.0389,13.8022,95.0974,13.9755,32.8186.1505,59.7488-2.8408,92.6722-12.4435v-34.0001c-.0253.0072-.0503.014-.0756.0212Z"
                fill={getFillColor()}
              />
          </svg>
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="absolute -right-10 -top-10 w-64 h-64 text-white" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 50 L30 10 L40 10 L55 45 L70 10 L80 10 L55 60 L55 90 L45 90 L45 60 Z" />
            </svg>
          </div>
      </div>

      {/* Solid Background for Scrolled State */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 shadow-md ${isScrolled ? 'opacity-100' : 'opacity-0'} ${bgClass}`}
        style={{ backdropFilter: 'blur(10px)' }}
      ></div>

      {/* INTERACTIVE CONTENT LAYER */}
      <div className="relative h-full flex flex-col justify-between px-6 max-w-5xl mx-auto w-full z-50">
         
         {/* Top Row: Logo & Actions */}
         <div className={`flex items-center justify-between transition-all duration-500 ${isScrolled ? 'pt-4' : 'pt-6'}`}>
             <div className="flex-shrink-0">
                {showLogo && (
                  <div 
                    onClick={(e) => { e.stopPropagation(); navigate('/'); }} 
                    className="cursor-pointer hover:scale-105 transition-transform"
                  >
                     <LylooLogo className={`w-auto text-lyloo-anthracite dark:text-lyloo-beige transition-all duration-500 ${isScrolled ? 'h-10' : 'h-24 md:h-32'}`} />
                  </div>
                )}
             </div>

             <div className="flex gap-2 flex-shrink-0 justify-end relative" onClick={(e) => e.stopPropagation()}>
                {/* Search Bar Logic */}
                <div ref={searchRef} className={`absolute top-0 right-20 bg-white rounded-full shadow-lg z-50 flex items-center px-4 py-2 transition-all duration-300 origin-top-right ${isSearchOpen ? 'opacity-100 scale-100 w-64' : 'opacity-0 scale-95 pointer-events-none w-0 p-0 overflow-hidden'}`}>
                    <Search size={20} className="text-stone-400 mr-2 flex-shrink-0" />
                    <input 
                        autoFocus={isSearchOpen}
                        type="text" 
                        placeholder="Rechercher..." 
                        className="flex-1 outline-none text-lyloo-anthracite font-medium bg-transparent min-w-0"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="flex-shrink-0"><X size={20} className="text-stone-400" /></button>
                </div>
                
                <Tooltip content="Rechercher" position="bottom" align="end">
                    <button onClick={() => setIsSearchOpen(true)} className="p-2.5 bg-white/30 backdrop-blur-sm rounded-full hover:bg-white/50 hover:scale-110 transition-all text-lyloo-anthracite dark:text-lyloo-beige shadow-sm">
                        <Search size={22} />
                    </button>
                </Tooltip>

                {/* Notifications Logic */}
                <div ref={notifRef} className="relative">
                    <Tooltip content="Notifications" position="bottom" align="end">
                        <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 bg-white/30 backdrop-blur-sm rounded-full hover:bg-white/50 hover:scale-110 transition-all text-lyloo-anthracite dark:text-lyloo-beige shadow-sm">
                            <Bell size={22} />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-white"></span>
                            )}
                        </button>
                    </Tooltip>

                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-4 w-72 bg-white dark:bg-stone-800 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 origin-top-right border border-stone-100 dark:border-stone-700 z-50">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-lyloo-anthracite dark:text-lyloo-beige text-sm">Notifications</h3>
                                {unreadCount > 0 && <span className="text-[10px] bg-lyloo-vertEau px-2 py-0.5 rounded-full font-bold">{unreadCount}</span>}
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                                {notifications.length > 0 ? notifications.map(n => (
                                    <div key={n.id} className={`p-3 rounded-xl flex gap-3 ${n.read ? 'bg-stone-50 dark:bg-stone-900 opacity-60' : 'bg-lyloo-vertPale/20 dark:bg-lyloo-vertPale/10'}`}>
                                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-stone-300' : 'bg-lyloo-orange'}`}></div>
                                        <div>
                                            <h4 className="text-sm font-bold text-lyloo-anthracite dark:text-lyloo-beige leading-tight">{n.title}</h4>
                                            <p className="text-stone-600 dark:text-stone-400 text-[10px] mt-0.5">{n.message}</p>
                                        </div>
                                    </div>
                                )) : <p className="text-center text-xs text-stone-400 py-4">Aucune notification.</p>}
                            </div>
                        </div>
                    )}
                </div>

                {rightAction}
                
                {onMenuClick && (
                  <Tooltip content="Mon Profil" position="bottom" align="end">
                    <button onClick={onMenuClick} className="p-2.5 bg-white/30 backdrop-blur-sm rounded-full hover:bg-white/50 hover:scale-110 transition-all text-lyloo-anthracite dark:text-lyloo-beige shadow-sm">
                      <User size={22} />
                    </button>
                  </Tooltip>
                )}
             </div>
         </div>

         {/* Bottom Row: Conditional Layout - Hides on scroll */}
         <div 
            className={`absolute bottom-0 w-full left-0 right-0 h-32 md:h-40 pointer-events-none flex items-center justify-center transition-all duration-500 origin-bottom ${isScrolled ? 'opacity-0 scale-y-0' : 'opacity-100 scale-y-100'}`}
         >
             <div className="relative w-full max-w-5xl mx-auto px-4">
                 
                 {/* Layout WITH Icon (Standard Pages) */}
                 {Icon ? (
                    <div className="flex w-full items-center">
                        {/* Left Column: 2/5 width, right justified */}
                        <div className="w-[40%] flex justify-end pr-4 md:pr-8">
                             <div className="text-lyloo-anthracite dark:text-lyloo-beige drop-shadow-sm opacity-90">
                                 <Icon size={90} color="currentColor" />
                             </div>
                        </div>

                        {/* Right Column: 3/5 width, left justified */}
                        <div className="w-[60%] flex flex-col items-start text-left">
                            {title && <h1 className="text-3xl sm:text-4xl md:text-6xl font-secondary font-bold text-lyloo-anthracite dark:text-lyloo-beige leading-none drop-shadow-sm">{title}</h1>}
                            {subtitle && (
                                <p className={`font-playful text-lyloo-anthracite dark:text-lyloo-beige mt-1 whitespace-nowrap overflow-hidden text-ellipsis w-full ${subtitleClassName}`}>
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                 ) : (
                    /* Layout WITHOUT Icon (Home Page) - Centered */
                    <div className="w-full flex flex-col items-center text-center pb-4">
                        {title && <h1 className="text-4xl md:text-6xl font-secondary font-bold text-lyloo-anthracite dark:text-lyloo-beige leading-none drop-shadow-sm">{title}</h1>}
                        {subtitle && <p className="text-2xl md:text-3xl font-playful italic text-lyloo-anthracite/80 dark:text-lyloo-beige/80 mt-1 tracking-wide">{subtitle}</p>}
                    </div>
                 )}

             </div>
         </div>
       </div>
    </div>
  );
};

export const WellnessCardImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  category?: string;
}> = ({ src, alt, className = "", category }) => {
  const [error, setError] = useState(false);
  const hasImage = src && src.trim().length > 0;

  return (
    <div className={`relative overflow-hidden bg-stone-100 group ${className}`}>
      {hasImage && !error ? (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover relative z-0 transition-transform duration-700 ease-in-out group-hover:scale-105" 
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-lyloo-beige to-white p-4 text-center relative z-0">
           <div className="opacity-20 flex items-center justify-center transform scale-150">
             <LylooIcon className="w-24 h-24 text-lyloo-anthracite" />
           </div>
        </div>
      )}
      
      {/* Subtle Overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none z-10" />

      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center opacity-25">
         <LylooIcon className="w-1/2 h-1/2 text-white drop-shadow-md" />
      </div>
    </div>
  );
};
