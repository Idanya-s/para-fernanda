import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';
import { finalLetterContent } from '../data/lettersData';

interface FinalLetterProps {
  onCompleted: () => void;
}

export default function FinalLetter({ onCompleted }: FinalLetterProps) {
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [currentCharIdx, setCurrentCharIdx] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [signatureVisible, setSignatureVisible] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const lines = finalLetterContent.content;

  // Custom typing orchestrator for a very long personal letter
  useEffect(() => {
    if (currentLineIdx >= lines.length) {
      // Finished writing body, show signature
      setSignatureVisible(true);
      setTimeout(() => {
        setIsDone(true);
        setButtonVisible(true);
        // Trigger completion callback to start fireworks, petals and swell music!
        onCompleted();
      }, 1500);
      return;
    }

    const currentText = lines[currentLineIdx];

    // If it is an empty line, skip quickly
    if (currentText === '') {
      setTypedLines(prev => [...prev, '']);
      setCurrentLineIdx(prev => prev + 1);
      setCurrentCharIdx(0);
      return;
    }

    // Type character by character
    const delay = currentText.length > 80 ? 15 : 22; // speed up slightly for longer lines
    const timer = setTimeout(() => {
      setTypedLines(prev => {
        const nextLines = [...prev];
        nextLines[currentLineIdx] = currentText.substring(0, currentCharIdx + 1);
        return nextLines;
      });

      if (currentCharIdx + 1 >= currentText.length) {
        // Line complete, move to next
        setTimeout(() => {
          setCurrentLineIdx(prev => prev + 1);
          setCurrentCharIdx(0);
        }, 350); // slight pause between paragraphs
      } else {
        setCurrentCharIdx(prev => prev + 1);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [currentLineIdx, currentCharIdx, lines, onCompleted]);

  // Auto-scroll as text gets typed
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [typedLines, signatureVisible]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="relative w-full max-w-2xl mx-auto bg-stone-50/95 border-2 border-gold-custom/40 rounded-xl p-6 sm:p-12 shadow-[0_15px_60px_rgba(114,47,55,0.15)] text-stone-800 font-serif overflow-hidden z-40 max-h-[85vh] flex flex-col"
      id="final-letter-card"
    >
      {/* Decorative Gold Filigree Borders */}
      <div className="absolute top-3 left-3 right-3 bottom-3 border border-gold-custom/30 pointer-events-none rounded-lg" />
      <div className="absolute top-4 left-4 right-4 bottom-4 border border-dashed border-gold-custom/20 pointer-events-none rounded-lg" />
      
      {/* Gold corner accents */}
      <div className="absolute top-6 left-6 w-5 h-5 border-t-2 border-l-2 border-gold-custom/60" />
      <div className="absolute top-6 right-6 w-5 h-5 border-t-2 border-r-2 border-gold-custom/60" />
      <div className="absolute bottom-6 left-6 w-5 h-5 border-b-2 border-l-2 border-gold-custom/60" />
      <div className="absolute bottom-6 right-6 w-5 h-5 border-b-2 border-r-2 border-gold-custom/60" />

      {/* Gentle Floating Feather Pen simulation indicator */}
      {!isDone && (
        <div className="absolute top-8 right-8 flex items-center gap-1.5 opacity-60">
          <div className="w-2 h-2 rounded-full bg-wine-custom animate-ping" />
          <span className="text-[9px] font-mono tracking-widest text-stone-500 uppercase">Escribiendo con alma...</span>
        </div>
      )}

      {/* Title */}
      <div className="text-center pt-2 pb-6 border-b border-stone-200">
        <span className="text-wine-custom flex justify-center mb-1 animate-pulse"><Heart size={16} fill="currentColor" /></span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-wide italic text-stone-900 font-cursive">
          {finalLetterContent.title}
        </h2>
        <div className="w-16 h-[1px] bg-gold-custom/40 mx-auto mt-2" />
      </div>

      {/* Scrolling Text Content */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto pr-2 my-6 space-y-4 text-sm sm:text-base leading-relaxed text-stone-850 text-justify indent-8 custom-scrollbar font-serif"
      >
        {typedLines.map((line, idx) => (
          <p key={idx} className="min-h-[1rem]">
            {line}
          </p>
        ))}

        {/* Signature */}
        {signatureVisible && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0 }}
            className="pt-8 text-right pr-6"
          >
            <p className="italic text-stone-600 text-xs sm:text-sm">{finalLetterContent.signature}</p>
             <p className="text-stone-900 font-bold text-lg sm:text-xl font-cursive mt-2 pr-2">
              Alguien que está aprendiendo a quererte
            </p>
          </motion.div>
        )}
      </div>

      {/* End Button - Leads to final fade to black */}
      <AnimatePresence>
        {buttonVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-4 border-t border-stone-200 text-center flex justify-between items-center bg-stone-50/95"
          >
            <span className="text-[10px] font-mono text-wine-custom uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={10} /> Presiona para sellar
            </span>
            <button
              onClick={onCompleted}
              className="px-6 py-2.5 bg-wine-custom text-white hover:bg-wine-custom/90 text-xs tracking-wider rounded font-serif font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 border border-gold-custom/30"
            >
              Cerrar y Recordar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
