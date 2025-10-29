"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// Speech Recognition types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    start(): void;
    stop(): void;
  }
}

export interface VoiceNavigationState {
  isListening: boolean;
  transcript: string;
  lastCommand: string | null;
  isProcessing: boolean;
}

export const useVoiceNavigation = () => {
  const router = useRouter();
  const [state, setState] = useState<VoiceNavigationState>({
    isListening: false,
    transcript: "",
    lastCommand: null,
    isProcessing: false,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldBeListeningRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Text-to-speech function
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Navigation routes mapping
  const navigationRoutes: Record<string, { path: string; name: string }> = {
    // Main pages
    home: { path: "/Home", name: "Home" },
    chat: { path: "/Chat", name: "Chat" },
    counseling: { path: "/Chat", name: "Counseling" },
    counselling: { path: "/Chat", name: "Counselling" },
    
    // Mental health features
    "mental health": { path: "/Guide-Eval", name: "Mental Health Assessment" },
    assessment: { path: "/Guide-Eval", name: "Assessment" },
    quiz: { path: "/Guide-Eval", name: "Quiz" },
    evaluation: { path: "/Guide-Eval", name: "Evaluation" },
    
    // Therapy and exercises
    mindquest: { path: "/MindQuest", name: "MindQuest" },
    "mind quest": { path: "/MindQuest", name: "MindQuest" },
    game: { path: "/MindQuest", name: "MindQuest Game" },
    exercise: { path: "/MindQuest", name: "Exercise" },
    
    // Emotion detection
    emotion: { path: "/EmotionDetection", name: "Emotion Detection" },
    "emotion detection": { path: "/EmotionDetection", name: "Emotion Detection" },
    feelings: { path: "/EmotionDetection", name: "Emotion Detection" },
    
    // Music therapy
    music: { path: "/MusicTherapy", name: "Music Therapy" },
    "music therapy": { path: "/MusicTherapy", name: "Music Therapy" },
    relax: { path: "/MusicTherapy", name: "Music Therapy" },
    
    // Contact
    contact: { path: "/Contact", name: "Contact" },
    "contact us": { path: "/Contact", name: "Contact" },
    help: { path: "/Contact", name: "Contact" },
    support: { path: "/Contact", name: "Contact" },
  };

  // Process voice navigation commands
  const processCommand = useCallback(async (command: string) => {
    const lowerCommand = command.toLowerCase().trim();
    console.log("🗣️ Processing navigation command:", lowerCommand);

    setState(prev => ({ ...prev, isProcessing: true, lastCommand: command }));

    try {
      // Check for "go to" or "open" or "navigate to" commands
      let targetPage = "";
      
      // Extract the page name from various command formats
      if (lowerCommand.includes("go to")) {
        targetPage = lowerCommand.replace("go to", "").trim();
      } else if (lowerCommand.includes("open")) {
        targetPage = lowerCommand.replace("open", "").trim();
      } else if (lowerCommand.includes("navigate to")) {
        targetPage = lowerCommand.replace("navigate to", "").trim();
      } else if (lowerCommand.includes("take me to")) {
        targetPage = lowerCommand.replace("take me to", "").trim();
      } else if (lowerCommand.includes("show me")) {
        targetPage = lowerCommand.replace("show me", "").trim();
      } else {
        // Direct page name
        targetPage = lowerCommand;
      }

      // Remove common words
      targetPage = targetPage
        .replace(/the /g, "")
        .replace(/page/g, "")
        .replace(/section/g, "")
        .trim();

      // Find matching route
      let matchedRoute = null;
      
      // Try exact match first
      if (navigationRoutes[targetPage]) {
        matchedRoute = navigationRoutes[targetPage];
      } else {
        // Try partial match
        for (const [key, route] of Object.entries(navigationRoutes)) {
          if (targetPage.includes(key) || key.includes(targetPage)) {
            matchedRoute = route;
            break;
          }
        }
      }

      if (matchedRoute) {
        speak(`Navigating to ${matchedRoute.name}`);
        setTimeout(() => {
          router.push(matchedRoute.path);
        }, 500);
      } else {
        speak("Sorry, I couldn't find that page. Try saying 'go to home', 'open chat', or 'show me mental health assessment'");
      }

    } catch (error) {
      console.error("Error processing navigation command:", error);
      speak("Sorry, I had trouble processing that command");
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [router, speak]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("🎤 Voice navigation started");
      setState(prev => ({ ...prev, isListening: true }));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript;
        console.log("📝 Final transcript:", transcript);
        
        setState(prev => ({ ...prev, transcript }));
        processCommand(transcript);
      } else {
        // Interim results
        const transcript = lastResult[0].transcript;
        setState(prev => ({ ...prev, transcript }));
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      
      if (event.error === "no-speech") {
        console.log("No speech detected, continuing to listen...");
      } else if (event.error === "aborted") {
        console.log("Speech recognition aborted");
      } else {
        setState(prev => ({ ...prev, isListening: false }));
      }
    };

    recognition.onend = () => {
      console.log("🎤 Voice navigation ended");
      
      // Auto-restart if should be listening
      if (shouldBeListeningRef.current) {
        console.log("🔄 Auto-restarting voice navigation...");
        restartTimeoutRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch (error) {
            console.error("Error restarting recognition:", error);
            setState(prev => ({ ...prev, isListening: false }));
            shouldBeListeningRef.current = false;
          }
        }, 100);
      } else {
        setState(prev => ({ ...prev, isListening: false }));
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [processCommand]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      console.error("Speech recognition not initialized");
      return;
    }

    try {
      shouldBeListeningRef.current = true;
      recognitionRef.current.start();
      speak("Voice navigation activated. Say 'go to' followed by a page name.");
    } catch (error) {
      console.error("Error starting recognition:", error);
    }
  }, [speak]);

  // Stop listening
  const stopListening = useCallback(() => {
    shouldBeListeningRef.current = false;
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    speak("Voice navigation deactivated");
    setState(prev => ({ ...prev, isListening: false, transcript: "" }));
  }, [speak]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    speak,
  };
};