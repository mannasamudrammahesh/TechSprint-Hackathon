"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import VoiceAssistant from '@/components/VoiceAssistant';

export default function VoiceAssistantLauncher() {
  const [showAssistant, setShowAssistant] = useState(false);

  return (
    <>
      {/* Launcher button, preserves layout; assistant is opt-in */}
      <div className="fixed bottom-4 right-4 z-40">
        <Button onClick={() => setShowAssistant(true)} size="lg">
          Open Assistant
        </Button>
      </div>
      {showAssistant && (
        <VoiceAssistant onClose={() => setShowAssistant(false)} />
      )}
    </>
  );
}
