import { HfInference } from '@huggingface/inference';

export interface EmotionResult {
  label: string;
  score: number;
}

export interface EmotionAnalysis {
  emotions: EmotionResult[];
  dominant: EmotionResult;
  confidence: number;
}

class EmotionService {
  private hf: HfInference | null = null;
  private fallbackKeywords = {
    POSITIVE: ['happy', 'joy', 'excited', 'great', 'awesome', 'wonderful', 'love', 'amazing', 'fantastic', 'good', 'excellent', 'brilliant', 'perfect', 'beautiful', 'smile', 'laugh'],
    NEGATIVE: ['sad', 'angry', 'frustrated', 'bad', 'terrible', 'awful', 'hate', 'horrible', 'worried', 'anxious', 'depressed', 'upset', 'mad', 'furious', 'devastated'],
    CALM: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'zen', 'breathe', 'meditation', 'quiet', 'still', 'composed', 'centered'],
    CONFIDENT: ['strong', 'powerful', 'confident', 'brave', 'courage', 'determined', 'focused', 'bold', 'fearless', 'unstoppable'],
    STRESSED: ['stress', 'overwhelmed', 'pressure', 'tension', 'burden', 'exhausted', 'tired', 'drained', 'burned out'],
    HOPEFUL: ['hope', 'optimistic', 'positive', 'bright', 'future', 'better', 'improve', 'progress', 'forward', 'believe']
  };

  constructor(apiKey?: string) {
    if (apiKey) {
      this.hf = new HfInference(apiKey);
    }
  }

  async analyzeEmotion(text: string): Promise<EmotionAnalysis> {
    try {
      // Try Hugging Face API first
      if (this.hf) {
        const result = await this.hf.textClassification({
          model: 'j-hartmann/emotion-english-distilroberta-base',
          inputs: text
        });

        if (result && Array.isArray(result)) {
          const emotions = result.map((item: any) => ({
            label: this.normalizeEmotionLabel(item.label),
            score: item.score
          })).sort((a, b) => b.score - a.score);

          return {
            emotions,
            dominant: emotions[0],
            confidence: emotions[0].score
          };
        }
      }

      // Fallback to keyword-based analysis
      return this.analyzeEmotionFallback(text);
    } catch (error) {
      console.error('Emotion analysis error:', error);
      return this.analyzeEmotionFallback(text);
    }
  }

  private analyzeEmotionFallback(text: string): EmotionAnalysis {
    const lowerText = text.toLowerCase();
    const emotionScores: { [key: string]: number } = {};

    // Calculate scores for each emotion category
    Object.entries(this.fallbackKeywords).forEach(([emotion, keywords]) => {
      const matches = keywords.filter(keyword => lowerText.includes(keyword));
      emotionScores[emotion] = matches.length / keywords.length;
    });

    // Convert to emotion results
    const emotions: EmotionResult[] = Object.entries(emotionScores)
      .map(([label, score]) => ({ label: label.toLowerCase(), score }))
      .filter(emotion => emotion.score > 0)
      .sort((a, b) => b.score - a.score);

    // If no emotions detected, return neutral
    if (emotions.length === 0) {
      emotions.push({ label: 'neutral', score: 0.5 });
    }

    return {
      emotions,
      dominant: emotions[0],
      confidence: emotions[0].score
    };
  }

  private normalizeEmotionLabel(label: string): string {
    const labelMap: { [key: string]: string } = {
      'joy': 'positive',
      'happiness': 'positive',
      'sadness': 'negative',
      'anger': 'negative',
      'fear': 'stressed',
      'surprise': 'excited',
      'disgust': 'negative',
      'love': 'positive',
      'optimism': 'hopeful',
      'pessimism': 'negative',
      'trust': 'confident',
      'anticipation': 'hopeful'
    };

    return labelMap[label.toLowerCase()] || label.toLowerCase();
  }

  async analyzeBattleEmotion(text: string): Promise<{
    battleEffect: 'boost' | 'neutral' | 'weaken';
    strength: number;
    emotion: string;
  }> {
    const analysis = await this.analyzeEmotion(text);
    const dominant = analysis.dominant;

    let battleEffect: 'boost' | 'neutral' | 'weaken' = 'neutral';
    let strength = 0.5;

    switch (dominant.label) {
      case 'positive':
      case 'confident':
      case 'hopeful':
        battleEffect = 'boost';
        strength = Math.min(1, dominant.score * 1.5);
        break;
      case 'calm':
        battleEffect = 'boost';
        strength = Math.min(1, dominant.score * 1.2);
        break;
      case 'negative':
      case 'stressed':
        battleEffect = 'weaken';
        strength = Math.min(1, dominant.score * 1.3);
        break;
      default:
        battleEffect = 'neutral';
        strength = 0.5;
    }

    return {
      battleEffect,
      strength,
      emotion: dominant.label
    };
  }

  getEmotionColor(emotion: string): string {
    const colorMap: { [key: string]: string } = {
      'positive': '#10b981', // green
      'negative': '#ef4444', // red
      'calm': '#3b82f6', // blue
      'confident': '#8b5cf6', // purple
      'stressed': '#f59e0b', // amber
      'hopeful': '#06b6d4', // cyan
      'neutral': '#6b7280' // gray
    };

    return colorMap[emotion.toLowerCase()] || colorMap.neutral;
  }

  getEmotionIcon(emotion: string): string {
    const iconMap: { [key: string]: string } = {
      'positive': '😊',
      'negative': '😢',
      'calm': '😌',
      'confident': '💪',
      'stressed': '😰',
      'hopeful': '🌟',
      'neutral': '😐'
    };

    return iconMap[emotion.toLowerCase()] || iconMap.neutral;
  }

  getBattleAdvice(emotion: string): string {
    const adviceMap: { [key: string]: string } = {
      'positive': 'Your positive energy strengthens your attacks! Keep it up!',
      'confident': 'Your confidence is your shield! You\'re unstoppable!',
      'calm': 'Your inner peace enhances your focus. Perfect for precise strikes!',
      'hopeful': 'Hope fuels your determination. Victory is within reach!',
      'negative': 'Channel that energy into determination. You can overcome this!',
      'stressed': 'Take a deep breath. Let calmness be your weapon.',
      'neutral': 'Stay centered and focused. Find your inner strength.'
    };

    return adviceMap[emotion.toLowerCase()] || adviceMap.neutral;
  }
}

// Singleton instance
let emotionServiceInstance: EmotionService | null = null;

export const getEmotionService = (apiKey?: string): EmotionService => {
  if (!emotionServiceInstance) {
    emotionServiceInstance = new EmotionService(apiKey);
  }
  return emotionServiceInstance;
};

export default EmotionService;
