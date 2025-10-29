"use client";

import { useCallback, useRef, useState } from 'react';
import { generateMentalHealthResponse } from '@/lib/dialogpt';

export interface DialogptReply {
  reply: string;
}

export const useDialogpt = () => {
  const [sessionId] = useState(() => {
    const existing = typeof window !== 'undefined' ? sessionStorage.getItem('dialogpt-session') : null;
    if (existing) return existing;
    const id = crypto.randomUUID();
    if (typeof window !== 'undefined') sessionStorage.setItem('dialogpt-session', id);
    return id;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (text: string, language: string = 'en'): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      // Use local DialogGPT model instead of API
      const response = await generateMentalHealthResponse(text, language, 'general');
      return response;
    } catch (e: any) {
      setError(e?.message || 'Request failed');
      return 'I apologize, but I\'m having trouble processing your request right now. Please try again or reach out to a mental health professional if you need immediate support.';
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { send, isLoading, error };
};


