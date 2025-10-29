"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MusicService, getMusicRecommendation, musicTracks } from "@/lib/musicService";

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

export interface VoiceMusicState {
  isListening: boolean;
  transcript: string;
  lastCommand: string | null;
  isProcessing: boolean;
}

export const useVoiceMusicAssistant = () => {
  const [state, setState] = useState<VoiceMusicState>({
    isListening: false,
    transcript: "",
    lastCommand: null,
    isProcessing: false,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const musicService = useRef(MusicService.getInstance());
  const shouldBeListeningRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Text-to-speech function
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Process voice commands
  const processCommand = useCallback(async (command: string) => {
    const lowerCommand = command.toLowerCase().trim();
    console.log("🎵 Processing music command:", lowerCommand);

    setState(prev => ({ ...prev, isProcessing: true, lastCommand: command }));

    try {
      // PLAY COMMANDS
      if (lowerCommand.includes("play")) {
        // Specific song requests (check specific keywords first)
        if (lowerCommand.includes("rain") || lowerCommand.includes("rainfall")) {
          const track = musicTracks.find(t => t.title.toLowerCase().includes("rain"));
          if (track) {
            await musicService.current.playTrack(track);
            speak(`Playing ${track.title}`);
          } else {
            speak("Rain sounds not available");
          }
        }
        else if (lowerCommand.includes("forest") || lowerCommand.includes("woodland")) {
          const track = musicTracks.find(t => t.title.toLowerCase().includes("forest"));
          if (track) {
            await musicService.current.playTrack(track);
            speak(`Playing ${track.title}`);
          } else {
            speak("Forest sounds not available");
          }
        }
        else if (lowerCommand.includes("ocean") || lowerCommand.includes("wave") || lowerCommand.includes("sea")) {
          const track = musicTracks.find(t => t.title.toLowerCase().includes("ocean"));
          if (track) {
            await musicService.current.playTrack(track);
            speak(`Playing ${track.title}`);
          } else {
            speak("Ocean sounds not available");
          }
        }
        else if (lowerCommand.includes("peaceful") || lowerCommand.includes("calm") || lowerCommand.includes("relax")) {
          const track = musicTracks.find(t => t.title === "Healix Meditation");
          if (track) {
            await musicService.current.playTrack(track);
            speak("Playing peaceful meditation music");
          } else {
            speak("Peaceful music not available");
          }
        }
        else if (lowerCommand.includes("meditation") || lowerCommand.includes("meditate")) {
          const track = musicTracks.find(t => t.title === "Healix Meditation");
          if (track) {
            await musicService.current.playTrack(track);
            speak("Playing Healix meditation");
          } else {
            await musicService.current.playByCategory("meditation");
            speak("Playing meditation music");
          }
        }
        else if (lowerCommand.includes("sleep") || lowerCommand.includes("bedtime")) {
          await musicService.current.playByCategory("sleep");
          speak("Playing sleep music");
        }
        else if (lowerCommand.includes("focus") || lowerCommand.includes("concentration")) {
          await musicService.current.playByCategory("focus");
          speak("Playing focus music");
        }
        else if (lowerCommand.includes("nature")) {
          await musicService.current.playByCategory("nature");
          speak("Playing nature sounds");
        }
        else if (lowerCommand.includes("classical")) {
          await musicService.current.playByCategory("classical");
          speak("Playing classical music");
        }
        else if (lowerCommand.includes("music") || lowerCommand.includes("song") || lowerCommand.includes("something")) {
          // Generic play request - default to Healix meditation
          const healixTrack = musicTracks.find(t => t.title === "Healix Meditation");
          if (healixTrack) {
            await musicService.current.playTrack(healixTrack);
            speak("Playing Healix meditation");
          } else {
            const recommendation = getMusicRecommendation(lowerCommand);
            if (recommendation) {
              await musicService.current.playTrack(recommendation);
              speak(`Playing ${recommendation.title}`);
            } else {
              await musicService.current.playRandomTherapeutic();
              speak("Playing therapeutic music");
            }
          }
        }
      }
      
      // PAUSE COMMAND
      else if (lowerCommand.includes("pause") || lowerCommand.includes("stop playing")) {
        musicService.current.pause();
        speak("Music paused");
      }
      
      // RESUME/CONTINUE COMMAND
      else if (lowerCommand.includes("resume") || lowerCommand.includes("continue") || lowerCommand.includes("unpause")) {
        musicService.current.resume();
        speak("Resuming music");
      }
      
      // STOP COMMAND
      else if (lowerCommand.includes("stop") && !lowerCommand.includes("stop playing")) {
        musicService.current.stop();
        speak("Music stopped");
      }
      
      // VOLUME UP
      else if (lowerCommand.includes("volume up") || lowerCommand.includes("louder") || lowerCommand.includes("increase volume") || lowerCommand.includes("turn up")) {
        const currentVol = musicService.current.getVolume();
        const newVol = Math.min(1, currentVol + 0.2);
        musicService.current.setVolume(newVol);
        speak(`Volume increased to ${Math.round(newVol * 100)} percent`);
      }
      
      // VOLUME DOWN
      else if (lowerCommand.includes("volume down") || lowerCommand.includes("quieter") || lowerCommand.includes("decrease volume") || lowerCommand.includes("turn down") || lowerCommand.includes("lower volume")) {
        const currentVol = musicService.current.getVolume();
        const newVol = Math.max(0, currentVol - 0.2);
        musicService.current.setVolume(newVol);
        speak(`Volume decreased to ${Math.round(newVol * 100)} percent`);
      }
      
      // NEXT SONG
      else if (lowerCommand.includes("next") || lowerCommand.includes("skip") || lowerCommand.includes("next song") || lowerCommand.includes("next track")) {
        console.log("🎵 Next command detected");
        const currentTrack = musicService.current.getCurrentTrack();
        console.log("Current track:", currentTrack);
        
        if (!currentTrack) {
          // No music playing, start with first track
          console.log("No track playing, starting first track");
          const firstTrack = musicTracks[0];
          await musicService.current.playTrack(firstTrack);
          speak(`Playing ${firstTrack.title}`);
        } else {
          // Find current track index
          const currentIndex = musicTracks.findIndex(t => t.id === currentTrack.id);
          console.log("Current index:", currentIndex);
          
          const nextIndex = (currentIndex + 1) % musicTracks.length;
          const nextTrack = musicTracks[nextIndex];
          console.log("Next track:", nextTrack);
          
          await musicService.current.playTrack(nextTrack);
          speak(`Playing next track: ${nextTrack.title}`);
        }
      }
      
      // PREVIOUS SONG
      else if (lowerCommand.includes("previous") || lowerCommand.includes("back") || lowerCommand.includes("last song") || lowerCommand.includes("previous song")) {
        console.log("🎵 Previous command detected");
        const currentTrack = musicService.current.getCurrentTrack();
        console.log("Current track:", currentTrack);
        
        if (!currentTrack) {
          // No music playing, start with last track
          console.log("No track playing, starting last track");
          const lastTrack = musicTracks[musicTracks.length - 1];
          await musicService.current.playTrack(lastTrack);
          speak(`Playing ${lastTrack.title}`);
        } else {
          // Find current track index
          const currentIndex = musicTracks.findIndex(t => t.id === currentTrack.id);
          console.log("Current index:", currentIndex);
          
          const prevIndex = currentIndex === 0 ? musicTracks.length - 1 : currentIndex - 1;
          const prevTrack = musicTracks[prevIndex];
          console.log("Previous track:", prevTrack);
          
          await musicService.current.playTrack(prevTrack);
          speak(`Playing previous track: ${prevTrack.title}`);
        }
      }
      
      // EXIT MUSIC PLAYER
      else if (lowerCommand.includes("exit music") || lowerCommand.includes("close music") || lowerCommand.includes("exit player") || lowerCommand.includes("close player")) {
        console.log("🚪 Exit music player command");
        musicService.current.stop();
        speak("Exiting music player");
        stopListening();
      }
      
      // GOODBYE
      else if (lowerCommand.includes("goodbye") || lowerCommand.includes("bye") || lowerCommand.includes("see you")) {
        console.log("👋 Goodbye command");
        const isPlaying = musicService.current.getIsPlaying();
        if (isPlaying) {
          musicService.current.stop();
          speak("Stopping music and saying goodbye");
        } else {
          speak("Goodbye");
        }
        stopListening();
      }
      
      // WHAT'S PLAYING
      else if (lowerCommand.includes("what") && (lowerCommand.includes("playing") || lowerCommand.includes("song") || lowerCommand.includes("music"))) {
        const currentTrack = musicService.current.getCurrentTrack();
        if (currentTrack) {
          speak(`Currently playing ${currentTrack.title} by ${currentTrack.artist}`);
        } else {
          speak("No music is currently playing");
        }
      }
      
      // HELP
      else if (lowerCommand.includes("help") || lowerCommand.includes("what can you do")) {
        speak("I can play rain, forest, ocean, peaceful, meditation, sleep, focus, or classical music. You can also say pause, resume, stop, volume up, volume down, next, or previous.");
      }
      
      else {
        console.log("⚠️ Command not recognized:", lowerCommand);
      }

    } catch (error) {
      console.error("❌ Error processing command:", error);
      speak("Sorry, I couldn't process that command");
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [speak]);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) return;

    try {
      if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
        console.error("Speech recognition not supported");
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        console.log("🎤 Voice music assistant started");
        setState(prev => ({ ...prev, isListening: true }));
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setState(prev => ({ ...prev, transcript: finalTranscript }));
          
          // Check for wake word or music commands
          const lowerTranscript = finalTranscript.toLowerCase();
          if (lowerTranscript.includes("healix") || 
              lowerTranscript.includes("play") || 
              lowerTranscript.includes("pause") ||
              lowerTranscript.includes("stop") ||
              lowerTranscript.includes("volume") ||
              lowerTranscript.includes("next") ||
              lowerTranscript.includes("previous") ||
              lowerTranscript.includes("exit") ||
              lowerTranscript.includes("close") ||
              lowerTranscript.includes("goodbye") ||
              lowerTranscript.includes("bye")) {
            processCommand(finalTranscript);
          }
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("❌ Speech recognition error:", event.error);
        if (event.error !== "no-speech" && event.error !== "audio-capture") {
          setState(prev => ({ ...prev, isListening: false }));
        }
      };

      recognitionRef.current.onend = () => {
        console.log("🛑 Speech recognition ended");
        setState(prev => ({ ...prev, isListening: false }));

        // Auto-restart if should be listening
        if (shouldBeListeningRef.current) {
          if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
          }
          restartTimeoutRef.current = setTimeout(() => {
            if (shouldBeListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e: any) {
                if (!e.message?.includes("already started")) {
                  console.error("Failed to restart:", e);
                }
              }
            }
          }, 100);
        }
      };

      console.log("✅ Voice music assistant initialized");
    } catch (err) {
      console.error("Failed to initialize speech recognition:", err);
    }
  }, [processCommand]);

  // Start listening
  const startListening = useCallback(async () => {
    console.log("▶️ Starting voice music assistant...");
    
    if (!recognitionRef.current) {
      initializeSpeechRecognition();
    }

    shouldBeListeningRef.current = true;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        console.log("✅ Voice music assistant started");
      } catch (error: any) {
        if (!error.message?.includes("already started")) {
          console.error("Failed to start:", error);
        }
      }
    }
  }, [initializeSpeechRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    console.log("⏸️ Stopping voice music assistant...");
    
    shouldBeListeningRef.current = false;

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Failed to stop:", error);
      }
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      shouldBeListeningRef.current = false;
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  return {
    state,
    startListening,
    stopListening,
    processCommand,
  };
};
