import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface StarrySkyProps {
  onOpenLastLetter: () => void;
}

export default function StarrySky({ onOpenLastLetter }: StarrySkyProps) {
  const [showQuote, setShowQuote] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Staggered reveal of cinematic elements
    const quoteTimer = setTimeout(() => setShowQuote(true), 3000);
    const btnTimer = setTimeout(() => setShowButton(true), 6500);

    return () => {
      clearTimeout(quoteTimer);
      clearTimeout(btnTimer);
    };
  }, []);

  // Generate individual background twinkling stars
  const starsArray = Array.from({ length: 120 }, (_, idx) => ({
    id: idx,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    delay: `${Math.random() * 5}s`,
    duration: `${3 + Math.random() * 4}s`
  }));

  return (
    <div className="absolute inset-0 overflow-hidden bg-radial-cosmos flex flex-col items-center justify-center p-6 text-center select-none z-20" id="starry-sky-container">
      {/* 1. Deep Space Twinkling Background Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {starsArray.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white rounded-full animate-pulse opacity-30 shadow-white"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: star.delay,
              animationDuration: star.duration
            }}
          />
        ))}
      </div>

      {/* Nebula ambient colored gases */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-wine-custom/15 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-wine-custom/25 rounded-full filter blur-[150px] pointer-events-none" />

      {/* 2. Constellation "Feliz Cumpleaños" (shimmering starlight paths) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.2, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center gap-1 mb-8"
      >
        {/* Shimmering Sparkles above text */}
        <div className="flex gap-1.5 text-gold-custom opacity-80 animate-bounce">
          <Sparkles size={16} />
          <Sparkles size={24} className="animate-pulse delay-75" />
          <Sparkles size={16} />
        </div>

        {/* Constellation SVG Text - Filled with Twinkling Dots */}
        <div className="relative mt-2">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold font-serif uppercase tracking-[0.18em] bg-gradient-to-b from-amber-50 via-gold-custom to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(212,175,55,0.3)] select-none">
            Feliz Cumpleaños
          </h1>
          {/* Subtle star nodes on the letters for a realistic constellation feel */}
          <div className="absolute top-0 left-4 w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          <div className="absolute bottom-2 right-12 w-1 h-1 bg-gold-custom rounded-full animate-ping delay-500" />
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-white rounded-full animate-ping delay-1000" />
        </div>
      </motion.div>

      {/* 3. The Central Epiphany Phrase */}
      <div className="max-w-xl mx-auto h-24 mb-10 relative z-10 flex items-center justify-center">
        {showQuote && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="text-lg sm:text-xl md:text-2xl italic font-serif text-gold-custom/95 leading-relaxed px-4 text-center filter drop-shadow"
          >
            "No hay distancia que pueda apagar lo que dos corazones deciden construir."
          </motion.p>
        )}
      </div>

      {/* 4. Trigger for the Custom Final Letter */}
      <div className="h-16 relative z-10">
        {showButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenLastLetter}
            className="px-8 py-3.5 bg-gradient-to-r from-wine-custom via-wine-custom/80 to-gold-custom hover:from-wine-custom/90 hover:to-gold-custom text-white font-serif font-bold text-sm tracking-widest uppercase rounded-full shadow-[0_4px_25px_rgba(114,47,55,0.4)] hover:shadow-[0_4px_30px_rgba(114,47,55,0.6)] transition-all duration-300 flex items-center gap-2 border border-gold-custom/30 cursor-pointer"
          >
            <span>Una carta para ti, Fer...</span>
            <ArrowRight size={16} className="animate-pulse" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
