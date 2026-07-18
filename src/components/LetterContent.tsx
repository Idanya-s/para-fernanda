import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool } from 'lucide-react';
import { Letter } from '../types';

interface LetterContentProps {
  letter: Letter;
  onClose: () => void;
}

export default function LetterContent({ letter, onClose }: LetterContentProps) {
  const [displayText, setDisplayText] = useState({
    title: '',
    quote: '',
    poemLines: [] as string[],
    reflection: '',
    dedication: ''
  });

  const [phase, setPhase] = useState<'idle' | 'writing-title' | 'writing-quote' | 'writing-poem' | 'writing-reflection' | 'writing-dedication' | 'finished'>('idle');
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [penPosition, setPenPosition] = useState({ x: 0, y: 0 });
  const textContainerRef = useRef<HTMLDivElement | null>(null);
  const penRef = useRef<HTMLDivElement | null>(null);

  // Speed parameters (ms per character)
  const CHAR_SPEED = 32;
  const REFLECTION_SPEED = 20; // faster for longer prose

  // Typewriter helper
  const typeText = (
    text: string, 
    speed: number, 
    onChar: (typed: string) => void, 
    onComplete: () => void
  ) => {
    let index = 0;
    const interval = setInterval(() => {
      onChar(text.substring(0, index + 1));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
        onComplete();
      }
    }, speed);
    return interval;
  };

  // Orchestrate the calligraphy sequence sequentially
  useEffect(() => {
    // Start sequence
    setPhase('writing-title');
  }, [letter]);

  useEffect(() => {
    let timer: NodeJS.Timeout | number | undefined;

    if (phase === 'writing-title') {
      timer = typeText(
        letter.title,
        CHAR_SPEED * 1.5,
        (text) => setDisplayText(prev => ({ ...prev, title: text })),
        () => {
          setTimeout(() => setPhase('writing-quote'), 700);
        }
      );
    } else if (phase === 'writing-quote') {
      timer = typeText(
        letter.quote,
        CHAR_SPEED,
        (text) => setDisplayText(prev => ({ ...prev, quote: text })),
        () => {
          setTimeout(() => setPhase('writing-poem'), 800);
        }
      );
    } else if (phase === 'writing-poem') {
      if (currentLineIdx < letter.poem.length) {
        const fullLine = letter.poem[currentLineIdx];
        timer = typeText(
          fullLine,
          CHAR_SPEED,
          (text) => {
            setDisplayText(prev => {
              const lines = [...prev.poemLines];
              lines[currentLineIdx] = text;
              return { ...prev, poemLines: lines };
            });
          },
          () => {
            setTimeout(() => {
              setCurrentLineIdx(prev => prev + 1);
            }, 500);
          }
        );
      } else {
        setPhase('writing-reflection');
      }
    } else if (phase === 'writing-reflection') {
      timer = typeText(
        letter.reflection,
        REFLECTION_SPEED,
        (text) => setDisplayText(prev => ({ ...prev, reflection: text })),
        () => {
          setTimeout(() => setPhase('writing-dedication'), 700);
        }
      );
    } else if (phase === 'writing-dedication') {
      timer = typeText(
        letter.dedication,
        REFLECTION_SPEED * 1.2,
        (text) => setDisplayText(prev => ({ ...prev, dedication: text })),
        () => {
          setPhase('finished');
        }
      );
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [phase, currentLineIdx, letter]);

  // Track the writing cursor to float the Calligraphy Pen
  useEffect(() => {
    if (phase === 'finished' || phase === 'idle') return;

    // We can simulate a pen sliding horizontally and slightly vibrating
    const interval = setInterval(() => {
      // Procedural movement to make the pen feel alive and responsive
      const time = Date.now() * 0.01;
      const swayX = Math.sin(time) * 4;
      const swayY = Math.cos(time * 1.5) * 3;
      
      setPenPosition({
        x: swayX,
        y: swayY
      });
    }, 50);

    return () => clearInterval(interval);
  }, [phase]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 40 }}
      transition={{ type: 'spring', stiffness: 100, damping: 18 }}
      className={`relative w-full max-w-2xl mx-auto ${letter.paperBg} rounded-lg p-4 sm:p-10 shadow-2xl border ${letter.textColor} select-text overflow-hidden z-40 max-h-[90vh] sm:max-h-[85vh] flex flex-col`}
      id={`letter-content-${letter.id}`}
    >
      {/* Torn Edge Effect Overlays */}
      <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-black/5 to-transparent pointer-events-none" />
      
      {/* Background Seal watermark watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] text-[180px] pointer-events-none select-none">
        {letter.sealSymbol}
      </div>

      {/* Floating Feather Calligraphy Pen */}
      {phase !== 'finished' && (
        <div 
          ref={penRef}
          className="hidden sm:flex absolute pointer-events-none z-50 flex-col items-center gap-1 transition-all duration-300"
          style={{
            top: '2.5rem',
            right: '2.5rem',
            transform: `translate(${penPosition.x}px, ${penPosition.y}px)`,
          }}
        >
          {/* Custom Pen Icon Design */}
          <div className="relative rotate-45 text-amber-700/60 drop-shadow-md">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
              <line x1="16" y1="8" x2="2" y2="22" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[8px] font-mono tracking-widest text-stone-500 uppercase">Escribiendo...</span>
        </div>
      )}

      {/* Parchment Scrolling Text Area */}
      <div 
        ref={textContainerRef}
        className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 sm:space-y-8 font-serif"
      >
        {/* Title */}
        <div className="text-center pt-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-wide italic font-serif text-stone-900 border-b border-stone-850/10 pb-2">
            {displayText.title}
          </h2>
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-stone-500 mt-2">
            Por {letter.author}
          </p>
        </div>

        {/* Famous Quote */}
        {displayText.quote && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-l-2 border-stone-400/40 pl-4 py-1 italic text-stone-600 text-xs sm:text-sm max-w-lg mx-auto"
          >
            {displayText.quote}
          </motion.div>
        )}

        {/* Original Poem */}
        {displayText.poemLines.length > 0 && (
          <div className="space-y-2 sm:space-y-3 text-center py-4 bg-stone-900/5 rounded-lg py-6 my-4 border border-stone-950/5">
            {displayText.poemLines.map((line, i) => (
              <p key={i} className="text-base sm:text-lg italic font-medium leading-relaxed font-serif text-stone-850 min-h-[1.5rem]">
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Prose Reflection */}
        {displayText.reflection && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-stone-800 text-xs sm:text-sm leading-relaxed text-justify indent-8 max-w-xl mx-auto"
          >
            {displayText.reflection}
          </motion.div>
        )}

        {/* Dedicated Birthday Message */}
        {displayText.dedication && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-t border-dashed border-stone-400/30 pt-6 max-w-xl mx-auto"
          >
            <div className="bg-gradient-to-r from-wine-custom/5 to-gold-custom/5 border border-gold-custom/20 rounded-lg p-4 sm:p-5">
              <span className="text-[9px] uppercase tracking-widest text-wine-custom font-mono font-bold block mb-2">
                🌟 Dedicatoria Especial
              </span>
              <p className="text-stone-900 font-serif text-sm sm:text-base leading-relaxed italic">
                "{displayText.dedication}"
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Finished Reading Indicator & CTA */}
      {phase === 'finished' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4 mt-4 border-t border-stone-400/20 text-center flex items-center justify-between"
        >
          <span className="text-[9px] font-mono text-stone-500">
            ✓ Guardado en tu memoria
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-wine-custom text-white hover:bg-wine-custom/90 text-xs rounded shadow hover:shadow-md transition-all duration-300 flex items-center gap-2 font-serif font-semibold"
          >
            Cerrar carta y guardar
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
