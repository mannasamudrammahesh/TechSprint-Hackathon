"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Languages, Brain, Headphones } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VoiceHandlerProps {
  onVoiceCommand: (command: string, confidence: number) => void;
  onEmotionDetected: (emotion: string, confidence: number) => void;
  isEnabled: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  grammars: SpeechGrammarList;
  start(): void;
  stop(): void;
  abort(): void;
  addEventListener(type: 'result', listener: (event: SpeechRecognitionEvent) => void): void;
  addEventListener(type: 'error', listener: (event: SpeechRecognitionErrorEvent) => void): void;
  addEventListener(type: 'start' | 'end' | 'speechstart' | 'speechend' | 'soundstart' | 'soundend' | 'audiostart' | 'audioend' | 'nomatch', listener: (event: Event) => void): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function VoiceHandler({ 
  onVoiceCommand, 
  onEmotionDetected, 
  isEnabled 
}: VoiceHandlerProps) {
  const [isListening, setIsListening] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [detectedCommands, setDetectedCommands] = useState<string[]>([]);
  const [detectedEmotion, setDetectedEmotion] = useState<{ emotion: string; confidence: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWakeWordDetected, setIsWakeWordDetected] = useState(false);
  const [wakeWordTimeout, setWakeWordTimeout] = useState<NodeJS.Timeout | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const supportedLanguages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
    { code: 'te-IN', name: 'Telugu', flag: '🇮🇳' },
    { code: 'ta-IN', name: 'Tamil', flag: '🇮🇳' },
    { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German', flag: '🇩🇪' },
    { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh-CN', name: 'Chinese (Mandarin)', flag: '🇨🇳' }
  ];

  const wakeWords = {
    'en-US': ['hey healix', 'healix', 'hello healix', 'hi healix'],
    'hi-IN': ['हे हीलिक्स', 'हीलिक्स', 'नमस्ते हीलिक्स'],
    'te-IN': ['హే హీలిక్స్', 'హీలిక్స్', 'నమస్కారం హీలిక్స్'],
    'ta-IN': ['ஹே ஹீலிக்ஸ்', 'ஹீலிக்ஸ்', 'வணக்கம் ஹீலிக்ஸ்'],
    'es-ES': ['hey healix', 'healix', 'hola healix'],
    'fr-FR': ['hey healix', 'healix', 'bonjour healix'],
    'de-DE': ['hey healix', 'healix', 'hallo healix'],
    'ja-JP': ['ヘイ ヒーリックス', 'ヒーリックス', 'こんにちは ヒーリックス'],
    'ko-KR': ['헤이 힐릭스', '힐릭스', '안녕 힐릭스'],
    'zh-CN': ['嘿 希利克斯', '希利克斯', '你好 希利克斯']
  };

  const battleCommands = [
    'attack', 'defend', 'heal', 'shield', 'breathe', 'calm', 'focus', 'relax',
    'meditation', 'peace', 'strength', 'courage', 'hope', 'love', 'gratitude'
  ];

  // Initialize Speech Recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = currentLanguage;
    recognition.maxAlternatives = 3;

    recognition.addEventListener('start', () => {
      setIsListening(true);
      setError(null);
    });

    recognition.addEventListener('end', () => {
      setIsListening(false);
      if (isEnabled) {
        // Restart recognition if still enabled
        setTimeout(() => {
          if (recognitionRef.current && isEnabled) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.log('Recognition restart failed:', e);
            }
          }
        }, 100);
      }
    });

    recognition.addEventListener('result', (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;

        if (result.isFinal) {
          finalTranscript += transcript;
          setConfidence(confidence);
          processVoiceInput(transcript, confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    });

    recognition.addEventListener('error', (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setError(`Recognition error: ${event.error}`);
      setIsListening(false);
    });

    recognitionRef.current = recognition;
  }, [currentLanguage, isEnabled]);

  // Check for wake word in current language
  const checkWakeWord = useCallback((text: string): boolean => {
    const lowerText = text.toLowerCase().trim();
    const currentWakeWords = wakeWords[currentLanguage] || wakeWords['en-US'];
    
    return currentWakeWords.some(wakeWord => {
      const lowerWakeWord = wakeWord.toLowerCase();
      return lowerText.includes(lowerWakeWord) || 
             lowerText.startsWith(lowerWakeWord) ||
             lowerText.endsWith(lowerWakeWord);
    });
  }, [currentLanguage]);

  // Process voice input for commands and emotion
  const processVoiceInput = useCallback(async (text: string, confidence: number) => {
    if (!text.trim()) return;

    const lowerText = text.toLowerCase();
    
    // First check for wake word
    if (checkWakeWord(text)) {
      setIsWakeWordDetected(true);
      setDetectedCommands(prev => [...prev.slice(-4), 'Wake Word Detected']);
      
      // Clear previous timeout
      if (wakeWordTimeout) {
        clearTimeout(wakeWordTimeout);
      }
      
      // Set timeout to reset wake word detection
      const timeout = setTimeout(() => {
        setIsWakeWordDetected(false);
      }, 10000); // 10 seconds to give command after wake word
      
      setWakeWordTimeout(timeout);
      return;
    }

    // Only process commands if wake word was recently detected or if it's a direct command
    if (!isWakeWordDetected && !battleCommands.some(cmd => lowerText.includes(cmd))) {
      return;
    }

    setIsProcessing(true);

    try {
      // Check for battle commands
      const detectedCommand = battleCommands.find(command => 
        lowerText.includes(command) || 
        lowerText.includes(command.substring(0, 4)) // Partial match
      );

      if (detectedCommand) {
        onVoiceCommand(detectedCommand, confidence);
        setDetectedCommands(prev => [...prev.slice(-4), detectedCommand]);
        
        // Reset wake word detection after successful command
        setIsWakeWordDetected(false);
        if (wakeWordTimeout) {
          clearTimeout(wakeWordTimeout);
          setWakeWordTimeout(null);
        }
      }

      // Detect emotion using Hugging Face API
      await detectEmotion(text);

      // Handle multi-language commands
      if (currentLanguage !== 'en-US') {
        await processMultiLanguageCommand(text, confidence);
      }

    } catch (error) {
      console.error('Voice processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [currentLanguage, onVoiceCommand, checkWakeWord, isWakeWordDetected, wakeWordTimeout]);

  // Detect emotion from text
  const detectEmotion = useCallback(async (text: string) => {
    try {
      const response = await fetch('/api/emotion-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const result = await response.json();
        const topEmotion = result.emotions?.[0];
        
        if (topEmotion) {
          setDetectedEmotion({
            emotion: topEmotion.label,
            confidence: topEmotion.score
          });
          onEmotionDetected(topEmotion.label, topEmotion.score);
        }
      } else {
        // Fallback emotion detection
        const emotion = detectEmotionFallback(text);
        if (emotion) {
          setDetectedEmotion(emotion);
          onEmotionDetected(emotion.emotion, emotion.confidence);
        }
      }
    } catch (error) {
      console.error('Emotion detection error:', error);
      // Use fallback
      const emotion = detectEmotionFallback(text);
      if (emotion) {
        setDetectedEmotion(emotion);
        onEmotionDetected(emotion.emotion, emotion.confidence);
      }
    }
  }, [onEmotionDetected]);

  // Fallback emotion detection using keywords
  const detectEmotionFallback = useCallback((text: string) => {
    const emotionKeywords = {
      positive: ['happy', 'joy', 'excited', 'great', 'awesome', 'wonderful', 'love', 'amazing', 'fantastic', 'good'],
      negative: ['sad', 'angry', 'frustrated', 'bad', 'terrible', 'awful', 'hate', 'horrible', 'worried', 'anxious'],
      calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'zen', 'breathe', 'meditation'],
      confident: ['strong', 'powerful', 'confident', 'brave', 'courage', 'determined', 'focused']
    };

    const lowerText = text.toLowerCase();
    let maxScore = 0;
    let detectedEmotion = 'neutral';

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const matches = keywords.filter(keyword => lowerText.includes(keyword)).length;
      const score = matches / keywords.length;
      
      if (score > maxScore) {
        maxScore = score;
        detectedEmotion = emotion;
      }
    });

    return maxScore > 0 ? { emotion: detectedEmotion, confidence: maxScore } : null;
  }, []);

  // Process multi-language commands
  const processMultiLanguageCommand = useCallback(async (text: string, confidence: number) => {
    try {
      // Translate to English first
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          target_language: 'en',
          source_language: currentLanguage.split('-')[0]
        })
      });

      if (response.ok) {
        const result = await response.json();
        const translatedText = result.translated_text;
        
        // Check for commands in translated text
        const lowerTranslated = translatedText.toLowerCase();
        const detectedCommand = battleCommands.find(command => 
          lowerTranslated.includes(command)
        );

        if (detectedCommand) {
          onVoiceCommand(detectedCommand, confidence * 0.8); // Slightly lower confidence for translated
          setDetectedCommands(prev => [...prev.slice(-4), `${detectedCommand} (translated)`]);
        }
      }
    } catch (error) {
      console.error('Translation error:', error);
    }
  }, [currentLanguage, onVoiceCommand]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      initializeSpeechRecognition();
    }

    try {
      recognitionRef.current?.start();
      setError(null);
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setError('Failed to start voice recognition');
    }
  }, [initializeSpeechRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  // Change language
  const changeLanguage = useCallback((newLanguage: string) => {
    const wasListening = isListening;
    
    if (wasListening) {
      stopListening();
    }
    
    setCurrentLanguage(newLanguage);
    
    // Reinitialize with new language
    setTimeout(() => {
      initializeSpeechRecognition();
      if (wasListening && isEnabled) {
        startListening();
      }
    }, 100);
  }, [isListening, isEnabled, stopListening, initializeSpeechRecognition, startListening]);

  // Initialize on mount
  useEffect(() => {
    if (isEnabled) {
      initializeSpeechRecognition();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isEnabled, initializeSpeechRecognition]);

  // Auto-start/stop based on enabled state
  useEffect(() => {
    if (isEnabled && !isListening) {
      startListening();
    } else if (!isEnabled && isListening) {
      stopListening();
    }
  }, [isEnabled, isListening, startListening, stopListening]);

  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'positive': return 'bg-green-500';
      case 'negative': return 'bg-red-500';
      case 'calm': return 'bg-blue-500';
      case 'confident': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getLanguageFlag = (langCode: string) => {
    return supportedLanguages.find(lang => lang.code === langCode)?.flag || '🌐';
  };

  return (
    <Card className="bg-black/70 border-purple-500/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Voice Commands & Emotion Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Language Selection */}
        <div>
          <label className="text-white text-sm font-medium mb-2 block">
            Language {getLanguageFlag(currentLanguage)}
          </label>
          <Select value={currentLanguage} onValueChange={changeLanguage}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {supportedLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code} className="text-white hover:bg-gray-700">
                  {lang.flag} {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Voice Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-white text-sm">
              {isListening ? 'Listening...' : 'Not listening'}
            </span>
            {isWakeWordDetected && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-yellow-400 text-xs">Wake Word Active</span>
              </div>
            )}
            {isProcessing && (
              <div className="flex items-center gap-1">
                <Brain className="h-3 w-3 text-blue-400 animate-spin" />
                <span className="text-blue-400 text-xs">Processing</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={stopListening}
              size="sm"
              variant="destructive"
              disabled={!isEnabled || !isListening}
            >
              <MicOff className="h-4 w-4" />
              Stop
            </Button>
            <Button
              onClick={startListening}
              size="sm"
              variant="default"
              disabled={!isEnabled || isListening}
            >
              <Mic className="h-4 w-4" />
              Start
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Live Transcript */}
        {transcript && (
          <div className="bg-gray-800/50 rounded-lg p-3">
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              Live Transcript
            </h4>
            <p className="text-gray-300 text-sm">{transcript}</p>
            {confidence > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-400">Confidence:</span>
                <div className="flex-1 bg-gray-700 rounded-full h-1">
                  <div 
                    className="bg-blue-400 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{(confidence * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>
        )}

        {/* Detected Commands */}
        <div>
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Recent Commands
          </h4>
          <div className="flex flex-wrap gap-1">
            {detectedCommands.slice(-5).map((command, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {command}
              </Badge>
            ))}
            {detectedCommands.length === 0 && (
              <span className="text-gray-400 text-sm">No commands detected</span>
            )}
          </div>
        </div>

        {/* Detected Emotion */}
        {detectedEmotion && (
          <div>
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Current Emotion
            </h4>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${getEmotionColor(detectedEmotion.emotion)}`} />
              <span className="text-white capitalize">{detectedEmotion.emotion}</span>
              <Badge variant="outline" className="text-xs">
                {(detectedEmotion.confidence * 100).toFixed(0)}%
              </Badge>
            </div>
          </div>
        )}

        {/* Wake Words Help */}
        <div className="bg-yellow-900/30 p-3 rounded-lg">
          <h4 className="text-yellow-300 font-medium mb-2">Wake Words ({getLanguageFlag(currentLanguage)})</h4>
          <div className="flex flex-wrap gap-1 text-xs mb-2">
            {(wakeWords[currentLanguage] || wakeWords['en-US']).map((wakeWord, index) => (
              <span key={index} className="text-yellow-200 bg-yellow-800/50 px-2 py-1 rounded">
                "{wakeWord}"
              </span>
            ))}
          </div>
          <p className="text-yellow-300 text-xs">
            Say a wake word first, then give your command within 10 seconds
          </p>
        </div>

        {/* Battle Commands Help */}
        <div className="bg-purple-900/30 p-3 rounded-lg">
          <h4 className="text-purple-300 font-medium mb-2">Battle Commands</h4>
          <div className="grid grid-cols-3 gap-1 text-xs">
            {battleCommands.slice(0, 9).map((command) => (
              <span key={command} className="text-purple-200 capitalize">
                "{command}"
              </span>
            ))}
          </div>
          <p className="text-purple-300 text-xs mt-2">
            Say wake word + any of these commands to trigger battle actions
          </p>
        </div>

        {/* Multi-language Instructions */}
        <div className="bg-blue-900/30 p-3 rounded-lg">
          <h4 className="text-blue-300 font-medium mb-1">Multi-Language Support</h4>
          <ul className="text-blue-200 text-xs space-y-1">
            <li>• Wake words work in your selected language</li>
            <li>• Commands work in your selected language</li>
            <li>• Automatic translation to English for processing</li>
            <li>• Emotion detection supports all languages</li>
            <li>• Clear pronunciation improves accuracy</li>
            <li>• Example: Say "Hey Healix" then "attack" or "breathe"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
