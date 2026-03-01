import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, Car } from 'lucide-react';

// Using a high-quality abstract map background
const MAP_BG = "https://imgs.search.brave.com/5yX32D7tXq4d3J2C4G3fK_yB4X6n5m7L8k9J0h1g2f3/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS12ZWN0b3Iv/Y2l0eS1tYXAtbmF2/aWdhdGlvbi1kZXNp/Z24tYWJzdHJhY3Qt/YmFja2dyb3VuZF85/MTkyOC00MDcuanBn/P3NpemU9NjI2JmV4/dD1qcGc";

export const MapVisualization: React.FC<{
  showPickup?: boolean;
  showDropoff?: boolean;
  isDriver?: boolean;
  status?: string;
}> = ({ showPickup = true, showDropoff = false, isDriver = false, status }) => {
  const [nearbyCars, setNearbyCars] = useState<{top: number, left: number, rot: number}[]>([]);

  useEffect(() => {
    // Generate random nearby cars
    const cars = Array.from({ length: 4 }).map(() => ({
      top: 30 + Math.random() * 40,
      left: 20 + Math.random() * 60,
      rot: Math.random() * 360
    }));
    setNearbyCars(cars);
    
    // Simulate movement
    const interval = setInterval(() => {
      setNearbyCars(prev => prev.map(c => ({
        ...c,
        top: c.top + (Math.random() - 0.5) * 2,
        left: c.left + (Math.random() - 0.5) * 2,
        rot: c.rot + (Math.random() - 0.5) * 20
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full bg-slate-200 dark:bg-slate-900 overflow-hidden transition-colors duration-300">
      {/* Map Background Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-80 dark:opacity-50 dark:filter dark:invert transition-all duration-300"
        style={{ backgroundImage: `url(${MAP_BG})`, filter: 'grayscale(0.2)' }}
      />
      
      {/* Dark Overlay for better contrast in dark mode */}
      <div className="absolute inset-0 bg-transparent dark:bg-black/30 pointer-events-none transition-colors duration-300"></div>
      
      {/* Animated Pulse for User Location */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="relative">
          <div className="absolute -inset-4 bg-wobio-500/30 rounded-full animate-ping"></div>
          <div className="absolute -inset-8 bg-wobio-500/10 rounded-full animate-pulse"></div>
          <div className="bg-white dark:bg-slate-800 p-1 rounded-full shadow-lg border-2 border-wobio-500 z-20 relative transition-colors">
             {isDriver ? <Navigation className="w-6 h-6 text-wobio-600 fill-current" /> : <div className="w-4 h-4 bg-wobio-600 rounded-full" />}
          </div>
        </div>
      </div>

      {/* Nearby Cars (Simulated) */}
      {!isDriver && nearbyCars.map((car, i) => (
        <div 
          key={i}
          className="absolute transition-all duration-[2000ms] ease-in-out z-0"
          style={{ top: `${car.top}%`, left: `${car.left}%`, transform: `rotate(${car.rot}deg)` }}
        >
          <Car className="w-5 h-5 text-slate-700 dark:text-slate-200 fill-slate-800 dark:fill-slate-300" />
        </div>
      ))}

      {/* Pickup Marker */}
      {showPickup && (
        <div className="absolute top-[42%] left-[48%] animate-bounce z-20">
             <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs px-2 py-1 rounded shadow mb-1 whitespace-nowrap font-bold">Pickup</div>
             <MapPin className="w-8 h-8 text-slate-900 dark:text-white mx-auto drop-shadow-md" fill="currentColor" />
        </div>
      )}

      {/* Dropoff Marker */}
      {showDropoff && (
        <div className="absolute top-[30%] left-[65%] z-20">
             <div className="bg-wobio-600 text-white text-xs px-2 py-1 rounded shadow mb-1 whitespace-nowrap">Destination</div>
             <MapPin className="w-8 h-8 text-wobio-600 mx-auto drop-shadow-md" fill="currentColor" />
        </div>
      )}

      {/* Route Line Simulation (SVG Overlay) */}
      {showDropoff && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <path 
            d="M 180 350 Q 250 300 240 250 T 260 220" 
            fill="none" 
            stroke="#1877F2" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeDasharray="10,5"
            className="animate-pulse"
          />
        </svg>
      )}
    </div>
  );
};