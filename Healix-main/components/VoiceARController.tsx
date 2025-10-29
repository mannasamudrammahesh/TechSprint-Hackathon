"use client";

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Play, Square, Wind } from 'lucide-react';

interface VoiceARControllerProps {
  onStartBreathing?: () => void;
  onStopBreathing?: () => void;
  isActive?: boolean;
}

export default function VoiceARController({ 
  onStartBreathing, 
  onStopBreathing,
  isActive = false 
}: VoiceARControllerProps) {
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  useEffect(() => {
    // Listen for voice AR commands
    const handleARCommand = (event: CustomEvent) => {
      const { intent, command } = event.detail;
      console.log('Voice AR command received:', intent, command);
      
      switch (intent) {
        case 'start_ar_breathing':
          onStartBreathing?.();
          setLastCommand('Started AR breathing');
          break;
        case 'stop_ar_breathing':
          onStopBreathing?.();
          setLastCommand('Stopped AR breathing');
          break;
        default:
          return;
      }
      
      // Clear last command after 3 seconds
      setTimeout(() => setLastCommand(null), 3000);
    };

    window.addEventListener('voice-ar-command', handleARCommand as EventListener);

    return () => {
      window.removeEventListener('voice-ar-command', handleARCommand as EventListener);
    };
  }, [onStartBreathing, onStopBreathing]);

  return (
    <Card className="w-80 shadow-lg border-2 border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Voice AR Controller
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium">
              AR Breathing: {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Last Command */}
        {lastCommand && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4" />
              <span className="text-sm font-medium">
                Last Command: {lastCommand}
              </span>
            </div>
          </div>
        )}

        {/* Voice Commands */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Voice Commands:</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-green-500" />
              <Badge variant="outline" className="flex-1 justify-center">
                "Start AR breathing" or "Start breathing exercise"
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Square className="h-4 w-4 text-red-500" />
              <Badge variant="outline" className="flex-1 justify-center">
                "Stop breathing" or "End breathing exercise"
              </Badge>
            </div>
          </div>
        </div>

        {/* Alternative Commands */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Alternative Phrases:</h4>
          <div className="grid grid-cols-1 gap-1">
            <Badge variant="secondary" className="w-full justify-center text-xs">
              "AR mirror"
            </Badge>
            <Badge variant="secondary" className="w-full justify-center text-xs">
              "Breathing mirror"
            </Badge>
            <Badge variant="secondary" className="w-full justify-center text-xs">
              "Close breathing"
            </Badge>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <p>🧘 Voice commands control AR breathing exercises</p>
          <p>🎯 Say "Hey Healix" first to activate</p>
          <p>📱 Works with camera-based AR features</p>
        </div>
      </CardContent>
    </Card>
  );
}
