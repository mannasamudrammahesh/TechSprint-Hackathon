"use client";

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Sword, Shield, Heart, Zap } from 'lucide-react';

interface VoiceGameControllerProps {
  gameType?: 'moodpet' | 'anxiety_battler';
  onGameAction?: (action: string) => void;
  onGameStart?: (gameType: string) => void;
}

export default function VoiceGameController({ 
  gameType, 
  onGameAction, 
  onGameStart 
}: VoiceGameControllerProps) {
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Listen for voice game commands
    const handleGameCommand = (event: CustomEvent) => {
      const { intent, command } = event.detail;
      console.log('Voice game command received:', intent, command);
      
      if (intent === 'start_moodpet' || intent === 'start_anxiety_battler') {
        const gameType = intent === 'start_moodpet' ? 'moodpet' : 'anxiety_battler';
        onGameStart?.(gameType);
        setLastAction(`Started ${gameType}`);
      }
    };

    // Listen for voice game actions
    const handleGameAction = (event: CustomEvent) => {
      const { intent, command } = event.detail;
      console.log('Voice game action received:', intent, command);
      
      let action = '';
      switch (intent) {
        case 'game_attack':
          action = 'attack';
          break;
        case 'game_defend':
          action = 'defend';
          break;
        case 'game_heal':
          action = 'heal';
          break;
        case 'game_special':
          action = 'special';
          break;
        default:
          return;
      }
      
      onGameAction?.(action);
      setLastAction(action);
      
      // Clear last action after 3 seconds
      setTimeout(() => setLastAction(null), 3000);
    };

    window.addEventListener('voice-game-command', handleGameCommand as EventListener);
    window.addEventListener('voice-game-action', handleGameAction as EventListener);

    return () => {
      window.removeEventListener('voice-game-command', handleGameCommand as EventListener);
      window.removeEventListener('voice-game-action', handleGameAction as EventListener);
    };
  }, [onGameAction, onGameStart]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'attack': return <Sword className="h-4 w-4" />;
      case 'defend': return <Shield className="h-4 w-4" />;
      case 'heal': return <Heart className="h-4 w-4" />;
      case 'special': return <Zap className="h-4 w-4" />;
      default: return <Gamepad2 className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'attack': return 'bg-red-500';
      case 'defend': return 'bg-blue-500';
      case 'heal': return 'bg-green-500';
      case 'special': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-80 shadow-lg border-2 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          Voice Game Controller
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Game Type Display */}
        {gameType && (
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">
                Active Game: {gameType === 'moodpet' ? 'Mood Pet' : 'Anxiety Battler'}
              </span>
            </div>
          </div>
        )}

        {/* Last Action */}
        {lastAction && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              {getActionIcon(lastAction)}
              <span className="text-sm font-medium">
                Last Action: {lastAction}
              </span>
            </div>
          </div>
        )}

        {/* Voice Commands */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Voice Commands:</h4>
          <div className="grid grid-cols-2 gap-2">
            <Badge variant="outline" className="justify-center">
              "Attack" → <Sword className="h-3 w-3 ml-1" />
            </Badge>
            <Badge variant="outline" className="justify-center">
              "Defend" → <Shield className="h-3 w-3 ml-1" />
            </Badge>
            <Badge variant="outline" className="justify-center">
              "Heal" → <Heart className="h-3 w-3 ml-1" />
            </Badge>
            <Badge variant="outline" className="justify-center">
              "Special" → <Zap className="h-3 w-3 ml-1" />
            </Badge>
          </div>
        </div>

        {/* Game Start Commands */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Start Games:</h4>
          <div className="space-y-1">
            <Badge variant="secondary" className="w-full justify-center">
              "Start Mood Pet" or "Play Mood Pet"
            </Badge>
            <Badge variant="secondary" className="w-full justify-center">
              "Start Anxiety Battler" or "Play Anxiety Battler"
            </Badge>
          </div>
        </div>

        {/* Status */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <p>🎮 Voice commands work with active games</p>
          <p>🎯 Say "Hey Healix" first to activate</p>
        </div>
      </CardContent>
    </Card>
  );
}
