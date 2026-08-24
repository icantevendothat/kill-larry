"use client";

import { useState, useEffect, useRef } from 'react';

const Particle = ({ x, y, color }: { x: number; y: number; color: string }) => {
  const [pos, setPos] = useState({ x, y });
  const [isDead, setIsDead] = useState(false);
  const velocity = useRef({
    x: (Math.random() - 0.5) * 14,
    y: (Math.random() - 0.5) * 14,
  });
  const lifeSpan = useRef(0);
  const maxLife = 40 + Math.random() * 30;

  useEffect(() => {
    if (isDead) return;
    const timer = setInterval(() => {
      lifeSpan.current += 1;
      setPos((prev) => ({
        x: prev.x + velocity.current.x,
        y: prev.y + velocity.current.y + (lifeSpan.current * 0.05),
      }));
      if (lifeSpan.current > maxLife) {
        setIsDead(true);
        clearInterval(timer);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isDead]);

  return (
    <div
      style={{
        left: pos.x,
        top: pos.y,
        backgroundColor: color,
        width: '3px',
        height: '3px',
        position: 'fixed',
        zIndex: 41,
        pointerEvents: 'none',
      }}
    />
  );
};

const LarryTarget = () => {
  const [pos, setPos] = useState({ x: 50, y: 150 });
  const [isKilled, setIsKilled] = useState(false);
  const [allParticles, setAllParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [direction, setDirection] = useState({ x: 1.5, y: 1.0 });
  const [isFlipped, setIsFlipped] = useState(false);
  const requestRef = useRef<number | null>(null);

  const handleKill = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (isKilled) return;
    setIsKilled(true);
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: Date.now() + i,
      x: pos.x + 24,
      y: pos.y + 24,
    }));
    setAllParticles(prev => [...prev, ...newParticles]);
  };

  useEffect(() => {
    if (isKilled) return;
    const animate = () => {
      setPos((prev) => {
        let nextX = prev.x + direction.x;
        let nextY = prev.y + direction.y;
        let nextDirX = direction.x;
        let nextDirY = direction.y;

        const maxX = typeof window !== 'undefined' ? window.innerWidth - 48 : 300;
        const maxY = typeof window !== 'undefined' ? window.innerHeight - 180 : 500;

        if (nextX <= 0 || nextX >= maxX) {
          nextDirX *= -1;
          setDirection((d) => ({ ...d, x: nextDirX }));
        }
        if (nextY <= 80 || nextY >= maxY) {
          nextDirY *= -1;
          setDirection((d) => ({ ...d, y: nextDirY }));
        }
        setIsFlipped(nextDirX > 0);
        return { x: nextX, y: nextY };
      });
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [direction, isKilled]);

  return (
    <>
      {!isKilled && (
        <div
          onClick={handleKill}
          onTouchStart={handleKill}
          style={{
            left: pos.x,
            top: pos.y,
            position: 'fixed',
            zIndex: 5,
            transform: `scaleX(${isFlipped ? -1 : 1})`,
            filter: 'invert(1)',
            touchAction: 'none',
          }}
        >
          <img src="/killlarry.gif" alt="target" className="w-12 h-auto select-none" />
        </div>
      )}
      {allParticles.map((p) => (
        <Particle key={p.id} x={p.x} y={p.y} color="#FF0000" />
      ))}
    </>
  );
};

const FloatingImage = ({ id, delay, initialPos, src, startTimer }: { id: number; delay: number; initialPos: { top: string; left: string }; src: string; startTimer: boolean }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const showTimer = setTimeout(() => setHasLoaded(true), delay);
    const hideTimer = setTimeout(() => setHasLoaded(false), 3000);

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
    const timer = setTimeout(() => setIsVisible(false), 1000);
    setHoverTimer(timer);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsVisible(!isVisible)}
      style={{ top: initialPos.top, left: initialPos.left }}
      className="fixed z-[50] group pointer-events-auto"
    >
      <div className="relative h-24 md:h-48 flex items-center justify-center min-w-[80px] md:min-w-[120px]">
        <img
          src={src}
          alt={`Gallery ${id}`}
          className={`h-full w-auto object-contain shadow-2xl transition-all duration-300 ease-out transform ${hasLoaded || isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        />
      </div>
    </div>
  );
};

const ScrambledLetter = ({ targetLetter, isSpace }: { targetLetter: string; isSpace?: boolean }) => {
  const [currentLetter, setCurrentLetter] = useState(targetLetter);

  useEffect(() => {
    if (isSpace) return;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    const interval = setInterval(() => {
      setCurrentLetter(chars[Math.floor(Math.random() * chars.length)]);
    }, 50);

    const randomDelay = 800 + Math.random() * 2000;

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setCurrentLetter(targetLetter);
    }, randomDelay);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [targetLetter, isSpace]);

  if (isSpace) return <span className="w-[10vw]"></span>;
  return <span>{currentLetter}</span>;
};


export default function Home() {
  const [activeStation, setActiveStation] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalHasBeenClosed, setModalHasBeenClosed] = useState(false);
  const [scatteredImages, setScatteredImages] = useState<{src: string; top: string; left: string}[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stations: Record<number, { name: string; url: string; duration: number }> = {
    1: { name: "JASWIRY", url: "/audio/jasradio.mp3", duration: 1478 },
    2: { name: "HAWA", url: "/audio/hawaradio.mp3", duration: 2338 }
  };

  const titleConfig = [
    { char: 'K', space: false },
    { char: 'I', space: false },
    { char: 'L', space: false },
    { char: 'L', space: false },
    { char: ' ', space: true },
    { char: 'L', space: false },
    { char: 'A', space: false },
    { char: 'R', space: false },
    { char: 'R', space: false },
    { char: 'Y', space: false },
  ];

  useEffect(() => {
    const imageNames = ['Screenshot 2026-01-30 at 11.01.03 PM 1.png', 'draft2 1.png', 'Screenshot 2026-01-30 at 11.21.41 PM 1.png', 'Screenshot 2026-01-30 at 11.24.15 PM 1 1.png', 'Screenshot 2026-01-30 at 11.25.07 PM 1.png', 'Screenshot 2026-01-30 at 11.25.20 PM 1.png', 'Screenshot 2026-01-30 at 11.26.55 PM 1.png', 'Screenshot 2026-01-30 at 11.30.17 PM 1.png', 'Screenshot 2026-01-30 at 11.31.09 PM 1.png'];    setScatteredImages(imageNames.map(name => ({
      src: `/gallery/${name}`,
      top: `${Math.random() * 50 + 15}%`,
      left: `${Math.random() * 50 + 10}%`,
    })));
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (activeStation !== null) {
      const station = stations[activeStation];
      const audio = new Audio(station.url);
      const referenceDate = new Date('2026-01-01T00:00:00Z').getTime() / 1000;
      const now = Date.now() / 1000;
      const secondsSinceStart = now - referenceDate;
      const syncPosition = secondsSinceStart % station.duration;

      audio.currentTime = syncPosition;
      audio.loop = true;
      audio.play().catch((err) => {
        console.error("Autoplay blocked. Most browsers require a click first.", err);
      });
      audioRef.current = audio;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [activeStation]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalHasBeenClosed(true);
  };

  return (
    <main className="flex flex-col h-[100dvh] justify-between font-sans font-bold overflow-hidden bg-black text-white relative" style={{ cursor: 'url("/larry.cur"), auto' }}>

      <LarryTarget />

      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 pointer-events-auto">
          <div className="bg-[#EE83B5] border-2 border-red-600 p-6 md:p-8 max-w-md w-full relative">
            <p className="text-red-600 text-[10px] md:text-sm font-normal uppercase tracking-tight leading-relaxed mb-8">
              STREAM KILL LARRY ARTISTS BELOW:
            </p>
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-red-600 hover:text-zinc-900 transition-colors p-2 text-xl leading-none font-bold"
              aria-label="Close modal"
            >
              ✕
            </button>
            <div className="flex flex-col gap-3">
              <a
                href="https://open.spotify.com/artist/1fGZCYZpR1kUczhB55AJaW"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCloseModal}
                className="w-full py-2 bg-[#EE83B5] text-red-600 border border-red-600 font-light uppercase hover:bg-zinc-900 transition-colors text-center cursor-pointer"
              >
                JASWIRY
              </a>
              <a
                href="https://ffm.bio/hawa"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCloseModal}
                className="w-full py-2 bg-[#EE83B5] text-red-600 border border-red-600 font-light uppercase hover:bg-zinc-900 transition-colors text-center cursor-pointer"
              >
                HAWA
              </a>
            </div>
          </div>
        </div>
      )}

      {scatteredImages.map((img, index) => (
        <FloatingImage
          key={index}
          id={index + 1}
          initialPos={{ top: img.top, left: img.left }}
          src={img.src}
          delay={index * 50}
          startTimer={modalHasBeenClosed}
        />
      ))}

      <div className="w-full flex flex-col justify-start absolute top-0 left-0 z-[40] pointer-events-none px-2">
        <h1 className="w-full flex justify-between items-start text-[18vw] md:text-[19.5vw] leading-[0.5] uppercase transform scale-y-[3.5] md:scale-y-[4] origin-top select-none mt-[-1vw] md:mt-[-2vw]">
          {titleConfig.map((item, index) => (
             <ScrambledLetter 
               key={index} 
               targetLetter={item.char} 
               isSpace={item.space} 
             />
          ))}
        </h1>

        {/* Mobile: Stream button anchored below title */}
        <div className="mt-[36vw] md:mt-[16vw] flex flex-col items-start md:items-end md:text-right md:pr-11 z-50">
          <button
            onClick={() => setIsModalOpen(true)}
            className="md:hidden pointer-events-auto w-full h-12 bg-black flex items-center justify-between px-4 border border-red-600"
          >
            <span className="text-red-600 font-normal uppercase text-[10px]">STREAM KILL LARRY ARTISTS</span>
            <span className="text-red-600 font-bold text-lg">+</span>
          </button>

          {/* Desktop: Artist management text */}
          <p className="hidden md:block text-red-600 text-lg font-normal uppercase tracking-tight">
            ARTIST MANAGEMENT, ETC
          </p>
        </div>
      </div>

      {/* Mobile: flex-1 spacer that pushes artist mgmt text to bottom of black area */}
      <div className="flex-1 flex md:hidden flex-col justify-end pointer-events-none z-[40] px-3 pb-2">
        <p className="text-red-600 text-[10px] font-normal uppercase tracking-tight">
          ARTIST MANAGEMENT, ETC
        </p>
      </div>

      {/* Desktop spacer */}
      <div className="hidden md:block flex-grow"></div>

      {/* Mobile footer */}
      <div className="flex md:hidden flex-col w-full bg-[#EE83B5] p-4 z-[10] relative pointer-events-auto border-t-2 border-red-600">
        <div className="flex justify-between items-center w-full mb-3">
          <p className="text-red-600 text-[10px] font-bold uppercase">Listen Here</p>
          <a href="mailto:info@kill-larry.com" className="text-red-600 text-[10px] font-normal uppercase underline">CONTACT</a>
        </div>
        <div className="flex flex-col gap-2 w-full">
          {[1, 2].map((num) => (
            <button
              key={num}
              onClick={() => setActiveStation(prev => (prev === num ? null : num))}
              className={`w-full h-11 bg-black flex items-center justify-between px-4 border border-red-600 transition-all ${activeStation === num ? 'ring-2 ring-red-600' : ''}`}
            >
              <span className="text-red-600 font-bold">{num}</span>
              <span className="text-red-600 font-normal uppercase text-[10px]">{stations[num].name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop footer */}
      <div className="hidden md:flex w-full bg-[#EE83B5] border-b-[4px] border-red-600 pt-40 pb-4 px-10 z-[10] relative items-end pointer-events-auto">
        <div className="w-full flex flex-row items-end justify-between pb-0">
          <div className="flex flex-row items-end mb-0 gap-4 pb-1">
            <div className="flex gap-2">
              {[1, 2].map((num) => (
                <button
                  key={num}
                  onClick={() => setActiveStation(prev => (prev === num ? null : num))}
                  className={`w-12 h-12 bg-black flex items-center justify-center transition-all group ${activeStation === num ? 'border-[4px] border-red-600' : 'border border-red-600 hover:bg-zinc-900'}`}
                >
                  <span className="text-red-600 font-bold text-lg">{num}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-col leading-none mb-1">
              <span className="text-red-600 text-[10px] font-bold uppercase tracking-tight leading-none mb-1">
                {activeStation ? "NOW PLAYING" : ""}
              </span>
              <span className="text-red-600 text-lg font-normal uppercase tracking-normal leading-none">
                {activeStation ? stations[activeStation].name : "LISTEN HERE"}
              </span>
            </div>
          </div>
          <div className="bg-black px-4 py-2 border border-red-600 mx-4 w-[550px] flex items-center justify-between mb-0">
            <div className="flex items-center gap-3 w-full justify-between">
              <p className="text-red-600 text-sm font-normal uppercase tracking-tight">STREAM KILL LARRY ARTISTS</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-4 h-4 rounded-full border border-red-600 text-red-600 text-[10px] flex items-center justify-center hover:bg-red-600 hover:text-black transition-all font-bold flex-shrink-0"
              >
                +
              </button>
            </div>
          </div>
          <a href="mailto:info@kill-larry.com" className="text-red-600 text-lg font-normal uppercase tracking-normal hover:text-red-800 transition-colors mb-0 pb-1">Contact</a>
        </div>
      </div>

    </main>
  );
}