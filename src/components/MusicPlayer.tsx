import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface MusicPlayerProps {
  isPlaying: boolean;
  onToggle: () => void;
  playWindOnly?: boolean; // plays a soft wind sound for the final letter
}

export default function MusicPlayer({ isPlaying, onToggle, playWindOnly = false }: MusicPlayerProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const schedulerIntervalRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const currentStepRef = useRef<number>(0);

  // Synthesize a soft, nostalgic piano node
  const playPianoTone = (ctx: AudioContext, freq: number, time: number, duration: number, volume: number = 0.15) => {
    // Principal oscillator (triangle wave is warm and mellow)
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, time);

    // Subtle overtone (sine wave for pure clarity)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, time);

    // Warm vintage lowpass filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, time);
    filter.frequency.exponentialRampToValueAtTime(350, time + duration);

    // ADSR Gain Envelope
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, time);
    gainNode.gain.linearRampToValueAtTime(volume, time + 0.06); // Soft attack
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.4, time + 0.4); // Decay
    gainNode.gain.setValueAtTime(volume * 0.4, time + duration - 0.5); // Sustain
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration); // Long release (sustain pedal effect)

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(time);
    osc1.stop(time + duration);

    osc2.start(time);
    osc2.stop(time + duration);
  };

  // Synthesize a gentle wind sound for the climax/final letter
  const windSourceRef = useRef<AudioNode | null>(null);
  const windGainRef = useRef<GainNode | null>(null);

  const startWindSound = (ctx: AudioContext) => {
    try {
      // Create white noise
      const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;

      // Filter to create a howling/breezy sound (bandpass with sweeping frequency)
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 3.0; // resonant
      filter.frequency.value = 350;

      // Modulate filter frequency with a low-frequency oscillator (LFO)
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08; // 12 seconds per wave
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 180; // range of sweep

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const gain = ctx.createGain();
      gain.gain.value = 0.02; // Very gentle background volume

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      lfo.start();
      noiseNode.start();

      windSourceRef.current = noiseNode;
      windGainRef.current = gain;
    } catch (e) {
      console.warn("Wind synthesis failed:", e);
    }
  };

  const stopWindSound = () => {
    if (windSourceRef.current) {
      try {
        (windSourceRef.current as AudioBufferSourceNode).stop();
      } catch (e) {}
      windSourceRef.current = null;
    }
  };

  // Chord progression & melody scheduler
  // G major / E minor pentatonic scale: E, G, A, B, D, F#
  const chords = [
    // Em9
    [82.41, 164.81, 196.00, 246.94, 293.66, 369.99], // E2, E3, G3, B3, D4, F#4
    // Cmaj9
    [65.41, 130.81, 196.00, 246.94, 293.66, 329.63], // C2, C3, G3, B3, D4, E4
    // Gmaj9
    [98.00, 196.00, 246.94, 293.66, 369.99, 440.00], // G2, G3, B3, D4, F#4, A4
    // D6/11
    [73.42, 146.83, 220.00, 293.66, 369.99, 493.88]  // D2, D3, A3, D4, F#4, B4
  ];

  const highMelody = [
    587.33, 659.25, 739.99, 783.99, 880.00, 987.77, 1174.66 // D5, E5, F#5, G5, A5, B5, D6
  ];

  // Scheduler loops
  useEffect(() => {
    if (isPlaying) {
      // Initialize AudioContext on first play
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Wind sound handling
      if (playWindOnly) {
        startWindSound(ctx);
        if (schedulerIntervalRef.current) {
          window.clearInterval(schedulerIntervalRef.current);
          schedulerIntervalRef.current = null;
        }
        return;
      } else {
        stopWindSound();
      }

      nextNoteTimeRef.current = ctx.currentTime;
      currentStepRef.current = 0;

      // Core audio scheduler
      const scheduleNextNotes = () => {
        const lookahead = 0.3; // schedule ahead by 300ms
        const stepDuration = 3.0; // 3 seconds per chord change

        while (nextNoteTimeRef.current < ctx.currentTime + lookahead) {
          const time = nextNoteTimeRef.current;
          const chordIndex = currentStepRef.current % chords.length;
          const currentChord = chords[chordIndex];

          // 1. Play deep bass note (soft volume)
          playPianoTone(ctx, currentChord[0], time, 3.8, 0.08);

          // 2. Play warm mid-range harmony notes arpeggiated slightly
          setTimeout(() => {
            if (!isPlaying || playWindOnly) return;
            // Play remaining chord notes
            currentChord.slice(1).forEach((freq, idx) => {
              playPianoTone(ctx, freq, time + idx * 0.12, 3.2, 0.04);
            });
          }, 20);

          // 3. Play elegant high-pitched sparkle notes randomly
          const numSparkles = 2 + Math.floor(Math.random() * 3); // 2 to 4 high notes
          for (let i = 0; i < numSparkles; i++) {
            const sparkleDelay = 0.5 + Math.random() * 2.0; // spread over the 3 seconds
            const randomHighNote = highMelody[Math.floor(Math.random() * highMelody.length)];
            const sparkleVolume = 0.02 + Math.random() * 0.03;
            const sparkleDuration = 1.5 + Math.random() * 1.5;
            playPianoTone(ctx, randomHighNote, time + sparkleDelay, sparkleDuration, sparkleVolume);
          }

          nextNoteTimeRef.current += stepDuration;
          currentStepRef.current++;
        }
      };

      // Poll scheduler every 100ms
      schedulerIntervalRef.current = window.setInterval(scheduleNextNotes, 100);
    } else {
      // Clean up when paused
      if (schedulerIntervalRef.current) {
        window.clearInterval(schedulerIntervalRef.current);
        schedulerIntervalRef.current = null;
      }
      stopWindSound();
    }

    return () => {
      if (schedulerIntervalRef.current) {
        window.clearInterval(schedulerIntervalRef.current);
        schedulerIntervalRef.current = null;
      }
      stopWindSound();
    };
  }, [isPlaying, playWindOnly]);

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
      {isPlaying && !playWindOnly && (
        <div className="flex items-end gap-0.5 h-4 px-1" id="music-visualizer">
          <div className="w-[2px] bg-gold-custom/80 animate-[pulse_0.7s_infinite_alternate]" style={{ height: '30%' }} />
          <div className="w-[2px] bg-gold-custom/80 animate-[pulse_0.9s_infinite_alternate_0.2s]" style={{ height: '70%' }} />
          <div className="w-[2px] bg-gold-custom/80 animate-[pulse_0.6s_infinite_alternate_0.4s]" style={{ height: '50%' }} />
          <div className="w-[2px] bg-gold-custom/80 animate-[pulse_0.8s_infinite_alternate_0.1s]" style={{ height: '90%' }} />
          <div className="w-[2px] bg-gold-custom/80 animate-[pulse_0.5s_infinite_alternate_0.3s]" style={{ height: '40%' }} />
        </div>
      )}
      {isPlaying && playWindOnly && (
        <div className="text-[10px] font-mono uppercase tracking-widest text-gold-custom/60 animate-pulse">
          🌬️ Brisa Nocturna
        </div>
      )}
      <button
        id="toggle-music-btn"
        onClick={onToggle}
        className="flex items-center justify-center w-10 h-10 rounded-full border border-gold-custom/20 bg-stone-950/80 backdrop-blur text-gold-custom shadow-lg shadow-black/40 hover:bg-stone-900/80 hover:border-gold-custom/40 transition-all duration-300"
        title={isPlaying ? 'Silenciar música' : 'Activar música de fondo'}
      >
        {isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
    </div>
  );
}
