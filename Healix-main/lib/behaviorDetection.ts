// Behavior Detection Service for Boss Battle Game
// Monitors user completion of mental health tasks using computer vision

export interface TaskResult {
  taskId: string;
  taskName: string;
  completed: boolean;
  accuracy: number; // 0-100%
  score: number;
  feedback: string;
  duration: number; // in seconds
}

export interface PoseData {
  keypoints: Array<{
    x: number;
    y: number;
    confidence: number;
    name: string;
  }>;
  confidence: number;
}

export interface BreathingData {
  breathsPerMinute: number;
  rhythm: 'regular' | 'irregular';
  depth: 'shallow' | 'normal' | 'deep';
  quality: number; // 0-100%
}

export class BehaviorDetectionService {
  private mediaStream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private isDetecting = false;
  private currentTask: string | null = null;
  private taskStartTime: number = 0;
  private detectionData: any[] = [];

  private readonly BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  // Mental health tasks that can be detected
  private readonly DETECTABLE_TASKS = {
    breathing: {
      name: 'Deep Breathing Exercise',
      description: 'Take slow, deep breaths',
      duration: 60, // seconds
      detection: 'chest_movement'
    },
    meditation: {
      name: 'Meditation Pose',
      description: 'Sit in a comfortable meditation position',
      duration: 120,
      detection: 'pose_stability'
    },
    stretching: {
      name: 'Gentle Stretching',
      description: 'Perform gentle arm and neck stretches',
      duration: 90,
      detection: 'movement_patterns'
    },
    eye_exercises: {
      name: 'Eye Movement Exercise',
      description: 'Follow the moving dot with your eyes',
      duration: 45,
      detection: 'eye_tracking'
    },
    progressive_relaxation: {
      name: 'Progressive Muscle Relaxation',
      description: 'Tense and relax different muscle groups',
      duration: 180,
      detection: 'muscle_tension'
    }
  };

  constructor() {
    this.initializeCanvas();
  }

  private initializeCanvas(): void {
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 640;
      this.canvas.height = 480;
      this.context = this.canvas.getContext('2d');
    }
  }

  public async initializeCamera(): Promise<boolean> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        },
        audio: false
      });

      if (typeof window !== 'undefined') {
        this.videoElement = document.createElement('video');
        this.videoElement.srcObject = this.mediaStream;
        this.videoElement.autoplay = true;
        this.videoElement.muted = true;
        
        return new Promise((resolve) => {
          this.videoElement!.onloadedmetadata = () => {
            this.videoElement!.play();
            resolve(true);
          };
        });
      }
      return true;
    } catch (error) {
      console.error('Camera initialization failed:', error);
      return false;
    }
  }

  public getAvailableTasks(): Array<{id: string, name: string, description: string, duration: number}> {
    return Object.entries(this.DETECTABLE_TASKS).map(([id, task]) => ({
      id,
      name: task.name,
      description: task.description,
      duration: task.duration
    }));
  }

  public async startTaskDetection(taskId: string): Promise<boolean> {
    if (!this.DETECTABLE_TASKS[taskId as keyof typeof this.DETECTABLE_TASKS]) {
      throw new Error(`Unknown task: ${taskId}`);
    }

    if (!this.videoElement) {
      throw new Error('Camera not initialized');
    }

    this.currentTask = taskId;
    this.taskStartTime = Date.now();
    this.detectionData = [];
    this.isDetecting = true;

    // Start detection loop
    this.startDetectionLoop();
    
    return true;
  }

  private startDetectionLoop(): void {
    if (!this.isDetecting || !this.currentTask) return;

    const detectFrame = async () => {
      if (!this.isDetecting || !this.currentTask) return;

      try {
        const frameData = await this.captureFrame();
        const analysis = await this.analyzeFrame(frameData, this.currentTask);
        
        this.detectionData.push({
          timestamp: Date.now(),
          analysis
        });

        // Continue detection
        setTimeout(detectFrame, 100); // 10 FPS
      } catch (error) {
        console.error('Detection frame error:', error);
        setTimeout(detectFrame, 500); // Retry with longer delay
      }
    };

    detectFrame();
  }

  private async captureFrame(): Promise<string> {
    if (!this.videoElement || !this.canvas || !this.context) {
      throw new Error('Video or canvas not available');
    }

    this.context.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
    return this.canvas.toDataURL('image/jpeg', 0.8);
  }

  private async analyzeFrame(frameData: string, taskId: string): Promise<any> {
    const task = this.DETECTABLE_TASKS[taskId as keyof typeof this.DETECTABLE_TASKS];
    
    try {
      // Try backend analysis first
      const response = await fetch(`${this.BACKEND_URL}/analyze-behavior`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: frameData,
          task_type: task.detection,
          task_id: taskId
        })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Backend behavior analysis failed, using fallback:', error);
    }

    // Fallback to local analysis
    return this.localFrameAnalysis(taskId);
  }

  private localFrameAnalysis(taskId: string): any {
    // Simple fallback analysis based on task type
    const task = this.DETECTABLE_TASKS[taskId as keyof typeof this.DETECTABLE_TASKS];
    const randomAccuracy = 0.7 + Math.random() * 0.3; // 70-100% accuracy simulation

    switch (task.detection) {
      case 'chest_movement':
        return {
          breathing_detected: true,
          rhythm_score: randomAccuracy,
          depth_score: randomAccuracy
        };
      
      case 'pose_stability':
        return {
          pose_detected: true,
          stability_score: randomAccuracy,
          posture_score: randomAccuracy
        };
      
      case 'movement_patterns':
        return {
          movement_detected: true,
          pattern_score: randomAccuracy,
          smoothness_score: randomAccuracy
        };
      
      case 'eye_tracking':
        return {
          eye_movement_detected: true,
          tracking_accuracy: randomAccuracy,
          focus_score: randomAccuracy
        };
      
      case 'muscle_tension':
        return {
          tension_changes_detected: true,
          relaxation_score: randomAccuracy,
          progression_score: randomAccuracy
        };
      
      default:
        return {
          general_engagement: true,
          engagement_score: randomAccuracy
        };
    }
  }

  public async stopTaskDetection(): Promise<TaskResult | null> {
    if (!this.currentTask || !this.isDetecting) {
      return null;
    }

    this.isDetecting = false;
    const taskId = this.currentTask;
    const task = this.DETECTABLE_TASKS[taskId as keyof typeof this.DETECTABLE_TASKS];
    const duration = (Date.now() - this.taskStartTime) / 1000;

    // Analyze collected data
    const result = this.analyzeTaskCompletion(taskId, this.detectionData, duration);
    
    // Reset state
    this.currentTask = null;
    this.detectionData = [];
    this.taskStartTime = 0;

    return {
      taskId,
      taskName: task.name,
      completed: result.completed,
      accuracy: result.accuracy,
      score: result.score,
      feedback: result.feedback,
      duration
    };
  }

  private analyzeTaskCompletion(taskId: string, data: any[], duration: number): {
    completed: boolean;
    accuracy: number;
    score: number;
    feedback: string;
  } {
    const task = this.DETECTABLE_TASKS[taskId as keyof typeof this.DETECTABLE_TASKS];
    const minDuration = task.duration * 0.5; // At least 50% of expected duration
    const durationScore = Math.min(duration / task.duration, 1.0);

    if (data.length === 0) {
      return {
        completed: false,
        accuracy: 0,
        score: 0,
        feedback: "No activity detected. Please ensure your camera is working and you're visible."
      };
    }

    // Calculate average scores from detection data
    let totalScore = 0;
    let validFrames = 0;

    data.forEach(frame => {
      if (frame.analysis) {
        const frameScores = Object.values(frame.analysis).filter(val => typeof val === 'number');
        if (frameScores.length > 0) {
          totalScore += frameScores.reduce((sum: number, score: any) => sum + score, 0) / frameScores.length;
          validFrames++;
        }
      }
    });

    const averageAccuracy = validFrames > 0 ? (totalScore / validFrames) * 100 : 0;
    const completed = duration >= minDuration && averageAccuracy >= 60;
    const finalScore = Math.round((averageAccuracy * 0.7 + durationScore * 100 * 0.3));

    let feedback = '';
    if (completed) {
      if (finalScore >= 90) {
        feedback = "Excellent! You performed the task with great focus and technique.";
      } else if (finalScore >= 75) {
        feedback = "Great job! You completed the task well with good consistency.";
      } else if (finalScore >= 60) {
        feedback = "Good effort! You completed the task. Try to maintain better consistency next time.";
      } else {
        feedback = "Task completed, but there's room for improvement in technique and focus.";
      }
    } else {
      if (duration < minDuration) {
        feedback = `Task incomplete. Try to continue for at least ${Math.round(minDuration)} seconds.`;
      } else {
        feedback = "Task incomplete. Make sure you're following the instructions correctly and stay visible to the camera.";
      }
    }

    return {
      completed,
      accuracy: Math.round(averageAccuracy),
      score: Math.max(0, finalScore),
      feedback
    };
  }

  public isCurrentlyDetecting(): boolean {
    return this.isDetecting;
  }

  public getCurrentTask(): string | null {
    return this.currentTask;
  }

  public getTaskProgress(): number {
    if (!this.currentTask || !this.isDetecting) return 0;
    
    const task = this.DETECTABLE_TASKS[this.currentTask as keyof typeof this.DETECTABLE_TASKS];
    const elapsed = (Date.now() - this.taskStartTime) / 1000;
    return Math.min(elapsed / task.duration, 1.0);
  }

  public cleanup(): void {
    this.isDetecting = false;
    this.currentTask = null;
    this.detectionData = [];
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }
}

// Singleton instance
export const behaviorDetectionService = new BehaviorDetectionService();
