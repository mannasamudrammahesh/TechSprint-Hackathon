"use client";

import { useVoiceNavigation } from "@/hooks/useVoiceNavigation";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export const VoiceNavigationButton = () => {
  const { isListening, transcript, toggleListening, isProcessing } = useVoiceNavigation();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Transcript display */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2 max-w-xs"
          >
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {isProcessing ? "Processing..." : transcript}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice navigation button */}
      <Button
        onClick={toggleListening}
        size="lg"
        className={cn(
          "rounded-full w-16 h-16 shadow-lg transition-all duration-300",
          isListening
            ? "bg-red-500 hover:bg-red-600 animate-pulse"
            : "bg-blue-500 hover:bg-blue-600"
        )}
        title={isListening ? "Stop voice navigation" : "Start voice navigation"}
      >
        {isListening ? (
          <MicOff className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <Mic className="w-6 h-6 text-white" />
            <Navigation className="w-3 h-3 text-white absolute -bottom-1 -right-1" />
          </div>
        )}
      </Button>

      {/* Listening indicator */}
      {isListening && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow"
        >
          🎤 Listening for navigation...
        </motion.div>
      )}
    </div>
  );
};
