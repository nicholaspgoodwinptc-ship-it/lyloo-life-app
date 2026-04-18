
import React, { useState, useEffect } from 'react';
import { WellnessCardImage } from './LayoutComponents';
import { Activity } from '../../types';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
    items: any[];
    onItemClick: (item: any) => void;
    renderItem?: (item: any, isActive: boolean) => React.ReactNode;
    autoPlayInterval?: number;
    className?: string;
}

export const Carousel: React.FC<CarouselProps> = ({ items, onItemClick, renderItem, autoPlayInterval = 6000, className = "" }) => {
    const [index, setIndex] = useState(0);

    // Auto-scroll (slower)
    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => prev + 1);
        }, autoPlayInterval);
        return () => clearInterval(interval);
    }, [autoPlayInterval]);

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIndex((prev) => prev - 1);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIndex((prev) => prev + 1);
    };

    // Calculate effective indices for an infinite loop feel
    const getEffectiveItem = (offset: number) => {
        let i = (index + offset) % items.length;
        if (i < 0) i += items.length;
        return items[i];
    };

    // Expanded positions to ensure smooth entry/exit at the edges
    const positions = [-3, -2, -1, 0, 1, 2, 3];

    return (
        <div className={`relative w-full h-[240px] flex items-center justify-center perspective-[1000px] overflow-hidden ${className}`}>
            
            {/* Scroll Arrows */}
            <button 
                onClick={handlePrev} 
                className="absolute left-2 z-30 p-2 rounded-full bg-white/30 backdrop-blur-md hover:bg-white/60 text-lyloo-anthracite shadow-sm transition-all hover:scale-110"
            >
                <ChevronLeft size={24} />
            </button>
            <button 
                onClick={handleNext} 
                className="absolute right-2 z-30 p-2 rounded-full bg-white/30 backdrop-blur-md hover:bg-white/60 text-lyloo-anthracite shadow-sm transition-all hover:scale-110"
            >
                <ChevronRight size={24} />
            </button>

            {positions.map((pos) => {
                const item = getEffectiveItem(pos);
                if (!item) return null;

                // Visual calculations
                const isActive = pos === 0;
                
                // Style transformation
                let xTrans = '0%';
                let scale = 1;
                let zIndex = 0;
                let opacity = 1;
                let blur = '0px';

                // Responsive Transforms: On MD screens, we spread items out more to show 3 clearly
                if (isActive) {
                    xTrans = '0%';
                    scale = 1.1;
                    zIndex = 30;
                    opacity = 1;
                } else if (pos === -1) {
                    // Mobile: -90%, Desktop: -110% (more spread)
                    xTrans = 'calc(-50% - 60px)'; 
                    scale = 0.85;
                    zIndex = 20;
                    opacity = 0.8;
                } else if (pos === 1) {
                    xTrans = 'calc(50% + 60px)';
                    scale = 0.85;
                    zIndex = 20;
                    opacity = 0.8;
                } else if (pos === -2) {
                    xTrans = 'calc(-100% - 80px)';
                    scale = 0.7;
                    zIndex = 10;
                    opacity = 0.4;
                    blur = '2px';
                } else if (pos === 2) {
                    xTrans = 'calc(100% + 80px)';
                    scale = 0.7;
                    zIndex = 10;
                    opacity = 0.4;
                    blur = '2px';
                } else {
                    // Positions -3 and 3 (hidden/fading edge)
                    xTrans = pos < 0 ? 'calc(-100% - 150px)' : 'calc(100% + 150px)';
                    scale = 0.5;
                    zIndex = 0;
                    opacity = 0;
                    blur = '4px';
                }

                return (
                    <div 
                        key={item.id} // Stable key based on content ID to enable CSS transitions
                        onClick={() => pos === 0 && onItemClick(item)}
                        className="absolute transition-all duration-[2000ms] ease-[cubic-bezier(0.25,0.8,0.25,1)] cursor-pointer w-40 md:w-56"
                        style={{
                            transform: `translateX(${xTrans}) scale(${scale})`,
                            zIndex,
                            opacity,
                            filter: `blur(${blur})`,
                        }}
                    >
                        {renderItem ? renderItem(item, isActive) : (
                            <div className="bg-white rounded-[24px] overflow-hidden shadow-lg h-[200px] flex flex-col hover:shadow-xl transition-shadow">
                                <div className="h-[140px] relative">
                                    <WellnessCardImage src={item.imageUrl} alt={item.titre} className="w-full h-full object-cover" />
                                    {isActive && <div className="absolute inset-0 bg-white/10 pointer-events-none" />}
                                </div>
                                <div className="p-3 text-center flex-1 flex flex-col justify-center">
                                    <h4 className="font-bold text-lyloo-anthracite text-xs leading-tight mb-1 line-clamp-2">{item.titre}</h4>
                                    <div className="flex items-center justify-center gap-1 text-[10px] text-stone-500">
                                        <Clock size={10} /> {item.dureeMinutes} min
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
            
            {/* Progression Dots */}
            <div className="absolute bottom-0 flex gap-2">
                {items.slice(0, Math.min(items.length, 10)).map((_, idx) => {
                    const realActiveIndex = ((index % items.length) + items.length) % items.length;
                    return (
                        <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-[2000ms] ${realActiveIndex === idx ? 'bg-lyloo-anthracite w-3' : 'bg-stone-300'}`}
                        />
                    );
                })}
            </div>
        </div>
    );
};
