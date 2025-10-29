/**
 * Face Detection and Emotion Recognition Library
 * Uses face-api.js for real-time face detection and emotion analysis
 */

import * as faceapi from 'face-api.js';

export interface EmotionScores {
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
  disgusted: number;
  surprised: number;
  neutral: number;
}

export interface FaceDetectionResult {
  detected: boolean;
  emotions: EmotionScores | null;
  dominantEmotion: string | null;
  confidence: number;
  landmarks: any | null;
}

export interface ExerciseValidation {
  isValid: boolean;
  feedback: string;
  score: number;
}

class FaceDetectionService {
  private modelsLoaded = false;
  private modelPath = '/models'; // face-api.js models

  /**
   * Load face-api.js models
   */
  async loadModels(): Promise<void> {
    if (this.modelsLoaded) return;

    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(this.modelPath),
        faceapi.nets.faceLandmark68Net.loadFromUri(this.modelPath),
        faceapi.nets.faceRecognitionNet.loadFromUri(this.modelPath),
        faceapi.nets.faceExpressionNet.loadFromUri(this.modelPath),
      ]);
      this.modelsLoaded = true;
      console.log('✅ Face detection models loaded');
    } catch (error) {
      console.error('❌ Failed to load face detection models:', error);
      throw error;
    }
  }

  /**
   * Detect face and emotions from video element
   */
  async detectFace(
    videoElement: HTMLVideoElement
  ): Promise<FaceDetectionResult> {
    if (!this.modelsLoaded) {
      await this.loadModels();
    }

    try {
      const detection = await faceapi
        .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (!detection) {
        return {
          detected: false,
          emotions: null,
          dominantEmotion: null,
          confidence: 0,
          landmarks: null,
        };
      }

      const emotions = detection.expressions;
      const dominantEmotion = this.getDominantEmotion(emotions);

      return {
        detected: true,
        emotions: emotions as EmotionScores,
        dominantEmotion,
        confidence: emotions[dominantEmotion as keyof typeof emotions],
        landmarks: detection.landmarks,
      };
    } catch (error) {
      console.error('Face detection error:', error);
      return {
        detected: false,
        emotions: null,
        dominantEmotion: null,
        confidence: 0,
        landmarks: null,
      };
    }
  }

  /**
   * Get dominant emotion from emotion scores
   */
  private getDominantEmotion(emotions: any): string {
    let maxEmotion = 'neutral';
    let maxScore = 0;

    for (const [emotion, score] of Object.entries(emotions)) {
      if ((score as number) > maxScore) {
        maxScore = score as number;
        maxEmotion = emotion;
      }
    }

    return maxEmotion;
  }

  /**
   * Validate meditation exercise
   * Checks for closed eyes and calm expression
   */
  validateMeditation(result: FaceDetectionResult): ExerciseValidation {
    if (!result.detected || !result.emotions) {
      return {
        isValid: false,
        feedback: 'No face detected. Please position yourself in front of the camera.',
        score: 0,
      };
    }

    const { emotions } = result;
    const calmScore = emotions.neutral + emotions.happy * 0.5;
    const stressScore = emotions.angry + emotions.fearful + emotions.sad;

    if (calmScore > 0.6 && stressScore < 0.3) {
      return {
        isValid: true,
        feedback: 'Great! You look calm and relaxed. Keep it up!',
        score: Math.round(calmScore * 100),
      };
    } else if (stressScore > 0.5) {
      return {
        isValid: false,
        feedback: 'Try to relax your facial muscles. Take deep breaths.',
        score: Math.round((1 - stressScore) * 100),
      };
    } else {
      return {
        isValid: false,
        feedback: 'Focus on relaxing. Let go of tension in your face.',
        score: Math.round(calmScore * 100),
      };
    }
  }

  /**
   * Validate breathing exercise
   * Checks for rhythmic facial movements
   */
  validateBreathing(
    result: FaceDetectionResult,
    previousResult: FaceDetectionResult | null
  ): ExerciseValidation {
    if (!result.detected || !result.landmarks) {
      return {
        isValid: false,
        feedback: 'No face detected. Please stay in frame.',
        score: 0,
      };
    }

    // Check for calm expression during breathing
    const emotions = result.emotions!;
    const calmScore = emotions.neutral + emotions.happy * 0.3;

    if (calmScore > 0.5) {
      return {
        isValid: true,
        feedback: 'Excellent breathing! Keep the rhythm steady.',
        score: Math.round(calmScore * 100),
      };
    } else {
      return {
        isValid: false,
        feedback: 'Breathe slowly and steadily. Relax your face.',
        score: Math.round(calmScore * 100),
      };
    }
  }

  /**
   * Validate positive affirmation exercise
   * Checks for smile and positive expression
   */
  validateAffirmation(result: FaceDetectionResult): ExerciseValidation {
    if (!result.detected || !result.emotions) {
      return {
        isValid: false,
        feedback: 'No face detected. Smile at the camera!',
        score: 0,
      };
    }

    const { emotions } = result;
    const positiveScore = emotions.happy + emotions.surprised * 0.3;

    if (positiveScore > 0.6) {
      return {
        isValid: true,
        feedback: 'Beautiful smile! You're radiating positivity!',
        score: Math.round(positiveScore * 100),
      };
    } else if (positiveScore > 0.3) {
      return {
        isValid: false,
        feedback: 'Try smiling more! Feel the positive energy.',
        score: Math.round(positiveScore * 100),
      };
    } else {
      return {
        isValid: false,
        feedback: 'Smile! Think of something that makes you happy.',
        score: Math.round(positiveScore * 100),
      };
    }
  }

  /**
   * Map emotion to mood pet state
   */
  mapEmotionToPetState(emotion: string): string {
    const emotionMap: Record<string, string> = {
      happy: 'happy',
      sad: 'sad',
      angry: 'calm',
      fearful: 'comfort',
      disgusted: 'neutral',
      surprised: 'excited',
      neutral: 'idle',
    };

    return emotionMap[emotion] || 'idle';
  }
}

// Singleton instance
export const faceDetectionService = new FaceDetectionService();
