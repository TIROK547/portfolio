'use client';

import { useEffect, useRef } from 'react';

export function useTypingSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext only in browser
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playTypingSound = () => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 800 + Math.random() * 200; // Random pitch variation
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.02, ctx.currentTime); // Very low volume
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  };

  return { playTypingSound };
}

export default function TypingSound({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
