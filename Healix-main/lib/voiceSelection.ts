// Enhanced Voice Selection System for Healix
// Provides optimal voice selection for mental health and stress relief

export interface VoiceProfile {
  id: string;
  name: string;
  description: string;
  category: "female" | "male";
  stressReliefScore: number; // 1-10, higher is better for stress relief
  languages: string[];
  browserPatterns: string[]; // Patterns to match browser voice names
  fallbackPatterns: string[]; // Alternative patterns if primary not found
}

export const VOICE_PROFILES: VoiceProfile[] = [
  // Female Voices (Optimized for stress relief)
  {
    id: "warm-female",
    name: "Warm Female",
    description: "Soothing & Empathetic",
    category: "female",
    stressReliefScore: 10,
    languages: ["en-US", "en-GB", "hi-IN", "te-IN", "ta-IN", "kn-IN", "gu-IN"],
    browserPatterns: [
      "zira",
      "hazel",
      "samantha",
      "susan",
      "victoria",
      "serena",
      "female",
      "woman",
      "natural",
      "enhanced",
      "premium",
    ],
    fallbackPatterns: ["google", "microsoft", "apple", "natural"],
  },
  {
    id: "gentle-female",
    name: "Gentle Female",
    description: "Calm & Nurturing",
    category: "female",
    stressReliefScore: 9,
    languages: ["en-US", "en-GB", "hi-IN", "te-IN", "ta-IN", "kn-IN"],
    browserPatterns: [
      "aria",
      "jenny",
      "emma",
      "amy",
      "eva",
      "claire",
      "soft",
      "calm",
      "gentle",
      "soothing",
    ],
    fallbackPatterns: ["google uk english female", "microsoft aria"],
  },
  {
    id: "soft-female",
    name: "Soft Female",
    description: "Peaceful & Relaxing",
    category: "female",
    stressReliefScore: 9,
    languages: ["en-US", "hi-IN", "te-IN", "ta-IN"],
    browserPatterns: [
      "helen",
      "linda",
      "kendra",
      "joanna",
      "salli",
      "whisper",
      "peaceful",
      "relaxing",
      "meditation",
    ],
    fallbackPatterns: ["amazon polly", "neural", "wavenet"],
  },
  {
    id: "caring-female",
    name: "Caring Female",
    description: "Supportive & Kind",
    category: "female",
    stressReliefScore: 8,
    languages: ["en-US", "en-GB", "hi-IN", "te-IN"],
    browserPatterns: [
      "nicole",
      "raveena",
      "aditi",
      "priya",
      "shreya",
      "caring",
      "supportive",
      "kind",
      "warm",
    ],
    fallbackPatterns: ["indian english female", "hindi female"],
  },
  {
    id: "melodic-female",
    name: "Melodic Female",
    description: "Musical & Harmonious",
    category: "female",
    stressReliefScore: 8,
    languages: ["en-US", "en-GB", "hi-IN"],
    browserPatterns: [
      "allison",
      "ava",
      "nicky",
      "veena",
      "kalpana",
      "melodic",
      "musical",
      "harmonious",
      "expressive",
    ],
    fallbackPatterns: ["expressive", "neural", "premium"],
  },

  // Male Voices (Alternative options)
  {
    id: "calm-male",
    name: "Calm Male",
    description: "Deep & Reassuring",
    category: "male",
    stressReliefScore: 7,
    languages: ["en-US", "en-GB", "hi-IN", "te-IN"],
    browserPatterns: [
      "david",
      "mark",
      "daniel",
      "alex",
      "tom",
      "calm",
      "deep",
      "reassuring",
      "meditation",
    ],
    fallbackPatterns: ["google us english male", "microsoft david"],
  },
  {
    id: "friendly-male",
    name: "Friendly Male",
    description: "Warm & Approachable",
    category: "male",
    stressReliefScore: 6,
    languages: ["en-US", "hi-IN", "te-IN"],
    browserPatterns: [
      "brian",
      "kevin",
      "ryan",
      "matthew",
      "joey",
      "friendly",
      "warm",
      "approachable",
      "conversational",
    ],
    fallbackPatterns: ["neural male", "standard male"],
  },
  {
    id: "wise-male",
    name: "Wise Male",
    description: "Mature & Thoughtful",
    category: "male",
    stressReliefScore: 7,
    languages: ["en-US", "en-GB", "hi-IN"],
    browserPatterns: [
      "richard",
      "george",
      "arthur",
      "winston",
      "james",
      "wise",
      "mature",
      "thoughtful",
      "distinguished",
    ],
    fallbackPatterns: ["british male", "mature", "classic"],
  },
  {
    id: "gentle-male",
    name: "Gentle Male",
    description: "Soft & Comforting",
    category: "male",
    stressReliefScore: 6,
    languages: ["en-US", "hi-IN"],
    browserPatterns: [
      "justin",
      "ben",
      "luke",
      "noah",
      "ethan",
      "gentle",
      "soft",
      "comforting",
      "tender",
    ],
    fallbackPatterns: ["soft male", "young male", "gentle"],
  },
  {
    id: "confident-male",
    name: "Confident Male",
    description: "Strong & Supportive",
    category: "male",
    stressReliefScore: 5,
    languages: ["en-US", "hi-IN"],
    browserPatterns: [
      "michael",
      "william",
      "christopher",
      "anthony",
      "john",
      "confident",
      "strong",
      "supportive",
      "authoritative",
    ],
    fallbackPatterns: ["standard male", "default male"],
  },
];

export class VoiceSelector {
  private availableVoices: SpeechSynthesisVoice[] = [];
  private voiceProfiles = VOICE_PROFILES;

  constructor() {
    this.loadAvailableVoices();
  }

  private loadAvailableVoices() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.availableVoices = speechSynthesis.getVoices();

      // Reload voices when they become available
      if (this.availableVoices.length === 0) {
        speechSynthesis.onvoiceschanged = () => {
          this.availableVoices = speechSynthesis.getVoices();
        };
      }
    }
  }

  public getOptimalVoice(
    selectedVoiceId: string = "auto",
    language: string = "en-US",
    preferFemale: boolean = true,
  ): SpeechSynthesisVoice | null {
    this.loadAvailableVoices();

    if (this.availableVoices.length === 0) {
      return null;
    }

    // If auto-select, choose best voice for stress relief
    if (selectedVoiceId === "auto") {
      return this.selectBestVoiceForLanguage(language, preferFemale);
    }

    // Find specific voice profile
    const profile = this.voiceProfiles.find((p) => p.id === selectedVoiceId);
    if (!profile) {
      return this.selectBestVoiceForLanguage(language, preferFemale);
    }

    // Find matching browser voice for this profile
    const matchingVoice = this.findVoiceByProfile(profile, language);
    if (matchingVoice) {
      return matchingVoice;
    }

    // Fallback to best available voice
    return this.selectBestVoiceForLanguage(language, preferFemale);
  }

  private findVoiceByProfile(
    profile: VoiceProfile,
    language: string,
  ): SpeechSynthesisVoice | null {
    const languageVoices = this.availableVoices.filter(
      (voice) =>
        voice.lang.startsWith(language.split("-")[0]) ||
        voice.lang === language,
    );

    // Try primary patterns first
    for (const pattern of profile.browserPatterns) {
      const voice = languageVoices.find(
        (v) =>
          v.name.toLowerCase().includes(pattern.toLowerCase()) ||
          v.voiceURI.toLowerCase().includes(pattern.toLowerCase()),
      );
      if (voice) return voice;
    }

    // Try fallback patterns
    for (const pattern of profile.fallbackPatterns) {
      const voice = languageVoices.find(
        (v) =>
          v.name.toLowerCase().includes(pattern.toLowerCase()) ||
          v.voiceURI.toLowerCase().includes(pattern.toLowerCase()),
      );
      if (voice) return voice;
    }

    // Try gender-based selection
    const genderVoices = languageVoices.filter((voice) => {
      const name = voice.name.toLowerCase();
      const uri = voice.voiceURI.toLowerCase();

      if (profile.category === "female") {
        return (
          name.includes("female") ||
          name.includes("woman") ||
          uri.includes("female") ||
          this.isFemaleVoiceName(name)
        );
      } else {
        return (
          name.includes("male") ||
          name.includes("man") ||
          uri.includes("male") ||
          this.isMaleVoiceName(name)
        );
      }
    });

    return genderVoices[0] || null;
  }

  private selectBestVoiceForLanguage(
    language: string,
    preferFemale: boolean = true,
  ): SpeechSynthesisVoice | null {
    const languageVoices = this.availableVoices.filter(
      (voice) =>
        voice.lang.startsWith(language.split("-")[0]) ||
        voice.lang === language,
    );

    if (languageVoices.length === 0) {
      // Fallback to any English voice
      const englishVoices = this.availableVoices.filter((voice) =>
        voice.lang.startsWith("en"),
      );
      return this.selectBestFromVoices(englishVoices, preferFemale);
    }

    return this.selectBestFromVoices(languageVoices, preferFemale);
  }

  private selectBestFromVoices(
    voices: SpeechSynthesisVoice[],
    preferFemale: boolean,
  ): SpeechSynthesisVoice | null {
    if (voices.length === 0) return null;

    // Priority order for voice selection
    const priorities = [
      // High-quality voices
      ["premium", "enhanced", "neural", "wavenet", "natural"],
      // Female voices (if preferred)
      preferFemale
        ? ["female", "woman", "zira", "hazel", "samantha", "aria", "jenny"]
        : [],
      // Male voices (if not preferring female)
      !preferFemale ? ["male", "man", "david", "mark", "alex"] : [],
      // Popular voice engines
      ["google", "microsoft", "apple", "amazon"],
      // Fallback patterns
      ["default", "standard"],
    ].flat();

    // Score voices based on priority patterns
    const scoredVoices = voices.map((voice) => {
      const name = voice.name.toLowerCase();
      const uri = voice.voiceURI.toLowerCase();
      let score = 0;

      priorities.forEach((pattern, index) => {
        if (name.includes(pattern) || uri.includes(pattern)) {
          score += priorities.length - index;
        }
      });

      // Bonus for female voices in stress relief context
      if (
        preferFemale &&
        (this.isFemaleVoiceName(name) || name.includes("female"))
      ) {
        score += 10;
      }

      // Bonus for local voices (usually higher quality)
      if (voice.localService) {
        score += 5;
      }

      return { voice, score };
    });

    // Sort by score and return best voice
    scoredVoices.sort((a, b) => b.score - a.score);
    return scoredVoices[0]?.voice || voices[0];
  }

  private isFemaleVoiceName(name: string): boolean {
    const femaleNames = [
      "zira",
      "hazel",
      "samantha",
      "susan",
      "victoria",
      "serena",
      "aria",
      "jenny",
      "emma",
      "amy",
      "eva",
      "claire",
      "helen",
      "linda",
      "kendra",
      "joanna",
      "salli",
      "nicole",
      "raveena",
      "aditi",
      "priya",
      "shreya",
      "allison",
      "ava",
      "nicky",
      "veena",
      "kalpana",
      "mary",
      "sarah",
      "anna",
      "lisa",
    ];

    return femaleNames.some((fname) => name.includes(fname));
  }

  private isMaleVoiceName(name: string): boolean {
    const maleNames = [
      "david",
      "mark",
      "daniel",
      "alex",
      "tom",
      "brian",
      "kevin",
      "ryan",
      "matthew",
      "joey",
      "richard",
      "george",
      "arthur",
      "winston",
      "james",
      "justin",
      "ben",
      "luke",
      "noah",
      "ethan",
      "michael",
      "william",
      "christopher",
      "anthony",
      "john",
    ];

    return maleNames.some((mname) => name.includes(mname));
  }

  public getVoiceProfiles(): VoiceProfile[] {
    return this.voiceProfiles;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    this.loadAvailableVoices();
    return this.availableVoices;
  }

  public testVoice(
    voiceId: string,
    language: string,
    speed: number = 1.0,
    pitch: number = 1.0,
    volume: number = 0.8,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const voice = this.getOptimalVoice(voiceId, language);
      if (!voice) {
        reject(new Error("Voice not available"));
        return;
      }

      // Multi-language test messages
      const testMessages: Record<string, string> = {
        en: "Hello! I'm your Healix voice assistant. I'm here to support your mental health journey with a warm and caring voice.",
        hi: "नमस्ते! मैं आपका हीलिक्स वॉयस असिस्टेंट हूँ। मैं आपके मानसिक स्वास्थ्य की यात्रा में सहायता के लिए यहाँ हूँ।",
        te: "నమస్కారం! నేను మీ హీలిక్స్ వాయిస్ అసిస్టెంట్. మీ మానసిక ఆరోగ్య ప్రయాణంలో సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను.",
        ta: "வணக்கம்! நான் உங்கள் ஹீலிக்ஸ் குரல் உதவியாளர். உங்கள் மன ஆரோக்கிய பயணத்தில் உதவ நான் இங்கே இருக்கிறேன்.",
        kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಹೀಲಿಕ್ಸ್ ಧ್ವನಿ ಸಹಾಯಕ. ನಿಮ್ಮ ಮಾನಸಿಕ ಆರೋಗ್ಯ ಪ್ರಯಾಣದಲ್ಲಿ ಸಹಾಯ ಮಾಡಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ.",
        gu: "નમસ્તે! હું તમારો હીલિક્સ વૉઇસ અસિસ્ટન્ટ છું. તમારી માનસિક સ્વાસ્થ્ય યાત્રામાં મદદ કરવા હું અહીં છું.",
      };

      const langCode = language.split("-")[0];
      const testMessage = testMessages[langCode] || testMessages["en"];

      const utterance = new SpeechSynthesisUtterance(testMessage);

      utterance.voice = voice;
      utterance.rate = speed;
      utterance.pitch = pitch;
      utterance.volume = volume;
      utterance.lang = language;

      utterance.onend = () => resolve();
      utterance.onerror = (event) =>
        reject(new Error(`Voice test failed: ${event.error}`));

      // Cancel any ongoing speech
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    });
  }

  public async testVoiceWithBackend(
    voiceId: string,
    language: string,
    backendUrl: string = "http://localhost:8000",
  ): Promise<void> {
    try {
      const testMessages: Record<string, string> = {
        en: "Hello! This is a test of the Healix voice system.",
        hi: "नमस्ते! यह हीलिक्स वॉयस सिस्टम का परीक्षण है।",
        te: "నమస్కారం! ఇది హీలిక్స్ వాయిస్ సిస్టమ్ యొక్క పరీక్ష.",
        ta: "வணக்கம்! இது ஹீலிக்ஸ் குரல் அமைப்பின் சோதனை.",
        kn: "ನಮಸ್ಕಾರ! ಇದು ಹೀಲಿಕ್ಸ್ ಧ್ವನಿ ವ್ಯವಸ್ಥೆಯ ಪರೀಕ್ಷೆ.",
        gu: "નમસ્તે! આ હીલિક્સ વૉઇસ સિસ્ટમનું પરીક્ષણ છે.",
      };

      const langCode = language.split("-")[0];
      const testMessage = testMessages[langCode] || testMessages["en"];

      const response = await fetch(`${backendUrl}/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: testMessage,
          language: langCode,
          voice: voiceId,
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        return new Promise((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            reject(new Error("Audio playback failed"));
          };
          audio.play();
        });
      } else {
        // Fallback to browser TTS
        return this.testVoice(voiceId, language);
      }
    } catch (error) {
      console.warn("Backend TTS test failed, using browser fallback:", error);
      return this.testVoice(voiceId, language);
    }
  }
}

// Singleton instance
export const voiceSelector = new VoiceSelector();

// Multi-language wake word patterns
export const MULTI_LANGUAGE_WAKE_WORDS: Record<string, RegExp[]> = {
  "en-US": [
    /\b(hey|hello|hi)\s+(healix|helix)\b/i,
    /\b(healix|helix)\s+(help|assist|start)\b/i,
    /\b(wake\s+up|activate)\s+(healix|helix)\b/i,
  ],
  "hi-IN": [
    /\b(हे|हैलो|नमस्ते)\s+(हीलिक्स|healix)\b/i,
    /\b(हीलिक्स|healix)\s+(मदद|सहायता|शुरू)\b/i,
    /\b(जागो|शुरू करो)\s+(हीलिक्स|healix)\b/i,
    // Transliterated versions
    /\b(hey|hello|hi)\s+(healix|helix)\b/i,
  ],
  "te-IN": [
    /\b(హే|హలో|నమస్కారం)\s+(హీలిక్స్|healix)\b/i,
    /\b(హీలిక్స్|healix)\s+(సహాయం|మొదలు|ప్రారంభం)\b/i,
    /\b(మేల్కొనండి|ప్రారంభించండి)\s+(హీలిక్స్|healix)\b/i,
    // Transliterated versions
    /\b(hey|hello|hi)\s+(healix|helix)\b/i,
  ],
  "ta-IN": [
    /\b(ஹே|ஹலோ|வணக்கம்)\s+(ஹீலிக்ஸ்|healix)\b/i,
    /\b(ஹீலிக்ஸ்|healix)\s+(உதவி|தொடக்கம்|ஆரம்பம்)\b/i,
    /\b(எழுந்திரு|தொடங்கு)\s+(ஹீலிக்ஸ்|healix)\b/i,
    // Transliterated versions
    /\b(hey|hello|hi)\s+(healix|helix)\b/i,
  ],
  "kn-IN": [
    /\b(ಹೇ|ಹಲೋ|ನಮಸ್ಕಾರ)\s+(ಹೀಲಿಕ್ಸ್|healix)\b/i,
    /\b(ಹೀಲಿಕ್ಸ್|healix)\s+(ಸಹಾಯ|ಪ್ರಾರಂಭ|ಆರಂಭ)\b/i,
    /\b(ಎಚ್ಚರಗೊಳ್ಳಿ|ಪ್ರಾರಂಭಿಸಿ)\s+(ಹೀಲಿಕ್ಸ್|healix)\b/i,
    // Transliterated versions
    /\b(hey|hello|hi)\s+(healix|helix)\b/i,
  ],
  "gu-IN": [
    /\b(હે|હેલો|નમસ્તે)\s+(હીલિક્સ|healix)\b/i,
    /\b(હીલિક્સ|healix)\s+(મદદ|સહાય|શરૂ)\b/i,
    /\b(જાગો|શરૂ કરો)\s+(હીલિક્સ|healix)\b/i,
    // Transliterated versions
    /\b(hey|hello|hi)\s+(healix|helix)\b/i,
  ],
};

// Language detection utilities
export const LANGUAGE_DETECTION_PATTERNS = {
  "hi-IN": {
    patterns: [
      /[\u0900-\u097F]/g, // Devanagari Unicode block
      /\b(मैं|तुम|है|हैं|और|या|नहीं|हां|कि|को|से|में|पर|के|का|की)\b/g,
    ],
    threshold: 0.1,
  },
  "te-IN": {
    patterns: [
      /[\u0C00-\u0C7F]/g, // Telugu Unicode block
      /\b(నేను|మీరు|ఉంది|లేదు|మరియు|కానీ|అవును|లేదా|లో|తో|కి|నుండి)\b/g,
    ],
    threshold: 0.1,
  },
  "ta-IN": {
    patterns: [
      /[\u0B80-\u0BFF]/g, // Tamil Unicode block
      /\b(நான்|நீ|உள்ளது|இல்லை|மற்றும்|அல்லது|ஆம்|இல்|உடன்|இருந்து)\b/g,
    ],
    threshold: 0.1,
  },
  "kn-IN": {
    patterns: [
      /[\u0C80-\u0CFF]/g, // Kannada Unicode block
      /\b(ನಾನು|ನೀವು|ಇದೆ|ಇಲ್ಲ|ಮತ್ತು|ಅಥವಾ|ಹೌದು|ರಲ್ಲಿ|ಇಂದ|ನೊಂದಿಗೆ)\b/g,
    ],
    threshold: 0.1,
  },
};

export const detectLanguage = (text: string): string => {
  const normalizedText = text.trim();

  // Check for Indian languages first
  for (const [langCode, config] of Object.entries(
    LANGUAGE_DETECTION_PATTERNS,
  )) {
    const totalLength = normalizedText.length;
    if (totalLength === 0) continue;

    let matchCount = 0;
    for (const pattern of config.patterns) {
      const matches = normalizedText.match(pattern);
      if (matches) {
        matchCount += matches.length;
      }
    }

    const ratio = matchCount / totalLength;
    if (ratio >= config.threshold) {
      return langCode;
    }
  }

  // Default to English
  return "en-US";
};

// Enhanced speech recognition language mapping
export const SPEECH_RECOGNITION_LANGUAGES = {
  "en-US": "en-US",
  "hi-IN": "hi-IN",
  "te-IN": "te-IN",
  "ta-IN": "ta-IN",
  "kn-IN": "kn-IN",
  "gu-IN": "gu-IN",
  en: "en-US",
  hi: "hi-IN",
  te: "te-IN",
  ta: "ta-IN",
  kn: "kn-IN",
  gu: "gu-IN",
};

export const getSpeechRecognitionLanguage = (userLanguage: string): string => {
  return (
    SPEECH_RECOGNITION_LANGUAGES[
      userLanguage as keyof typeof SPEECH_RECOGNITION_LANGUAGES
    ] || "en-US"
  );
};

export const detectWakeWord = (
  text: string,
  language: string = "en-US",
  customWakeWord?: string,
): boolean => {
  const normalizedText = text.toLowerCase().trim();

  // If custom wake word is provided, check for it with fuzzy matching
  if (customWakeWord) {
    const customWord = customWakeWord.toLowerCase().trim();
    // Check for exact match or with common prefixes
    const customPatterns = [
      new RegExp(`\\b(hey|hello|hi)\\s+${customWord}\\b`, 'i'),
      new RegExp(`\\b${customWord}\\s+(help|assist|start)\\b`, 'i'),
      new RegExp(`\\b(wake\\s+up|activate)\\s+${customWord}\\b`, 'i'),
      new RegExp(`\\b${customWord}\\b`, 'i'), // Just the wake word alone
    ];
    
    if (customPatterns.some(pattern => pattern.test(normalizedText))) {
      return true;
    }
  }

  // FUZZY MATCHING: Check for common speech recognition errors
  // "healix" might be heard as "helex", "helix", "helics", "helux", etc.
  const fuzzyWakeWords = [
    /\b(hey|hello|hi)\s+(healix|helix|helex|helics|helux|heliks|hilux|hilux)\b/i,
    /\b(healix|helix|helex|helics|helux|heliks|hilux)\s+(help|assist|start)\b/i,
    /\b(wake\s+up|activate)\s+(healix|helix|helex|helics|helux|heliks)\b/i,
    /\b(healix|helix|helex|helics|helux|heliks|hilux)\b/i, // Just the wake word alone
  ];

  if (fuzzyWakeWords.some(pattern => pattern.test(normalizedText))) {
    return true;
  }

  // Auto-detect language if not specified
  const detectedLang = language === "auto" ? detectLanguage(text) : language;

  // Check patterns for detected language
  const patterns =
    MULTI_LANGUAGE_WAKE_WORDS[detectedLang] ||
    MULTI_LANGUAGE_WAKE_WORDS["en-US"];

  // Also check English patterns as fallback for all languages
  const englishPatterns = MULTI_LANGUAGE_WAKE_WORDS["en-US"];
  const allPatterns = [...patterns, ...englishPatterns];

  return allPatterns.some((pattern: RegExp) => pattern.test(normalizedText));
};

// Helper function to generate personalized greetings
export const generatePersonalizedGreeting = (userName?: string): string => {
  const greetings = [
    `Hello ${userName || 'there'}! I'm Healix, your mental health companion. How can I help you today?`,
    `Hi ${userName || 'there'}! I'm Healix, here to support your mental wellness journey. What's on your mind?`,
    `Welcome ${userName || 'there'}! I'm Healix, your caring AI companion. How are you feeling today?`,
    `Hello ${userName || 'there'}! I'm Healix, ready to listen and support you. What would you like to talk about?`
  ];
  
  return greetings[Math.floor(Math.random() * greetings.length)];
};
