"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Upload, Music, Volume2, VolumeX } from "lucide-react";
import StressReliefPlayer from "./StressReliefPlayer";

interface Message {
  role: "user" | "assistant";
  text: string;
  timestamp?: Date;
  isVoice?: boolean;
}

export default function ChatDialo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize speech recognition
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setText(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }

      // Initialize speech synthesis
      if ("speechSynthesis" in window) {
        synthesisRef.current = window.speechSynthesis;
      }
    }
  }, []);

  // Check for stress-related keywords and trigger music player
  const checkForStressKeywords = (message: string) => {
    const stressKeywords = [
      "stressed",
      "anxiety",
      "anxious",
      "worried",
      "panic",
      "overwhelmed",
      "sad",
      "depressed",
      "tired",
      "exhausted",
    ];
    const musicKeywords = ["music", "song", "relax", "calm", "play"];

    const hasStressKeyword = stressKeywords.some((keyword) =>
      message.toLowerCase().includes(keyword),
    );
    const hasMusicKeyword = musicKeywords.some((keyword) =>
      message.toLowerCase().includes(keyword),
    );

    if (hasStressKeyword && hasMusicKeyword) {
      setShowMusicPlayer(true);
      // Trigger music player with custom event
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("play-stress-relief-music", {
            detail: { command: message, language: "en" },
          }),
        );
      }, 1000);
    } else if (hasStressKeyword) {
      // Show music player option for stressed users
      setShowMusicPlayer(true);
    }
  };

  const speak = (text: string) => {
    if (!voiceEnabled || !synthesisRef.current) return;

    // Clean text for speech
    let cleanText = text.replace(/\*\*(.*?)\*\*/g, "$1"); // Remove markdown bold
    cleanText = cleanText.replace(/\*(.*?)\*/g, "$1"); // Remove markdown italic
    cleanText = cleanText.replace(/#{1,6}\s/g, ""); // Remove markdown headers
    cleanText = cleanText.replace(/\n+/g, ". "); // Replace newlines with periods
    cleanText = cleanText.replace(/•/g, ""); // Remove bullet points
    cleanText = cleanText.substring(0, 500); // Limit length for speech

    synthesisRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesisRef.current.speak(utterance);
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking && synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Handle different file types
    if (file.type.startsWith("audio/")) {
      // Handle audio file upload for voice processing
      const formData = new FormData();
      formData.append("audio", file);

      setIsLoading(true);
      try {
        // This would integrate with your existing voice processing backend
        const response = await fetch("/api/process-audio", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setText(data.transcript || "Audio processed successfully");
        }
      } catch (error) {
        console.error("Audio processing error:", error);
      } finally {
        setIsLoading(false);
      }
    } else if (file.type.startsWith("text/")) {
      // Handle text file upload
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(content.substring(0, 500)); // Limit text length
      };
      reader.readAsText(file);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSend = async () => {
    const t = text.trim();
    if (!t) return;

    const userMessage: Message = {
      role: "user",
      text: t,
      timestamp: new Date(),
      isVoice: isListening,
    };

    setMessages((prev) => [...prev, userMessage]);
    setText("");
    setIsLoading(true);

    // Check for stress keywords
    checkForStressKeywords(t);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt: t,
          language: "en",
          isVoiceInput: isListening,
          context: "council_chat",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const reply =
        data.text ||
        "I'm here to help. Could you tell me more about what you're experiencing?";

      const assistantMessage: Message = {
        role: "assistant",
        text: reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Auto-speak response if voice is enabled
      if (voiceEnabled && !isSpeaking) {
        setTimeout(() => speak(reply), 500);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage =
        "I apologize, but I'm having trouble connecting right now. Please try again, or if you're in crisis, please contact emergency services or a crisis hotline.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: errorMessage, timestamp: new Date() },
      ]);

      if (voiceEnabled) {
        speak(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Healix Counseling - Mental Health Support</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMusicPlayer(!showMusicPlayer)}
                className="flex items-center gap-1"
              >
                <Music className="h-4 w-4" />
                Serenity
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSpeech}
                className={voiceEnabled ? "bg-green-50" : "bg-gray-50"}
              >
                {voiceEnabled && !isSpeaking ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto space-y-3 mb-4 p-4 border rounded-lg bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-lg font-semibold mb-2">
                  Welcome to Healix Council
                </div>
                <p>
                  I'm here to provide mental health support and guidance. Feel
                  free to share what's on your mind.
                </p>
                <p className="text-sm mt-2">
                  You can type, speak, or upload files to communicate with me.
                </p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-lg ${
                      m.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white border shadow-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>
                    {m.timestamp && (
                      <div
                        className={`text-xs mt-1 flex items-center gap-1 ${
                          m.role === "user" ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {m.isVoice && <Mic className="h-3 w-3" />}
                        {formatTime(m.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border shadow-sm px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-gray-600">Healix is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Controls */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey ? onSend() : null
                }
                placeholder="Share your thoughts, feelings, or ask for guidance..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={toggleVoiceInput}
                variant="outline"
                disabled={isLoading}
                className={isListening ? "bg-red-50 border-red-300" : ""}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                disabled={isLoading}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                onClick={onSend}
                disabled={isLoading || !text.trim()}
                className="px-6"
              >
                {isLoading ? "Sending..." : "Send"}
              </Button>
            </div>

            {isListening && (
              <div className="text-center text-sm text-red-600 animate-pulse">
                🎤 Listening... Speak now
              </div>
            )}

            {isSpeaking && (
              <div className="text-center text-sm text-green-600 animate-pulse">
                🔊 Speaking... Click volume button to stop
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,text/*,.txt,.md"
            onChange={handleFileUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Stress Relief Music Player */}
      <StressReliefPlayer
        isVisible={showMusicPlayer}
        onClose={() => setShowMusicPlayer(false)}
        position="bottom-right"
      />
    </div>
  );
}
