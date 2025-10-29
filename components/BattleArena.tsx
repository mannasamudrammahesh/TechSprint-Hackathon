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

// 2D Canvas Challenge Component
function ChallengeCanvas({ health, maxHealth, isAttacking, isDamaged, isDefeated }: {
  health: number;
  maxHealth: number;
  isAttacking: boolean;
  isDamaged: boolean;
  isDefeated: boolean;
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
      time += 0.016; // ~60fps
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Challenge size based on health
      const baseRadius = 80;
      const healthRatio = health / maxHealth;
      let radius = baseRadius * healthRatio;
      
      // Animation effects
      if (isDefeated) {
        radius = baseRadius * Math.max(0, healthRatio - time * 0.5);
      } else if (isDamaged) {
        radius = baseRadius * (healthRatio + Math.sin(time * 20) * 0.1);
      } else if (isAttacking) {
        radius = baseRadius * (healthRatio + Math.sin(time * 8) * 0.2);
      } else {
        radius = baseRadius * (healthRatio + Math.sin(time * 2) * 0.05);
      }
      
      // Challenge color based on health
      let color = '#8844ff';
      if (health < 30) color = '#ff4444';
      else if (health < 60) color = '#ff8844';
      
      // Challenge body with glow effect
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.7, color + '80');
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Attack effect
      if (isAttacking) {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 4;
        ctx.setLineDash([5, 5]);
        ctx.lineDashOffset = -time * 10;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 15 + Math.sin(time * 10) * 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // Challenge face
      if (!isDefeated) {
        // Eyes
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(centerX - radius * 0.3, centerY - radius * 0.2, radius * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + radius * 0.3, centerY - radius * 0.2, radius * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouth
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (isAttacking) {
          ctx.arc(centerX, centerY + radius * 0.2, radius * 0.3, 0, Math.PI);
        } else {
          ctx.arc(centerX, centerY + radius * 0.4, radius * 0.2, 0, Math.PI);
        }
        ctx.stroke();
      }
      
      // Health text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${health}/${maxHealth} HP`, centerX, centerY - radius - 20);
      
      // Defeat effect
      if (isDefeated) {
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('DEFEATED!', centerX, centerY + radius + 40);
      }
      
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
      width={400}
      height={400}
      className="border border-purple-500/50 rounded-lg bg-gradient-to-br from-purple-900/20 to-blue-900/20"
    />
  );
}

// 2D Canvas MoodPet Component
function MoodPetCanvas({ emotion, message, animation }: {
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
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 30;
      
      // Pet body animation
      let yOffset = 0;
      if (animation === 'bounce') {
        yOffset = Math.sin(time * 8) * 10;
      } else if (animation === 'shake') {
        yOffset = Math.sin(time * 20) * 5;
      } else {
        yOffset = Math.sin(time * 4) * 3;
      }
      
      // Pet color based on emotion
      let color = '#44ff44';
      if (emotion === 'worried') color = '#ffaa44';
      else if (emotion === 'excited') color = '#ff44ff';
      else if (emotion === 'happy') color = '#44ffff';
      
      // Pet body
      const gradient = ctx.createRadialGradient(centerX, centerY + yOffset, 0, centerX, centerY + yOffset, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color + '40');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY + yOffset, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Pet face
      ctx.fillStyle = '#000000';
      // Eyes
      ctx.beginPath();
      ctx.arc(centerX - 8, centerY - 5 + yOffset, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX + 8, centerY - 5 + yOffset, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Mouth based on emotion
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (emotion === 'happy' || emotion === 'excited') {
        ctx.arc(centerX, centerY + 5 + yOffset, 8, 0, Math.PI);
      } else if (emotion === 'worried') {
        ctx.arc(centerX, centerY + 15 + yOffset, 8, Math.PI, 0);
      } else {
        ctx.moveTo(centerX - 6, centerY + 8 + yOffset);
        ctx.lineTo(centerX + 6, centerY + 8 + yOffset);
      }
      ctx.stroke();
      
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
        width={120}
        height={120}
        className="border border-green-500/50 rounded-lg bg-gradient-to-br from-green-900/20 to-blue-900/20 mb-2"
      />
      <p className="text-sm text-white bg-black/50 rounded p-2 max-w-xs">
        {message}
      </p>
    </div>
  );
}

export default function BattleArena({
  gameState,
  moodPet,
  currentTask,
  onTaskSelect,
  onGameStart,
  onGameReset
}: BattleArenaProps) {
  const [showEffects, setShowEffects] = useState(false);

  // Trigger effects on boss damage
  useEffect(() => {
    if (gameState.gamePhase === 'task' && gameState.taskProgress === 100) {
      setShowEffects(true);
      setTimeout(() => setShowEffects(false), 1000);
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
                The anxiety boss awaits. Use calming techniques to defeat it!
              </p>
            </div>
            
            <div className="flex justify-center">
              <ChallengeCanvas
                health={gameState.challengeHp}
                maxHealth={gameState.maxChallengeHp}
                isAttacking={false}
                isDamaged={false}
                isDefeated={false}
              />
            </div>
            
            <Button
              onClick={onGameStart}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
            >
              <Sword className="h-5 w-5 mr-2" />
              Begin Battle
            </Button>
          </div>
        );

      case 'battle':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Choose Your Technique</h2>
            </div>
            
            <div className="flex justify-center space-x-8">
              <ChallengeCanvas
                health={gameState.challengeHp}
                maxHealth={gameState.maxChallengeHp}
                isAttacking={true}
                isDamaged={showEffects}
                isDefeated={gameState.challengeHp <= 0}
              />
              
              <MoodPetCanvas
                emotion={moodPet.emotion}
                message={moodPet.message}
                animation={moodPet.animation}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => onTaskSelect('breathing')}
                className="bg-blue-600 hover:bg-blue-700 text-white p-4"
              >
                <Heart className="h-5 w-5 mr-2" />
                Deep Breathing
              </Button>
              <Button
                onClick={() => onTaskSelect('affirmation')}
                className="bg-green-600 hover:bg-green-700 text-white p-4"
              >
                <Shield className="h-5 w-5 mr-2" />
                Positive Affirmation
              </Button>
              <Button
                onClick={() => onTaskSelect('grounding')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white p-4"
              >
                <Zap className="h-5 w-5 mr-2" />
                5-4-3-2-1 Grounding
              </Button>
              <Button
                onClick={() => onTaskSelect('visualization')}
                className="bg-purple-600 hover:bg-purple-700 text-white p-4"
              >
                <Brain className="h-5 w-5 mr-2" />
                Visualization
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
            
            <div className="flex justify-center space-x-8">
              <ChallengeCanvas
                health={gameState.challengeHp}
                maxHealth={gameState.maxChallengeHp}
                isAttacking={false}
                isDamaged={false}
                isDefeated={false}
              />
              
              <MoodPetCanvas
                emotion={moodPet.emotion}
                message={moodPet.message}
                animation={moodPet.animation}
              />
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-white mb-2">Task Progress</div>
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
              <h2 className="text-4xl font-bold text-yellow-400">Victory!</h2>
              <p className="text-green-200 text-xl">
                You've conquered your anxiety!
              </p>
            </div>
            
            <div className="flex justify-center space-x-8">
              <ChallengeCanvas
                health={0}
                maxHealth={gameState.maxChallengeHp}
                isAttacking={false}
                isDamaged={false}
                isDefeated={true}
              />
              
              <MoodPetCanvas
                emotion="excited"
                message="Amazing! You did it!"
                animation="bounce"
              />
            </div>
            
            <div className="bg-black/50 rounded-lg p-6 space-y-2">
              <div className="text-2xl font-bold text-yellow-400">Final Score: {gameState.score}</div>
              <div className="text-lg text-white">Tasks Completed: {gameState.tasksCompleted}</div>
            </div>
            
            <Button
              onClick={onGameReset}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
            >
              <Star className="h-5 w-5 mr-2" />
              Play Again
            </Button>
          </div>
        );

      case 'defeat':
        return (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-red-400">Don't Give Up!</h2>
              <p className="text-red-200 text-lg">
                Every attempt makes you stronger. Try again!
              </p>
            </div>
            
            <div className="flex justify-center space-x-8">
              <ChallengeCanvas
                health={gameState.challengeHp}
                maxHealth={gameState.maxChallengeHp}
                isAttacking={true}
                isDamaged={false}
                isDefeated={false}
              />
              
              <MoodPetCanvas
                emotion="worried"
                message="You can do this! Don't give up!"
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Try Again
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
