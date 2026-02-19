"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

// --- Floating Image Component ---
const FloatingImage = ({ id, delay, initialPos, src }: { id: number, delay: number, initialPos: { top: string, left: string, rotate: string }, src: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const showTimer = setTimeout(() => setHasLoaded(true), delay);
    const hideTimer = setTimeout(() => setHasLoaded(false), delay + 3000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [delay]);

  const handleMouseEnter = () => {
    if (hoverTimer) clearTimeout(hoverTimer);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    const timer = setTimeout(() => setIsVisible(false), 3000);
    setHoverTimer(timer);
  };

  return (
    <div
      style={{ 
        top: initialPos.top, 
        left: initialPos.left,
        transform: `rotate(${initialPos.rotate})` 
      }}
      className="fixed z-30 cursor-crosshair group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative h-48 flex items-center justify-center min-w-[120px]">
        <img 
          src={src} 
          alt={`Gallery ${id}`} 
          className={`
            h-48 w-auto object-contain shadow-2xl transition-all 
            duration-150 ease-out transform
            ${hasLoaded || isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
          `} 
        />
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function Home() {
  const [activeStation, setActiveStation] = useState<number | null>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scatteredImages, setScatteredImages] = useState<{src: string, top: string, left: string}[]>([]);

  useEffect(() => {
    const imageNames = [
      'Screenshot 2026-01-30 at 11.01.03 PM 1.png', 
      'draft2 1.png', 
      'Screenshot 2026-01-30 at 11.21.41 PM 1.png', 
      'Screenshot 2026-01-30 at 11.24.15 PM 1 1.png', 
      'Screenshot 2026-01-30 at 11.25.07 PM 1.png', 
      'Screenshot 2026-01-30 at 11.25.20 PM 1.png', 
      'Screenshot 2026-01-30 at 11.26.55 PM 1.png', 
      'Screenshot 2026-01-30 at 11.30.17 PM 1.png', 
      'Screenshot 2026-01-30 at 11.31.09 PM 1.png'
    ];
    
    const generatedData = imageNames.map((name) => ({
      src: `/gallery/${name}`,
      top: `${Math.random() * 60 + 10}%`, 
      left: `${Math.random() * 70 + 10}%`, 
    }));
    
    setScatteredImages(generatedData);
  }, []);

  return (
    <main className="flex flex-col h-screen justify-between font-sans font-bold overflow-hidden bg-black text-white relative">

      {/* --- Cookie Info Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 pointer-events-auto">
          <div className="bg-black border-2 border-red-600 p-8 max-w-md w-full relative">
            <h2 className="text-red-600 text-2xl font-black uppercase tracking-tighter mb-4">SYSTEM INFO</h2>
            <p className="text-red-600 text-sm font-normal uppercase tracking-tight leading-relaxed mb-6">
              THIS TERMINAL INTERFACE USES COOKIES TO STORE STATION FREQUENCIES AND SESSION DATA. NO DATA IS HARVESTED FOR LARRY.
            </p>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="w-full py-2 bg-red-600 text-black font-black uppercase hover:bg-red-700 transition-colors"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* --- Scattered Images Layer --- */}
      {scatteredImages.map((img, index) => (
        <FloatingImage 
          key={index} 
          id={index + 1} 
          initialPos={{ top: img.top, left: img.left }} 
          src={img.src}
          delay={index * 50}  /* Reduced delay for faster pop-up */
        />
      ))}

      {/* --- Title Section --- */}
      <div className="w-full flex flex-col justify-start absolute top-0 left-0 w-full z-20 pointer-events-none">
        <h1 className="w-full flex justify-between items-start text-[18.5vw] leading-[0.6] uppercase transform scale-y-[4] origin-top select-none px-2 mt-[-2vw]">
          <span>K</span><span>I</span><span>L</span><span>L</span>
          <span className="w-[10vw]"></span>
          <span>L</span><span>A</span><span>R</span><span>R</span><span>Y</span>
        </h1>
      </div>

      <div className="flex-grow"></div>

      {/* --- Pink Strip Footer --- */}
      <div className="w-full bg-[#EE83B5] border-b-[4px] border-red-600 pt-40 pb-5 px-4 sm:px-10 z-10 relative flex items-end pointer-events-auto">
        <div className="w-full flex flex-row items-end justify-between pb-0">

          <div className="flex flex-row items-end mb-0 gap-4 pb-1">
            <div className="flex gap-2">
              {[1, 2].map((num) => (
                <button 
                  key={num}
                  onClick={() => setActiveStation(num)}
                  className={`w-12 h-12 bg-black flex items-center justify-center transition-all group ${activeStation === num ? 'border-[4px] border-red-600' : 'border border-red-600 hover:bg-zinc-900'}`}
                >
                  <span className="text-red-600 font-bold text-lg">{num}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col leading-none mb-1">
              <span className="text-red-600 text-[7px] uppercase tracking-normal font-bold">Now Playing</span>
              <span className="text-red-600 text-lg font-normal uppercase tracking-normal leading-none">
                {activeStation === 1 ? "JASWIRY" : "HAWA"}
              </span>
            </div>
          </div>

          <div className="bg-black px-4 py-2 border border-red-600 mx-4 w-[550px] flex items-center justify-between mb-0">
            <div className="flex items-center gap-2">
              <p className="text-red-600 text-sm font-normal uppercase tracking-tight">THIS SITE COLLECTS COOKIES.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-4 h-4 rounded-full border border-red-600 text-red-600 text-[10px] flex items-center justify-center hover:bg-red-600 hover:text-black transition-all font-bold"
              >
                i
              </button>
            </div>
            <div className="flex gap-3 text-red-600 text-[12px] leading-tight uppercase underline tracking-tight">
              <button className="hover:text-white transition-colors">AGREE</button>
              <button className="hover:text-white transition-colors">DISAGREE</button>
            </div>
          </div>

          <a 
            href="mailto:contact@killlarry.com?subject=STATION%20FEEDBACK"
            className="text-red-600 text-lg font-normal uppercase tracking-normal hover:text-red-800 transition-colors mb-0 pb-1 cursor-pointer"
          >
            Contact
          </a>
        </div>
      </div>
    </main>
  );
}