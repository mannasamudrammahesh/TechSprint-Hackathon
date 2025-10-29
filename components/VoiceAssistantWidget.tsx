"use client";

import React, { useState, useEffect } from 'react';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useUserSettings } from '@/contexts/UserSettingsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  AlertCircle, 
  Brain,
  Gamepad2,
  Heart,
  MessageSquare,
  Home,
  Activity
} from 'lucide-react';

interface VoiceAssistantWidgetProps {
  onClose?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  compact?: boolean;
}

export default function VoiceAssistantWidget({ 
  onClose, 
  position = 'bottom-right',
  compact = false 
}: VoiceAssistantWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const { settings } = useUserSettings();
  
  const {
    state,
    toggleListening,
    activateAssistant,
    deactivateAssistant,
    speak
  } = useVoiceAssistant({
    hotword: settings.wakeWord,
    continuous: true,
    enableTTS: settings.voiceEnabled,
    enableGestures: settings.gestureEnabled
  });

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  // Status color mapping
  const getStatusColor = () => {
    switch (state.status) {
      case 'listening': return 'bg-green-500';
      case 'processing': return 'bg-yellow-500';
      case 'speaking': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (state.status) {
      case 'listening': return state.isActive ? 'Listening for commands' : `Listening for "Hey ${settings.assistantName}"`;
      case 'processing': return 'Processing command...';
      case 'speaking': return 'Speaking...';
      case 'error': return 'Error - Check permissions';
      default: return 'Ready';
    }
  };

  // Sample commands for help
  const sampleCommands = [
    { category: 'Navigation', icon: Home, commands: ['Go home', 'Open chatbot', 'Start therapy', 'Show insights'] },
    { category: 'Games', icon: Gamepad2, commands: ['Start Mood Pet', 'Play Anxiety Battler', 'Attack', 'Defend', 'Heal'] },
    { category: 'Wellness', icon: Heart, commands: ['Start AR breathing', 'Stop breathing exercise'] },
    { category: 'Assistant', icon: Brain, commands: [`Hey ${settings.assistantName}`, 'Help', 'Goodbye'] }
  ];

  // Compact widget (just the mic button)
  if (compact) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <Button
          onClick={toggleListening}
          size="lg"
          className={`rounded-full w-16 h-16 shadow-lg ${
            state.isListening ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {state.isListening ? (
            <Mic className="h-6 w-6 animate-pulse" />
          ) : (
            <MicOff className="h-6 w-6" />
          )}
        </Button>
        
        {isExpanded && (
          <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-xl border p-4 min-w-80">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
                <span className="text-sm font-medium">{getStatusText()}</span>
              </div>
              
              {state.transcript && (
                <div className="text-sm text-gray-600">
                  <strong>You said:</strong> "{state.transcript}"
                </div>
              )}
              
              {state.lastCommand && (
                <div className="text-sm text-blue-600">
                  <strong>Command:</strong> {state.lastCommand.intent}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={toggleListening} size="sm" variant="outline">
                  {state.isListening ? 'Stop' : 'Start'} Listening
                </Button>
                <Button onClick={() => setIsExpanded(false)} size="sm" variant="ghost">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full widget
  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <Card className="w-96 shadow-2xl border-2 border-blue-200 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full animate-pulse ${getStatusColor()}`}></div>
              {settings.assistantName} Voice Assistant
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCommands(!showCommands)}
                className="h-8 w-8 p-0"
              >
                <Brain className="h-4 w-4" />
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
              <span className="text-sm font-medium">{getStatusText()}</span>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${state.isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">
                {state.isListening ? 'Listening' : 'Not listening'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${state.isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">
                {state.isSpeaking ? 'Speaking' : 'Not speaking'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleListening}
              variant={state.isListening ? "default" : "outline"}
              size="sm"
              className="flex-1"
            >
              {state.isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
              {state.isListening ? 'Stop Listening' : 'Start Listening'}
            </Button>
            
            <Button
              onClick={() => speak("Hello! I'm here to help.")}
              variant={state.isSpeaking ? "default" : "outline"}
              size="sm"
            >
              {state.isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Transcript */}
          {state.transcript && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">You said:</label>
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-800">
                "{state.transcript}"
              </div>
            </div>
          )}

          {/* Last Command */}
          {state.lastCommand && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Last Command:</label>
              <div className="p-3 bg-blue-50 rounded-lg text-sm text-gray-800">
                <Badge variant="secondary" className="mb-2">
                  {state.lastCommand.intent}
                </Badge>
                <div>Confidence: {(state.lastCommand.confidence * 100).toFixed(0)}%</div>
              </div>
            </div>
          )}

          {/* Error */}
          {state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {/* Commands Help */}
          {showCommands && (
            <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-700">Voice Commands:</h4>
              {sampleCommands.map((category, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                    <category.icon className="h-4 w-4" />
                    {category.category}:
                  </div>
                  <div className="flex flex-wrap gap-1 ml-6">
                    {category.commands.map((command, cmdIndex) => (
                      <Badge key={cmdIndex} variant="outline" className="text-xs">
                        "{command}"
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-700">How to use:</p>
            <p>• Say <strong>"Hey {settings.assistantName}"</strong> to activate</p>
            <p>• Give voice commands for navigation and games</p>
            <p>• Say "goodbye" to deactivate</p>
            <p className="mt-2 text-blue-600">Make sure your microphone is enabled!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
