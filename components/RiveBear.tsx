"use client";

import { useRive } from '@rive-app/react-canvas';
import { useEffect, useState } from 'react';

interface RiveBearProps {
  isTyping?: boolean;
  size?: number;
}

export default function RiveBear({ isTyping = false, size = 40 }: RiveBearProps) {
  const [animationState, setAnimationState] = useState<'idle' | 'typing' | 'smiling'>('idle');

  const { RiveComponent } = useRive({
    src: '/rive/bear.riv',
    autoplay: true,
  });

  useEffect(() => {
    if (isTyping) {
      setAnimationState('typing');
      const interval = setInterval(() => {
        setAnimationState(prev => prev === 'typing' ? 'smiling' : 'typing');
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setAnimationState('idle');
    }
  }, [isTyping]);

  return (
    <div 
      style={{ 
        width: size, 
        height: size,
        backgroundColor: '#d6e2ea',
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        transform: isTyping ? 'scale(1.05)' : 'scale(1)',
      }}
      className={isTyping ? 'animate-pulse' : ''}
    >
      {/* Solid background layer */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#d6e2ea',
          zIndex: 0,
        }}
      />
      
      {/* Rive animation */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <RiveComponent 
          style={{ 
            width: size * 1.2, 
            height: size * 1.2,
            transform: animationState === 'smiling' ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.3s ease-in-out',
            backgroundColor: 'transparent',
          }} 
        />
      </div>
    </div>
  );
}
