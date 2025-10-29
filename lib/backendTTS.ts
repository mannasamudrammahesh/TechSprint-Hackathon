/**
 * Backend TTS Integration for Indian Languages
 * Uses Google TTS and Edge TTS from backend for better quality
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:3003';

export interface TTSOptions {
  text: string;
  language?: string;
  voice?: string;
}

export class BackendTTS {
  private static instance: BackendTTS;
  private audioQueue: HTMLAudioElement[] = [];
  private isPlaying: boolean = false;

  private constructor() {}

  static getInstance(): BackendTTS {
    if (!BackendTTS.instance) {
      BackendTTS.instance = new BackendTTS();
    }
    return BackendTTS.instance;
  }

  /**
   * Speak text using backend TTS (supports all Indian languages)
   */
  async speak(options: TTSOptions): Promise<void> {
    const { text, language = 'en', voice } = options;

    try {
      // Call backend TTS endpoint
      const response = await fetch(`${BACKEND_URL}/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language,
          voice,
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          this.isPlaying = false;
          resolve();
        };

        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          this.isPlaying = false;
          reject(error);
        };

        this.isPlaying = true;
        audio.play().catch(reject);
      });
    } catch (error) {
      console.error('Backend TTS error:', error);
      // Fallback to browser TTS
      return this.fallbackToBrowserTTS(text, language);
    }
  }

  /**
   * Fallback to browser TTS if backend fails
   */
  private fallbackToBrowserTTS(text: string, language: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        this.isPlaying = false;
        resolve();
      };

      utterance.onerror = (error) => {
        this.isPlaying = false;
        reject(error);
      };

      this.isPlaying = true;
      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Stop current speech
   */
  stop(): void {
    // Stop browser TTS
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Stop audio elements
    this.audioQueue.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.audioQueue = [];
    this.isPlaying = false;
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.isPlaying;
  }
}

// Export singleton instance
export const backendTTS = BackendTTS.getInstance();

// Language codes for Indian languages
export const INDIAN_LANGUAGES = {
  'hi': 'hi-IN', // Hindi
  'te': 'te-IN', // Telugu
  'ta': 'ta-IN', // Tamil
  'kn': 'kn-IN', // Kannada
  'gu': 'gu-IN', // Gujarati
  'en': 'en-US', // English
};

/**
 * Helper function to speak text with automatic language detection
 */
export async function speakText(text: string, language: string = 'en'): Promise<void> {
  const tts = BackendTTS.getInstance();
  
  // Map language code
  const langCode = INDIAN_LANGUAGES[language as keyof typeof INDIAN_LANGUAGES] || language;
  
  return tts.speak({
    text,
    language: langCode,
  });
}
