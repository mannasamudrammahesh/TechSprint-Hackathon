"use client";

import { useState, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { voiceSelector, detectWakeWord, getSpeechRecognitionLanguage, generatePersonalizedGreeting } from '@/lib/voiceSelection';
import { useMobileDetection } from './useMobileDetection';
import { useAuth } from '@/contexts/AuthContext';

interface VoiceAssistantOptions {
  onTranscript?: (transcript: string) => void;
  onWakeWordDetected?: () => void;
  language?: string;
  autoSubmit?: boolean;
  autoSubmitDelay?: number;
}

export const useVoiceAssistant = (options: VoiceAssistantOptions = {}) => {
  const {
    onTranscript,
    onWakeWordDetected,
    language = 'en-US',
    autoSubmit = true,
    autoSubmitDelay = 1500
  } = options;

  const { user } = useAuth();
  const isMobile = useMobileDetection();
  const [isListening, setIsListening] = useState(false);
  const [isWakeWordMode, setIsWakeWordMode] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const submissionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wakeWordTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user is authenticated (only for mobile)
  const isAuthenticatedForVoice = useCallback(() => {
    if (!isMobile) {
      return true; // Desktop/tablet users can always use voice
    }
    return !!user; // Mobile users must be authenticated
  }, [isMobile, user]);

  // Get personalized greeting
  const getPersonalizedGreeting = useCallback(() => {
    const userName = user?.user_metadata?.full_name || 
                    user?.email?.split('@')[0];

    return generatePersonalizedGreeting(userName);
  }, [user]);

  // Speak the greeting
  const speakGreeting = useCallback(async () => {
    try {
      const greeting = getPersonalizedGreeting();
      const voice = voiceSelector.getOptimalVoice('warm-female', language, true);
      
      if (voice && 'speechSynthesis' in window) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(greeting);
        utterance.voice = voice;
        utterance.rate = 0.95;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        utterance.lang = language;

        return new Promise<void>((resolve, reject) => {
          utterance.onend = () => resolve();
          utterance.onerror = (event) => reject(new Error(`Speech error: ${event.error}`));
          speechSynthesis.speak(utterance);
        });
      }
    } catch (error) {
      console.error('Failed to speak greeting:', error);
    }
  }, [getPersonalizedGreeting, language]);

  // Start listening for voice input
  const startListening = useCallback(() => {
    // Check authentication for mobile users
    if (!isAuthenticatedForVoice()) {
      toast.error("Please sign in to use voice features on mobile devices");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in this browser!");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.lang = getSpeechRecognitionLanguage(language);
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        toast.success("Listening...");
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        
        if (onTranscript) {
          onTranscript(transcript);
        }

        // Auto-submit after delay if enabled
        if (autoSubmit && autoSubmitDelay > 0) {
          if (submissionTimeoutRef.current) {
            clearTimeout(submissionTimeoutRef.current);
          }
          submissionTimeoutRef.current = setTimeout(() => {
            // This would trigger form submission in the parent component
            toast.success("Voice captured!");
          }, autoSubmitDelay);
        } else {
          toast.success("Voice captured!");
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast.error(`Voice input error: ${event.error}`);
        setIsListening(false);
        if (submissionTimeoutRef.current) {
          clearTimeout(submissionTimeoutRef.current);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      toast.error("Failed to start voice input.");
      setIsListening(false);
    }
  }, [isAuthenticatedForVoice, language, onTranscript, autoSubmit, autoSubmitDelay]);

  // Start wake word detection
  const startWakeWordDetection = useCallback(() => {
    // Check authentication for mobile users
    if (!isAuthenticatedForVoice()) {
      toast.error("Please sign in to use voice features on mobile devices");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in this browser!");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.lang = getSpeechRecognitionLanguage(language);
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsWakeWordMode(true);
        toast.success("Wake word detection active - say 'Hey Healix'");
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');

        // Check for wake word
        if (detectWakeWord(transcript, language)) {
          // Stop wake word detection
          recognition.stop();
          setIsWakeWordMode(false);
          
          // Speak greeting
          speakGreeting().then(() => {
            // Start regular listening after greeting
            setTimeout(() => {
              startListening();
            }, 500);
          });

          if (onWakeWordDetected) {
            onWakeWordDetected();
          }

          toast.success("Wake word detected! Hello!");
        }
      };

      recognition.onerror = (event) => {
        console.error('Wake word detection error:', event.error);
        if (event.error !== 'no-speech') {
          toast.error(`Wake word detection error: ${event.error}`);
        }
        setIsWakeWordMode(false);
      };

      recognition.onend = () => {
        setIsWakeWordMode(false);
        // Auto-restart wake word detection if it wasn't manually stopped
        if (wakeWordTimeoutRef.current) {
          clearTimeout(wakeWordTimeoutRef.current);
        }
        wakeWordTimeoutRef.current = setTimeout(() => {
          if (!isListening) {
            startWakeWordDetection();
          }
        }, 1000);
      };

      recognition.start();
    } catch (error) {
      console.error('Failed to start wake word detection:', error);
      toast.error("Failed to start wake word detection.");
      setIsWakeWordMode(false);
    }
  }, [isAuthenticatedForVoice, language, onWakeWordDetected, speakGreeting, startListening, isListening]);

  // Stop all voice recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    if (submissionTimeoutRef.current) {
      clearTimeout(submissionTimeoutRef.current);
      submissionTimeoutRef.current = null;
    }

    if (wakeWordTimeoutRef.current) {
      clearTimeout(wakeWordTimeoutRef.current);
      wakeWordTimeoutRef.current = null;
    }

    setIsListening(false);
    setIsWakeWordMode(false);
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    stopListening();
  }, [stopListening]);

  return {
    isListening,
    isWakeWordMode,
    isAuthenticatedForVoice: isAuthenticatedForVoice(),
    isMobile,
    startListening,
    startWakeWordDetection,
    stopListening,
    speakGreeting,
    getPersonalizedGreeting,
    cleanup
  };
};