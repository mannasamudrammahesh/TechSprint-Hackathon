/**
 * Local Voice Response System
 * Uses Web Speech API only - completely free, no external API calls
 * Provides intelligent, context-aware responses without rate limits
 */

export interface LocalResponse {
  text: string;
  suggestions?: string[];
}

// Mental health support responses
const mentalHealthResponses: Record<string, LocalResponse> = {
  stressed: {
    text: "I understand you're feeling stressed. Let's try some deep breathing together. Would you like me to play calming music or guide you through a breathing exercise?",
    suggestions: ["play peaceful music", "start breathing exercise", "open therapy"]
  },
  anxious: {
    text: "Anxiety can be overwhelming. Remember, you're safe right now. Would you like to try a grounding exercise or listen to some calming sounds?",
    suggestions: ["play meditation music", "open mindquest", "start breathing"]
  },
  sad: {
    text: "I'm here for you. It's okay to feel sad. Would you like to talk to our counseling chatbot or try some mood-lifting activities?",
    suggestions: ["open chat", "play uplifting music", "open mindquest"]
  },
  depressed: {
    text: "Thank you for sharing that with me. Depression is real, and you're not alone. Our counseling service can provide support. Would you like to connect?",
    suggestions: ["open counseling", "play peaceful music", "open mental health assessment"]
  },
  worried: {
    text: "Worry is natural, but let's work through this together. Would you like to explore coping strategies or talk to our AI counselor?",
    suggestions: ["open chat", "play calm music", "open therapy"]
  },
  panic: {
    text: "Let's focus on your breathing right now. Breathe in slowly for 4 counts, hold for 4, and out for 4. You're going to be okay. Would you like me to guide you?",
    suggestions: ["start breathing exercise", "play calming music", "open therapy"]
  },
  overwhelmed: {
    text: "When things feel overwhelming, let's break them down. First, let's help you relax. Would you like calming music or a mindfulness exercise?",
    suggestions: ["play meditation music", "open mindquest", "open chat"]
  },
  lonely: {
    text: "Feeling lonely is difficult. I'm here with you. Would you like to chat with our AI counselor or explore some engaging activities?",
    suggestions: ["open chat", "open mindquest", "play peaceful music"]
  },
  angry: {
    text: "It's okay to feel angry. Let's channel that energy positively. Would you like to try a physical exercise or talk through what's bothering you?",
    suggestions: ["open mindquest", "open chat", "play calming music"]
  },
  scared: {
    text: "Fear is a natural response. You're safe here. Would you like to talk about what's scaring you or try a grounding exercise?",
    suggestions: ["open chat", "start breathing exercise", "play peaceful music"]
  }
};

// General conversation responses
const conversationalResponses: Record<string, string> = {
  hello: "Hello! I'm Healix, your mental health companion. How can I support you today?",
  "how are you": "I'm here and ready to help you. More importantly, how are you feeling today?",
  "thank you": "You're very welcome! I'm always here when you need support.",
  thanks: "My pleasure! Remember, I'm here whenever you need me.",
  bye: "Take care of yourself. I'll be here if you need me again.",
  goodbye: "Goodbye! I'll be here if you need me again.",
  "exit music": "Closing music player.",
  "close music": "Closing music player.",
  "exit player": "Closing music player.",
  "close player": "Closing music player.",
  help: "I can help you navigate the app, play therapeutic music, start breathing exercises, or connect you with our AI counselor. What would you like to do?",
  "what can you do": "I can play calming music, guide breathing exercises, help you navigate to counseling, therapy, mindquest games, and mental health assessments. I can also control music playback with commands like 'next', 'previous', 'volume up', 'volume down', and 'exit music player'. Just tell me what you need!",
};

// Wellness tips and encouragement
const wellnessTips = [
  "Remember to take deep breaths throughout your day.",
  "You're doing better than you think. Be kind to yourself.",
  "Small steps forward are still progress.",
  "It's okay to ask for help. That's a sign of strength.",
  "Your feelings are valid, and you deserve support.",
  "Taking care of your mental health is just as important as physical health.",
  "You're not alone in this journey.",
  "Every day is a new opportunity for healing and growth."
];

/**
 * Get a local, intelligent response without any API calls
 */
export function getLocalVoiceResponse(userInput: string): LocalResponse {
  const lowerInput = userInput.toLowerCase().trim();
  
  // Check for mental health keywords
  for (const [keyword, response] of Object.entries(mentalHealthResponses)) {
    if (lowerInput.includes(keyword)) {
      return response;
    }
  }
  
  // Check for conversational keywords
  for (const [keyword, response] of Object.entries(conversationalResponses)) {
    if (lowerInput.includes(keyword)) {
      return { text: response };
    }
  }
  
  // Check for questions about feelings
  if (lowerInput.includes("feel") || lowerInput.includes("feeling")) {
    return {
      text: "I'm here to listen. Can you tell me more about how you're feeling? I can also connect you with our counseling service or play calming music.",
      suggestions: ["open chat", "play peaceful music", "open therapy"]
    };
  }
  
  // Check for help requests
  if (lowerInput.includes("need help") || lowerInput.includes("help me")) {
    return {
      text: "I'm here to help. Would you like to talk to our AI counselor, try a breathing exercise, or explore our mental health resources?",
      suggestions: ["open counseling", "start breathing", "open mental health assessment"]
    };
  }
  
  // Check for music/relaxation requests
  if (lowerInput.includes("relax") || lowerInput.includes("calm down") || lowerInput.includes("peace")) {
    return {
      text: "Let's help you relax. I can play peaceful music or guide you through a breathing exercise. What sounds good?",
      suggestions: ["play peaceful music", "start breathing exercise", "play meditation"]
    };
  }
  
  // Default supportive response
  const randomTip = wellnessTips[Math.floor(Math.random() * wellnessTips.length)];
  return {
    text: `I'm here to support you. ${randomTip} Would you like to explore our counseling, therapy exercises, or calming music?`,
    suggestions: ["open chat", "play music", "open therapy"]
  };
}

/**
 * Get a quick acknowledgment response (for immediate feedback)
 */
export function getQuickAcknowledgment(userInput: string): string {
  const lowerInput = userInput.toLowerCase();
  
  if (lowerInput.includes("stressed") || lowerInput.includes("anxious") || lowerInput.includes("worried")) {
    return "I hear you. Let me help with that.";
  }
  
  if (lowerInput.includes("sad") || lowerInput.includes("depressed") || lowerInput.includes("lonely")) {
    return "I'm here for you.";
  }
  
  if (lowerInput.includes("angry") || lowerInput.includes("frustrated")) {
    return "I understand. Let's work through this.";
  }
  
  if (lowerInput.includes("help") || lowerInput.includes("need")) {
    return "I'm here to help.";
  }
  
  return "Let me help you with that.";
}

/**
 * Check if input is a mental health concern that needs support
 */
export function isMentalHealthConcern(userInput: string): boolean {
  const concerns = [
    "stressed", "stress", "anxious", "anxiety", "worried", "worry",
    "sad", "depressed", "depression", "lonely", "loneliness",
    "angry", "anger", "scared", "fear", "panic", "overwhelmed",
    "help", "need help", "feeling", "feel"
  ];
  
  const lowerInput = userInput.toLowerCase();
  return concerns.some(concern => lowerInput.includes(concern));
}
