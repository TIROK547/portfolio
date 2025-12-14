'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type CursorState = 'default' | 'pointer' | 'text';

export default function CursorGlass() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicked, setIsClicked] = useState(false);
  const [cursorState, setCursorState] = useState<CursorState>('default');

  const cursorImages = {
    default: '/cursors/aero_arrow_glow.cur',
    pointer: '/cursors/aero_link_glow.cur',
    text: '/cursors/beam_glow.cur',
  };

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Check what element we're hovering over
      const target = e.target as HTMLElement;
      updateCursorState(target);
    };

    const updateCursorState = (target: HTMLElement) => {
      // Check for text input elements
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        setCursorState('text');
        return;
      }

      // Check for clickable elements (links, buttons, or elements with click handlers)
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.onclick !== null ||
        target.getAttribute('role') === 'button' ||
        getComputedStyle(target).cursor === 'pointer'
      ) {
        setCursorState('pointer');
        return;
      }

      // Check if parent elements are clickable
      let parent = target.parentElement;
      while (parent) {
        if (
          parent.tagName === 'A' ||
          parent.tagName === 'BUTTON' ||
          parent.onclick !== null
        ) {
          setCursorState('pointer');
          return;
        }
        parent = parent.parentElement;
      }

      setCursorState('default');
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      className="cursor-overlay"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: isClicked ? 'scale(0.9)' : 'scale(1)',
      }}
    >
      <img
        src={cursorImages[cursorState]}
        alt="cursor"
        style={{
          width: '48px',
          height: '48px',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
}
