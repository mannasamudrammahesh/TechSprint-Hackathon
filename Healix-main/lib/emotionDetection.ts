/**
 * Emotion Detection using MediaPipe and Face Landmarks
 * Detects user emotions (happy/laughing, sad, neutral) from webcam
 */

import { FaceLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

export type EmotionType = 'happy' | 'sad' | 'neutral' | 'surprised' | 'angry';

export interface EmotionResult {
  emotion: EmotionType;
  confidence: number;
  timestamp: number;
}

export class EmotionDetector {
  private faceLandmarker: FaceLandmarker | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private stream: MediaStream | null = null;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private onEmotionCallback: ((result: EmotionResult) => void) | null = null;
  private lastEmotionTime: number = 0;
  private emotionThrottle: number = 1000; // Detect emotion every 1 second

  async initialize(): Promise<boolean> {
    try {
      console.log('🎭 Initializing MediaPipe Face Landmarker...');
      
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      console.log('✅ MediaPipe Face Landmarker initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize MediaPipe:', error);
      return false;
    }
  }

  async startCamera(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): Promise<boolean> {
    try {
      this.videoElement = videoElement;
      this.canvasElement = canvasElement;

      console.log('📹 Starting camera...');
      
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      this.videoElement.srcObject = this.stream;
      
      await new Promise<void>((resolve) => {
        this.videoElement!.onloadedmetadata = () => {
          this.videoElement!.play();
          resolve();
        };
      });

      console.log('✅ Camera started successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to start camera:', error);
      return false;
    }
  }

  startDetection(callback: (result: EmotionResult) => void): void {
    if (!this.faceLandmarker || !this.videoElement || !this.canvasElement) {
      console.error('❌ Cannot start detection: components not initialized');
      return;
    }

    this.onEmotionCallback = callback;
    this.isRunning = true;
    this.detectEmotion();
    console.log('🎭 Emotion detection started');
  }

  private detectEmotion = (): void => {
    if (!this.isRunning || !this.faceLandmarker || !this.videoElement || !this.canvasElement) {
      return;
    }

    const currentTime = Date.now();
    
    // Throttle emotion detection
    if (currentTime - this.lastEmotionTime >= this.emotionThrottle) {
      try {
        const results = this.faceLandmarker.detectForVideo(
          this.videoElement,
          performance.now()
        );

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];
          const emotion = this.analyzeEmotion(landmarks);
          
          if (this.onEmotionCallback) {
            this.onEmotionCallback(emotion);
          }

          this.lastEmotionTime = currentTime;
        }
      } catch (error) {
        console.error('Error detecting emotion:', error);
      }
    }

    this.animationFrameId = requestAnimationFrame(this.detectEmotion);
  };

  private analyzeEmotion(landmarks: any[]): EmotionResult {
    // Key facial landmarks for emotion detection
    // Mouth corners: 61 (left), 291 (right)
    // Mouth top: 13
    // Mouth bottom: 14
    // Left eye: 159 (top), 145 (bottom)
    // Right eye: 386 (top), 374 (bottom)
    // Left eyebrow: 70 (inner), 105 (outer)
    // Right eyebrow: 300 (inner), 334 (outer)

    const mouthLeft = landmarks[61];
    const mouthRight = landmarks[291];
    const mouthTop = landmarks[13];
    const mouthBottom = landmarks[14];
    
    const leftEyeTop = landmarks[159];
    const leftEyeBottom = landmarks[145];
    const rightEyeTop = landmarks[386];
    const rightEyeBottom = landmarks[374];
    
    const leftEyebrowInner = landmarks[70];
    const leftEyebrowOuter = landmarks[105];
    const rightEyebrowInner = landmarks[300];
    const rightEyebrowOuter = landmarks[334];

    // Calculate mouth width and height
    const mouthWidth = Math.abs(mouthRight.x - mouthLeft.x);
    const mouthHeight = Math.abs(mouthBottom.y - mouthTop.y);
    const mouthAspectRatio = mouthHeight / mouthWidth;

    // Calculate eye openness
    const leftEyeHeight = Math.abs(leftEyeBottom.y - leftEyeTop.y);
    const rightEyeHeight = Math.abs(rightEyeBottom.y - rightEyeTop.y);
    const avgEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;

    // Calculate eyebrow position (higher = surprised/happy, lower = sad/angry)
    const leftEyebrowHeight = leftEyebrowOuter.y;
    const rightEyebrowHeight = rightEyebrowOuter.y;
    const avgEyebrowHeight = (leftEyebrowHeight + rightEyebrowHeight) / 2;

    // Calculate mouth corners position (up = happy, down = sad)
    const mouthCenterY = (mouthLeft.y + mouthRight.y) / 2;
    const mouthCornerAngle = mouthCenterY - mouthTop.y;

    // Emotion detection logic
    let emotion: EmotionType = 'neutral';
    let confidence = 0.5;

    // Happy/Laughing: Wide smile, mouth open, eyes slightly closed
    if (mouthAspectRatio > 0.3 && mouthCornerAngle < -0.01) {
      emotion = 'happy';
      confidence = Math.min(0.95, 0.6 + mouthAspectRatio * 1.5);
    }
    // Sad: Mouth corners down, eyebrows down
    else if (mouthCornerAngle > 0.005 && avgEyebrowHeight > 0.35) {
      emotion = 'sad';
      confidence = Math.min(0.9, 0.6 + Math.abs(mouthCornerAngle) * 10);
    }
    // Surprised: Eyes wide open, mouth open, eyebrows raised
    else if (avgEyeHeight > 0.025 && mouthAspectRatio > 0.25 && avgEyebrowHeight < 0.3) {
      emotion = 'surprised';
      confidence = Math.min(0.9, 0.6 + avgEyeHeight * 15);
    }
    // Angry: Eyebrows down and together, mouth tight
    else if (avgEyebrowHeight > 0.36 && mouthAspectRatio < 0.15) {
      emotion = 'angry';
      confidence = 0.75;
    }
    // Neutral: Default state
    else {
      emotion = 'neutral';
      confidence = 0.7;
    }

    return {
      emotion,
      confidence,
      timestamp: Date.now()
    };
  }

  stopDetection(): void {
    this.isRunning = false;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    console.log('🛑 Emotion detection stopped');
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    console.log('📹 Camera stopped');
  }

  cleanup(): void {
    this.stopDetection();
    this.stopCamera();
    this.faceLandmarker = null;
    this.videoElement = null;
    this.canvasElement = null;
    this.onEmotionCallback = null;
    console.log('🧹 Emotion detector cleaned up');
  }
}

// Singleton instance
let emotionDetectorInstance: EmotionDetector | null = null;

export const getEmotionDetector = (): EmotionDetector => {
  if (!emotionDetectorInstance) {
    emotionDetectorInstance = new EmotionDetector();
  }
  return emotionDetectorInstance;
};
