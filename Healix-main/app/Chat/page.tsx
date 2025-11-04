"use client";
import { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { Mic, Volume2, User, Plus, History, Menu, X, ArrowLeft, MessageCircleCode } from "lucide-react";
import { Send, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import toast, { Toaster } from "react-hot-toast";
import { TypingIndicator, HealixThinking } from "@/components/LoadingSpinner";
import { useSpeechSynthesis } from "react-speech-kit";
import { chatStorage } from "@/lib/chatStorage";
import { useAuth } from "@/contexts/AuthContext";
import RiveBear from "@/components/RiveBear";
import HealixLogo from "@/components/HealixLogo";
import { useRouter } from "next/navigation";
import { BeatLoader } from "react-spinners";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const submissionTimeout = useRef<NodeJS.Timeout | null>(null);
  const { speak, speaking, cancel, voices } = useSpeechSynthesis();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const getBestVoice = () => {
    const preferredVoiceNames = [
      "Google UK English Female",
      "Google US English Female",
      "Microsoft Zira Desktop - English (United States)",
      "Samantha",
      "Victoria",
      "Alex",
      "Karen",
    ];
    for (const name of preferredVoiceNames) {
      const exactMatch = voices.find((voice: SpeechSynthesisVoice) => voice.name === name);
      if (exactMatch) return exactMatch;
    }
    const keywordMatch = voices.find(
      (voice: SpeechSynthesisVoice) =>
        (voice.name.toLowerCase().includes("female") ||
          voice.name.toLowerCase().includes("girl") ||
          voice.name.toLowerCase().includes("woman")) &&
        voice.lang.startsWith("en"),
    );
    if (keywordMatch) return keywordMatch;
    const providerMatch = voices.find(
      (voice: SpeechSynthesisVoice) =>
        (voice.name.includes("Google") || voice.name.includes("Microsoft")) &&
        voice.lang.startsWith("en"),
    );
    if (providerMatch) return providerMatch;
    const englishVoice = voices.find((voice: SpeechSynthesisVoice) => voice.lang.startsWith("en"));
    return englishVoice || voices[0];
  };

  const speechOptions = {
    voice: getBestVoice(),
    rate: 0.95,
    pitch: 1.1,
    volume: 1.0,
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  // Load chat history from Supabase/LocalStorage on mount - optimized
  useEffect(() => {
    if (!user?.id) return;
    const loadChatHistory = async () => {
      try {
        const loadedMessages = await chatStorage.getMessages(user.id);
        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };
    // Use setTimeout to defer loading and improve initial render
    const timeoutId = setTimeout(loadChatHistory, 100);
    return () => clearTimeout(timeoutId);
  }, [user?.id]);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in this browser!");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      setIsListening(true);
      toast.success("Listening...");
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(transcript);
      toast.success("Voice captured!");
      submissionTimeout.current = setTimeout(() => onSubmit(), 1500);
    };
    recognition.onerror = (event) => {
      toast.error(`Voice input error: ${event.error}`);
      setIsListening(false);
      if (submissionTimeout.current) clearTimeout(submissionTimeout.current);
    };
    recognition.onend = () => setIsListening(false);
    try {
      recognition.start();
    } catch (error) {
      toast.error("Failed to start voice input.");
      setIsListening(false);
    }
  };

  const processTextForSpeech = (text: string): string => {
    if (!text) return "";
    let cleanedText = text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/_(.*?)_/g, "$1")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
      .replace(/#{1,6}\s+(.*?)(?:\n|$)/g, "$1. ")
      .replace(/^\s*[-*+]\s+(.*?)(?:\n|$)/gm, "$1. ")
      .replace(/^\s*\d+\.\s+(.*?)(?:\n|$)/gm, "$1. ")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, ". ")
      .replace(/\.\s*\./g, ".")
      .replace(/\s{2,}/g, " ")
      .replace(/[\s\.]+([\.,;:])/g, "$1")
      .trim();
    if (cleanedText && !".?!".includes(cleanedText[cleanedText.length - 1])) {
      cleanedText += ".";
    }
    return cleanedText;
  };

  const speakMessage = (text: string) => {
    if (speaking) {
      cancel();
      return;
    }
    const processedText = processTextForSpeech(text);
    if (!processedText) {
      toast.error("No valid content to speak");
      return;
    }
    toast.success("Starting speech...");
    speak({
      ...speechOptions,
      text: processedText,
      onEnd: () => toast.success("Speech completed"),
      onError: (err: Error) => {
        console.error("Speech error:", err);
        toast.error("Speech playback failed");
      },
    });
  };

  const onKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  const copyMessage = (text: string) => {
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/_(.*?)_/g, "$1");
    navigator.clipboard
      .writeText(cleanText)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Failed to copy text."));
  };

  // Load chat history on mount and migrate old chat if exists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load existing history
      const savedHistory = localStorage.getItem('healix_chat_history_list');
      let historyList: ChatHistory[] = [];
      if (savedHistory) {
        try {
          historyList = JSON.parse(savedHistory);
        } catch (error) {
          console.error('Failed to load chat history:', error);
        }
      }
      // Check for old chat format and migrate it
      const oldChatData = localStorage.getItem('healix_chat_history');
      if (oldChatData && historyList.length === 0) {
        try {
          const oldMessages: Message[] = JSON.parse(oldChatData);
          if (oldMessages.length > 0) {
            // Create a history item from the old chat
            const firstUserMessage = oldMessages.find(m => m.role === 'user');
            const title = firstUserMessage
              ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
              : 'Previous Conversation';
            const migratedChat: ChatHistory = {
              id: `chat_migrated_${Date.now()}`,
              title: `${title} (${oldMessages.length} messages)`,
              messages: oldMessages,
              timestamp: oldMessages[0]?.timestamp || Date.now(),
            };
            historyList = [migratedChat];
            localStorage.setItem('healix_chat_history_list', JSON.stringify(historyList));
            console.log(`✅ Migrated old chat with ${oldMessages.length} messages to history`);
            toast.success(`Recovered previous chat with ${oldMessages.length} messages!`);
          }
        } catch (error) {
          console.error('Failed to migrate old chat:', error);
        }
      }
      setChatHistory(historyList);
    }
  }, []);

  const startNewChat = async () => {
    // Save current chat to history if it has messages AND it's not already from history
    if (messages.length > 0 && !currentChatId) {
      const firstUserMessage = messages.find(m => m.role === 'user');
      const title = firstUserMessage
        ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
        : 'Untitled Chat';
      const newHistoryItem: ChatHistory = {
        id: `chat_${Date.now()}`,
        title,
        messages: [...messages],
        timestamp: Date.now(),
      };
      const updatedHistory = [newHistoryItem, ...chatHistory];
      setChatHistory(updatedHistory);
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('healix_chat_history_list', JSON.stringify(updatedHistory));
      }
    }
    // Clear current chat
    await chatStorage.clearMessages(user?.id);
    setMessages([]);
    setStreamingMessage("");
    setCurrentChatId(null);
    toast.success("New chat started");
  };

  const loadChatFromHistory = (historyItem: ChatHistory) => {
    // Set the current chat ID to track that this is from history
    setCurrentChatId(historyItem.id);
    setMessages(historyItem.messages);
    setShowSidebar(false);
    toast.success("Chat loaded");
  };

  const deleteChatFromHistory = (chatId: string) => {
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
    setChatHistory(updatedHistory);
    if (typeof window !== 'undefined') {
      localStorage.setItem('healix_chat_history_list', JSON.stringify(updatedHistory));
    }
    toast.success("Chat deleted");
  };

  const onSubmit = async () => {
    if (submissionTimeout.current) clearTimeout(submissionTimeout.current);
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return toast.error("Please enter a message!");
    // Add user message immediately
    const userMessage: Message = {
      role: 'user',
      content: trimmedPrompt,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);
    setStreamingMessage("");
    try {
      // Save user message
      await chatStorage.saveMessage({
        ...userMessage,
        userId: user?.id,
      });
      // Prepare conversation history for context (last 10 messages)
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userPrompt: trimmedPrompt,
          language: "en",
          conversationHistory: conversationHistory, // Send conversation context
        }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
        setLoading(false);
        return;
      }
      if (!data.text) {
        toast.error("No response from server!");
        setLoading(false);
        return;
      }
      const fullResponse = data.text;
      // Animate the response
      const charsPerBatch = 5;
      const batchDelay = 12;
      let currentText = "";
      for (let i = 0; i < fullResponse.length; i += charsPerBatch) {
        await new Promise(resolve => setTimeout(resolve, batchDelay));
        currentText += fullResponse.slice(i, Math.min(i + charsPerBatch, fullResponse.length));
        setStreamingMessage(currentText);
      }
      // Add assistant message to messages
      const assistantMessage: Message = {
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setStreamingMessage("");
      setLoading(false);
      // Save assistant message
      await chatStorage.saveMessage({
        ...assistantMessage,
        userId: user?.id,
      });
      console.log('✅ Messages saved to storage');
    } catch (error) {
      toast.error(
        `Failed to get response: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setLoading(false);
      setStreamingMessage("");
    }
  };

  return (
    <div className="flex h-screen bg-[#d6e2ea]">
      <Toaster position="top-center" />
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 sm:w-80 md:w-72 bg-[#d6e2ea] border-r border-gray-300 transform transition-transform duration-300 ease-in-out flex flex-col shadow-lg",
        showSidebar ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header with Logo and Close Button */}
        <div className="p-4 border-b border-gray-300 flex items-center justify-between">
          <HealixLogo width={30} height={30} textSize="text-xl" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(false)}
            className="h-8 w-8 p-0 hover:bg-gray-200"
          >
            <X size={20} />
          </Button>
        </div>
        {/* New Chat Button */}
        <div className="p-4">
          <Button
            onClick={startNewChat}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 h-11 rounded-lg shadow-sm"
          >
            <Plus size={20} />
            New Chat
          </Button>
        </div>
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-800">
            <History size={18} />
            <span>History</span>
          </div>
          {/* Current Chat */}
          {messages.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2 px-1">Current Chat</p>
              <div className="p-3 rounded-lg bg-blue-50 border-2 border-blue-300 shadow-sm">
                <p className="text-sm font-medium text-gray-800 truncate">
                  Active Conversation
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {messages.length} messages
                </p>
              </div>
            </div>
          )}
          {/* Previous Chats */}
          {chatHistory.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-600 mb-2 px-1">Previous Chats</p>
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="group relative p-3 rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-colors border border-gray-300 shadow-sm"
                  onClick={() => loadChatFromHistory(chat)}
                >
                  <p className="text-sm font-medium text-gray-800 truncate pr-6">
                    {chat.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {chat.messages.length} messages • {new Date(chat.timestamp).toLocaleDateString()}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChatFromHistory(chat.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                    title="Delete chat"
                  >
                    <X size={14} className="text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            !messages.length && (
              <div className="text-center py-8">
                <History size={40} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">No chat history yet</p>
                <p className="text-xs text-gray-500 mt-1">Start a conversation to see it here</p>
              </div>
            )
          )}
        </div>
      </div>
      {/* Overlay for mobile/desktop */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with Counselling Image and Back Button */}
        <div className="sticky top-0 z-30 bg-[#d6e2ea] border-b border-gray-300 p-3 md:p-4 shadow-sm">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Left: Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="h-9 w-9 md:h-10 md:w-10 p-0 hover:bg-gray-100 flex-shrink-0"
            >
              <Menu size={20} className="md:w-[22px] md:h-[22px]" />
            </Button>
            {/* Center: Counselling Icon and Text */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 md:gap-3">
              <MessageCircleCode size={36} className="text-gray-800 md:w-12 md:h-12" />
              <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 hidden sm:inline">Counselling</span>
            </div>
            {/* Right: Back Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/Home')}
              className="flex items-center gap-1 md:gap-2 h-9 md:h-10 px-2 md:px-4 hover:bg-gray-100 flex-shrink-0 text-xs md:text-sm"
            >
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
        </div>
        {/* Messages Container */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6"
        >
          {messages.length === 0 && !streamingMessage && (
            <div className="flex flex-col items-center justify-center min-h-full text-center p-4 sm:p-6 md:p-8">
              <div className="mb-6 md:mb-8">
                <RiveBear size={80} />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-3">
                Welcome to Counselling
              </h2>
              <p className="text-gray-600 max-w-lg text-base sm:text-lg leading-relaxed px-4">
                I'm here to listen and support you. Share what's on your mind, and we'll work through it together.
              </p>
              <div className="mt-6 md:mt-8 flex flex-wrap gap-2 md:gap-3 justify-center px-4">
                <div className="px-3 md:px-4 py-1.5 md:py-2 bg-white rounded-full shadow-sm text-xs md:text-sm text-gray-600 border border-gray-200">
                  💬 Safe Space
                </div>
                <div className="px-3 md:px-4 py-1.5 md:py-2 bg-white rounded-full shadow-sm text-xs md:text-sm text-gray-600 border border-gray-200">
                  🤝 Supportive
                </div>
                <div className="px-3 md:px-4 py-1.5 md:py-2 bg-white rounded-full shadow-sm text-xs md:text-sm text-gray-600 border border-gray-200">
                  🔒 Confidential
                </div>
              </div>
            </div>
          )}
          <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-2 sm:gap-3 items-start",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {/* Assistant Avatar - Left Side */}
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 mt-1 sticky top-20">
                    <div className="w-9 h-9 sm:w-11 sm:h-11">
                      <RiveBear size={36} />
                    </div>
                  </div>
                )}
                {/* Message Content */}
                <div className={cn(
                  "max-w-[80%] sm:max-w-[75%] md:max-w-[70%]",
                  message.role === 'user' ? "flex flex-col items-end" : "flex flex-col items-start"
                )}>
                  <div className={cn(
                    "rounded-2xl p-3.5 sm:p-4 md:p-5 shadow-md",
                    message.role === 'user'
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                      : "bg-white text-gray-800 border border-gray-100"
                  )}>
                    <div className="prose prose-sm sm:prose-base max-w-none" style={{ color: message.role === 'user' ? 'white' : 'inherit' }}>
                      <Markdown
                        components={{
                          p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed text-[15px] sm:text-base" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1.5 text-[15px] sm:text-base" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1.5 text-[15px] sm:text-base" {...props} />,
                          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                          code: ({ node, ...props }) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm" {...props} />,
                        }}
                      >
                        {message.content}
                      </Markdown>
                    </div>
                  </div>
                  {/* Action Buttons for Assistant Messages */}
                  {message.role === 'assistant' && (
                    <div className="flex gap-1 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyMessage(message.content)}
                        title="Copy message"
                        className="h-8 px-2 text-xs hover:bg-gray-100 rounded-lg"
                      >
                        <Copy size={14} className="text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => speakMessage(message.content)}
                        title="Read aloud"
                        className="h-8 px-2 text-xs hover:bg-gray-100 rounded-lg"
                      >
                        <Volume2 size={14} className="text-gray-500" />
                      </Button>
                    </div>
                  )}
                </div>
                {/* User Avatar - Right Side */}
                {message.role === 'user' && (
                  <div className="flex-shrink-0 mt-1 sticky top-20">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-base sm:text-lg">
                        {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Streaming Message */}
            {streamingMessage && (
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 mt-1 sticky top-20">
                  <RiveBear size={44} isTyping={true} />
                </div>
                <div className="max-w-[75%] md:max-w-[70%]">
                  <div className="rounded-2xl p-4 bg-white text-gray-800 shadow-md border border-gray-100">
                    <div className="prose prose-sm max-w-none">
                      <Markdown
                        components={{
                          p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                        }}
                      >
                        {streamingMessage}
                      </Markdown>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Loading Indicator */}
            {loading && !streamingMessage && (
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 mt-1 sticky top-20">
                  <RiveBear size={44} isTyping={true} />
                </div>
                <div className="max-w-[75%] md:max-w-[70%]">
                  <div className="rounded-2xl p-4 bg-white text-gray-800 shadow-md border border-gray-100">
                    <BeatLoader color="#3b82f6" size={8} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
        {/* Input Area - Sticky at bottom */}
        <div className="sticky bottom-4 sm:bottom-0 bg-gradient-to-t from-[#d6e2ea] to-transparent border-t border-gray-200 p-2 sm:p-3 md:p-4 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex gap-2 items-center bg-white rounded-2xl shadow-xl border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <Input
                type="text"
                placeholder="Message Healix..."
                value={prompt}
                className="flex-1 h-12 sm:h-14 md:h-16 pl-4 pr-24 sm:pr-28 md:pl-6 text-sm sm:text-base border-0 rounded-2xl focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={loading}
              />
              <div className="absolute right-2 sm:right-3 flex gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startListening}
                  disabled={isListening || loading}
                  className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 p-0 rounded-full hover:bg-gray-100 transition-all"
                  title="Voice input"
                >
                  <Mic size={18} className={cn("sm:w-5 sm:h-5", isListening ? "animate-pulse text-red-500" : "text-gray-600")} />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={onSubmit}
                  disabled={loading || !prompt.trim()}
                  className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 p-0 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md disabled:opacity-50 transition-all"
                  title="Send message"
                >
                  <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
                </Button>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-1 sm:mt-2 hidden sm:block">
              Press Enter to send • Click mic for voice input
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
