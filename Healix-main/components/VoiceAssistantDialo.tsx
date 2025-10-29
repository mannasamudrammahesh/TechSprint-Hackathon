"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Settings, Volume2, VolumeX } from 'lucide-react';
import { useDialogpt } from '@/hooks/useDialogpt';
import { useUser } from '@clerk/nextjs';
import { useUserSettings } from '@/contexts/UserSettingsContext';
import { voiceSelector } from '@/lib/voiceSelection';

interface VoiceAssistantDialoProps {
  language?: string;
  onLanguageChange?: (lang: string) => void;
}

export default function VoiceAssistantDialo({ 
  language = 'en', 
  onLanguageChange 
}: VoiceAssistantDialoProps) {
  const { send, isLoading } = useDialogpt();
  const { isSignedIn, user } = useUser();
  const { settings, updateSettings } = useUserSettings();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [microphonePermission, setMicrophonePermission] = useState<boolean>(false);
  const [customWakeWord, setCustomWakeWord] = useState<string>('');
  const [autoTimeout, setAutoTimeout] = useState<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Helper function for string similarity calculation
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const editDistance = getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const getEditDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    return matrix[str2.length][str1.length];
  };

  // Enhanced Language configurations with multiple wake words
  const languageConfigs = {
    en: { 
      code: 'en-US', 
      name: 'English',
      wakeWords: ['healix', 'hey healix', 'hello healix', 'hey siri', 'ok google', 'assistant', customWakeWord].filter(Boolean),
      activationMessage: 'Healix voice assistant activated. I\'m here to help with your mental health. How are you feeling today?'
    },
    hi: { 
      code: 'hi-IN', 
      name: 'हिंदी',
      wakeWords: ['हीलिक्स', 'हे हीलिक्स', 'नमस्ते हीलिक्स', 'हे सिरी', 'ओके गूगल', 'असिस्टेंट'],
      activationMessage: 'हीलिक्स वॉयस असिस्टेंट सक्रिय। मैं आपके मानसिक स्वास्थ्य में मदद के लिए यहाँ हूँ। आज आप कैसा महसूस कर रहे हैं?'
    },
    te: { 
      code: 'te-IN', 
      name: 'తెలుగు',
      wakeWords: ['హీలిక్స్', 'హే హీలిక్స్', 'నమస్కారం హీలిక్స్', 'హే సిరి', 'ఓకే గూగుల్', 'అసిస్టెంట్'],
      activationMessage: 'హీలిక్స్ వాయిస్ అసిస్టెంట్ యాక్టివేట్ అయింది. నేను మీ మానసిక ఆరోగ్యంలో సహాయం చేయడానికి ఇక్కడ ఉన్నాను. ఈరోజు మీరు ఎలా అనిపిస్తున్నారు?'
    },
    ta: { 
      code: 'ta-IN', 
      name: 'தமிழ்',
      wakeWords: ['ஹீலிக்ஸ்', 'ஹே ஹீலிக்ஸ்', 'வணக்கம் ஹீலிக்ஸ்', 'ஹே சிரி', 'ஓகே கூகுள்', 'அசிஸ்டெண்ட்'],
      activationMessage: 'ஹீலிக்ஸ் குரல் உதவியாளர் செயல்படுத்தப்பட்டது. உங்கள் மன ஆரோக்கியத்தில் உதவ நான் இங்கே இருக்கிறேன். இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?'
    },
    kn: { 
      code: 'kn-IN', 
      name: 'ಕನ್ನಡ',
      wakeWords: ['ಹೀಲಿಕ್ಸ್', 'ಹೇ ಹೀಲಿಕ್ಸ್', 'ನಮಸ್ಕಾರ ಹೀಲಿಕ್ಸ್', 'ಹೇ ಸಿರಿ', 'ಓಕೇ ಗೂಗಲ್', 'ಅಸಿಸ್ಟೆಂಟ್'],
      activationMessage: 'ಹೀಲಿಕ್ಸ್ ಧ್ವನಿ ಸಹಾಯಕ ಸಕ್ರಿಯಗೊಂಡಿದೆ. ನಿಮ್ಮ ಮಾನಸಿಕ ಆರೋಗ್ಯದಲ್ಲಿ ಸಹಾಯ ಮಾಡಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ. ಇಂದು ನೀವು ಹೇಗೆ ಅನಿಸುತ್ತಿದೆ?'
    },
    gu: { 
      code: 'gu-IN', 
      name: 'ગુજરાતી',
      wakeWords: ['હીલિક્સ', 'હે હીલિક્સ', 'નમસ્તે હીલિક્સ', 'હે સિરી', 'ઓકે ગૂગલ', 'અસિસ્ટન્ટ'],
      activationMessage: 'હીલિક્સ વૉઇસ અસિસ્ટન્ટ સક્રિય થયું. હું તમારા માનસિક સ્વાસ્થ્યમાં મદદ કરવા અહીં છું. આજે તમે કેવું લાગે છે?'
    }
  };

  // Use settings language or fallback to prop
  const currentLanguage = settings.voiceLanguage || language;
  const currentLangConfig = languageConfigs[currentLanguage as keyof typeof languageConfigs] || languageConfigs.en;
  
  // Update custom wake word from settings
  useEffect(() => {
    setCustomWakeWord(settings.wakeWord || '');
  }, [settings.wakeWord]);

  // Auto-activate microphone for signed-in users
  useEffect(() => {
    if (isSignedIn && !microphonePermission) {
      requestMicrophonePermission();
    }
  }, [isSignedIn]);

  // Auto-deactivate after 5 minutes of inactivity
  useEffect(() => {
    if (isListening && isActivated) {
      if (autoTimeout) clearTimeout(autoTimeout);
      const timeout = setTimeout(() => {
        if (isListening && !isSpeaking) {
          setIsListening(false);
          setIsActivated(false);
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
          speak('Voice assistant deactivated due to inactivity. Say wake word to reactivate.');
        }
      }, 5 * 60 * 1000); // 5 minutes
      setAutoTimeout(timeout);
    }
    return () => {
      if (autoTimeout) clearTimeout(autoTimeout);
    };
  }, [isListening, isActivated, isSpeaking]);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicrophonePermission(true);
      stream.getTracks().forEach(track => track.stop()); // Stop the stream, we just needed permission
      
      // Auto-start listening for signed-in users
      if (isSignedIn) {
        setTimeout(() => {
          if (recognitionRef.current && !isListening) {
            recognitionRef.current.start();
            setIsListening(true);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setMicrophonePermission(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return;
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = currentLangConfig.code;
      
      recognition.onresult = async (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          const text = finalTranscript.trim().toLowerCase();
          
          // Check for stop words first
          const stopWords = ['stop', 'quit', 'exit', 'close', 'end', 'pause', 'halt', 'terminate', 'goodbye', 'good bye', 'stop it', 'बंद करो', 'रोको', 'ఆపు', 'ముగించు', 'நிறுத்து', 'முடி', 'ನಿಲ್ಲಿಸು', 'ಮುಗಿಸು', 'બંધ કરો', 'રોકો'];
          const isStopWord = stopWords.some(stop => text.includes(stop.toLowerCase()));
          
          if (isStopWord) {
            setIsActivated(false);
            setIsListening(false);
            if (sessionTimeout) clearTimeout(sessionTimeout);
            if (autoTimeout) clearTimeout(autoTimeout);
            speak('Voice assistant stopped. Say wake word to reactivate.');
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
            return;
          }

          // Enhanced wake word detection with fuzzy matching for multi-language support
          const isWakeWord = currentLangConfig.wakeWords.some(wake => {
            const wakeWordLower = wake.toLowerCase();
            const textLower = text.toLowerCase();
            
            // Exact match
            if (textLower.includes(wakeWordLower)) return true;
            
            // Enhanced fuzzy matching for similar sounds (common speech recognition errors)
            const fuzzyMatches: Record<string, string[]> = {
              // English variations
              'healix': ['helix', 'healing', 'heal it', 'heal x', 'he likes', 'he licks', 'healicks'],
              'hey healix': ['hey helix', 'hey healing', 'a healix', 'hey heal it', 'he healix', 'hai healix'],
              'hello healix': ['hello helix', 'halo healix', 'hello healing', 'helo healix'],
              'hey siri': ['hey sri', 'hey serie', 'hey seri', 'a siri', 'hey sorry'],
              'ok google': ['okay google', 'ok googol', 'okay googol', 'ok goggle'],
              'assistant': ['assistance', 'assistants', 'assist ant'],
              
              // Hindi variations
              'हीलिक्स': ['हीलिक्स', 'हिलिक्स', 'हीलिक्स', 'हेलिक्स', 'हीलिक्स'],
              'हे हीलिक्स': ['हे हीलिक्स', 'हे हिलिक्स', 'हाय हीलिक्स', 'है हीलिक्स'],
              'नमस्ते हीलिक्स': ['नमस्ते हीलिक्स', 'नमस्कार हीलिक्स', 'नमस्ते हिलिक्स'],
              
              // Telugu variations
              'హీలిక్స్': ['హీలిక్స్', 'హిలిక్స్', 'హేలిక్స్', 'హీలిక్స'],
              'హే హీలిక్స్': ['హే హీలిక్స్', 'హాయ్ హీలిక్స్', 'హే హిలిక్స్'],
              'నమస్కారం హీలిక్స్': ['నమస్కారం హీలిక్స్', 'నమస్తే హీలిక్స్'],
              
              // Tamil variations
              'ஹீலிக்ஸ்': ['ஹீலிக்ஸ்', 'ஹிலிக்ஸ்', 'ஹேலிக்ஸ்'],
              'ஹே ஹீலிக்ஸ்': ['ஹே ஹீலிக்ஸ்', 'ஹாய் ஹீலிக்ஸ்'],
              'வணக்கம் ஹீலிக்ஸ்': ['வணக்கம் ஹீலிக்ஸ்', 'வணக்கம் ஹிலிக்ஸ்'],
              
              // Kannada variations
              'ಹೀಲಿಕ್ಸ್': ['ಹೀಲಿಕ್ಸ್', 'ಹಿಲಿಕ್ಸ್', 'ಹೇಲಿಕ್ಸ್'],
              'ಹೇ ಹೀಲಿಕ್ಸ್': ['ಹೇ ಹೀಲಿಕ್ಸ್', 'ಹಾಯ್ ಹೀಲಿಕ್ಸ್'],
              'ನಮಸ್ಕಾರ ಹೀಲಿಕ್ಸ್': ['ನಮಸ್ಕಾರ ಹೀಲಿಕ್ಸ್', 'ನಮಸ್ತೇ ಹೀಲಿಕ್ಸ್'],
              
              // Gujarati variations
              'હીલિક્સ': ['હીલિક્સ', 'હિલિક્સ', 'હેલિક્સ'],
              'હે હીલિક્સ': ['હે હીલિક્સ', 'હાય હીલિક્સ'],
              'નમસ્તે હીલિક્સ': ['નમસ્તે હીલિક્સ', 'નમસ્કાર હીલિક્સ']
            };
            
            // Check fuzzy matches
            if (fuzzyMatches[wakeWordLower]) {
              return fuzzyMatches[wakeWordLower].some((fuzzy: string) => textLower.includes(fuzzy));
            }
            
            // Phonetic similarity check for non-English languages with lower threshold
            const similarity = calculateSimilarity(textLower, wakeWordLower);
            return similarity > 0.5; // 50% similarity threshold for better detection
          });
          
          if (isWakeWord) {
            setIsActivated(true);
            speak(currentLangConfig.activationMessage);
            
            // Set session timeout for 5 minutes
            if (sessionTimeout) clearTimeout(sessionTimeout);
            const timeout = setTimeout(() => {
              setIsActivated(false);
              speak('Voice assistant session ended. Say wake word to reactivate.');
            }, 5 * 60 * 1000); // 5 minutes
            setSessionTimeout(timeout);
            return;
          }
          
          // Only process commands if activated or if it's a wake word
          if (!isActivated && !isWakeWord) {
            return;
          }
          
          try {
            const reply = await send(finalTranscript, language);
            if (reply) {
              speak(reply);
            }
          } catch (error) {
            console.error('Voice assistant error:', error);
            speak('Sorry, I encountered an error. Please try again.');
          }
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        if (isListening) {
          recognition.start(); // Restart if still listening
        }
      };
      
      recognitionRef.current = recognition;
      
      // Initialize speech synthesis
      if ('speechSynthesis' in window) {
        synthesisRef.current = window.speechSynthesis;
      }
    }
  }, [language, currentLangConfig, send, isListening]);

  const speak = (text: string) => {
    if (!synthesisRef.current) return;
    
    // Clean text for speech
    let cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove markdown bold
    cleanText = cleanText.replace(/\*(.*?)\*/g, '$1'); // Remove markdown italic
    cleanText = cleanText.replace(/#{1,6}\s/g, ''); // Remove markdown headers
    cleanText = cleanText.replace(/\n+/g, '. '); // Replace newlines with periods
    cleanText = cleanText.substring(0, 500); // Limit length
    
    synthesisRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Use voice selector to get optimal voice
    const selectedVoice = voiceSelector.getOptimalVoice(
      settings.selectedVoice,
      currentLanguage,
      true // prefer female for stress relief
    );
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Use settings for voice parameters
    utterance.rate = settings.voiceSpeed || 0.9;
    utterance.pitch = settings.voicePitch || 1.0;
    utterance.volume = settings.voiceVolume || 0.8;
    utterance.lang = currentLangConfig.code;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthesisRef.current.speak(utterance);
  };

  const toggleListening = async () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      console.error('Speech recognition not available');
      return;
    }
    
    try {
      if (isListening) {
        // Stop listening
        console.log('Stopping voice assistant...');
        recognition.stop();
        setIsListening(false);
        setIsActivated(false);
        
        // Clear all timeouts
        if (sessionTimeout) {
          clearTimeout(sessionTimeout);
          setSessionTimeout(null);
        }
        if (autoTimeout) {
          clearTimeout(autoTimeout);
          setAutoTimeout(null);
        }
        
        speak('Voice assistant turned off.');
      } else {
        // Start listening
        console.log('Starting voice assistant...');
        
        // Request microphone permission if not already granted
        if (!microphonePermission) {
          await requestMicrophonePermission();
        }
        
        // Start recognition
        recognition.lang = currentLangConfig.code;
        recognition.start();
        setIsListening(true);
        setIsActivated(true);
        
        speak(currentLangConfig.activationMessage);
        
        // Set 5-minute auto-deactivation timer
        if (autoTimeout) clearTimeout(autoTimeout);
        const timeout = setTimeout(() => {
          console.log('Auto-deactivating due to inactivity...');
          if (isListening && !isSpeaking) {
            setIsListening(false);
            setIsActivated(false);
            recognition.stop();
            speak('Voice assistant deactivated due to inactivity.');
          }
        }, 5 * 60 * 1000); // 5 minutes
        setAutoTimeout(timeout);
      }
    } catch (error) {
      console.error('Error toggling voice assistant:', error);
      setIsListening(false);
      setIsActivated(false);
    }
  };

  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2">
      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-lg shadow-lg p-4 mb-2 min-w-[250px] max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-3">Voice Assistant Settings</h3>
          
          {/* Language Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Language</label>
            <div className="space-y-1">
              {Object.entries(languageConfigs).map(([code, config]) => (
                <button
                  key={code}
                  onClick={() => {
                    updateSettings({ voiceLanguage: code });
                    onLanguageChange?.(code);
                    // Restart recognition with new language
                    if (recognitionRef.current && isListening) {
                      recognitionRef.current.stop();
                      setTimeout(() => {
                        if (recognitionRef.current) {
                          recognitionRef.current.lang = config.code;
                          recognitionRef.current.start();
                        }
                      }, 100);
                    }
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    currentLanguage === code ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  {config.name}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Wake Word */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Custom Wake Word</label>
            <input
              type="text"
              value={customWakeWord}
              onChange={(e) => {
                setCustomWakeWord(e.target.value);
                updateSettings({ wakeWord: e.target.value });
              }}
              placeholder="Enter custom wake word"
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>

          {/* Voice Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Voice Selection</label>
            <div className="space-y-2">
              {voiceSelector.getVoiceProfiles().map((profile) => (
                <div key={profile.id} className="space-y-1">
                  <button
                    onClick={() => {
                      updateSettings({ selectedVoice: profile.id });
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      settings.selectedVoice === profile.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{profile.name}</div>
                    <div className="text-xs text-gray-500">{profile.description}</div>
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await voiceSelector.testVoiceWithBackend(profile.id, currentLanguage);
                      } catch (error) {
                        console.error('Voice test failed:', error);
                        // Fallback to browser TTS
                        try {
                          await voiceSelector.testVoice(profile.id, currentLanguage);
                        } catch (fallbackError) {
                          console.error('Browser TTS also failed:', fallbackError);
                        }
                      }
                    }}
                    className="w-full text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100 transition-colors"
                  >
                    🔊 Test Voice
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="w-full bg-blue-500 text-white py-2 rounded text-sm hover:bg-blue-600"
          >
            Close Settings
          </button>
        </div>
      )}
      
      {/* Transcript Display */}
      {transcript && (
        <div className="bg-white rounded-lg shadow-lg px-4 py-2 max-w-xs">
          <div className="text-sm text-gray-600 mb-1">
            {isLoading ? 'Processing...' : 'You said:'}
          </div>
          <div className="text-sm">{transcript}</div>
        </div>
      )}
      
      {/* Control Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={() => setShowSettings(!showSettings)}
          variant="outline"
          size="sm"
          className="rounded-full w-10 h-10 p-0"
        >
          <Settings className="h-4 w-4" />
        </Button>
        
        {isSpeaking && (
          <Button
            onClick={stopSpeaking}
            variant="outline"
            size="sm"
            className="rounded-full w-10 h-10 p-0 bg-orange-50 border-orange-300"
          >
            <Volume2 className="h-4 w-4 text-orange-600" />
          </Button>
        )}
        
        <Button
          onClick={toggleListening}
          disabled={isLoading}
          className={`rounded-full w-14 h-14 p-0 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isListening ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </Button>
      </div>
      
      {/* Enhanced Status Indicator with Listening Popup */}
      {isListening && (
        <div className="absolute bottom-20 right-0 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            <span className="text-sm font-medium">
              {isActivated ? 'Listening...' : 'Waiting for wake word...'}
            </span>
          </div>
        </div>
      )}
      
      {!isListening && !isSpeaking && (
        <div className="absolute bottom-20 right-0 bg-gray-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-sm font-medium">Start</span>
          </div>
        </div>
      )}
      
      <div className="text-xs text-center text-gray-500">
        {isListening ? 
          `${isActivated ? '🟢 Active' : '🔴 Waiting for wake word'} - Listening in ${currentLangConfig.name}` : 
         isSpeaking ? 'Speaking...' : 
         isActivated ? `🟢 Voice Assistant Active (${currentLangConfig.name})` :
         `🔴 Voice Assistant (${currentLangConfig.name}) - Say wake word to activate`}
      </div>
    </div>
  );
}


