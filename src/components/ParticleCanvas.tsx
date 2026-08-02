import React, { useEffect, useRef } from "react";
import { ParticleType } from "../types";

interface ParticleCanvasProps {
  type?: ParticleType;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  baseSpeedX: number;
  speedY: number;
  opacity: number;
  targetOpacity: number;
  rotation: number;
  rotSpeed: number;
  swayFrequency: number;
  swayAmplitude: number;
  swayPhase: number;
  spriteIndex: number;
}

const PARTICLE_SYMBOLS: Record<string, string[]> = {
  hearts: ["❤️", "💖", "💕", "💗", "🌸"],
  sakura: ["🌸", "🌺", "🍃", "💮"],
  stars: ["✨", "⭐", "🌟", "💫"],
  sparkles: ["✨", "💖", "💫", "⚡"],
  bubbles: ["🫧", "⚪", "🤍", "💖"],
};

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  type = "hearts",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isComponentMounted = true;
    let particles: Particle[] = [];
    const sprites: HTMLCanvasElement[] = [];

    // 1. Pre-render particle symbols to offscreen canvas sprites for high-performance GPU drawing
    const symbols = PARTICLE_SYMBOLS[type] || PARTICLE_SYMBOLS.hearts;
    const spriteSize = 64; // Base sprite size for sharp rendering

    symbols.forEach((symbol) => {
      const offscreen = document.createElement("canvas");
      offscreen.width = spriteSize;
      offscreen.height = spriteSize;
      const offCtx = offscreen.getContext("2d");
      if (offCtx) {
        if (type === "bubbles") {
          // Draw crisp vector translucent bubble
          const radius = spriteSize / 2 - 4;
          const grad = offCtx.createRadialGradient(
            spriteSize * 0.35,
            spriteSize * 0.35,
            radius * 0.1,
            spriteSize / 2,
            spriteSize / 2,
            radius,
          );
          grad.addColorStop(0, "rgba(255, 255, 255, 0.8)");
          grad.addColorStop(0.4, "rgba(244, 114, 182, 0.35)");
          grad.addColorStop(0.85, "rgba(219, 39, 119, 0.45)");
          grad.addColorStop(1, "rgba(244, 114, 182, 0.1)");

          offCtx.beginPath();
          offCtx.arc(spriteSize / 2, spriteSize / 2, radius, 0, Math.PI * 2);
          offCtx.fillStyle = grad;
          offCtx.fill();
          offCtx.lineWidth = 2;
          offCtx.strokeStyle = "rgba(255, 255, 255, 0.7)";
          offCtx.stroke();

          // Highlight
          offCtx.beginPath();
          offCtx.arc(
            spriteSize * 0.35,
            spriteSize * 0.35,
            radius * 0.25,
            0,
            Math.PI * 2,
          );
          offCtx.fillStyle = "rgba(255, 255, 255, 0.7)";
          offCtx.fill();
        } else {
          // Draw crisp high-res emoji/symbol
          offCtx.font = `${spriteSize * 0.7}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
          offCtx.textAlign = "center";
          offCtx.textBaseline = "middle";
          offCtx.fillText(symbol, spriteSize / 2, spriteSize / 2 + 2);
        }
      }
      sprites.push(offscreen);
    });

    // 2. Responsive Canvas Sizing with Retina / High-DPI Display Support
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resizeCanvas = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for performance
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    resizeCanvas();

    // 3. Create optimized particle physics
    const getParticleCount = (w: number) => {
      if (w < 640) return 16; // Mobile
      if (w < 1024) return 26; // Tablet
      return 38; // Desktop
    };

    const createParticle = (isInitial = false): Particle => {
      const isMobile = width < 640;
      const size = Math.random() * (isMobile ? 12 : 18) + (isMobile ? 12 : 16);
      const targetOpacity = Math.random() * 0.5 + 0.4;

      return {
        x: Math.random() * width,
        y: isInitial
          ? Math.random() * height
          : height + size + Math.random() * 20,
        size,
        baseSpeedX: (Math.random() - 0.5) * 0.4,
        speedY: -(Math.random() * 0.8 + 0.5),
        opacity: isInitial ? targetOpacity : 0, // Fade-in effect
        targetOpacity,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        swayFrequency: Math.random() * 0.002 + 0.001,
        swayAmplitude: Math.random() * 1.2 + 0.5,
        swayPhase: Math.random() * Math.PI * 2,
        spriteIndex: Math.floor(Math.random() * sprites.length),
      };
    };

    const initParticles = () => {
      const count = getParticleCount(width);
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(createParticle(true));
      }
    };

    initParticles();

    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };

    window.addEventListener("resize", handleResize);

    // 4. Smooth Animation Loop with Page Visibility Optimization
    let time = 0;

    const render = () => {
      if (!isComponentMounted) return;

      // Skip rendering if document is hidden (saves CPU/Battery)
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      time += 16;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Smooth floating physics with horizontal sine wave sway
        p.swayPhase += p.swayFrequency;
        p.x += p.baseSpeedX + Math.sin(p.swayPhase) * p.swayAmplitude * 0.5;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        // Smooth fade-in on spawn
        if (p.opacity < p.targetOpacity) {
          p.opacity = Math.min(p.targetOpacity, p.opacity + 0.02);
        }

        // Fade out near the top of the screen
        if (p.y < 100) {
          p.opacity -= 0.015;
        }

        // Respawn when particle leaves screen or fades out completely
        if (
          p.y < -p.size ||
          p.opacity <= 0 ||
          p.x < -p.size ||
          p.x > width + p.size
        ) {
          particles[i] = createParticle(false);
          continue;
        }

        // Fast GPU-accelerated drawing from offscreen sprite
        const sprite = sprites[p.spriteIndex];
        if (sprite) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x, p.y);
          if (p.rotation !== 0) {
            ctx.rotate(p.rotation);
          }

          const halfSize = p.size / 2;
          ctx.drawImage(sprite, -halfSize, -halfSize, p.size, p.size);
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Visibility listener to pause/resume frame loop
    const handleVisibilityChange = () => {
      if (!document.hidden && isComponentMounted) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isComponentMounted = false;
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden transform-gpu"
    />
  );
};
