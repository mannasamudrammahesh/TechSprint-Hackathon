"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sword, Shield, Heart, Zap, Brain, Star } from 'lucide-react';

interface BattleArenaProps {
  gameState: {
    challengeHp: number;
    maxChallengeHp: number;
    playerStress: number;
    maxPlayerStress: number;
    currentTask: string;
    taskProgress: number;
    gamePhase: 'selection' | 'intro' | 'battle' | 'task' | 'victory' | 'defeat';
    score: number;
    tasksCompleted: number;
    level: number;
    isGameActive: boolean;
    selectedIssue: string;
    completedTasks: string[];
    playerAttacks: number;
    comboMultiplier: number;
  };
  moodPet: {
    emotion: 'happy' | 'encouraging' | 'worried' | 'excited';
    message: string;
    animation: string;
  };
  currentTask: any;
  currentBoss: any;
  availableTasks: any[];
  onTaskSelect: (taskId: string) => void;
  onGameStart: () => void;
  onGameReset: () => void;
  playerAttackAnimation: string;
  bossAttackAnimation: string;
  showDamageNumbers: {damage: number, type: string} | null;
  isVictoryAnimating: boolean;
}

// 2D Canvas Animation Component
function Canvas2DArena({ 
  gameState, 
  currentBoss, 
  playerAttackAnimation, 
  bossAttackAnimation, 
  showDamageNumbers, 
  isVictoryAnimating 
}: {
  gameState: any;
  currentBoss: any;
  playerAttackAnimation: string;
  bossAttackAnimation: string;
  showDamageNumbers: {damage: number, type: string} | null;
  isVictoryAnimating: boolean;
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
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.5, '#16213e');
      gradient.addColorStop(1, '#0f3460');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      ctx.fillStyle = 'white';
      for (let i = 0; i < 50; i++) {
        const x = (i * 123) % canvas.width;
        const y = (i * 456) % canvas.height;
        const size = Math.sin(time + i) * 0.5 + 1;
        ctx.fillRect(x, y, size, size);
      }

      // Draw player (left side)
      const playerX = 100;
      const playerY = canvas.height - 150;
      const playerBounce = Math.sin(time * 4) * 5;
      
      // Player attack animation
      const playerScale = playerAttackAnimation ? 1.2 + Math.sin(time * 20) * 0.1 : 1;
      const playerColor = playerAttackAnimation ? '#44ff44' : '#4CAF50';
      
      ctx.fillStyle = playerColor;
      ctx.fillRect(playerX - 20 * playerScale, playerY + playerBounce - 40 * playerScale, 40 * playerScale, 80 * playerScale);
      
      // Player head
      ctx.beginPath();
      ctx.arc(playerX, playerY + playerBounce - 60, 15 * playerScale, 0, Math.PI * 2);
      ctx.fillStyle = '#ffddaa';
      ctx.fill();

      // Draw boss (right side)
      const bossX = canvas.width - 150;
      const bossY = canvas.height - 200;
      const bossFloat = Math.sin(time * 2) * 10;
      
      // Challenge core with advanced materials
      const bossColor = currentBoss?.color || '#ff4444';
      const bossScale = bossAttackAnimation ? 1.3 + Math.sin(time * 15) * 0.1 : 1;
      
      ctx.fillStyle = bossColor;
      ctx.fillRect(bossX - 30 * bossScale, bossY + bossFloat - 60 * bossScale, 60 * bossScale, 120 * bossScale);
      
      // Challenge eyes with glow
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(bossX - 15, bossY + bossFloat - 40, 8, 8);
      ctx.fillRect(bossX + 7, bossY + bossFloat - 40, 8, 8);

      // Victory animals animation
      if (isVictoryAnimating) {
        for (let i = 0; i < 8; i++) {
          const angle = (time + i) * 0.5;
          const x = canvas.width / 2 + Math.cos(angle) * 100;
          const y = canvas.height / 2 + Math.sin(angle) * 50 + Math.sin(time * 3 + i) * 20;
          
          ctx.fillStyle = `hsl(${i * 45}, 70%, 60%)`;
          ctx.beginPath();
          ctx.arc(x, y, 15, 0, Math.PI * 2);
          ctx.fill();
          
          // Animal ears
          ctx.fillRect(x - 8, y - 15, 4, 8);
          ctx.fillRect(x + 4, y - 15, 4, 8);
        }
        
        // Celebration particles
        for (let i = 0; i < 30; i++) {
          const x = canvas.width / 2 + Math.cos(time * 2 + i) * (50 + i * 5);
          const y = canvas.height / 2 + Math.sin(time * 3 + i) * (30 + i * 3);
          ctx.fillStyle = '#ffff00';
          ctx.fillRect(x, y, 3, 3);
        }
      }

      // Damage numbers
      if (showDamageNumbers) {
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`-${showDamageNumbers.damage}`, bossX, bossY - 100);
        ctx.font = '14px Arial';
        ctx.fillText(showDamageNumbers.type, bossX, bossY - 75);
      }

      // Combat effects
      if (playerAttackAnimation || bossAttackAnimation) {
        // Lightning effect
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(playerX + 30, playerY);
        ctx.lineTo(bossX - 30, bossY);
        ctx.stroke();
        
        // Challenge aura particles
        for (let i = 0; i < 10; i++) {
          const x = (playerX + bossX) / 2 + Math.random() * 40 - 20;
          const y = (playerY + bossY) / 2 + Math.random() * 40 - 20;
          ctx.fillStyle = `hsl(${Math.random() * 60 + 30}, 100%, 50%)`;
          ctx.fillRect(x, y, 4, 4);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, currentBoss, playerAttackAnimation, bossAttackAnimation, showDamageNumbers, isVictoryAnimating]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="w-full h-full border-2 border-purple-500 rounded-lg"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}

// Main Advanced 3D Battle Arena Component
export default function Advanced3DBattleArena({ 
  gameState, 
  moodPet, 
  currentTask, 
  currentBoss,
  availableTasks,
  onTaskSelect, 
  onGameStart, 
  onGameReset,
  playerAttackAnimation,
  bossAttackAnimation,
  showDamageNumbers,
  isVictoryAnimating
}: BattleArenaProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading time for assets
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
          <p className="text-white text-xl font-bold">Loading Battle Arena...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-900">
        <div className="text-center">
          <p className="text-white text-xl font-bold mb-4">Error Loading Arena</p>
          <p className="text-red-200">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Main Canvas Arena */}
      <div className="w-full h-full flex items-center justify-center p-4">
        <Canvas2DArena
          gameState={gameState}
          currentBoss={currentBoss}
          playerAttackAnimation={playerAttackAnimation}
          bossAttackAnimation={bossAttackAnimation}
          showDamageNumbers={showDamageNumbers}
          isVictoryAnimating={isVictoryAnimating}
        />
      </div>
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <Card className="bg-black/70 backdrop-blur-sm border-purple-500">
          <CardContent className="p-4 text-white">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Sword className="w-5 h-5" />
              Battle Status
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Phase:</span>
                <Badge variant="outline" className="capitalize text-white border-white">
                  {gameState.gamePhase}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Score:</span>
                <span className="text-yellow-400 font-bold">{gameState.score}</span>
              </div>
              <div className="flex justify-between">
                <span>Tasks:</span>
                <span className="text-green-400 font-bold">{gameState.tasksCompleted}/5</span>
              </div>
              {gameState.comboMultiplier > 1 && (
                <div className="flex justify-between">
                  <span>Combo:</span>
                  <span className="text-orange-400 font-bold animate-pulse">
                    x{gameState.comboMultiplier.toFixed(1)}
                  </span>
                </div>
              )}
              {currentBoss && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">{currentBoss.name}:</span>
                    <span className="text-sm">{gameState.challengeHp}/{gameState.maxChallengeHp} HP</span>
                  </div>
                  <Progress 
                    value={(gameState.challengeHp / gameState.maxChallengeHp) * 100} 
                    className="h-2"
                  />
                </Advanced3DChallenge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Mood Pet Display */}
      <div className="absolute top-4 right-4 z-10">
        <Card className="bg-black/70 backdrop-blur-sm border-blue-500">
          <CardContent className="p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-pink-400" />
              <span className="font-bold">Mood Pet</span>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">
                {moodPet.emotion === 'happy' && '😊'}
                {moodPet.emotion === 'encouraging' && '💪'}
                {moodPet.emotion === 'worried' && '😟'}
                {moodPet.emotion === 'excited' && '🎉'}
              </Advanced3DChallenge>
              <p className="text-sm text-gray-300">{moodPet.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Controls */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="flex space-x-2">
          <Button
            onClick={onGameStart}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={gameState.isGameActive}
          >
            <Zap className="w-4 h-4 mr-2" />
            Start Battle
          </Button>
          <Button
            onClick={onGameReset}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Shield className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Game Phase Specific UI */}
      {gameState.gamePhase === 'victory' && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50">
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 border-0">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-4">VICTORY!</h2>
              <p className="text-xl text-white mb-4">
                You defeated the {currentBoss?.name || 'Boss'}!
              </p>
              <p className="text-lg text-yellow-100 mb-6">
                Final Score: {gameState.score} points
              </p>
              <Button
                onClick={onGameReset}
                className="bg-white text-orange-600 hover:bg-gray-100"
              >
                <Star className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {gameState.gamePhase === 'defeat' && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50">
          <Card className="bg-gradient-to-r from-red-600 to-red-800 border-0">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">💔</div>
              <h2 className="text-3xl font-bold text-white mb-4">DEFEAT</h2>
              <p className="text-xl text-white mb-4">
                The {currentBoss?.name || 'Boss'} was too strong this time.
              </p>
              <p className="text-lg text-red-100 mb-6">
                Score: {gameState.score} points
              </p>
              <Button
                onClick={onGameReset}
                className="bg-white text-red-600 hover:bg-gray-100"
              >
                <Brain className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}




