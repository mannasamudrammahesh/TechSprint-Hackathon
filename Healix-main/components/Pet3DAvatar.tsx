"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Pet3DAvatarProps {
  petType: 'cat' | 'dog' | 'bird' | 'rabbit' | 'dragon';
  mood: 'happy' | 'sad' | 'excited' | 'calm' | 'sleepy' | 'energetic' | 'surprised' | 'angry';
  isListening: boolean;
  isSpeaking: boolean;
  mirroredExpression: string;
}

// Main Pet Avatar Component - Using Enhanced 2D Animations
export default function Pet3DAvatar({ petType, mood, isListening, isSpeaking, mirroredExpression }: Pet3DAvatarProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % 60);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const getPetEmoji = () => {
    const petEmojis = {
      cat: { base: '🐱', expressions: { happy: '😸', sad: '😿', excited: '🙀', calm: '😺', sleepy: '😴', surprised: '😹', angry: '😾', energetic: '😸' }},
      dog: { base: '🐕', expressions: { happy: '😄', sad: '😢', excited: '🤩', calm: '😌', sleepy: '😴', surprised: '😲', angry: '😠', energetic: '🤩' }},
      bird: { base: '🦜', expressions: { happy: '🎵', sad: '💔', excited: '🎉', calm: '🕊️', sleepy: '😴', surprised: '❗', angry: '💢', energetic: '🎵' }},
      rabbit: { base: '🐰', expressions: { happy: '😊', sad: '😔', excited: '🥳', calm: '😇', sleepy: '😴', surprised: '😯', angry: '😤', energetic: '🥳' }},
      dragon: { base: '🐲', expressions: { happy: '✨', sad: '💙', excited: '🔥', calm: '🌟', sleepy: '🌙', surprised: '⚡', angry: '🔥', energetic: '🔥' }}
    };
    
    return petEmojis[petType]?.expressions[mood as keyof typeof petEmojis[typeof petType]['expressions']] || petEmojis[petType]?.base || mirroredExpression;
  };

  const getAnimationStyle = () => {
    const baseScale = 1;
    const breathingScale = 1 + Math.sin(currentFrame * 0.2) * 0.05;
    
    if (mood === 'excited' || mood === 'energetic' || isSpeaking) {
      return {
        scale: breathingScale * 1.1,
        rotate: Math.sin(currentFrame * 0.3) * 5,
      };
    }
    
    if (mood === 'happy') {
      return {
        scale: breathingScale,
        y: Math.sin(currentFrame * 0.2) * 5,
      };
    }
    
    if (mood === 'sleepy') {
      return {
        scale: breathingScale * 0.9,
        opacity: 0.8 + Math.sin(currentFrame * 0.1) * 0.2,
      };
    }
    
    return { scale: breathingScale };
  };

  return (
    <div className="relative w-full h-64 bg-gradient-to-b from-sky-200 to-sky-100 rounded-lg overflow-hidden flex items-center justify-center">
      {/* Background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            animate={{
              x: [Math.random() * 300, Math.random() * 300],
              y: [Math.random() * 200, Math.random() * 200],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
      
      {/* Main pet avatar */}
      <motion.div
        className="relative z-10"
        animate={getAnimationStyle()}
        transition={{ duration: 0.1 }}
      >
        <div className="text-8xl mb-4 relative">
          {getPetEmoji()}
          
          {/* Speaking indicator */}
          {isSpeaking && (
            <motion.div
              className="absolute -top-4 -right-4 text-2xl"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              ♪
            </motion.div>
          )}
          
          {/* Listening indicator */}
          {isListening && (
            <motion.div
              className="absolute -top-4 -left-4 w-4 h-4 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </div>
      </motion.div>
      
      {/* Mood indicator */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-center">
          <span className="text-sm font-medium capitalize">{mood}</span>
          {isSpeaking && <span className="ml-2 text-blue-500">🎵</span>}
          {isListening && <span className="ml-2 text-green-500">👂</span>}
        </div>
      </div>
      
      {/* Energy waves for excited/energetic mood */}
      {(mood === 'excited' || mood === 'energetic') && (
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 border-2 border-yellow-400/30 rounded-lg"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
