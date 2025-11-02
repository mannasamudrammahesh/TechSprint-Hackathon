"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info, Mic, Sword } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import dynamic from 'next/dynamic';

// Lazy load heavy components - only load when user navigates to this page
const BossBattleGame = dynamic(() => import('@/components/BossBattleGame'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading therapy game...</p>
      </div>
    </div>
  )
});

const VoiceAssistant = dynamic(() => import('@/components/VoiceAssistant'), {
  ssr: false,
  loading: () => null
});

const PerformanceMonitor = dynamic(() => import('@/components/PerformanceMonitor'), {
  ssr: false,
  loading: () => null
});

export default function TherapyPage() {
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);

  const toggleVoiceAssistant = () => {
    setShowVoiceAssistant(!showVoiceAssistant);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#d6e2ea' }}>
      <div className="container mx-auto p-3 md:p-6">
        {/* Enhanced Header Section */}
        <div className="text-center mb-4 sm:mb-6 md:mb-10 mt-3 sm:mt-4 md:mt-8 px-3 sm:px-4">
          <div className="mb-3 sm:mb-4 md:mb-6">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2 md:mb-3 pb-1 sm:pb-2">
              Therapy
            </h1>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-base xs:text-lg sm:text-xl md:text-2xl font-semibold text-gray-700">
              <Sword className="h-4 w-4 xs:h-5 xs:w-5 md:h-6 md:w-6 text-purple-600" />
              <span>Interactive Therapy</span>
            </div>
          </div>
          <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
            Experience cutting-edge AI-powered mental health support with real-time exercise detection
            and personalized therapeutic activities designed for your wellbeing.
          </p>
        </div>



        {/* Mind Quest Game */}
        <div className="max-w-6xl mx-auto">
          <BossBattleGame />
        </div>

        {/* Voice Assistant */}
        {showVoiceAssistant && <VoiceAssistant />}

        {/* Performance Monitor for debugging */}
        {process.env.NODE_ENV === "development" && <PerformanceMonitor />}
      </div>
    </div>
  );
}
