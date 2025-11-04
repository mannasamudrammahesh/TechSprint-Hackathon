"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { voiceSelector, detectWakeWord, getSpeechRecognitionLanguage } from "@/lib/voiceSelection";
import toast from "react-hot-toast";

interface MobileVoiceAssistantProps {
  onVoiceInput: (text: string) => void;
  onWakeWordDetected: () => void;
  isLoading?: boolean;
  className?: string;
}

export default function MobileVoiceAssistant({
  onVoiceInput,
  onWakeWordDetected,
  isLoading = false,
  className = "",
}: MobileVoiceAssistantProps) {
  const { user } = useAuth();
  const { settings } = useUserSettings();
  const [isListening, setIsListening] = useState(false);
  const [isWakeWordListening, setIsWakeWordListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [lastSpeechTime, setLastSpeechTime] = useState(0);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const wakeWordRecognitionRef = useRef<SpeechRecognition | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const greetingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user is on mobile device
  const isMobile = () => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 768; // Mobile breakpoint
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Main speech recognition for user input
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = getSpeechRecognitionLanguage(settings.voiceLanguage);
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      if (transcript) {
        onVoiceInput(transcript);
        setLastSpeechTime(Date.now());
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "aborted") {
        toast.error(`Voice input error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Wake word detection (continuous listening)
    const wakeWordRecognition = new SpeechRecognition();
    wakeWordRecognition.continuous = true;
    wakeWordRecognition.interimResults = true;
    wakeWordRecognition.lang = getSpeechRecognitionLanguage(settings.voiceLanguage);

    wakeWordRecognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase().trim();
      
      if (transcript && detectWakeWord(transcript, settings.voiceLanguage, settings.wakeWord)) {
        // Prevent multiple wake word detections within 3 seconds
        const now = Date.now();
        if (now - lastSpeechTime < 3000) return;
        
        setLastSpeechTime(now);
        handleWakeWordDetected();
      }
    };

    wakeWordRecognition.onerror = (event) => {
      if (event.error !== "aborted" && event.error !== "no-speech") {
        console.error("Wake word detection error:", event.error);
      }
    };

    wakeWordRecognition.onend = () => {
      // Restart wake word listening if it was enabled
      if (isWakeWordListening && settings.autoActivate) {
        setTimeout(() => {
          try {
            wakeWordRecognition.start();
          } catch (error) {
            console.error("Failed to restart wake word detection:", error);
          }
        }, 1000);
      }
    };

    wakeWordRecognitionRef.current = wakeWordRecognition;

    return () => {
      try {
        recognition.stop();
        wakeWordRecognition.stop();
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    };
  }, [settings.voiceLanguage, settings.wakeWord, settings.autoActivate, isWakeWordListening, lastSpeechTime, onVoiceInput]);

  // Handle wake word detection
  const handleWakeWordDetected = useCallback(() => {
    if (!user && isMobile()) {
      toast.error("Please sign in to use voice features on mobile");
      return;
    }

    // Stop any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Clear any existing timeouts
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    if (greetingTimeoutRef.current) {
      clearTimeout(greetingTimeoutRef.current);
    }

    onWakeWordDetected();

    // Provide greeting if not greeted yet
    if (!hasGreeted) {
      greetingTimeoutRef.current = setTimeout(() => {
        const userName = settings.userName || user?.user_metadata?.full_name || "there";
        const greeting = `Hello ${userName}, I'm ${settings.assistantName}, your mental health companion. How can I help you today?`;
        speakMessage(greeting);
        setHasGreeted(true);
      }, 500);
    } else {
      // Quick acknowledgment for subsequent wake words
      speakMessage("Yes, I'm listening.");
    }

    // Start listening for user input after a brief delay
    speechTimeoutRef.current = setTimeout(() => {
      startListening();
    }, hasGreeted ? 1000 : 3000);
  }, [user, settings, hasGreeted, onWakeWordDetected]);

  // Speak message using enhanced voice selection
  const speakMessage = useCallback((text: string) => {
    if (!settings.voiceEnabled || !text.trim()) return;

    // Prevent multiple simultaneous speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const voice = voiceSelector.getOptimalVoice(
      settings.selectedVoice,
      settings.voiceLanguage,
      true // Prefer female voice for mental health context
    );

    if (!voice) {
      console.warn("No suitable voice found");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.rate = settings.voiceSpeed;
    utterance.pitch = settings.voicePitch;
    utterance.volume = settings.voiceVolume;
    utterance.lang = settings.voiceLanguage;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [settings]);

  // Start listening for user input
  const startListening = useCallback(() => {
    if (!user && isMobile()) {
      toast.error("Please sign in to use voice features on mobile");
      return;
    }

    if (!recognitionRef.current || isListening || isLoading) return;

    try {
      recognitionRef.current.start();
      toast.success("Listening...");
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      toast.error("Failed to start voice input");
    }
  }, [user, isListening, isLoading]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
      setIsListening(false);
    }
  }, [isListening]);

  // Toggle wake word listening
  const toggleWakeWordListening = useCallback(() => {
    if (!user && isMobile()) {
      toast.error("Please sign in to use voice features on mobile");
      return;
    }

    if (!wakeWordRecognitionRef.current) return;

    if (isWakeWordListening) {
      try {
        wakeWordRecognitionRef.current.stop();
      } catch (error) {
        console.error("Error stopping wake word recognition:", error);
      }
      setIsWakeWordListening(false);
      toast.success("Wake word detection disabled");
    } else {
      try {
        wakeWordRecognitionRef.current.start();
        setIsWakeWordListening(true);
        toast.success(`Say "${settings.wakeWord}" to activate`);
      } catch (error) {
        console.error("Failed to start wake word detection:", error);
        toast.error("Failed to start wake word detection");
      }
    }
  }, [user, isWakeWordListening, settings.wakeWord]);

  // Toggle speech output
  const toggleSpeech = useCallback(() => {
    if (isSpeaking && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
      if (greetingTimeoutRef.current) {
        clearTimeout(greetingTimeoutRef.current);
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Only show on mobile devices
  if (!isMobile()) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Wake Word Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleWakeWordListening}
        disabled={isLoading}
        className={`h-8 w-8 p-0 rounded-full transition-all ${
          isWakeWordListening 
            ? "bg-green-100 border-2 border-green-300 animate-pulse" 
            : "hover:bg-gray-100"
        }`}
        title={isWakeWordListening ? "Disable wake word" : "Enable wake word"}
      >
        <Mic 
          size={16} 
          className={isWakeWordListening ? "text-green-600" : "text-gray-600"} 
        />
      </Button>

      {/* Manual Voice Input Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={isListening ? stopListening : startListening}
        disabled={isLoading || (!user && isMobile())}
        className={`h-8 w-8 p-0 rounded-full transition-all ${
          isListening 
            ? "bg-red-100 border-2 border-red-300 animate-pulse" 
            : "hover:bg-gray-100"
        }`}
        title={isListening ? "Stop listening" : "Start voice input"}
      >
        {isListening ? (
          <MicOff size={16} className="text-red-600" />
        ) : (
          <Mic size={16} className="text-gray-600" />
        )}
      </Button>

      {/* Speech Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSpeech}
        className={`h-8 w-8 p-0 rounded-full transition-all ${
          settings.voiceEnabled && !isSpeaking 
            ? "bg-blue-50 hover:bg-blue-100" 
            : "hover:bg-gray-100"
        }`}
        title={isSpeaking ? "Stop speaking" : "Toggle voice output"}
      >
        {settings.voiceEnabled && !isSpeaking ? (
          <Volume2 size={16} className="text-blue-600" />
        ) : (
          <VolumeX size={16} className="text-gray-600" />
        )}
      </Button>

      {/* Status Indicators */}
      {isWakeWordListening && (
        <div className="text-xs text-green-600 animate-pulse">
          🎤 Wake word active
        </div>
      )}
      
      {isListening && (
        <div className="text-xs text-red-600 animate-pulse">
          🎤 Listening...
        </div>
      )}
      
      {isSpeaking && (
        <div className="text-xs text-blue-600 animate-pulse">
          🔊 Speaking...
        </div>
      )}
    </div>
  );
}