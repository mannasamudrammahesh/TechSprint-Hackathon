"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sword, Shield, Heart, Zap, Brain, Star, Sparkles } from 'lucide-react';

interface BattleArenaProps {
  gameState: {
    challengeHp: number;
    maxChallengeHp: number;
    playerStress: number;
    maxPlayerStress: number;
    currentTask: string;
    taskProgress: number;
    gamePhase: 'intro' | 'battle' | 'task' | 'victory' | 'defeat';
    score: number;
    tasksCompleted: number;
    level: number;
    isGameActive: boolean;
  };
  moodPet: {
    emotion: 'happy' | 'encouraging' | 'worried' | 'excited';
    message: string;
    animation: string;
  };
  currentTask: any;
  onTaskSelect: (taskId: string) => void;
  onGameStart: () => void;
  onGameReset: () => void;
}

// Enhanced Challenge Component with Advanced Animations
function EnhancedChallenge({ health, maxHealth, isAttacking, isDamaged, isDefeated }: {
  health: number;
  maxHealth: number;
  isAttacking: boolean;
  isDamaged: boolean;
  isDefeated: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Array<{x: number, y: number, vx: number, vy: number, life: number}>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const animate = () => {
      time += 0.016;
      
      // Clear with gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      gradient.addColorStop(0, '#1a0033');
      gradient.addColorStop(1, '#000011');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Challenge size and effects based on health
      const baseRadius = 80;
      const healthRatio = health / maxHealth;
      let radius = baseRadius * healthRatio;
      
      // Advanced animation effects
      if (isDefeated) {
        radius = baseRadius * Math.max(0, healthRatio - time * 0.3);
        // Explosion particles
        for (let i = 0; i < 5; i++) {
          particlesRef.current.push({
            x: centerX + (Math.random() - 0.5) * 100,
            y: centerY + (Math.random() - 0.5) * 100,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1
          });
        }
      } else if (isDamaged) {
        radius = baseRadius * (healthRatio + Math.sin(time * 30) * 0.2);
        // Screen shake effect
        ctx.translate(Math.sin(time * 50) * 5, Math.cos(time * 50) * 5);
      } else if (isAttacking) {
        radius = baseRadius * (healthRatio + Math.sin(time * 15) * 0.3);
        // Attack particles
        for (let i = 0; i < 3; i++) {
          particlesRef.current.push({
            x: centerX,
            y: centerY,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 0.8
          });
        }
      } else {
        radius = baseRadius * (healthRatio + Math.sin(time * 3) * 0.08);
      }
      
      // Challenge color based on health with glow
      let color = '#8844ff';
      let glowColor = '#8844ff';
      if (health < 30) {
        color = '#ff4444';
        glowColor = '#ff0000';
      } else if (health < 60) {
        color = '#ff8844';
        glowColor = '#ff6600';
      }
      
      // Outer glow effect
      const glowGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 2);
      glowGradient.addColorStop(0, glowColor + '80');
      glowGradient.addColorStop(0.5, glowColor + '40');
      glowGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Challenge body with advanced shading
      const bodyGradient = ctx.createRadialGradient(
        centerX - radius * 0.3, centerY - radius * 0.3, 0,
        centerX, centerY, radius
      );
      bodyGradient.addColorStop(0, color + 'ff');
      bodyGradient.addColorStop(0.7, color + 'cc');
      bodyGradient.addColorStop(1, color + '66');
      
      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Attack ring effect
      if (isAttacking) {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 6;
        ctx.setLineDash([10, 10]);
        ctx.lineDashOffset = -time * 20;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 20 + Math.sin(time * 20) * 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Energy waves
        for (let i = 0; i < 3; i++) {
          const waveRadius = radius + 30 + i * 20 + Math.sin(time * 10) * 10;
          ctx.strokeStyle = `rgba(255, 0, 0, ${0.5 - i * 0.15})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      
      // Challenge face with dynamic expressions
      if (!isDefeated && radius > 10) {
        // Eyes with glow
        const eyeGlow = ctx.createRadialGradient(centerX - radius * 0.3, centerY - radius * 0.2, 0, centerX - radius * 0.3, centerY - radius * 0.2, radius * 0.15);
        eyeGlow.addColorStop(0, '#ff0000');
        eyeGlow.addColorStop(1, '#660000');
        
        ctx.fillStyle = eyeGlow;
        ctx.beginPath();
        ctx.arc(centerX - radius * 0.3, centerY - radius * 0.2, radius * 0.12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(centerX + radius * 0.3, centerY - radius * 0.2, radius * 0.12, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouth
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 4;
        ctx.beginPath();
        if (isAttacking) {
          // Angry mouth
          ctx.arc(centerX, centerY + radius * 0.2, radius * 0.4, 0, Math.PI);
        } else if (isDamaged) {
          // Pain expression
          ctx.arc(centerX, centerY + radius * 0.5, radius * 0.3, Math.PI, 0);
        } else {
          // Normal menacing expression
          ctx.arc(centerX, centerY + radius * 0.3, radius * 0.25, 0.2, Math.PI - 0.2);
        }
        ctx.stroke();
      }
      
      // Update and render particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.02;
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        
        if (particle.life > 0) {
          const alpha = particle.life;
          ctx.fillStyle = `rgba(255, 100, 100, ${alpha})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 3 * particle.life, 0, Math.PI * 2);
          ctx.fill();
          
          // Particle glow
          const particleGlow = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, 10 * particle.life);
          particleGlow.addColorStop(0, `rgba(255, 150, 150, ${alpha * 0.8})`);
          particleGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = particleGlow;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 10 * particle.life, 0, Math.PI * 2);
          ctx.fill();
          
          return true;
        }
        return false;
      });
      
      // Health text with glow
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${health}/${maxHealth} HP`, centerX, centerY - radius - 30);
      ctx.shadowBlur = 0;
      
      // Defeat effect
      if (isDefeated) {
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 28px Arial';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 20;
        ctx.fillText('DEFEATED!', centerX, centerY + radius + 50);
        ctx.shadowBlur = 0;
      }
      
      // Reset transform
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [health, maxHealth, isAttacking, isDamaged, isDefeated]);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={400}
      className="border border-purple-500/50 rounded-lg bg-gradient-to-br from-purple-900/20 to-blue-900/20"
    />
  );
}

// Enhanced MoodPet with Advanced Animations
function EnhancedMoodPet({ emotion, message, animation }: {
  emotion: 'happy' | 'encouraging' | 'worried' | 'excited';
  message: string;
  animation: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const animate = () => {
      time += 0.016;
      
      // Clear with gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      gradient.addColorStop(0, '#001122');
      gradient.addColorStop(1, '#000011');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 35;
      
      // Pet animation
      let yOffset = 0;
      let scale = 1;
      if (animation === 'bounce') {
        yOffset = Math.sin(time * 12) * 15;
        scale = 1 + Math.sin(time * 12) * 0.1;
      } else if (animation === 'shake') {
        yOffset = Math.sin(time * 25) * 8;
      } else {
        yOffset = Math.sin(time * 6) * 5;
      }
      
      // Pet color based on emotion
      let color = '#44ff44';
      let glowColor = '#44ff44';
      if (emotion === 'worried') {
        color = '#ffaa44';
        glowColor = '#ff8800';
      } else if (emotion === 'excited') {
        color = '#ff44ff';
        glowColor = '#ff00ff';
      } else if (emotion === 'happy') {
        color = '#44ffff';
        glowColor = '#00ffff';
      }
      
      // Pet glow effect
      const petGlow = ctx.createRadialGradient(centerX, centerY + yOffset, 0, centerX, centerY + yOffset, radius * 2);
      petGlow.addColorStop(0, glowColor + '80');
      petGlow.addColorStop(0.5, glowColor + '40');
      petGlow.addColorStop(1, 'transparent');
      
      ctx.fillStyle = petGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY + yOffset, radius * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Pet body with gradient
      const bodyGradient = ctx.createRadialGradient(
        centerX - radius * 0.3, centerY + yOffset - radius * 0.3, 0,
        centerX, centerY + yOffset, radius * scale
      );
      bodyGradient.addColorStop(0, color + 'ff');
      bodyGradient.addColorStop(0.7, color + 'cc');
      bodyGradient.addColorStop(1, color + '88');
      
      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY + yOffset, radius * scale, 0, Math.PI * 2);
      ctx.fill();
      
      // Pet face
      ctx.fillStyle = '#000000';
      // Eyes
      ctx.beginPath();
      ctx.arc(centerX - 10, centerY - 8 + yOffset, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX + 10, centerY - 8 + yOffset, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Mouth based on emotion
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (emotion === 'happy' || emotion === 'excited') {
        ctx.arc(centerX, centerY + 5 + yOffset, 12, 0, Math.PI);
      } else if (emotion === 'worried') {
        ctx.arc(centerX, centerY + 20 + yOffset, 12, Math.PI, 0);
      } else {
        ctx.moveTo(centerX - 8, centerY + 10 + yOffset);
        ctx.lineTo(centerX + 8, centerY + 10 + yOffset);
      }
      ctx.stroke();
      
      // Sparkles around pet
      for (let i = 0; i < 8; i++) {
        const angle = (time * 2 + i * Math.PI / 4) % (Math.PI * 2);
        const sparkleX = centerX + Math.cos(angle) * (radius + 20);
        const sparkleY = centerY + yOffset + Math.sin(angle) * (radius + 20);
        const sparkleSize = 2 + Math.sin(time * 8 + i) * 1;
        
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [emotion, animation]);

  return (
    <div className="text-center">
      <canvas
        ref={canvasRef}
        width={150}
        height={120}
        className="border border-green-500/50 rounded-lg bg-gradient-to-br from-green-900/20 to-blue-900/20 mb-2"
      />
      <p className="text-sm text-white bg-black/70 rounded p-2 max-w-xs backdrop-blur-sm">
        {message}
      </p>
    </div>
  );
}

export default function EnhancedBattleArena({
  gameState,
  moodPet,
  currentTask,
  onTaskSelect,
  onGameStart,
  onGameReset
}: BattleArenaProps) {
  const [showEffects, setShowEffects] = useState(false);

  // Trigger effects on challenge damage
  useEffect(() => {
    if (gameState.gamePhase === 'task' && gameState.taskProgress === 100) {
      setShowEffects(true);
      setTimeout(() => setShowEffects(false), 1500);
    }
  }, [gameState.taskProgress]);

  const renderGamePhase = () => {
    switch (gameState.gamePhase) {
      case 'intro':
        return (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">Face Your Anxiety</h2>
              <p className="text-purple-200 text-lg">
                The enhanced anxiety challenge awaits. Use advanced calming techniques to conquer it!
              </p>
            </div>
            
            <div className="flex justify-center space-x-8">
              <EnhancedChallenge
                health={gameState.challengeHp}
                maxHealth={gameState.maxChallengeHp}
                isAttacking={false}
                isDamaged={false}
                isDefeated={false}
              />
              <EnhancedMoodPet
                emotion={moodPet.emotion}
                message={moodPet.message}
                animation={moodPet.animation}
              />
            </div>
            
            <Button
              onClick={onGameStart}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Sword className="h-5 w-5 mr-2" />
              Begin Enhanced Battle
            </Button>
          </div>
        );

      case 'battle':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Choose Your Advanced Technique</h2>
            </div>
            
            <div className="flex justify-center space-x-8 mb-6">
              <EnhancedChallenge
                health={gameState.challengeHp}
                maxHealth={gameState.maxChallengeHp}
                isAttacking={true}
                isDamaged={showEffects}
                isDefeated={gameState.challengeHp <= 0}
              />
              
              <EnhancedMoodPet
                emotion={moodPet.emotion}
                message={moodPet.message}
                animation={moodPet.animation}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => onTaskSelect('breathing')}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white p-4 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Heart className="h-5 w-5 mr-2" />
                Advanced Breathing
              </Button>
              <Button
                onClick={() => onTaskSelect('affirmation')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-4 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Shield className="h-5 w-5 mr-2" />
                Power Affirmation
              </Button>
              <Button
                onClick={() => onTaskSelect('grounding')}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white p-4 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Zap className="h-5 w-5 mr-2" />
                Enhanced Grounding
              </Button>
              <Button
                onClick={() => onTaskSelect('visualization')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Brain className="h-5 w-5 mr-2" />
                Epic Visualization
              </Button>
            </div>
          </div>
        );

      case 'task':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">{currentTask?.name}</h2>
              <p className="text-purple-200">{currentTask?.instructions}</p>
            </div>
            
            <div className="flex justify-center space-x-8 mb-6">
              <EnhancedChallenge
                health={gameState.challengeHp}
                maxHealth={gameState.maxChallengeHp}
                isAttacking={false}
                isDamaged={showEffects}
                isDefeated={false}
              />
              
              <EnhancedMoodPet
                emotion={moodPet.emotion}
                message={moodPet.message}
                animation={moodPet.animation}
              />
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-white mb-2">Enhanced Task Progress</div>
                <Progress value={gameState.taskProgress} className="h-4" />
                <div className="text-sm text-purple-200 mt-1">
                  {gameState.taskProgress.toFixed(0)}% Complete
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-lg text-white">{currentTask?.description}</p>
              </div>
            </div>
          </div>
        );

      case 'victory':
        return (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-yellow-400">Epic Victory!</h2>
              <p className="text-green-200 text-xl">
                You've conquered your anxiety with enhanced therapeutic power!
              </p>
            </div>
            
            <div className="flex justify-center space-x-8 mb-6">
              <EnhancedChallenge
                health={0}
                maxHealth={gameState.maxChallengeHp}
                isAttacking={false}
                isDamaged={false}
                isDefeated={true}
              />
              
              <EnhancedMoodPet
                emotion="excited"
                message="Incredible! You're a true warrior!"
                animation="bounce"
              />
            </div>
            
            <div className="bg-black/50 rounded-lg p-6 space-y-2">
              <div className="text-2xl font-bold text-yellow-400">Final Score: {gameState.score}</div>
              <div className="text-lg text-white">Tasks Completed: {gameState.tasksCompleted}</div>
              <div className="text-sm text-purple-300">Level Achieved: {gameState.level}</div>
            </div>
            
            <Button
              onClick={onGameReset}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Star className="h-5 w-5 mr-2" />
              Play Enhanced Mode Again
            </Button>
          </div>
        );

      case 'defeat':
        return (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-red-400">Rise Stronger!</h2>
              <p className="text-red-200 text-lg">
                Every challenge builds resilience. Your enhanced journey continues!
              </p>
            </div>
            
            <div className="flex justify-center space-x-8 mb-6">
              <EnhancedChallenge
                health={gameState.challengeHp}
                maxHealth={gameState.maxChallengeHp}
                isAttacking={true}
                isDamaged={false}
                isDefeated={false}
              />
              
              <EnhancedMoodPet
                emotion="worried"
                message="Don't give up! You have the power within!"
                animation="shake"
              />
            </div>
            
            <div className="bg-black/50 rounded-lg p-6 space-y-2">
              <div className="text-xl text-white">Score: {gameState.score}</div>
              <div className="text-lg text-gray-300">Tasks Completed: {gameState.tasksCompleted}</div>
            </div>
            
            <Button
              onClick={onGameReset}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Enhanced Retry
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[600px] bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-indigo-900/30 rounded-lg p-6">
      {renderGamePhase()}
    </div>
  );
}
