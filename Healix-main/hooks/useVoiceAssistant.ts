"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  voiceSelector,
  detectWakeWord,
} from "@/lib/voiceSelection";
import {
  MusicService,
  getMusicRecommendation,
  getVoiceResponse,
  musicTracks,
} from "@/lib/musicService";
import {
  getLocalVoiceResponse,
  getQuickAcknowledgment,
  isMentalHealthConcern,
} from "@/lib/localVoiceResponses";

// Type declarations for Speech Recognition API
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
    onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
    | null;
    onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any)
    | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    start(): void;
    stop(): void;
  }
}

// Types for voice assistant
export interface VoiceCommand {
  intent: string;
  confidence: number;
  entities?: Record<string, any>;
  originalText: string;
}

export interface VoiceAssistantState {
  isListening: boolean;
  isSpeaking: boolean;
  isActive: boolean;
  transcript: string;
  lastCommand: VoiceCommand | null;
  error: string | null;
  status: "idle" | "listening" | "processing" | "speaking" | "error";
}

export interface VoiceAssistantConfig {
  hotword: string;
  continuous: boolean;
  language: string;
  confidence: number;
  enableTTS: boolean;
  enableGestures: boolean;
}

// Intent detection system
class IntentDetector {
  private intents: Map<
    string,
    { keywords: string[]; action: string; response: string }
  > = new Map();
  private assistantName: string = "healix";

  constructor(assistantName: string = "healix") {
    this.assistantName = assistantName.toLowerCase();
    this.initializeIntents();
  }

  private initializeIntents() {
    // Navigation commands
    this.intents.set("navigate_home", {
      keywords: ["home", "main page", "go home", "back to home"],
      action: "navigate",
      response: "Taking you to the home page.",
    });

    this.intents.set("navigate_chat", {
      keywords: ["chat", "chatbot", "open chatbot", "start chat", "council", "counseling", "counselling", "open counseling", "open counselling", "start counseling", "start counselling"],
      action: "navigate",
      response: "Opening counseling for you.",
    });

    this.intents.set("navigate_therapy", {
      keywords: [
        "therapy",
        "therapist",
        "open therapy",
        "start therapy",
        "breathing",
      ],
      action: "navigate",
      response: "Opening the therapy section.",
    });

    this.intents.set("navigate_music", {
      keywords: [
        "music therapy",
        "open music therapy",
        "go to music therapy",
        "music therapy page",
        "show music therapy",
        "take me to music therapy",
        "music page",
      ],
      action: "navigate",
      response: "Opening music therapy page.",
    });

    this.intents.set("navigate_insights", {
      keywords: ["insights", "open insights", "analytics", "data"],
      action: "navigate",
      response: "Opening insights for you.",
    });

    this.intents.set("navigate_contact", {
      keywords: ["contact", "contact us", "support", "help center"],
      action: "navigate",
      response: "Opening contact page.",
    });

    this.intents.set("navigate_settings", {
      keywords: ["settings", "preferences", "configure", "options"],
      action: "navigate",
      response: "Opening settings.",
    });

    this.intents.set("navigate_guide", {
      keywords: ["guide", "evaluation", "get started", "assessment"],
      action: "navigate",
      response: "Opening the guide evaluation.",
    });

    // Game commands
    this.intents.set("start_moodpet", {
      keywords: [
        "mood pet",
        "moodpet",
        "start mood pet",
        "play mood pet",
        "pet game",
      ],
      action: "game",
      response: "Starting the Mood Pet game!",
    });

    this.intents.set("start_anxiety_battler", {
      keywords: [
        "anxiety battler",
        "anxiety game",
        "start anxiety",
        "battle anxiety",
        "anxiety fighter",
      ],
      action: "game",
      response: "Starting the Anxiety Battler game!",
    });

    // Game actions
    this.intents.set("game_attack", {
      keywords: ["attack", "fight", "strike", "hit", "punch"],
      action: "game_action",
      response: "Attacking!",
    });

    this.intents.set("game_defend", {
      keywords: ["defend", "block", "shield", "protect", "guard"],
      action: "game_action",
      response: "Defending!",
    });

    this.intents.set("game_heal", {
      keywords: ["heal", "healing", "recover", "restore", "cure"],
      action: "game_action",
      response: "Healing!",
    });

    this.intents.set("game_special", {
      keywords: ["special", "power", "ultimate", "super", "magic"],
      action: "game_action",
      response: "Using special power!",
    });

    // AR Breathing commands
    this.intents.set("start_ar_breathing", {
      keywords: [
        "ar breathing",
        "breathing exercise",
        "start breathing",
        "ar mirror",
        "breathing mirror",
      ],
      action: "ar_breathing",
      response: "Starting AR breathing exercise!",
    });

    this.intents.set("stop_ar_breathing", {
      keywords: ["stop breathing", "end breathing", "close breathing"],
      action: "ar_breathing",
      response: "Stopping breathing exercise.",
    });

    // Voice assistant control
    this.intents.set("activate_assistant", {
      keywords: [
        `hey ${this.assistantName}`,
        `hi ${this.assistantName}`,
        `hello ${this.assistantName}`,
        `wake up ${this.assistantName}`,
        "activate",
        // Multi-language wake words
        `హే ${this.assistantName}`,
        `హలో ${this.assistantName}`, // Telugu
        `हे ${this.assistantName}`,
        `हैलो ${this.assistantName}`, // Hindi
        `ஹே ${this.assistantName}`,
        `ஹலோ ${this.assistantName}`, // Tamil
        `ಹೇ ${this.assistantName}`,
        `ಹಲೋ ${this.assistantName}`, // Kannada
        `હે ${this.assistantName}`,
        `હેલો ${this.assistantName}`, // Gujarati
        "healix",
        "हीलिक्स",
        "హీలిక్స్",
        "ஹீலிக்ஸ்",
        "ಹೀಲಿಕ್ಸ್",
        "હીલિક્સ",
      ],
      action: "assistant_control",
      response: "Hello! I'm Healix, your mental health companion. How can I help you today?",
    });

    this.intents.set("deactivate_assistant", {
      keywords: ["goodbye", "bye", "see you later", "talk to you later", "that's all"],
      action: "assistant_control",
      response: "Goodbye! I'll be here if you need me.",
    });

    // Music commands - these trigger music playback
    this.intents.set("play_music", {
      keywords: [
        "play music",
        "start music",
        "play song",
        "play a song",
        "put on music",
      ],
      action: "music_control",
      response: "Playing therapeutic music for you.",
    });

    this.intents.set("play_peaceful", {
      keywords: [
        "play peaceful",
        "peaceful music",
        "calm music",
        "relaxing music",
        "play calm",
        "play relaxing",
      ],
      action: "music_control",
      response: "Playing peaceful music to help you relax.",
    });

    this.intents.set("play_meditation", {
      keywords: [
        "play meditation",
        "meditation music",
        "meditate",
        "mindfulness music",
      ],
      action: "music_control",
      response: "Starting meditation music for your mindfulness practice.",
    });

    this.intents.set("play_nature", {
      keywords: [
        "play nature",
        "nature sounds",
        "play rain",
        "play ocean",
        "play forest",
      ],
      action: "music_control",
      response: "Playing nature sounds to connect you with tranquility.",
    });

    this.intents.set("play_sleep", {
      keywords: [
        "play sleep music",
        "sleep sounds",
        "bedtime music",
        "help me sleep",
      ],
      action: "music_control",
      response: "Playing sleep-inducing music to help you rest.",
    });

    this.intents.set("play_focus", {
      keywords: [
        "play focus music",
        "concentration music",
        "study music",
        "work music",
      ],
      action: "music_control",
      response: "Playing focus-enhancing music to boost your concentration.",
    });

    this.intents.set("pause_music", {
      keywords: ["pause music", "pause", "pause the music"],
      action: "music_control",
      response: "Music paused.",
    });

    this.intents.set("stop_music", {
      keywords: [
        "stop music",
        "stop",
        "stop the music",
        "turn off music",
        "music off",
      ],
      action: "music_control",
      response: "Music stopped.",
    });

    this.intents.set("close_music_player", {
      keywords: [
        "exit music player",
        "close music player",
        "quit music player",
        "leave music player",
        "exit the player",
        "close the player",
        "close player",
        "exit player",
        "stop player",
        "quit player",
        "leave player",
        "exit music",
        "close music",
      ],
      action: "music_control",
      response: "Closing music player.",
    });

    this.intents.set("resume_music", {
      keywords: ["resume music", "continue music", "play again", "resume"],
      action: "music_control",
      response: "Resuming your therapeutic music session.",
    });

    this.intents.set("volume_up", {
      keywords: ["volume up", "louder", "increase volume", "turn up"],
      action: "music_control",
      response: "Volume increased.",
    });

    this.intents.set("volume_down", {
      keywords: ["volume down", "quieter", "decrease volume", "turn down"],
      action: "music_control",
      response: "Volume decreased to a more gentle level.",
    });

    this.intents.set("next_song", {
      keywords: ["next song", "next track", "skip", "next", "play next"],
      action: "music_control",
      response: "Playing next song.",
    });

    this.intents.set("previous_song", {
      keywords: ["previous song", "previous track", "go back", "previous", "last song"],
      action: "music_control",
      response: "Playing previous song.",
    });

    // Help commands
    this.intents.set("help", {
      keywords: ["help", "what can you do", "commands", "assistance"],
      action: "help",
      response:
        "I can help you navigate the site, start games, control breathing exercises, play therapeutic music, and more. Just tell me what you'd like to do!",
    });
  }

  detectIntent(text: string, language: string = "en-US", customWakeWord?: string): VoiceCommand {
    const normalizedText = text.toLowerCase().trim();

    // First check for wake word using multi-language detection with custom wake word
    if (detectWakeWord(text, language, customWakeWord)) {
      return {
        intent: "activate_assistant",
        confidence: 0.95,
        originalText: text,
        entities: { keyword: "wake_word", action: "assistant_control" },
      };
    }

    // Priority check: Music therapy navigation (must come before music player)
    if (normalizedText.includes("music therapy") ||
      normalizedText.includes("go to music") ||
      normalizedText.includes("open music therapy") ||
      normalizedText.includes("show music therapy") ||
      normalizedText.includes("take me to music therapy")) {
      return {
        intent: "navigate_music",
        confidence: 0.95,
        originalText: text,
        entities: { keyword: "music therapy", action: "navigate" },
      };
    }

    // Check intents with longest keywords first to avoid partial matches
    const sortedIntents = Array.from(this.intents.entries()).map(([name, data]) => ({
      name,
      data,
      longestKeyword: Math.max(...data.keywords.map(k => k.length))
    })).sort((a, b) => b.longestKeyword - a.longestKeyword);

    for (const { name: intentName, data: intentData } of sortedIntents) {
      // Sort keywords by length (longest first) to match more specific phrases first
      const sortedKeywords = [...intentData.keywords].sort((a, b) => b.length - a.length);

      for (const keyword of sortedKeywords) {
        if (normalizedText.includes(keyword)) {
          return {
            intent: intentName,
            confidence: 0.9,
            originalText: text,
            entities: { keyword, action: intentData.action },
          };
        }
      }
    }

    // Fallback for unknown commands
    return {
      intent: "unknown",
      confidence: 0.1,
      originalText: text,
      entities: { action: "unknown" },
    };
  }

  getResponse(intent: string): string {
    const intentData = this.intents.get(intent);
    return (
      intentData?.response || "Sorry, I didn't catch that. Can you repeat?"
    );
  }
}

// Voice Assistant Hook
export const useVoiceAssistant = (
  config: Partial<VoiceAssistantConfig> = {},
) => {
  const router = useRouter();
  const { settings } = useUserSettings();
  const { user } = useAuth();
  const [state, setState] = useState<VoiceAssistantState>({
    isListening: false,
    isSpeaking: false,
    isActive: false,
    transcript: "",
    lastCommand: null,
    error: null,
    status: "idle",
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const intentDetectorRef = useRef<IntentDetector | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldBeListeningRef = useRef<boolean>(false); // Track if user wants mic ON
  const hasUserInteractedRef = useRef<boolean>(false); // Track if user has clicked mic button
  const lastActivationTimeRef = useRef<number>(0); // Prevent multiple activations
  const isActivatingRef = useRef<boolean>(false); // Track if currently activating
  const isRestartingRef = useRef<boolean>(false); // Prevent rapid restarts
  const cachedFemaleVoiceRef = useRef<SpeechSynthesisVoice | null>(null); // Cache female voice for faster response
  const justActivatedRef = useRef<boolean>(false); // Prevent processing wake word as command

  // Check if user is on mobile device
  const isMobile = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 768;
  }, []);

  // Extract clean name for greeting
  const getCleanUserName = useCallback(() => {
    // Priority 1: Use profile name from settings
    if (settings.userName && settings.userName.trim()) {
      return settings.userName.trim();
    }

    // Priority 2: Use full name from user metadata
    if (user?.user_metadata?.full_name && user.user_metadata.full_name.trim()) {
      return user.user_metadata.full_name.trim();
    }

    // Priority 3: Extract and clean username from email
    if (user?.email) {
      const emailUsername = user.email.split('@')[0];
      // Remove numbers and special characters, keep only letters and spaces
      const cleanName = emailUsername
        .replace(/[^a-zA-Z\s]/g, '') // Remove non-letters except spaces
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
      
      if (cleanName.length > 0) {
        return cleanName;
      }
    }

    // Fallback
    return "there";
  }, [settings.userName, user?.user_metadata?.full_name, user?.email]);

  const defaultConfig: VoiceAssistantConfig = {
    hotword: settings.wakeWord.toLowerCase(),
    continuous: true,
    language: settings.voiceLanguage,
    confidence: 0.7,
    enableTTS: settings.voiceEnabled,
    enableGestures: settings.gestureEnabled,
    ...config,
  };

  // Initialize speech recognition with multi-language support
  const initializeSpeechRecognition = useCallback(() => {
    try {
      if (
        !("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window)
      ) {
        setState((prev) => ({
          ...prev,
          error:
            "Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.",
          status: "error",
        }));
        return;
      }

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = defaultConfig.continuous;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = defaultConfig.language;
      recognitionRef.current.maxAlternatives = 3; // Increased for better multi-language detection

      recognitionRef.current.onstart = () => {
        console.log("🎤 Speech recognition STARTED (onstart event)");
        setState((prev) => ({
          ...prev,
          isListening: true,
          error: null,
          status: "listening",
        }));
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        let interimTranscript = "";
        let detectedLanguage = "en";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            console.log("📝 Final transcript:", transcript);
          } else {
            interimTranscript += transcript;
            // Only log interim if assistant is active (to reduce spam)
            if (state.isActive) {
              console.log("📝 Interim transcript:", transcript);
            }
          }
        }

        const fullTranscript = finalTranscript + interimTranscript;
        setState((prev) => ({ ...prev, transcript: fullTranscript }));

        // Only check for wake word if assistant is NOT active
        if (!state.isActive) {
          const isWakeWordDetected = detectWakeWord(
            fullTranscript,
            defaultConfig.language,
            settings.wakeWord
          );

          // DEBOUNCE: Only activate if not already activating and enough time has passed
          const now = Date.now();
          const timeSinceLastActivation = now - lastActivationTimeRef.current;
          const ACTIVATION_COOLDOWN = 3000; // 3 seconds cooldown

          if (isWakeWordDetected && !isActivatingRef.current && timeSinceLastActivation > ACTIVATION_COOLDOWN) {
            console.log(`🎯 Wake word detected: "${settings.wakeWord}"`);
            lastActivationTimeRef.current = now;
            isActivatingRef.current = true;
            justActivatedRef.current = true; // Prevent processing this transcript as command
            
            // Clear transcript to avoid processing wake word as command
            setState((prev) => ({ ...prev, transcript: "" }));
            
            activateAssistant();
            
            // Reset activation flags after a delay
            setTimeout(() => {
              isActivatingRef.current = false;
              justActivatedRef.current = false; // Allow command processing again
            }, 3000); // Increased delay to ensure greeting completes
          }
        } else {
          // Process commands when assistant is active (only on final transcript)
          // BUT NOT if we just activated (to prevent processing wake word as command)
          if (finalTranscript && !justActivatedRef.current) {
            console.log("🎯 Processing command:", finalTranscript);
            processCommand(finalTranscript, detectedLanguage);
          } else if (finalTranscript && justActivatedRef.current) {
            console.log("🚫 Skipping command processing - just activated with wake word");
          }
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);

        // Don't treat "no-speech" as a critical error - just continue listening
        if (event.error === 'no-speech') {
          console.log("ℹ️ No speech detected, continuing to listen...");
          return; // Don't update state, just continue
        }

        // For "aborted" errors during normal operation, just log
        if (event.error === 'aborted') {
          console.log("ℹ️ Recognition aborted (normal during restart)");
          return;
        }

        // For other errors, log but try to recover
        setState((prev) => ({
          ...prev,
          error: `Speech recognition error: ${event.error}`,
        }));

        // Auto-restart after error only if user wants mic ON and has interacted
        if (shouldBeListeningRef.current && hasUserInteractedRef.current) {
          if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
          }
          restartTimeoutRef.current = setTimeout(() => {
            if (recognitionRef.current && shouldBeListeningRef.current && hasUserInteractedRef.current) {
              try {
                recognitionRef.current.start();
                console.log("✅ Recovered from error, recognition restarted");
              } catch (e) {
                console.error("Failed to restart after error:", e);
              }
            }
          }, 1000);
        }
      };

      recognitionRef.current.onend = () => {
        console.log("🛑 Speech recognition ENDED (onend event)");
        console.log("🔍 shouldBeListeningRef.current:", shouldBeListeningRef.current);
        console.log("🔍 hasUserInteractedRef.current:", hasUserInteractedRef.current);

        // Clear any existing restart timeout first
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = null;
        }

        // AUTO-RESTART: Keep microphone ON only if:
        // 1. User wants mic ON (shouldBeListeningRef)
        // 2. User has actually clicked the mic button (hasUserInteractedRef)
        // 3. Not already in the process of restarting
        // This prevents auto-restart on page load before user interaction
        if (shouldBeListeningRef.current && hasUserInteractedRef.current && !isRestartingRef.current) {
          console.log("🔄 Auto-restarting speech recognition to keep microphone ON");
          isRestartingRef.current = true;

          // Restart with longer delay to prevent abort loop
          restartTimeoutRef.current = setTimeout(() => {
            // Double-check the flags before restarting
            if (recognitionRef.current && shouldBeListeningRef.current && hasUserInteractedRef.current) {
              try {
                recognitionRef.current.start();
                console.log("✅ Speech recognition restarted successfully");
                setState((prev) => ({ ...prev, isListening: true, status: "listening" }));
                isRestartingRef.current = false;
              } catch (e: any) {
                // Ignore "already started" errors
                if (!e.message?.includes('already started')) {
                  console.error("Failed to restart recognition:", e);
                  isRestartingRef.current = false;
                } else {
                  isRestartingRef.current = false;
                }
              }
            } else {
              console.log("ℹ️ Flag changed during timeout - not restarting");
              isRestartingRef.current = false;
            }
          }, 500); // Longer delay to prevent abort loop
        } else {
          console.log("ℹ️ Not restarting - user manually stopped microphone or hasn't interacted yet");
          setState((prev) => ({ ...prev, isListening: false, status: "idle" }));
        }
      };
    } catch (err) {
      console.error("Failed to initialize speech recognition:", err);
      setState((prev) => ({
        ...prev,
        error: "Failed to initialize speech recognition",
        status: "error",
      }));
    }
  }, [defaultConfig.hotword, state.isActive, state.error]);

  // Initialize speech synthesis with female voice detection
  const initializeSpeechSynthesis = useCallback(() => {
    if ("speechSynthesis" in window) {
      synthesisRef.current = window.speechSynthesis;

      // Load voices immediately (only log once on first load)
      let voices = speechSynthesis.getVoices();
      
      // Only log if voices are available and not already logged
      if (voices.length > 0 && !cachedFemaleVoiceRef.current) {
        console.log('🎤 Speech synthesis initialized with', voices.length, 'voices');
      }

      // If no voices yet, wait for them to load
      if (voices.length === 0) {
        speechSynthesis.onvoiceschanged = () => {
          voices = speechSynthesis.getVoices();
          if (!cachedFemaleVoiceRef.current) {
            console.log('🎤 Voices loaded:', voices.length);
          }
        };
      }
    }
  }, []);

  // Initialize intent detector
  const initializeIntentDetector = useCallback(() => {
    intentDetectorRef.current = new IntentDetector(settings.assistantName);
  }, [settings.assistantName]);

  // Activate assistant
  const activateAssistant = useCallback(() => {
    console.log("🚀 Activating assistant...");
    
    // Update state to active
    setState((prev) => ({
      ...prev,
      isActive: true,
      transcript: "",
      status: "processing",
    }));

    // Stop current recognition to prevent interference
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
    }

    // Provide personalized greeting immediately using direct speech synthesis
    const userName = getCleanUserName();
    const greeting = `Hello ${userName}, I'm ${settings.assistantName}, your mental health companion. How can I help you today?`;
    
    console.log("🎤 Speaking greeting:", greeting);
    
    // Use direct speech synthesis for greeting
    if (synthesisRef.current && defaultConfig.enableTTS) {
      synthesisRef.current.cancel(); // Cancel any ongoing speech
      
      const utterance = new SpeechSynthesisUtterance(greeting);
      utterance.lang = settings.voiceLanguage;
      utterance.rate = settings.voiceSpeed || 1.0;
      utterance.pitch = settings.voicePitch || 1.1;
      utterance.volume = settings.voiceVolume || 1.0;
      
      utterance.onstart = () => setState((prev) => ({ ...prev, isSpeaking: true, status: "speaking" }));
      utterance.onend = () => setState((prev) => ({ ...prev, isSpeaking: false, status: "listening" }));
      utterance.onerror = () => setState((prev) => ({ ...prev, isSpeaking: false, status: "listening" }));
      
      synthesisRef.current.speak(utterance);
    }

    // Restart recognition for commands after greeting completes
    setTimeout(() => {
      if (recognitionRef.current && shouldBeListeningRef.current) {
        try {
          recognitionRef.current.start();
          console.log("✅ Recognition restarted for commands after greeting");
          setState((prev) => ({ ...prev, status: "listening" }));
        } catch (e: any) {
          // Ignore "already started" errors
          if (!e.message?.includes('already started')) {
            console.error("Failed to restart recognition for commands:", e);
          }
        }
      }
    }, 2000); // Wait for greeting to complete
  }, [getCleanUserName, settings.assistantName, settings.voiceLanguage, settings.voiceSpeed, settings.voicePitch, settings.voiceVolume, defaultConfig.enableTTS]);

  // Deactivate assistant
  const deactivateAssistant = useCallback(() => {
    console.log("🛑 Deactivating assistant...");
    
    setState((prev) => ({
      ...prev,
      isActive: false,
      transcript: "",
      lastCommand: null,
      status: "idle",
    }));

    // Cancel any ongoing speech
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }

    // Reset activation flags
    isActivatingRef.current = false;

    // Only restart hotword detection if user wants mic to stay on
    if (shouldBeListeningRef.current) {
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error("Failed to restart hotword detection:", e);
          }
        }
      }, 500);
    }
  }, []);

  // Handle music-specific commands
  const handleMusicCommand = useCallback(
    async (voiceCommand: VoiceCommand, command: string, language: string) => {
      const musicService = MusicService.getInstance();
      const lowerCommand = command.toLowerCase();

      try {
        switch (voiceCommand.intent) {
          case "play_music":
            const success = await musicService.playRandomTherapeutic();
            if (success) {
              const track = musicService.getCurrentTrack();
              const response = track
                ? `Playing ${track.title}.`
                : "Playing music.";
              speak(response, language);
            } else {
              speak("Music not available.", language);
            }
            break;

          case "play_peaceful":
          case "play_meditation":
            // Prioritize Healix meditation track for peaceful requests
            const healixTrack = musicTracks.find((t) => t.title === "Healix Meditation");

            if (healixTrack) {
              await musicService.playTrack(healixTrack);
              speak("Playing Healix meditation.", language);
            } else {
              const meditationSuccess =
                await musicService.playByCategory("meditation");
              if (meditationSuccess) {
                speak("Playing meditation music.", language);
              } else {
                speak("Meditation music not available.", language);
              }
            }
            break;

          case "play_nature":
            // Check for specific nature sounds
            if (lowerCommand.includes("rain")) {
              const track = musicTracks.find(t => t.title.toLowerCase().includes("rain"));
              if (track) {
                await musicService.playTrack(track);
                speak(`Playing ${track.title}.`, language);
              } else {
                speak("Rain sounds not available.", language);
              }
            } else if (lowerCommand.includes("ocean")) {
              const track = musicTracks.find(t => t.title.toLowerCase().includes("ocean"));
              if (track) {
                await musicService.playTrack(track);
                speak(`Playing ${track.title}.`, language);
              } else {
                speak("Ocean sounds not available.", language);
              }
            } else if (lowerCommand.includes("forest")) {
              const track = musicTracks.find(t => t.title.toLowerCase().includes("forest"));
              if (track) {
                await musicService.playTrack(track);
                speak(`Playing ${track.title}.`, language);
              } else {
                speak("Forest sounds not available.", language);
              }
            } else {
              const natureSuccess = await musicService.playByCategory("nature");
              if (natureSuccess) {
                speak("Playing nature sounds.", language);
              } else {
                speak("Nature sounds not available.", language);
              }
            }
            break;

          case "play_sleep":
            const sleepSuccess = await musicService.playByCategory("sleep");
            if (sleepSuccess) {
              speak("Playing sleep music.", language);
            } else {
              speak("Sleep music not available.", language);
            }
            break;

          case "play_focus":
            const focusSuccess =
              (await musicService.playByCategory("focus")) ||
              (await musicService.playByCategory("binaural"));
            if (focusSuccess) {
              speak("Playing focus music.", language);
            } else {
              speak("Focus music not available.", language);
            }
            break;

          case "pause_music":
            musicService.pause();
            speak("Paused.", language);
            break;

          case "stop_music":
            musicService.stop();
            speak("Stopped.", language);
            break;

          case "resume_music":
            musicService.resume();
            speak("Resumed.", language);
            break;

          case "volume_up":
            const currentVol = musicService.getVolume();
            musicService.setVolume(Math.min(1, currentVol + 0.2));
            speak("Volume up.", language);
            break;

          case "volume_down":
            const currentVolDown = musicService.getVolume();
            musicService.setVolume(Math.max(0, currentVolDown - 0.2));
            speak("Volume down.", language);
            break;

          case "next_song":
            try {
              await musicService.playNext();
              speak("Playing next song.", language);
            } catch (error) {
              console.error("Next song error:", error);
              speak("Unable to play next song.", language);
            }
            break;

          case "previous_song":
            try {
              await musicService.playPrevious();
              speak("Playing previous song.", language);
            } catch (error) {
              console.error("Previous song error:", error);
              speak("Unable to play previous song.", language);
            }
            break;

          case "close_music_player":
            musicService.stop();
            speak("Closing music player.", language);
            // Dispatch event to hide global music player
            window.dispatchEvent(new CustomEvent('voice-close-music-player'));
            // Navigate to home page after stopping music
            setTimeout(() => {
              router.push("/");
            }, 1500);
            break;

          default:
            // Try to find music by keyword
            const recommendation = getMusicRecommendation(command);
            if (recommendation) {
              await musicService.playTrack(recommendation);
              const response = getVoiceResponse(recommendation);
              speak(response, language);
            } else {
              speak("Music not found.", language);
            }
        }
      } catch (error) {
        console.error("Music command error:", error);
        speak("Music error.", language);
      }
    },
    [router],
  );

  // Process voice command with multi-language support
  const processCommand = useCallback(
    async (command: string, detectedLanguage: string = "en") => {
      if (!intentDetectorRef.current) return;

      setState((prev) => ({ ...prev, status: "processing" }));

      const voiceCommand = intentDetectorRef.current.detectIntent(
        command,
        settings.voiceLanguage,
      );
      setState((prev) => ({ ...prev, lastCommand: voiceCommand }));

      // PRIORITY 1: Check for navigation commands FIRST (including music therapy page)
      if (voiceCommand.entities?.action === "navigate") {
        console.log("🧭 Navigation command detected:", voiceCommand.intent);
        const response = intentDetectorRef.current.getResponse(voiceCommand.intent);
        console.log("🧭 Executing navigation to:", voiceCommand.intent);
        
        // Speak first to provide immediate feedback
        speak(response, detectedLanguage);
        
        // Then navigate with minimal delay for near-simultaneous execution
        setTimeout(() => {
          executeCommand(voiceCommand);
          console.log("🧭 Navigation executed");
        }, 50);
        
        setState((prev) => ({ ...prev, status: "idle" }));
        return;
      }

      // PRIORITY 2: Handle music playback commands (not navigation)
      if (
        voiceCommand.entities?.action === "music" ||
        voiceCommand.entities?.action === "music_control"
      ) {
        await handleMusicCommand(voiceCommand, command, detectedLanguage);
        setState((prev) => ({ ...prev, status: "idle" }));
        return;
      }

      // Check for music/stress relief requests
      const stressKeywords = [
        "stressed",
        "anxiety",
        "anxious",
        "worried",
        "panic",
        "overwhelmed",
        "sad",
        "depressed",
        "music",
        "song",
        "relax",
        "calm",
      ];
      const isStressRelated = stressKeywords.some((keyword) =>
        command.toLowerCase().includes(keyword),
      );

      if (
        isStressRelated &&
        (command.toLowerCase().includes("play") ||
          command.toLowerCase().includes("music") ||
          command.toLowerCase().includes("song"))
      ) {
        // Use music service for stress relief
        const musicService = MusicService.getInstance();
        const recommendation = getMusicRecommendation(command);

        if (recommendation) {
          try {
            await musicService.playTrack(recommendation);
            speak(`Playing ${recommendation.title}.`, detectedLanguage);
          } catch (error) {
            speak("Music error.", detectedLanguage);
          }
        } else {
          speak("Playing calming music.", detectedLanguage);
        }
        setState((prev) => ({ ...prev, status: "idle" }));
        return;
      }

      // If unknown or conversational, use LOCAL response system (no API calls - completely free!)
      if (voiceCommand.intent === "unknown" || isStressRelated) {
        // INSTANT FEEDBACK: Speak immediately
        const quickResponse = getQuickAcknowledgment(command);
        speak(quickResponse, detectedLanguage);

        // Get intelligent local response (no API call, no rate limits!)
        const localResponse = getLocalVoiceResponse(command);

        // Speak the full response after a brief pause
        setTimeout(() => {
          if (synthesisRef.current) {
            synthesisRef.current.cancel();
          }
          speak(localResponse.text, detectedLanguage);
        }, 800);

        setState((prev) => ({ ...prev, status: "idle" }));
        return;
      }

      // FAST RESPONSE: Provide voice feedback IMMEDIATELY for known intents
      let response = intentDetectorRef.current.getResponse(
        voiceCommand.intent,
      );

      // Skip greeting for activate_assistant since it's handled in activateAssistant function
      if (voiceCommand.intent === "activate_assistant") {
        // Don't speak anything here - greeting is already handled
        return;
      }

      // Speak first then execute for non-navigation commands
      speak(response, detectedLanguage);
      await executeCommand(voiceCommand);
    },
    [settings.voiceLanguage, getCleanUserName],
  );

  // Execute command
  const executeCommand = useCallback(
    async (command: VoiceCommand) => {
      const { intent, entities } = command;

      switch (entities?.action) {
        case "navigate":
          console.log("🚀 Executing navigation action for intent:", intent);
          switch (intent) {
            case "navigate_home":
              console.log("🏠 Navigating to home");
              router.push("/");
              break;
            case "navigate_chat":
              console.log("💬 Navigating to /Chat");
              try {
                router.push("/Chat");
                console.log("✅ router.push('/Chat') called successfully");
              } catch (error) {
                console.error("❌ Error calling router.push:", error);
              }
              break;
            case "navigate_therapy":
              router.push("/Therapy");
              break;
            case "navigate_music":
              router.push("/music");
              break;
            case "open_music_player":
              // This is handled by music_player action below
              break;
            case "navigate_insights":
              speak("Insights has been removed.");
              break;
            case "navigate_guide":
              router.push("/Guide-Eval");
              break;
            case "navigate_contact":
              router.push("/Contact");
              break;
            case "navigate_settings":
              router.push("/settings");
              break;
          }
          break;

        case "music_player":
          // Handle music player commands - play music directly
          const musicService = MusicService.getInstance();
          const lowerCommand = command.originalText.toLowerCase();

          // Play Healix meditation by default for music player requests
          const healixTrack = musicTracks.find(t => t.title === "Healix Meditation");
          if (healixTrack) {
            await musicService.playTrack(healixTrack);
          } else {
            await musicService.playRandomTherapeutic();
          }
          break;

        case "game":
          // Dispatch custom event for game components to listen
          window.dispatchEvent(
            new CustomEvent("voice-game-command", {
              detail: { intent, command },
            }),
          );
          break;

        case "game_action":
          // Dispatch custom event for game actions
          window.dispatchEvent(
            new CustomEvent("voice-game-action", {
              detail: { intent, command },
            }),
          );
          break;

        case "ar_breathing":
          // Dispatch custom event for AR breathing
          window.dispatchEvent(
            new CustomEvent("voice-ar-command", {
              detail: { intent, command },
            }),
          );
          break;

        case "assistant_control":
          if (intent === "deactivate_assistant") {
            // Check if music is currently playing
            const musicService = MusicService.getInstance();
            const isMusicPlaying = musicService.getIsPlaying();

            if (isMusicPlaying) {
              // If music is playing, stop it and turn off microphone
              musicService.stop();
              speak("Goodbye! Stopping music and turning off microphone.");

              // IMMEDIATELY set flag to false to prevent any restarts
              shouldBeListeningRef.current = false;
              console.log("🛑 Set shouldBeListeningRef to FALSE immediately");

              // Clear any pending restart timeouts
              if (restartTimeoutRef.current) {
                clearTimeout(restartTimeoutRef.current);
                restartTimeoutRef.current = null;
              }

              // Dispatch event to hide global music player
              window.dispatchEvent(new CustomEvent('voice-close-music-player'));

              setTimeout(() => {
                deactivateAssistant();
                // Stop recognition
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.stop();
                    console.log("🛑 Recognition stopped after goodbye");
                  } catch (e) {
                    console.error("Error stopping recognition:", e);
                  }
                }
                setState((prev) => ({ ...prev, isListening: false, status: "idle" }));
              }, 1500);
            } else {
              // If no music playing, just turn off microphone
              speak("Goodbye! Turning off microphone.");

              // IMMEDIATELY set flag to false to prevent any restarts
              shouldBeListeningRef.current = false;
              console.log("🛑 Set shouldBeListeningRef to FALSE immediately");

              // Clear any pending restart timeouts
              if (restartTimeoutRef.current) {
                clearTimeout(restartTimeoutRef.current);
                restartTimeoutRef.current = null;
              }

              setTimeout(() => {
                deactivateAssistant();
                // Stop recognition
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.stop();
                    console.log("🛑 Recognition stopped after goodbye");
                  } catch (e) {
                    console.error("Error stopping recognition:", e);
                  }
                }
                setState((prev) => ({ ...prev, isListening: false, status: "idle" }));
              }, 1500);
            }
          }
          break;

        case "help":
          // Help is handled by the response system
          break;

        default:
          console.log("Unknown command:", command);
      }
    },
    [router, deactivateAssistant],
  );

  // Text-to-speech with backend TTS for multilingual support
  const speak = useCallback(
    async (text: string, language?: string) => {
      if (!defaultConfig.enableTTS) return;

      const targetLanguage = language || settings.voiceLanguage;

      // PREVENT MULTIPLE SIMULTANEOUS SPEECH - Cancel any ongoing speech first
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }

      setState((prev) => ({ ...prev, isSpeaking: true, status: "speaking" }));

      // Use browser TTS with voice selection
      speakWithBrowserTTS(text, targetLanguage);
    },
    [defaultConfig.enableTTS, settings.voiceLanguage, settings.selectedVoice, settings.voiceSpeed, settings.voicePitch, settings.voiceVolume],
  );

  // Browser TTS with FEMALE voice selection - ALWAYS USE FEMALE VOICE
  const speakWithBrowserTTS = useCallback(
    (text: string, language: string) => {
      if (!synthesisRef.current) return;

      synthesisRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      // FASTER RESPONSE: Slightly increased speech rate for quicker responses
      utterance.rate = settings.voiceSpeed || 1.0; // Increased from 0.95 to 1.0
      utterance.pitch = settings.voicePitch || 1.1;
      utterance.volume = settings.voiceVolume || 1.0;

      // Use cached voice for faster response, or find it if not cached
      let femaleVoice = cachedFemaleVoiceRef.current;
      
      if (!femaleVoice) {
        // Get all available voices
        const voices = speechSynthesis.getVoices();

        // PRIORITY 1: Find best female voice by name patterns
        const femaleVoicePatterns = [
          'zira', 'hazel', 'samantha', 'susan', 'victoria', 'serena',
          'aria', 'jenny', 'emma', 'amy', 'eva', 'claire',
          'helen', 'linda', 'kendra', 'joanna', 'salli',
          'nicole', 'raveena', 'aditi', 'priya', 'shreya',
          'allison', 'ava', 'nicky', 'veena', 'kalpana',
          'female', 'woman'
        ];

        // Filter voices by language first
        const languageVoices = voices.filter(v =>
          v.lang.startsWith(language.split('-')[0]) || v.lang === language
        );

        // Try to find female voice by name patterns
        for (const pattern of femaleVoicePatterns) {
          const foundVoice = languageVoices.find(v =>
            v.name.toLowerCase().includes(pattern)
          );
          if (foundVoice) {
            femaleVoice = foundVoice;
            // Only log once when caching
            if (!cachedFemaleVoiceRef.current) {
              console.log('✅ Found & cached FEMALE voice:', femaleVoice.name);
            }
            break;
          }
        }

        // PRIORITY 2: If no female voice found, try Google/Microsoft female voices
        if (!femaleVoice) {
          const foundVoice = languageVoices.find(v =>
            (v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('microsoft')) &&
            (v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('uk english female') ||
              v.name.toLowerCase().includes('us english female'))
          );
          if (foundVoice) femaleVoice = foundVoice;
        }

        // PRIORITY 3: Use voice selector as fallback
        if (!femaleVoice) {
          const foundVoice = voiceSelector.getOptimalVoice('warm-female', language, true);
          if (foundVoice) femaleVoice = foundVoice;
        }

        // PRIORITY 4: Try any English female voice if language-specific not found
        if (!femaleVoice) {
          const englishVoices = voices.filter(v => v.lang.startsWith('en'));
          for (const pattern of femaleVoicePatterns) {
            const foundVoice = englishVoices.find(v =>
              v.name.toLowerCase().includes(pattern)
            );
            if (foundVoice) {
              femaleVoice = foundVoice;
              break;
            }
          }
        }

        // Cache the voice for next time
        if (femaleVoice) {
          cachedFemaleVoiceRef.current = femaleVoice;
        }
      }

      // Apply the female voice
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onend = () => {
        setState((prev) => ({ ...prev, isSpeaking: false, status: "idle" }));
      };

      utterance.onerror = (error: any) => {
        console.error('❌ Speech synthesis error:', error);
        // Don't log full error object, just the type
        console.log('Error type:', error.error || 'unknown');
        setState((prev) => ({ ...prev, isSpeaking: false, status: "idle" }));
      };

      // Cancel any ongoing speech before starting new one
      try {
        synthesisRef.current.cancel();
        // Speak immediately for faster response
        if (synthesisRef.current) {
          synthesisRef.current.speak(utterance);
        }
      } catch (e) {
        console.error('Failed to speak:', e);
        setState((prev) => ({ ...prev, isSpeaking: false, status: "idle" }));
      }
    },
    [settings.voiceSpeed, settings.voicePitch, settings.voiceVolume],
  );



  // Start listening - KEEPS MICROPHONE ON CONTINUOUSLY
  const startListening = useCallback(() => {
    // Check authentication for mobile users ONLY
    if (isMobile() && !user) {
      console.error("❌ Mobile user not authenticated");
      setState((prev) => ({
        ...prev,
        error: "Please sign in to use voice features on mobile",
        status: "error",
      }));
      return;
    }

    if (!recognitionRef.current) {
      console.error("❌ Speech recognition not initialized");
      setState((prev) => ({
        ...prev,
        error: "Speech recognition not initialized. Please refresh the page.",
        status: "error",
      }));
      return;
    }

    // Mark that user has interacted (clicked mic button)
    hasUserInteractedRef.current = true;

    // Set flag to indicate user wants microphone ON
    shouldBeListeningRef.current = true;
    console.log("🎤 User wants microphone ON - will auto-restart if needed");

    // If already listening, just update state and return
    if (state.isListening) {
      console.log("ℹ️ Recognition already running, no need to start again");
      return;
    }

    try {
      console.log("🎤 Starting speech recognition...");
      recognitionRef.current.start();
      console.log("✅ Speech recognition started successfully");
      setState((prev) => ({ ...prev, isListening: true, status: "listening" }));
    } catch (err: any) {
      console.error("❌ Failed to start recognition:", err);
      // If already started, that's okay
      if (err.message && err.message.includes('already started')) {
        console.log("ℹ️ Recognition already running");
        setState((prev) => ({ ...prev, isListening: true, status: "listening" }));
      } else {
        setState((prev) => ({
          ...prev,
          error: `Failed to start: ${err.message}`,
          status: "error",
        }));
      }
    }
  }, [state.isListening, isMobile, user]);

  // Stop listening - ONLY STOPS WHEN USER CLICKS BUTTON
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {
      console.warn("⚠️ Speech recognition not initialized");
      return;
    }

    // Set flag to indicate user wants microphone OFF
    shouldBeListeningRef.current = false;
    isRestartingRef.current = false;
    console.log("🛑 User wants microphone OFF - will NOT auto-restart");

    // Clear any pending restart timeouts
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    try {
      console.log("🛑 Stopping speech recognition...");
      recognitionRef.current.stop();

      // Stop all active media streams to release microphone permission
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          stream.getTracks().forEach(track => {
            track.stop();
            console.log("🎤 Microphone track stopped:", track.label);
          });
        })
        .catch(err => {
          console.log("ℹ️ No active media stream to stop");
        });

      console.log("✅ Speech recognition stopped successfully");
      setState((prev) => ({ ...prev, isListening: false, status: "idle" }));
    } catch (err: any) {
      console.error("❌ Failed to stop recognition:", err);
      setState((prev) => ({
        ...prev,
        error: `Failed to stop: ${err.message}`,
        status: "error",
      }));
    }
  }, []);

  // Toggle listening with mobile authentication check
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  // Initialize on mount
  useEffect(() => {
    initializeSpeechRecognition();
    initializeSpeechSynthesis();
    initializeIntentDetector();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, [
    initializeSpeechRecognition,
    initializeSpeechSynthesis,
    initializeIntentDetector,
  ]);

  // DO NOT auto-start on mount - browser requires user gesture for microphone
  // User must click the microphone button to start
  // This prevents the "recognition ends immediately" issue on page load

  return {
    state,
    startListening,
    stopListening,
    toggleListening,
    activateAssistant,
    deactivateAssistant,
    speak,
    processCommand,
  };
};
