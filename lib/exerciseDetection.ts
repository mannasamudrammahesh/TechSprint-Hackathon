// Enhanced Exercise Detection System with fallback implementation
// Provides real-time monitoring for various mental health exercises
// Uses browser-compatible motion detection as fallback

export interface ExerciseMetrics {
  exerciseType: string;
  score: number;
  accuracy: number;
  reps: number;
  duration: number;
  feedback: string;
  isCorrectForm: boolean;
}

export interface BodyLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface ExerciseConfig {
  name: string;
  description: string;
  duration: number;
  targetReps: number;
  scoreMultiplier: number;
}

export type ExerciseType = 'deep-breathing' | 'shoulder-rolls' | 'neck-stretches' | 'arm-raises' | 'meditation-posture' | 'eye-exercises';

export class ExerciseDetector {
  private isInitialized = false;
  private currentExercise: ExerciseType | '' = '';
  private startTime: number = 0;
  private repCount = 0;
  private lastPoseState: string = '';
  private exerciseHistory: ExerciseMetrics[] = [];
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private lastFrameData: ImageData | null = null;

  // Exercise-specific thresholds and configurations
  private exerciseConfigs: Record<ExerciseType, ExerciseConfig> = {
    'deep-breathing': {
      name: 'Deep Breathing',
      description: 'Monitor chest expansion and breathing rhythm',
      duration: 60000, // 1 minute
      targetReps: 10,
      scoreMultiplier: 10
    },
    'shoulder-rolls': {
      name: 'Shoulder Rolls',
      description: 'Detect shoulder movement patterns',
      duration: 30000, // 30 seconds
      targetReps: 8,
      scoreMultiplier: 12
    },
    'neck-stretches': {
      name: 'Neck Stretches',
      description: 'Monitor neck movement and posture',
      duration: 45000, // 45 seconds
      targetReps: 6,
      scoreMultiplier: 15
    },
    'arm-raises': {
      name: 'Arm Raises',
      description: 'Track arm elevation and coordination',
      duration: 40000, // 40 seconds
      targetReps: 10,
      scoreMultiplier: 8
    },
    'meditation-posture': {
      name: 'Meditation Posture',
      description: 'Monitor sitting posture and stillness',
      duration: 120000, // 2 minutes
      targetReps: 1,
      scoreMultiplier: 20
    },
    'eye-exercises': {
      name: 'Eye Exercises',
      description: 'Track head movement for eye relaxation',
      duration: 30000, // 30 seconds
      targetReps: 8,
      scoreMultiplier: 10
    }
  };

  async initialize(videoElement?: HTMLVideoElement): Promise<boolean> {
    try {
      // Create canvas for motion detection
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
      
      if (videoElement) {
        this.videoElement = videoElement;
        this.canvas.width = videoElement.videoWidth || 640;
        this.canvas.height = videoElement.videoHeight || 480;
      }

      this.isInitialized = true;
      console.log('Exercise detector initialized with fallback motion detection');
      return true;
    } catch (error) {
      console.error('Failed to initialize exercise detector:', error);
      return false;
    }
  }

  startExercise(exerciseType: ExerciseType): boolean {
    if (!this.isInitialized || !this.exerciseConfigs[exerciseType]) {
      return false;
    }

    this.currentExercise = exerciseType;
    this.startTime = Date.now();
    this.repCount = 0;
    this.lastPoseState = '';
    
    console.log(`Started exercise: ${this.exerciseConfigs[exerciseType].name}`);
    return true;
  }

  async detectExercise(videoElement: HTMLVideoElement): Promise<ExerciseMetrics | null> {
    if (!this.isInitialized || !this.currentExercise) {
      return null;
    }

    try {
      // Use motion detection as fallback
      const motionData = this.detectMotion(videoElement);
      return this.analyzeExerciseWithMotion(motionData);
    } catch (error) {
      console.error('Exercise detection error:', error);
    }

    return null;
  }

  private detectMotion(videoElement: HTMLVideoElement): { intensity: number; regions: any } {
    if (!this.context || !this.canvas) {
      return { intensity: 0, regions: {} };
    }

    // Draw current frame to canvas
    this.context.drawImage(videoElement, 0, 0, this.canvas.width, this.canvas.height);
    const currentFrameData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

    if (!this.lastFrameData) {
      this.lastFrameData = currentFrameData;
      return { intensity: 0, regions: {} };
    }

    // Calculate motion intensity
    let totalDiff = 0;
    const regions = {
      upper: 0, // Upper body motion
      center: 0, // Center/chest motion
      arms: 0   // Arm motion
    };

    for (let i = 0; i < currentFrameData.data.length; i += 4) {
      const diff = Math.abs(currentFrameData.data[i] - this.lastFrameData.data[i]) +
                   Math.abs(currentFrameData.data[i + 1] - this.lastFrameData.data[i + 1]) +
                   Math.abs(currentFrameData.data[i + 2] - this.lastFrameData.data[i + 2]);
      
      totalDiff += diff;
      
      // Calculate pixel position for region detection
      const pixelIndex = i / 4;
      const y = Math.floor(pixelIndex / this.canvas.width);
      const x = pixelIndex % this.canvas.width;
      
      // Assign motion to regions
      if (y < this.canvas.height * 0.4) regions.upper += diff;
      else if (y < this.canvas.height * 0.7) regions.center += diff;
      else regions.arms += diff;
    }

    this.lastFrameData = currentFrameData;
    const intensity = totalDiff / (this.canvas.width * this.canvas.height * 255 * 3);
    
    return { intensity, regions };
  }

  private analyzeExerciseWithMotion(motionData: { intensity: number; regions: any }): ExerciseMetrics {
    if (!this.currentExercise) {
      throw new Error('No exercise currently active');
    }
    const config = this.exerciseConfigs[this.currentExercise as ExerciseType];
    const elapsed = Date.now() - this.startTime;
    const progress = Math.min(elapsed / config.duration, 1);

    let metrics: ExerciseMetrics = {
      exerciseType: this.currentExercise,
      score: 0,
      accuracy: 0,
      reps: this.repCount,
      duration: elapsed,
      feedback: '',
      isCorrectForm: false
    };

    switch (this.currentExercise) {
      case 'deep-breathing':
        metrics = this.analyzeBreathingMotion(motionData, metrics);
        break;
      case 'shoulder-rolls':
        metrics = this.analyzeShoulderRollsMotion(motionData, metrics);
        break;
      case 'neck-stretches':
        metrics = this.analyzeNeckStretchesMotion(motionData, metrics);
        break;
      case 'arm-raises':
        metrics = this.analyzeArmRaisesMotion(motionData, metrics);
        break;
      case 'meditation-posture':
        metrics = this.analyzeMeditationPostureMotion(motionData, metrics);
        break;
      case 'eye-exercises':
        metrics = this.analyzeEyeExercisesMotion(motionData, metrics);
        break;
    }

    // Calculate final score based on accuracy, reps, and time
    const targetReps = config.targetReps;
    const repScore = Math.min(this.repCount / targetReps, 1) * 50;
    const accuracyScore = metrics.accuracy * 30;
    const timeScore = progress * 20;
    
    metrics.score = Math.round(repScore + accuracyScore + timeScore);
    
    return metrics;
  }

  private analyzeBreathingMotion(motionData: { intensity: number; regions: any }, metrics: ExerciseMetrics): ExerciseMetrics {
    // Monitor chest movement for breathing
    const chestMotion = motionData.regions.center;
    const currentState = chestMotion > 0.02 ? 'inhale' : 'exhale';
    
    if (this.lastPoseState !== currentState) {
      if (currentState === 'exhale' && this.lastPoseState === 'inhale') {
        this.repCount++;
      }
      this.lastPoseState = currentState;
    }

    metrics.accuracy = Math.min(chestMotion * 2000, 100);
    metrics.isCorrectForm = chestMotion > 0.01;
    metrics.feedback = metrics.isCorrectForm 
      ? `Great breathing! ${this.repCount} deep breaths completed.`
      : 'Try to breathe deeper and expand your chest more.';

    return metrics;
  }

  private analyzeShoulderRollsMotion(motionData: { intensity: number; regions: any }, metrics: ExerciseMetrics): ExerciseMetrics {
    const shoulderMotion = motionData.regions.upper;
    const currentState = shoulderMotion > 0.03 ? 'moving' : 'still';
    
    if (this.lastPoseState !== currentState) {
      if (currentState === 'still' && this.lastPoseState === 'moving') {
        this.repCount++;
      }
      this.lastPoseState = currentState;
    }

    metrics.accuracy = Math.min(shoulderMotion * 1500, 100);
    metrics.isCorrectForm = shoulderMotion > 0.02;
    metrics.feedback = metrics.isCorrectForm
      ? `Excellent shoulder rolls! ${this.repCount} reps completed.`
      : 'Roll your shoulders in a smooth, circular motion.';

    return metrics;
  }

  private analyzeNeckStretchesMotion(motionData: { intensity: number; regions: any }, metrics: ExerciseMetrics): ExerciseMetrics {
    const headMotion = motionData.regions.upper;
    const currentState = headMotion > 0.025 ? 'stretched' : 'neutral';
    
    if (this.lastPoseState !== currentState) {
      if (currentState === 'neutral' && this.lastPoseState === 'stretched') {
        this.repCount++;
      }
      this.lastPoseState = currentState;
    }

    metrics.accuracy = Math.min(headMotion * 2000, 100);
    metrics.isCorrectForm = headMotion > 0.015;
    metrics.feedback = metrics.isCorrectForm
      ? `Good neck stretch! ${this.repCount} stretches completed.`
      : 'Gently tilt or turn your head to stretch your neck muscles.';

    return metrics;
  }

  private analyzeArmRaisesMotion(motionData: { intensity: number; regions: any }, metrics: ExerciseMetrics): ExerciseMetrics {
    const armMotion = motionData.regions.arms;
    const currentState = armMotion > 0.04 ? 'raised' : 'lowered';
    
    if (this.lastPoseState !== currentState) {
      if (currentState === 'lowered' && this.lastPoseState === 'raised') {
        this.repCount++;
      }
      this.lastPoseState = currentState;
    }

    metrics.accuracy = Math.min(armMotion * 1250, 100);
    metrics.isCorrectForm = armMotion > 0.025;
    metrics.feedback = metrics.isCorrectForm
      ? `Perfect arm raises! ${this.repCount} reps completed.`
      : 'Raise your arms higher, ideally to shoulder level or above.';

    return metrics;
  }

  private analyzeMeditationPostureMotion(motionData: { intensity: number; regions: any }, metrics: ExerciseMetrics): ExerciseMetrics {
    const stillness = 1 - motionData.intensity;
    
    metrics.accuracy = Math.min(stillness * 120, 100);
    metrics.isCorrectForm = stillness > 0.8;
    metrics.reps = 1; // Meditation is about maintaining posture
    metrics.feedback = metrics.isCorrectForm
      ? 'Excellent meditation posture! Stay relaxed and centered.'
      : 'Try to stay still and maintain a steady posture.';

    return metrics;
  }

  private analyzeEyeExercisesMotion(motionData: { intensity: number; regions: any }, metrics: ExerciseMetrics): ExerciseMetrics {
    const headMotion = motionData.regions.upper;
    const currentState = headMotion > 0.03 ? 'moving' : 'still';
    
    if (this.lastPoseState !== currentState) {
      if (currentState === 'still' && this.lastPoseState === 'moving') {
        this.repCount++;
      }
      this.lastPoseState = currentState;
    }

    metrics.accuracy = Math.min(headMotion * 1500, 100);
    metrics.isCorrectForm = headMotion > 0.02;
    metrics.feedback = metrics.isCorrectForm
      ? `Good eye exercise! ${this.repCount} movements completed.`
      : 'Move your head to look in different directions for eye relaxation.';

    return metrics;
  }

  getExerciseConfig(exerciseType: ExerciseType): ExerciseConfig | null {
    return this.exerciseConfigs[exerciseType] || null;
  }

  getAvailableExercises(): ExerciseType[] {
    return Object.keys(this.exerciseConfigs) as ExerciseType[];
  }

  stopExercise(): ExerciseMetrics | null {
    if (!this.currentExercise) {
      return null;
    }

    const config = this.exerciseConfigs[this.currentExercise as ExerciseType];
    const elapsed = Date.now() - this.startTime;
    
    const finalMetrics: ExerciseMetrics = {
      exerciseType: this.currentExercise,
      score: Math.round((this.repCount / config.targetReps) * 100),
      accuracy: 85, // Default accuracy for completed exercise
      reps: this.repCount,
      duration: elapsed,
      feedback: `Exercise completed! You performed ${this.repCount} reps in ${Math.round(elapsed / 1000)} seconds.`,
      isCorrectForm: true
    };

    this.exerciseHistory.push(finalMetrics);
    this.currentExercise = '';
    this.repCount = 0;
    
    return finalMetrics;
  }

  getExerciseHistory(): ExerciseMetrics[] {
    return [...this.exerciseHistory];
  }

  cleanup(): void {
    this.canvas = null;
    this.context = null;
    this.videoElement = null;
    this.lastFrameData = null;
    this.isInitialized = false;
  }
}

// Singleton instance
export const exerciseDetector = new ExerciseDetector();
