'use client';

import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import VoiceAssistantWidget from './VoiceAssistantWidget';

interface VoiceAssistantProps {
  onClose?: () => void;
}

export default function VoiceAssistant({ onClose }: VoiceAssistantProps) {
  return (
    <VoiceAssistantWidget 
      onClose={onClose}
      position="bottom-right"
      compact={false}
    />
  );
}