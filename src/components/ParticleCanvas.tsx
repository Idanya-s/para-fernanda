import React, { useEffect, useRef } from 'react';
import { AppStage } from '../types';

interface ParticleCanvasProps {
  stage: AppStage;
  triggerPetalsCount: number; // Incrementing this triggers a localized shower of falling petals
  ambientIntensity: number; // 0 to 7 based on letters opened
}

interface DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  color: string;
}

interface PetalParticle {
  x: number;
  y: number;
  size: number;
  vy: number;
  vx: number;
  angle: number;
  spin: number;
  sway: number;
  swaySpeed: number;
  color: string;
}

interface FireworkSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
  trail: { x: number; y: number }[];
}

interface FireworkRocket {
  x: number;
  y: number;
  tx: number; // target x
  ty: number; // target y
  vx: number;
  vy: number;
  color: string;
  exploded: boolean;
}

export default function ParticleCanvas({ stage, triggerPetalsCount, ambientIntensity }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dustRef = useRef<DustParticle[]>([]);
  const petalsRef = useRef<PetalParticle[]>([]);
  const rocketsRef = useRef<FireworkRocket[]>([]);
  const sparksRef = useRef<FireworkSpark[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const triggerCountRef = useRef<number>(0);

  // Soundless visual sparkle generator helper
  const fireworkColors = [
    '#f59e0b', // Amber/gold
    '#ec4899', // Pink
    '#8b5cf6', // Violet
    '#ef4444', // Red
    '#14b8a6', // Teal
    '#f43f5e', // Rose
    '#fbbf24'  // Warm yellow
  ];

  // Helper to spawn a firework rocket
  const spawnRocket = (width: number, height: number) => {
    const x = width * (0.2 + Math.random() * 0.6);
    const y = height;
    const tx = width * (0.15 + Math.random() * 0.7);
    const ty = height * (0.15 + Math.random() * 0.45); // Explode in top half

    const speed = 7 + Math.random() * 5;
    const angle = Math.atan2(ty - y, tx - x);

    rocketsRef.current.push({
      x,
      y,
      tx,
      ty,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: fireworkColors[Math.floor(Math.random() * fireworkColors.length)],
      exploded: false
    });
  };

  // Helper to create explosion sparks
  const explodeRocket = (x: number, y: number, color: string) => {
    const sparkCount = 80 + Math.floor(Math.random() * 50);
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 5.0;
      sparksRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
        decay: 0.008 + Math.random() * 0.012,
        color,
        size: 1.2 + Math.random() * 1.8,
        trail: []
      });
    }
  };

  // Helper to spawn falling rose petals
  const spawnPetals = (count: number, width: number, isLocal: boolean = false, clickX?: number) => {
    const colors = [
      'rgba(244, 63, 94, 0.75)',  // Rose pink
      'rgba(225, 29, 72, 0.75)',  // Warm red
      'rgba(190, 24, 74, 0.75)',  // Wine/Burgundy
      'rgba(251, 113, 133, 0.7)'  // Pastel pink
    ];

    for (let i = 0; i < count; i++) {
      petalsRef.current.push({
        x: isLocal && clickX ? clickX + (Math.random() * 200 - 100) : Math.random() * width,
        y: isLocal ? Math.random() * -50 : -20 - Math.random() * 200,
        size: 8 + Math.random() * 10,
        vy: 1.2 + Math.random() * 1.8,
        vx: (Math.random() * 2 - 1) * 0.6,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() * 2 - 1) * 0.03,
        sway: Math.random() * Math.PI,
        swaySpeed: 0.02 + Math.random() * 0.03,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  };

  // Hook for reacting to triggerPetalsCount changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (triggerPetalsCount > 0) {
      // Trigger a direct localized burst of petals (falling from top middle-ish)
      spawnPetals(15, canvas.width, true, canvas.width / 2);
    }
  }, [triggerPetalsCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle Resize
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Populate initial vintage golden dust
      if (dustRef.current.length === 0) {
        const dustCount = 80;
        const colors = ['#f59e0b', '#d97706', '#b45309', '#fef3c7'];
        for (let i = 0; i < dustCount; i++) {
          dustRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() * 2 - 1) * 0.15,
            vy: -(0.05 + Math.random() * 0.15),
            size: 0.8 + Math.random() * 1.6,
            alpha: 0.02 + Math.random() * 0.12,
            targetAlpha: 0.02 + Math.random() * 0.12,
            color: colors[Math.floor(Math.random() * colors.length)]
          });
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Rocket scheduler for finale stages
    let rocketTimer: number | null = null;
    if (stage === 'finale' || stage === 'final-letter') {
      // Continuous fireworks!
      rocketTimer = window.setInterval(() => {
        spawnRocket(canvas.width, canvas.height);
        // Sometimes spawn dual rockets
        if (Math.random() > 0.5) {
          setTimeout(() => spawnRocket(canvas.width, canvas.height), 300);
        }
      }, 1500);

      // Mass petals on start of finale
      spawnPetals(40, canvas.width);
    }

    // Main 60fps draw and physics loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw and Update Golden Vintage Dust Particles
      const maxDust = 80 + ambientIntensity * 10; // slightly more dust as room gets warmer
      while (dustRef.current.length < maxDust) {
        const colors = ['#f59e0b', '#d97706', '#b45309', '#fef3c7'];
        dustRef.current.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 10,
          vx: (Math.random() * 2 - 1) * 0.15,
          vy: -(0.05 + Math.random() * 0.15),
          size: 0.8 + Math.random() * 1.6,
          alpha: 0.01,
          targetAlpha: 0.02 + Math.random() * 0.12,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }

      dustRef.current.forEach((p) => {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Soft alpha pulse
        if (Math.abs(p.alpha - p.targetAlpha) < 0.01) {
          p.targetAlpha = 0.02 + Math.random() * 0.15;
        } else {
          p.alpha += (p.targetAlpha - p.alpha) * 0.02;
        }

        // Out of bounds reset
        if (p.x < -10 || p.x > canvas.width + 10 || p.y < -10) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
          p.alpha = 0.01;
        }

        // Draw soft glow
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 2. Draw and Update Falling Rose Petals
      // In final stage, keep a steady slow stream of rose petals falling
      if ((stage === 'finale' || stage === 'final-letter') && petalsRef.current.length < 25) {
        spawnPetals(1, canvas.width);
      }

      petalsRef.current = petalsRef.current.filter((p) => {
        p.y += p.vy;
        p.sway += p.swaySpeed;
        p.x += p.vx + Math.sin(p.sway) * 0.4;
        p.angle += p.spin;

        // If out of bottom, remove
        if (p.y > canvas.height + 20) return false;

        // Draw petal as curved path or leaf shape
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.scale(1, 0.6); // compress for 3D spin effect
        ctx.fillStyle = p.color;
        
        ctx.beginPath();
        // Custom petal path
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size, p.size / 3, 0, p.size);
        ctx.bezierCurveTo(p.size, p.size / 3, p.size / 2, -p.size / 2, 0, 0);
        ctx.fill();

        // Highlight line inside petal for realism
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-2, p.size / 2, 0, p.size * 0.85);
        ctx.stroke();

        ctx.restore();
        return true;
      });

      // 3. Draw and Update Celebratory Fireworks Rockets
      rocketsRef.current = rocketsRef.current.filter((r) => {
        r.x += r.vx;
        r.y += r.vy;

        // Add rocket trails as simple red/orange smoke sparks
        if (Math.random() > 0.4) {
          sparksRef.current.push({
            x: r.x,
            y: r.y,
            vx: (Math.random() * 2 - 1) * 0.4,
            vy: Math.random() * 0.4,
            alpha: 0.6,
            decay: 0.04,
            color: '#f97316',
            size: 0.8 + Math.random() * 0.8,
            trail: []
          });
        }

        // Check if rocket reached its explosion target altitude
        const dist = Math.hypot(r.tx - r.x, r.ty - r.y);
        if (dist < 20 || r.vy >= 0 || r.y <= r.ty) {
          explodeRocket(r.x, r.y, r.color);
          return false; // remove rocket
        }

        // Draw elegant glowing rocket tail
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      });

      // 4. Draw and Update Firework Sparks
      sparksRef.current = sparksRef.current.filter((s) => {
        // Apply physics (gravity and friction)
        s.vx *= 0.98;
        s.vy *= 0.98;
        s.vy += 0.035; // soft gravity
        s.x += s.vx;
        s.y += s.vy;

        // Fade
        s.alpha -= s.decay;
        if (s.alpha <= 0) return false;

        // Add trail positions
        s.trail.push({ x: s.x, y: s.y });
        if (s.trail.length > 5) s.trail.shift();

        // Draw spark with its glowing trail
        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size;
        ctx.beginPath();
        if (s.trail.length > 1) {
          ctx.moveTo(s.trail[0].x, s.trail[0].y);
          for (let i = 1; i < s.trail.length; i++) {
            ctx.lineTo(s.trail[i].x, s.trail[i].y);
          }
        } else {
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx, s.y - s.vy);
        }
        ctx.stroke();

        // Core bright center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        return true;
      });

      // Draw active warm vignette layer on top
      if (ambientIntensity > 0 && stage !== 'finale') {
        const warmGlow = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 50,
          canvas.width / 2, canvas.height / 2, canvas.width * 0.8
        );
        // Slowly increase golden opacity with opened letters
        const alpha = Math.min(0.02 + ambientIntensity * 0.015, 0.12);
        warmGlow.addColorStop(0, `rgba(245, 158, 11, ${alpha})`);
        warmGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.save();
        ctx.fillStyle = warmGlow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (rocketTimer) {
        clearInterval(rocketTimer);
      }
    };
  }, [stage, ambientIntensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 block"
      id="particles-canvas"
    />
  );
}
