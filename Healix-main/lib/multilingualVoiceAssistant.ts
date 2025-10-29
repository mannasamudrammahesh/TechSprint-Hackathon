"use client";

/**
 * Enhanced Multilingual Voice Assistant for Healix
 * Supports: English, Hindi, Telugu, Tamil, Kannada, Gujarati
 * Features: Wake word detection, Speech recognition, TTS in multiple languages
 */

export interface MultilingualConfig {
  language: string;
  wakeWords: string[];
  speechRecognitionLang: string;
  ttsLang: string;
  greetings: string[];
}

export const LANGUAGE_CONFIGS: Record<string, MultilingualConfig> = {
  'en': {
    language: 'en',
    wakeWords: [
      'hey healix', 'hi healix', 'hello healix', 'healix',
      'wake up healix', 'start healix', 'activate healix'
    ],
    speechRecognitionLang: 'en-US',
    ttsLang: 'en-US',
    greetings: [
      'Hello! How can I help you today?',
      'Hi there! I\'m here to support you.',
      'Hello! What would you like to talk about?'
    ]
  },
  'hi': {
    language: 'hi',
    wakeWords: [
      'हे हीलिक्स', 'हैलो हीलिक्स', 'नमस्ते हीलिक्स', 'हीलिक्स',
      'hey healix', 'hi healix', 'hello healix', 'healix',
      'हीलिक्स शुरू करो', 'हीलिक्स जागो'
    ],
    speechRecognitionLang: 'hi-IN',
    ttsLang: 'hi-IN',
    greetings: [
      'नमस्ते! मैं आपकी कैसे मदद कर सकता हूं?',
      'नमस्कार! मैं आपके लिए यहां हूं।',
      'हैलो! आप किस बारे में बात करना चाहेंगे?'
    ]
  },
  'te': {
    language: 'te',
    wakeWords: [
      'హే హీలిక్స్', 'హలో హీలిక్స్', 'నమస్కారం హీలిక్స్', 'హీలిక్స్',
      'hey healix', 'hi healix', 'hello healix', 'healix',
      'హీలిక్స్ ప్రారంభించు', 'హీలిక్స్ మేల్కొను'
    ],
    speechRecognitionLang: 'te-IN',
    ttsLang: 'te-IN',
    greetings: [
      'నమస్కారం! నేను మీకు ఎలా సహాయం చేయగలను?',
      'హలో! నేను మీ కోసం ఇక్కడ ఉన్నాను.',
      'నమస్తే! మీరు దేని గురించి మాట్లాడాలనుకుంటున్నారు?'
    ]
  },
  'ta': {
    language: 'ta',
    wakeWords: [
      'ஹே ஹீலிக்ஸ்', 'ஹலோ ஹீலிக்ஸ்', 'வணக்கம் ஹீலிக்ஸ்', 'ஹீலிக்ஸ்',
      'hey healix', 'hi healix', 'hello healix', 'healix',
      'ஹீலிக்ஸ் தொடங்கு', 'ஹீலிக்ஸ் எழுந்திரு'
    ],
    speechRecognitionLang: 'ta-IN',
    ttsLang: 'ta-IN',
    greetings: [
      'வணக்கம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?',
      'ஹலோ! நான் உங்களுக்காக இங்கே இருக்கிறேன்.',
      'வணக்கம்! நீங்கள் எதைப் பற்றி பேச விரும்புகிறீர்கள்?'
    ]
  },
  'kn': {
    language: 'kn',
    wakeWords: [
      'ಹೇ ಹೀಲಿಕ್ಸ್', 'ಹಲೋ ಹೀಲಿಕ್ಸ್', 'ನಮಸ್ಕಾರ ಹೀಲಿಕ್ಸ್', 'ಹೀಲಿಕ್ಸ್',
      'hey healix', 'hi healix', 'hello healix', 'healix',
      'ಹೀಲಿಕ್ಸ್ ಪ್ರಾರಂಭಿಸು', 'ಹೀಲಿಕ್ಸ್ ಎಚ್ಚರಗೊಳ್ಳು'
    ],
    speechRecognitionLang: 'kn-IN',
    ttsLang: 'kn-IN',
    greetings: [
      'ನಮಸ್ಕಾರ! ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
      'ಹಲೋ! ನಾನು ನಿಮಗಾಗಿ ಇಲ್ಲಿದ್ದೇನೆ.',
      'ನಮಸ್ತೆ! ನೀವು ಯಾವುದರ ಬಗ್ಗೆ ಮಾತನಾಡಲು ಬಯಸುತ್ತೀರಿ?'
    ]
  },
  'gu': {
    language: 'gu',
    wakeWords: [
      'હે હીલિક્સ', 'હેલો હીલિક્સ', 'નમસ્તે હીલિક્સ', 'હીલિક્સ',
      'hey healix', 'hi healix', 'hello healix', 'healix',
      'હીલિક્સ શરૂ કરો', 'હીલિક્સ જાગો'
    ],
    speechRecognitionLang: 'gu-IN',
    ttsLang: 'gu-IN',
    greetings: [
      'નમસ્તે! હું તમને કેવી રીતે મદદ કરી શકું?',
      'હેલો! હું તમારા માટે અહીં છું.',
      'નમસ્કાર! તમે શું વિશે વાત કરવા માંગો છો?'
    ]
  }
};

export class MultilingualVoiceDetector {
  private currentLanguage: string = 'en';
  
  constructor(language: string = 'en') {
    this.currentLanguage = language;
  }

  setLanguage(language: string): void {
    this.currentLanguage = language;
  }

  detectWakeWord(transcript: string): boolean {
    const config = LANGUAGE_CONFIGS[this.currentLanguage] || LANGUAGE_CONFIGS['en'];
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    // Check all wake words for current language
    return config.wakeWords.some(wakeWord => {
      const normalizedWakeWord = wakeWord.toLowerCase();
      return normalizedTranscript.includes(normalizedWakeWord) ||
             this.fuzzyMatch(normalizedTranscript, normalizedWakeWord);
    });
  }

  private fuzzyMatch(text: string, pattern: string, threshold: number = 0.8): boolean {
    // Simple fuzzy matching for wake word detection
    const words = text.split(/\s+/);
    const patternWords = pattern.split(/\s+/);
    
    for (let i = 0; i <= words.length - patternWords.length; i++) {
      const segment = words.slice(i, i + patternWords.length).join(' ');
      const similarity = this.calculateSimilarity(segment, pattern);
      if (similarity >= threshold) {
        return true;
      }
    }
    
    return false;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  getGreeting(): string {
    const config = LANGUAGE_CONFIGS[this.currentLanguage] || LANGUAGE_CONFIGS['en'];
    return config.greetings[Math.floor(Math.random() * config.greetings.length)];
  }

  getSpeechRecognitionLanguage(): string {
    const config = LANGUAGE_CONFIGS[this.currentLanguage] || LANGUAGE_CONFIGS['en'];
    return config.speechRecognitionLang;
  }

  getTTSLanguage(): string {
    const config = LANGUAGE_CONFIGS[this.currentLanguage] || LANGUAGE_CONFIGS['en'];
    return config.ttsLang;
  }

  getLanguageConfig(): MultilingualConfig {
    return LANGUAGE_CONFIGS[this.currentLanguage] || LANGUAGE_CONFIGS['en'];
  }
}

// Export singleton instance
export const multilingualDetector = new MultilingualVoiceDetector();

// Helper function to get optimal voice for language
export function getOptimalVoiceForLanguage(language: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  const voices = speechSynthesis.getVoices();
  const config = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS['en'];
  const targetLang = config.ttsLang;

  // Priority: exact match > language match > female voice > any voice
  const exactMatch = voices.find(v => v.lang === targetLang);
  if (exactMatch) return exactMatch;

  const langMatch = voices.find(v => v.lang.startsWith(language));
  if (langMatch) return langMatch;

  const femaleVoice = voices.find(v => 
    v.lang.startsWith(language) && 
    (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman'))
  );
  if (femaleVoice) return femaleVoice;

  return voices.find(v => v.lang.startsWith(language)) || voices[0] || null;
}

// Test multilingual support
export async function testMultilingualSupport(): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};
  
  if (typeof window === 'undefined') {
    return results;
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  for (const [lang, config] of Object.entries(LANGUAGE_CONFIGS)) {
    try {
      // Test speech recognition
      const recognition = new SpeechRecognition();
      recognition.lang = config.speechRecognitionLang;
      
      // Test TTS
      const voices = speechSynthesis.getVoices();
      const hasVoice = voices.some(v => v.lang.startsWith(lang));
      
      results[lang] = hasVoice;
    } catch (error) {
      results[lang] = false;
    }
  }
  
  return results;
}
