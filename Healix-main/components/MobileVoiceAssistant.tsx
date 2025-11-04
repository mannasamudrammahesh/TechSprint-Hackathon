"use client";

import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useAuth } from '@/contexts/AuthContext';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import toast from 'react-hot-toast';

interface MobileVoiceAssistantProps {
  onTranscript?: (transcript: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  className?: string;
  language?: string;
}

export const MobileVoiceAssistant: React.FC<MobileVoiceAssistantProps> = ({
  onTranscript,
  onSubmit,
  disabled = false,
  className,
  language = 'en-US'
}) => {
  const { user } = useAuth();
  const isMobile = useMobileDetection();
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false);

  const {
    isListening,
    isWakeWordMode,
    isAuthenticatedForVoice,
    startListening,
    startWakeWordDetection,
    stopListening,
    speakGreeting,
    cleanup
  } = useVoiceAssistant({
    onTranscript: (transcript) => {
      if (onTranscript) {
        onTranscript(transcript);
      }
      // Auto-submit after capturing voice
      if (onSubmit) {
        setTimeout(onSubmit, 1500);
      }
    },
    onWakeWordDetected: () => {
      // Wake word detected, greeting will be spoken automatically
    },
    language,
    autoSubmit: true,
    autoSubmitDelay: 1500
  });

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Don't render on desktop/tablet
  if (!isMobile) {
    return null;
  }

  // Show authentication required message for mobile users
  if (!isAuthenticatedForVoice) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <MicOff className="w-8 h-8 text-yellow-600" />
        <p className="text-sm text-yellow-800 text-center">
          Please sign in to use voice features on mobile devices
        </p>
      </div>
    );
  }

  const handleVoiceInput = () => {
    if (disabled) return;
    
    if (isListening || isWakeWordMode) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleWakeWordToggle = () => {
    if (disabled) return;

    if (isWakeWordMode) {
      stopListening();
      setWakeWordEnabled(false);
    } else {
      startWakeWordDetection();
      setWakeWordEnabled(true);
    }
  };

  const handleGreeting = () => {
    if (disabled) return;
    speakGreeting();
  };

  return (
    <div className={cn("flex flex-col gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Voice Assistant</h3>
        <div className="flex items-center gap-1">
          {user && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Authenticated
            </span>
          )}
        </div>
      </div>

      {/* Status */}
      {(isListening || isWakeWordMode) && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-blue-700">
            {isWakeWordMode ? "Listening for 'Hey Healix'..." : "Listening..."}
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {/* Voice Input Button */}
        <Button
          variant={isListening ? "destructive" : "default"}
          size="sm"
          onClick={handleVoiceInput}
          disabled={disabled || isWakeWordMode}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 h-10",
            isListening && "animate-pulse"
          )}
        >
          <Mic size={16} />
          <span className="text-sm">
            {isListening ? "Stop" : "Voice Input"}
          </span>
        </Button>

        {/* Wake Word Toggle */}
        <Button
          variant={isWakeWordMode ? "destructive" : "outline"}
          size="sm"
          onClick={handleWakeWordToggle}
          disabled={disabled || isListening}
          className={cn(
            "flex items-center justify-center gap-2 h-10 px-3",
            isWakeWordMode && "animate-pulse"
          )}
          title={isWakeWordMode ? "Stop wake word detection" : "Start wake word detection"}
        >
          {isWakeWordMode ? <MicOff size={16} /> : <Mic size={16} />}
          <span className="text-xs">
            {isWakeWordMode ? "Stop" : "Wake"}
          </span>
        </Button>

        {/* Greeting Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleGreeting}
          disabled={disabled}
          className="flex items-center justify-center gap-2 h-10 px-3"
          title="Play greeting"
        >
          <Volume2 size={16} />
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-600 space-y-1">
        <p>• Tap "Voice Input" to speak directly</p>
        <p>• Tap "Wake" to enable "Hey Healix" detection</p>
        <p>• Tap speaker icon to hear personalized greeting</p>
        {wakeWordEnabled && (
          <p className="text-blue-600 font-medium">💡 Try saying: "Hey Healix" or "Hello Healix"</p>
        )}
      </div>
    </div>
  );
};

export default MobileVoiceAssistant;