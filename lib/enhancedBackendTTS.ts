/**
 * Enhanced Backend TTS with Multilingual Support
 * Uses backend gTTS for perfect pronunciation in all languages
 * Falls back to browser TTS if backend is unavailable
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3003';

export interface TTSOptions {
  language?: string;
  slow?: boolean;
  fallbackToBrowser?: boolean;
}

class EnhancedTTSService {
  private audioQueue: HTMLAudioElement[] = [];
  private isPlaying = false;

  /**
   * Speak text using backend TTS with fallback to browser TTS
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    const {
      language = 'en-US',
      slow = false,
      fallbackToBrowser = true,
    } = options;

    try {
      // Try backend TTS first
      await this.speakWithBackend(text, language, slow);
    } catch (error) {
      console.warn('Backend TTS failed, falling back to browser TTS:', error);
      
      if (fallbackToBrowser) {
        this.speakWithBrowser(text, language, slow);
      } else {
        throw error;
      }
    }
  }

  /**
   * Speak using backend gTTS
   */
  private async speakWithBackend(
    text: string,
    language: string,
    slow: boolean
  ): Promise<void> {
    const response = await fetch(`${BACKEND_URL}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language, slow }),
    });

    if (!response.ok) {
      throw new Error(`Backend TTS failed: ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };
      audio.play().catch(reject);
    });
  }

  /**
   * Speak using browser TTS (fallback)
   */
  private speakWithBrowser(
    text: string,
    language: string,
    slow: boolean
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Browser TTS not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = slow ? 0.7 : 0.9;

      // Try to select a good voice for the language
      const voices = speechSynthesis.getVoices();
      const matchingVoice = voices.find(
        (voice) =>
          voice.lang.startsWith(language.split('-')[0]) ||
          voice.lang === language
      );

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      speechSynthesis.speak(utterance);
    });
  }

  /**
   * Stop all speech
   */
  stop(): void {
    // Stop browser TTS
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }

    // Stop audio queue
    this.audioQueue.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.audioQueue = [];
    this.isPlaying = false;
  }

  /**
   * Check if backend TTS is available
   */
  async isBackendAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const enhancedTTS = new EnhancedTTSService();

// Convenience function
export async function speakText(
  text: string,
  language: string = 'en-US'
): Promise<void> {
  return enhancedTTS.speak(text, { language });
}
