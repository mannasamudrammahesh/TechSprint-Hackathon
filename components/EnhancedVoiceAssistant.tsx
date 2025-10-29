"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Languages, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EnhancedVoiceAssistantProps {
  onTranscription?: (text: string, language: string) => void;
  onResponse?: (text: string, language: string) => void;
  enableWhisperSTT?: boolean;
  enableCoquiTTS?: boolean;
  enableTranslation?: boolean;
}

export default function EnhancedVoiceAssistant({
  onTranscription,
  onResponse,
  enableWhisperSTT = true,
  enableCoquiTTS = true,
  enableTranslation = true
}: EnhancedVoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{user: string, assistant: string, timestamp: Date}>>([]);
  const [assistantPersonality, setAssistantPersonality] = useState('friendly');
  const [userName, setUserName] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'te', name: 'Telugu' },
    { code: 'ta', name: 'Tamil' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' }
  ];

  // Enhanced personality function for more interactive responses
  const enhanceResponsePersonality = (response: string, userInput: string, language: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    // Add conversational elements based on input patterns
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      const greetingEnhancers = [
        "It's wonderful to hear from you! ",
        "I'm so glad you're here! ",
        "What a pleasure to chat with you! "
      ];
      const enhancer = greetingEnhancers[Math.floor(Math.random() * greetingEnhancers.length)];
      return enhancer + response;
    }
    
    if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
      const gratitudeEnhancers = [
        "You're absolutely welcome! ",
        "It's my joy to help! ",
        "Anytime, friend! "
      ];
      const enhancer = gratitudeEnhancers[Math.floor(Math.random() * gratitudeEnhancers.length)];
      return enhancer + response;
    }
    
    if (lowerInput.includes('sad') || lowerInput.includes('depressed') || lowerInput.includes('down')) {
      return "I hear you, and I want you to know that your feelings are completely valid. " + response + " Remember, you're not alone in this journey.";
    }
    
    if (lowerInput.includes('anxious') || lowerInput.includes('worried') || lowerInput.includes('stress')) {
      return "I can sense you're going through a challenging time right now. " + response + " Take a deep breath with me - you've got this.";
    }
    
    // Add encouraging elements for questions
    if (lowerInput.includes('?') || lowerInput.includes('how') || lowerInput.includes('what')) {
      return "That's a really thoughtful question! " + response;
    }
    
    return response;
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      let transcribedText = '';
      let detectedLanguage = currentLanguage;

      if (enableWhisperSTT) {
        // Use Whisper STT via backend
        const formData = new FormData();
        formData.append('audio_file', audioBlob, 'recording.wav');
        formData.append('session_id', 'voice_session');

        const sttResponse = await fetch('/api/stt', {
          method: 'POST',
          body: formData
        });

        if (sttResponse.ok) {
          const sttResult = await sttResponse.json();
          transcribedText = sttResult.text;
          detectedLanguage = sttResult.language;
        } else {
          throw new Error('STT failed');
        }
      } else {
        // Fallback to Web Speech API
        transcribedText = await fallbackSpeechRecognition(audioBlob);
      }

      setTranscript(transcribedText);
      onTranscription?.(transcribedText, detectedLanguage);

      // Process with AI and get response
      await processWithAI(transcribedText, detectedLanguage);

    } catch (error) {
      console.error('Audio processing error:', error);
      setTranscript('Error processing audio');
    } finally {
      setIsProcessing(false);
    }
  };

  const processWithAI = async (text: string, language: string) => {
    try {
      // Translate to English if needed for processing
      let processedText = text;
      if (enableTranslation && language !== 'en') {
        const translateResponse = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text,
            target_language: 'en',
            source_language: language
          })
        });

        if (translateResponse.ok) {
          const translateResult = await translateResponse.json();
          processedText = translateResult.translated_text;
        }
      }

      // Enhanced AI processing with personality and context
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: processedText,
          language: language,
          isVoiceInput: true,
          context: 'voice_assistant',
          conversationHistory: conversationHistory.slice(-3), // Last 3 exchanges for context
          personality: assistantPersonality,
          userName: userName
        })
      });

      if (chatResponse.ok) {
        const chatResult = await chatResponse.json();
        let responseText = chatResult.text || chatResult.reply;
        
        // Add friendly, conversational enhancements
        responseText = enhanceResponsePersonality(responseText, text, language);
        
        // Translate response back to original language if needed
        if (enableTranslation && language !== 'en') {
          const translateBackResponse = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: responseText,
              target_language: language,
              source_language: 'en'
            })
          });

          if (translateBackResponse.ok) {
            const translateBackResult = await translateBackResponse.json();
            responseText = translateBackResult.translated_text;
          }
        }
        
        setResponse(responseText);
        onResponse?.(responseText, language);
        
        // Update conversation history
        setConversationHistory(prev => [...prev, {
          user: text,
          assistant: responseText,
          timestamp: new Date()
        }].slice(-5)); // Keep last 5 exchanges

        // Convert to speech if enabled
        if (enableCoquiTTS) {
          await textToSpeech(responseText, language);
        }
      } else {
        throw new Error('Chat API failed');
      }
    } catch (error) {
      console.error('AI processing error:', error);
      const fallbackResponse = "I'm sorry, I'm having trouble processing your request right now.";
      setResponse(fallbackResponse);
      
      if (enableCoquiTTS) {
        await textToSpeech(fallbackResponse, 'en');
      }
    }
  };

  const textToSpeech = async (text: string, language: string) => {
    try {
      setIsSpeaking(true);

      if (enableCoquiTTS) {
        // Use Coqui TTS via backend
        const ttsResponse = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text,
            language: language,
            session_id: 'voice_session'
          })
        });

        if (ttsResponse.ok) {
          const audioBlob = await ttsResponse.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          
          if (audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.onended = () => setIsSpeaking(false);
            await audioRef.current.play();
          }
        } else {
          throw new Error('TTS failed');
        }
      } else {
        // Fallback to Web Speech API
        await fallbackTextToSpeech(text, language);
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      // Fallback to Web Speech API
      await fallbackTextToSpeech(text, language);
    }
  };

  const fallbackSpeechRecognition = async (audioBlob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = currentLanguage;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event: any) => {
        reject(new Error('Speech recognition failed'));
      };

      recognition.start();
    });
  };

  const fallbackTextToSpeech = async (text: string, language: string) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.onend = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Fallback TTS error:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Enhanced Voice Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Language Selection */}
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          <select 
            value={currentLanguage} 
            onChange={(e) => setCurrentLanguage(e.target.value)}
            className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {supportedLanguages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Personality Selection */}
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          <select 
            value={assistantPersonality} 
            onChange={(e) => setAssistantPersonality(e.target.value)}
            className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="friendly">Friendly & Warm</option>
            <option value="professional">Professional</option>
            <option value="empathetic">Highly Empathetic</option>
            <option value="energetic">Energetic & Upbeat</option>
          </select>
        </div>

        {/* Voice Controls */}
        <div className="flex gap-2 justify-center">
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            size="lg"
            className="flex items-center gap-2"
            disabled={isProcessing || isSpeaking}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </Button>

          <Button
            onClick={stopSpeaking}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
            disabled={!isSpeaking}
          >
            {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            Stop Speaking
          </Button>
        </div>

        {/* Status Indicators */}
        <div className="text-center space-y-2">
          {isListening && (
            <div className="text-blue-600 font-medium animate-pulse">🎤 I'm listening to you...</div>
          )}
          {isProcessing && (
            <div className="text-yellow-600 font-medium animate-pulse">🧠 Thinking about your message...</div>
          )}
          {isSpeaking && (
            <div className="text-green-600 font-medium animate-pulse">🔊 Speaking with care...</div>
          )}
          {!isListening && !isProcessing && !isSpeaking && conversationHistory.length === 0 && (
            <div className="text-gray-500 font-medium">💙 Ready to chat! Press the microphone to start.</div>
          )}
        </div>

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <h3 className="font-semibold text-gray-800 mb-2">💬 Our Conversation:</h3>
            {conversationHistory.slice(-3).map((exchange, index) => (
              <div key={index} className="space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-blue-700 font-medium">You: {exchange.user}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <p className="text-green-700">Assistant: {exchange.assistant}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Current Transcript Display */}
        {transcript && (
          <div className="p-4 bg-blue-50 rounded-lg border">
            <h3 className="font-semibold text-blue-800 mb-2">🎤 You just said:</h3>
            <p className="text-blue-700">{transcript}</p>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="p-4 bg-green-50 rounded-lg border">
            <h3 className="font-semibold text-green-800 mb-2">Assistant:</h3>
            <p className="text-green-700">{response}</p>
          </div>
        )}

        {/* Feature Indicators */}
        <div className="flex justify-center gap-4 text-sm text-gray-600">
          <div className={`flex items-center gap-1 ${enableWhisperSTT ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full ${enableWhisperSTT ? 'bg-green-500' : 'bg-gray-400'}`} />
            Whisper STT
          </div>
          <div className={`flex items-center gap-1 ${enableCoquiTTS ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full ${enableCoquiTTS ? 'bg-green-500' : 'bg-gray-400'}`} />
            Coqui TTS
          </div>
          <div className={`flex items-center gap-1 ${enableTranslation ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full ${enableTranslation ? 'bg-green-500' : 'bg-gray-400'}`} />
            Translation
          </div>
        </div>

        {/* Hidden audio element for TTS */}
        <audio ref={audioRef} style={{ display: 'none' }} />
      </CardContent>
    </Card>
  );
}
