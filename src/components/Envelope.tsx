import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Letter } from '../types';

interface EnvelopeProps {
  letter: Letter;
  isOpened: boolean;
  isRead: boolean;
  onOpen: () => void;
}

export default function Envelope({ letter, isOpened, isRead, onOpen }: EnvelopeProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Mouse Move Event for 3D Tilt Effect (Awwwards Style)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isOpened || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Relative coordinates (-0.5 to 0.5)
    const relX = (e.clientX - rect.left) / width - 0.5;
    const relY = (e.clientY - rect.top) / height - 0.5;
    
    setTilt({
      x: relX * 18, // Max rotation angle
      y: relY * -18
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div 
      className="relative w-64 h-44 sm:w-72 sm:h-48 flex items-center justify-center m-4"
      id={`envelope-container-${letter.id}`}
    >
      {/* Interactive Envelope Body */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={!isOpened ? onOpen : undefined}
        className={`relative w-full h-full rounded-lg bg-gradient-to-br ${letter.envelopeBg} border p-4 shadow-xl cursor-pointer select-none overflow-hidden flex flex-col justify-between`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
          boxShadow: isOpened
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            : `0 ${15 + tilt.y * 0.5}px ${30 + Math.abs(tilt.x) * 0.5}px rgba(0,0,0,0.45)`,
          transition: isOpened ? 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)' : 'transform 0.1s ease-out, box-shadow 0.1s ease-out'
        }}
        whileHover={!isOpened ? { scale: 1.04 } : {}}
      >
        {/* Envelope Paper Backside Lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none border border-current m-2 rounded" />
        
        {/* Envelope Flap triangular lines */}
        {!isOpened && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="0" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1.5" />
            <line x1="100%" y1="0" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        )}

        {/* Top/Header Info inside the Envelope */}
        <div className="relative z-10 flex flex-col gap-1">
          <div className="text-[10px] uppercase tracking-widest opacity-60 font-mono">
            {letter.styleName}
          </div>
          <div className="text-sm font-serif font-medium tracking-wide">
            Inspirado en
          </div>
          <div className="text-base font-serif font-bold tracking-wider text-gold-custom">
            {letter.author}
          </div>
        </div>

        {/* Read State Indicator */}
        {isRead && !isOpened && (
          <div className="absolute top-4 right-4 text-[9px] font-mono border border-gold-custom/30 text-gold-custom/80 px-1.5 py-0.5 rounded uppercase tracking-wider bg-black/40">
            Leído
          </div>
        )}

        {/* Centered Wax Seal (Visual Climax of Envelope) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20">
          <div className="relative w-14 h-14 flex items-center justify-center">
            
            {/* Crackable Wax Seal halves */}
            <motion.div
              className={`absolute inset-y-0 left-0 w-7 rounded-l-full overflow-hidden flex items-center justify-end pr-[1px] ${letter.sealBg} border border-r-0 border-white/10`}
              style={{ transformOrigin: 'left center' }}
              animate={isOpened ? {
                rotateY: -110,
                x: -12,
                opacity: 0
              } : {
                rotateY: 0,
                x: 0,
                opacity: 1
              }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
              {/* Inner seal circle part */}
              <div 
                className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center shrink-0"
                style={{
                  background: `radial-gradient(circle, ${letter.sealColor} 60%, rgba(0,0,0,0.3) 100%)`,
                  transform: 'translateX(20px)'
                }}
              >
                <span className="text-xl select-none">{letter.sealSymbol}</span>
              </div>
            </motion.div>

            <motion.div
              className={`absolute inset-y-0 right-0 w-7 rounded-r-full overflow-hidden flex items-center justify-start pl-[1px] ${letter.sealBg} border border-l-0 border-white/10`}
              style={{ transformOrigin: 'right center' }}
              animate={isOpened ? {
                rotateY: 110,
                x: 12,
                opacity: 0
              } : {
                rotateY: 0,
                x: 0,
                opacity: 1
              }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
              {/* Inner seal circle part */}
              <div 
                className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center shrink-0"
                style={{
                  background: `radial-gradient(circle, ${letter.sealColor} 60%, rgba(0,0,0,0.3) 100%)`,
                  transform: 'translateX(-20px)'
                }}
              >
                {/* empty, matched with left side */}
              </div>
            </motion.div>

            {/* Glowing Wax Reflection on Hover */}
            {!isOpened && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none mix-blend-overlay hover:scale-110 transition-transform duration-300" />
            )}
          </div>
        </div>

        {/* Bottom Sender Seal Text */}
        <div className="relative z-10 flex justify-between items-center text-[10px] font-serif tracking-[0.1em] opacity-40">
          <span>{letter.id.toUpperCase()}-SEAL-Nº {184 + letter.id.charCodeAt(0)}</span>
          <span>100% CERA</span>
        </div>

        {/* Vintage Postmark Stamp Effect */}
        <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full border border-current opacity-[0.08] flex items-center justify-center text-[7px] font-mono uppercase rotate-12 pointer-events-none select-none">
          <div className="text-center">
            <span>PARIS</span>
            <br />
            <span>1885</span>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
