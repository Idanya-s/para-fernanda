import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';
import { AppStage, Letter, WriterId } from './types';
import { lettersData } from './data/lettersData';
import MusicPlayer from './components/MusicPlayer';
import ParticleCanvas from './components/ParticleCanvas';
import KeepsakeBox from './components/KeepsakeBox';
import Envelope from './components/Envelope';
import LetterContent from './components/LetterContent';
import StarrySky from './components/StarrySky';
import FinalLetter from './components/FinalLetter';

export default function App() {
  const [stage, setStage] = useState<AppStage>('landing');
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [activeLetter, setActiveLetter] = useState<Letter | null>(null);
  const [readLetters, setReadLetters] = useState<Set<WriterId>>(new Set());
  const [triggerPetalsCount, setTriggerPetalsCount] = useState(0);
  const [finalCompleted, setFinalCompleted] = useState(false);

  // Auto transition to Finale when all letters are read
  useEffect(() => {
    if (readLetters.size === 7 && stage === 'opened-box' && !activeLetter) {
      const timer = setTimeout(() => {
        setStage('finale');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [readLetters, stage, activeLetter]);

  // Audio helper: trigger music play on landing screen click
  const handleStartExperience = () => {
    setMusicPlaying(true);
    setStage('closed-box');
  };

  const handleOpenBox = () => {
    setStage('opened-box');
  };

  const handleOpenLetter = (letter: Letter) => {
    setActiveLetter(letter);
  };

  const handleCloseLetter = () => {
    if (activeLetter) {
      setReadLetters((prev) => {
        const next = new Set(prev);
        next.add(activeLetter.id);
        return next;
      });
      setActiveLetter(null);
      // Trigger a localized petal shower
      setTriggerPetalsCount((prev) => prev + 1);
    }
  };

  const handleOpenLastLetter = () => {
    setStage('final-letter');
  };

  const handleFinalLetterCompleted = () => {
    setFinalCompleted(true);
    setStage('ended');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-space-custom text-stone-100 flex items-center justify-center font-sans">
      
      {/* Immersive Cinematic Overlays */}
      <div className="absolute inset-0 bg-radial-vignette opacity-90 pointer-events-none z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-wine-custom/15 rounded-full filter blur-[140px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '8s' }} />

      {/* 1. Master Canvas Particle Engine (Golden Dust, Floating Petals, Climax Fireworks) */}
      <ParticleCanvas 
        stage={stage} 
        triggerPetalsCount={triggerPetalsCount}
        ambientIntensity={readLetters.size} 
      />

      {/* 2. Interactive Audio Player (Procedural Web Audio Synths) */}
      <MusicPlayer 
        isPlaying={musicPlaying} 
        onToggle={() => setMusicPlaying(!musicPlaying)} 
        playWindOnly={stage === 'final-letter' && !finalCompleted} // Soft wind during the typing of the final letter
      />

      {/* 3. Main Scene Swapper with Framer Motion AnimatePresence */}
      <AnimatePresence mode="wait">
        
        {/* LANDING SCREEN: Screen starts in pitch-black silence */}
        {stage === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.5 } }}
            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-30 bg-space-custom cursor-pointer"
            onClick={handleStartExperience}
          >
            {/* Pulsating Candle Flame/Glow */}
            <div className="relative w-16 h-16 flex items-center justify-center mb-6">
              <motion.div 
                className="absolute w-6 h-6 bg-gold-custom rounded-full filter blur-md opacity-70"
                animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.9, 0.6] }}
                transition={{ repeat: Infinity, duration: 2.0, ease: 'easeInOut' }}
              />
              <div className="w-1.5 h-4 bg-gold-custom rounded-t-full filter drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
              <div className="absolute bottom-2 w-6 h-1.5 bg-stone-700 rounded" />
            </div>

            <h1 className="text-xl sm:text-2xl font-serif text-gold-custom/90 tracking-[0.2em] uppercase mb-3 select-none font-semibold">
              Para Fernanda
            </h1>
            <p className="text-xs sm:text-sm font-serif text-gold-custom/60 max-w-xs leading-relaxed mb-8 italic select-none">
              "La distancia no es nada cuando alguien significa todo."
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 rounded border border-gold-custom/20 bg-gradient-to-b from-stone-900/40 to-stone-950/60 text-xs text-gold-custom/90 tracking-widest uppercase hover:border-gold-custom/50 hover:text-gold-custom transition-all duration-300 shadow-md cursor-pointer"
            >
              Encender recuerdo
            </motion.button>
          </motion.div>
        )}

        {/* CLOSED BOX STAGE: Wood Box sitting on table under candle ray */}
        {stage === 'closed-box' && (
          <motion.div
            key="closed-box"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 2.0 } }}
            exit={{ opacity: 0, transition: { duration: 1.0 } }}
            className="absolute inset-0 flex flex-col items-center justify-center p-6 z-20"
          >
            <KeepsakeBox isOpen={false} onOpen={handleOpenBox} />
          </motion.div>
        )}

        {/* OPENED BOX STAGE: The Envelopes drawer is revealed */}
        {stage === 'opened-box' && !activeLetter && (
          <motion.div
            key="opened-box-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8 z-20 overflow-y-auto"
          >
            {/* Header progress bar */}
            <div className="w-full max-w-4xl text-center mb-6 sm:mb-8 flex flex-col items-center">
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-gold-custom">
                Caja abierta
              </span>
              <h2 className="text-xl sm:text-2xl font-serif text-stone-100 tracking-wider mt-1 italic">
                Cartas para ti, Fernanda
              </h2>
              <div className="flex items-center gap-2 mt-3">
                <div className="h-[1px] w-12 bg-gold-custom/20" />
                <span className="text-xs font-serif text-gold-custom/75">
                  Sobres abiertos: <b className="text-gold-custom">{readLetters.size}</b> / 7
                </span>
                <div className="h-[1px] w-12 bg-gold-custom/20" />
              </div>
              
              {/* Elegant dots progress */}
              <div className="flex gap-2 mt-3">
                {lettersData.map((letter) => (
                  <div
                    key={letter.id}
                    className={`w-2 h-2 rounded-full border transition-all duration-500 ${
                      readLetters.has(letter.id)
                        ? 'bg-gold-custom border-gold-custom shadow-[0_0_8px_rgba(212,175,55,0.8)]'
                        : 'border-gold-custom/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Envelopes Bento Scatter Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-full sm:max-w-5xl justify-items-center items-center gap-0.5 sm:gap-2 select-none">
              {lettersData.map((letter, idx) => {
                // Procedural scatter rotation angles to look natural
                const scatterAngles = [-5, 3, -1, 4, -3, 2, -2];
                const angle = scatterAngles[idx % scatterAngles.length];

                return (
                  <motion.div
                    key={letter.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      rotate: angle,
                      transition: { delay: idx * 0.1, duration: 0.6 }
                    }}
                    whileHover={{ rotate: 0, scale: 1.05, zIndex: 30, transition: { duration: 0.2 } }}
                    className="origin-center"
                  >
                    <Envelope
                      letter={letter}
                      isOpened={activeLetter?.id === letter.id}
                      isRead={readLetters.has(letter.id)}
                      onOpen={() => handleOpenLetter(letter)}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Prompt to read all */}
            <p className="text-[10px] sm:text-xs font-serif text-gold-custom/40 text-center mt-8 tracking-wide italic">
              * Lee las siete cartas para descubrir lo que el corazón guarda para ti.
            </p>
          </motion.div>
        )}

        {/* ACTIVE LETTER DETAIL VIEW (Slides out of its specific envelope) */}
        {activeLetter && (
          <motion.div
            key="active-letter-wrapper"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          >
            <LetterContent letter={activeLetter} onClose={handleCloseLetter} />
          </motion.div>
        )}

        {/* STARRY SKY FINALE STAGE: Stars align into words with fireworks */}
        {stage === 'finale' && (
          <motion.div
            key="finale"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 2.5 } }}
            exit={{ opacity: 0, transition: { duration: 1.5 } }}
            className="absolute inset-0 z-20"
          >
            <StarrySky onOpenLastLetter={handleOpenLastLetter} />
          </motion.div>
        )}

        {/* FINAL CUSTOM DEDICATION LETTER VIEW */}
        {stage === 'final-letter' && (
          <motion.div
            key="final-letter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 2.0 } }}
            exit={{ opacity: 0, transition: { duration: 1.5 } }}
            className="absolute inset-0 z-30 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <FinalLetter onCompleted={handleFinalLetterCompleted} />
          </motion.div>
        )}

        {/* ENDED BLACK CARD: Clean, breathtaking fade-to-black emotional ending */}
        {stage === 'ended' && (
          <motion.div
            key="ended"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 2.5 } }}
            className="absolute inset-0 z-50 bg-space-custom flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.0, duration: 2.5, ease: 'easeOut' }}
              className="relative z-20 flex flex-col items-center gap-4"
            >
              <Heart size={36} className="text-wine-custom animate-pulse fill-wine-custom/20" />
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gold-custom/90 tracking-widest font-cursive italic">
                Gracias por existir, Fernanda.
              </h2>
              <p className="text-lg sm:text-xl font-serif text-gold-custom/70 tracking-wider font-light mt-1">
                Feliz cumpleaños, Fer.
              </p>

              <div className="w-12 h-[1px] bg-wine-custom/40 mt-4" />
              <p className="text-[10px] font-mono text-stone-500 uppercase tracking-[0.3em] mt-2">
                Te quiere, quien piensa en ti a distancia
              </p>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
