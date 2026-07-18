import React from 'react';
import { motion } from 'motion/react';

interface KeepsakeBoxProps {
  isOpen: boolean;
  onOpen: () => void;
}

export default function KeepsakeBox({ isOpen, onOpen }: KeepsakeBoxProps) {
  return (
    <div className="flex flex-col items-center justify-center select-none" id="keepsake-box-container">
      {/* 3D Perspective Wrapper */}
      <div 
        className="relative w-72 h-48 sm:w-96 sm:h-64 cursor-pointer"
        style={{ perspective: '1200px' }}
        onClick={!isOpen ? onOpen : undefined}
      >
        {/* The Entire Box Wrapper */}
        <div className="relative w-full h-full transition-transform duration-700 preserve-3d">
          
          {/* Lid (Top Half) */}
          <motion.div
            className="absolute top-0 left-0 w-full h-24 sm:h-28 z-30 transform-gpu"
            style={{ 
              transformOrigin: 'top center',
              transformStyle: 'preserve-3d'
            }}
            animate={isOpen ? {
              rotateX: -110,
              y: -15,
              z: -40,
              scaleY: 0.95
            } : {
              rotateX: 0,
              y: 0,
              z: 0,
              scaleY: 1
            }}
            transition={{ type: 'spring', stiffness: 70, damping: 15 }}
          >
            {/* Front of Lid */}
            <div className="absolute inset-0 bg-stone-850 border-4 border-stone-900 rounded-t-xl shadow-2xl flex flex-col items-center justify-center overflow-hidden">
              {/* Wood Grain Texture Simulation */}
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[repeating-linear-gradient(90deg,#5c3d24,#5c3d24_10px,#3d2514_10px,#3d2514_20px)]" />
              <div className="absolute inset-x-2 bottom-0 h-[2px] bg-gold-custom/30" />
              
              {/* Golden Ornaments & Corner Brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-gold-custom/60 rounded-tl-md" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-gold-custom/60 rounded-tr-md" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-gold-custom/60 rounded-bl-md" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-gold-custom/60 rounded-br-md" />

              {/* Antique Brass Plaque */}
              <div className="relative z-10 px-4 py-2 border border-gold-custom/40 bg-gradient-to-b from-wine-custom/40 to-stone-950/60 backdrop-blur-sm rounded shadow-inner text-center max-w-[85%]">
                <div className="text-[10px] sm:text-xs font-serif uppercase tracking-[0.15em] text-gold-custom font-semibold">
                  Para Fer ❤
                </div>
                <div className="w-12 h-[1px] bg-gold-custom/50 mx-auto my-1" />
                <div className="text-[9px] sm:text-[10px] italic text-gold-custom/70">
                  "Algunas personas llegan para quedarse..."
                </div>
              </div>
            </div>
            
            {/* Inner Side of Lid (Visible when opened) */}
            <div 
              className="absolute inset-0 bg-stone-900 border-4 border-stone-950 rounded-t-xl overflow-hidden backface-hidden"
              style={{ transform: 'rotateX(180deg)' }}
            >
              <div className="absolute inset-2 bg-rose-950/40 border border-wine-custom/30 rounded shadow-inner flex items-center justify-center">
                <span className="font-serif text-xs text-gold-custom/40 italic">Feliz cumpleaños, Fer</span>
              </div>
            </div>
          </motion.div>

          {/* Box Base (Bottom Half) */}
          <div className="absolute bottom-0 left-0 w-full h-32 sm:h-36 z-10 bg-stone-900 border-4 border-stone-950 rounded-b-xl shadow-2xl overflow-hidden">
            {/* Wood Grain Texture Simulation */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[repeating-linear-gradient(90deg,#5c3d24,#5c3d24_10px,#3d2514_10px,#3d2514_20px)]" />
            
            {/* Metal Corners */}
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-gold-custom/60 rounded-bl-md" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-gold-custom/60 rounded-br-md" />
            
            {/* Velvet Interior Cushioning (Visible when open) */}
            <div className="absolute inset-1.5 bg-gradient-to-b from-rose-950 to-stone-950 rounded-md shadow-inner flex flex-col justify-end p-2 border border-rose-900/40">
              
              {/* Box Lock Keyhole */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-b from-gold-custom to-amber-700 rounded-b-md flex items-center justify-center shadow z-20">
                <div className="w-1.5 h-4 bg-stone-950 rounded-full" />
              </div>
              
              {/* Velvet Shadows */}
              <div className="absolute inset-0 bg-radial-vignette opacity-70 pointer-events-none" />
              
              {!isOpen && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-4 animate-pulse">
                  <span className="text-[10px] sm:text-xs font-serif text-gold-custom/80 uppercase tracking-[0.2em]">
                    Toca para abrir
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Box Placement Shadow */}
      <div className="w-72 h-4 sm:w-80 bg-black/70 rounded-full filter blur-md -mt-2 opacity-80" />

      {/* Floating Gentle Message under the Box */}
      {!isOpen && (
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.2 }}
          className="text-center mt-8 px-6 text-sm sm:text-base font-serif text-gold-custom/95 max-w-sm leading-relaxed"
        >
            "Aunque el océano nos separe, mi corazón viaja hasta ti. Feliz cumpleaños, Fernanda."
        </motion.p>
      )}
    </div>
  );
}
