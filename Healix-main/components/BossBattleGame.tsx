"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { enhancedExerciseDetector, ExerciseMetrics } from '@/lib/enhancedExerciseDetection';
import ExerciseScoreCard from '@/components/ExerciseScoreCard';
import { 
  Sword, 
  Shield, 
  Heart, 
  Zap, 
  Target, 
  Timer, 
  Camera,
  Activity,
  Brain,
  Sparkles,
  TrendingUp,
  Eye,
  Rotate3D,
  ArrowUp,
  Wind,
  CameraOff,
  Trophy,
  CheckCircle,
  Play,
  Star,
  type LucideIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MentalHealthIssue {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  challengeHp: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface MentalHealthTask {
  id: string;
  name: string;
  description: string;
  type: 'breathing' | 'meditation' | 'affirmation' | 'visualization' | 'grounding';
  duration: number;
  instructions: string[];
  damage: number;
  icon: LucideIcon;
  requiresCamera: boolean;
}

interface GameState {
  phase: 'issue-selection' | 'preparation' | 'battle' | 'task' | 'results' | 'victory' | 'defeat';
  playerHealth: number;
  challengeHealth: number;
  currentTask: MentalHealthTask | null;
  taskTimer: number;
  score: number;
  completedTasks: string[];
  availableTasks: MentalHealthTask[];
  cameraEnabled: boolean;
  breathingScore: number;
  breathingRate: number;
  isBreathingDetected: boolean;
  selectedIssue: MentalHealthIssue | null;
  streakCount: number;
  lastTaskMetrics: ExerciseMetrics | null;
  lastTaskDamage: number;
}

const MENTAL_HEALTH_ISSUES: MentalHealthIssue[] = [
  {
    id: 'anxiety',
    name: 'Anxiety Shadow',
    description: 'Overcome anxiety through mindful practices',
    emoji: '😰',
    color: 'from-red-500 to-orange-500',
    challengeHp: 100,
    difficulty: 'beginner'
  },
  {
    id: 'depression',
    name: 'Depression Cloud',
    description: 'Lift the fog of depression with positive actions',
    emoji: '😔',
    color: 'from-blue-600 to-purple-600',
    challengeHp: 150,
    difficulty: 'advanced'
  },
  {
    id: 'stress',
    name: 'Stress Demon',
    description: 'Battle daily stress with calming techniques',
    emoji: '😤',
    color: 'from-yellow-500 to-red-500',
    challengeHp: 100,
    difficulty: 'beginner'
  }
];

const MENTAL_HEALTH_TASKS: MentalHealthTask[] = [
  {
    id: 'deep-breathing',
    name: 'Deep Breathing Exercise',
    description: 'Take 10 deep breaths while AI monitors your chest expansion',
    type: 'breathing',
    duration: 60,
    instructions: ['Sit comfortably with your back straight', 'Inhale slowly through your nose for 4 counts', 'Hold your breath for 4 counts', 'Exhale slowly through your mouth for 6 counts'],
    damage: 15,
    requiresCamera: true,
    icon: Activity
  },
  {
    id: 'shoulder-rolls',
    name: 'Shoulder Tension Release',
    description: 'Perform shoulder rolls to release stress and tension',
    type: 'meditation',
    duration: 30,
    instructions: ['Sit or stand with arms at your sides', 'Slowly roll shoulders forward 5 times', 'Slowly roll shoulders backward 5 times', 'Repeat the sequence'],
    damage: 12,
    requiresCamera: true,
    icon: Rotate3D
  },
  {
    id: 'neck-stretches',
    name: 'Neck Stretches',
    description: 'Gentle neck movements to relieve tension',
    type: 'meditation',
    duration: 45,
    instructions: ['Slowly turn head left and hold for 5 seconds', 'Slowly turn head right and hold for 5 seconds', 'Tilt head left and hold for 5 seconds', 'Tilt head right and hold for 5 seconds'],
    damage: 18,
    requiresCamera: true,
    icon: ArrowUp
  },
  {
    id: 'arm-raises',
    name: 'Arm Raises',
    description: 'Raise your arms to improve circulation and energy',
    type: 'meditation',
    duration: 40,
    instructions: ['Stand with feet shoulder-width apart', 'Slowly raise both arms overhead', 'Hold for 3 seconds', 'Slowly lower arms to sides'],
    damage: 14,
    requiresCamera: true,
    icon: ArrowUp
  },
  {
    id: 'meditation-posture',
    name: 'Meditation Posture',
    description: 'Maintain proper meditation posture for mindfulness',
    type: 'meditation',
    duration: 120,
    instructions: ['Sit cross-legged or in a chair', 'Keep your back straight but relaxed', 'Rest hands on knees or lap', 'Close eyes and focus on breathing'],
    damage: 25,
    requiresCamera: true,
    icon: Brain
  },
  {
    id: 'eye-exercises',
    name: 'Eye Relaxation',
    description: 'Eye movements to reduce digital eye strain',
    type: 'meditation',
    duration: 30,
    instructions: ['Look up and down 5 times', 'Look left and right 5 times', 'Roll eyes clockwise 5 times', 'Roll eyes counter-clockwise 5 times'],
    damage: 10,
    requiresCamera: true,
    icon: Eye
  },
  {
    id: 'breathing',
    name: 'Deep Breathing',
    description: 'Practice 4-7-8 breathing technique',
    type: 'breathing',
    duration: 60,
    instructions: ['Inhale for 4 counts', 'Hold for 7 counts', 'Exhale for 8 counts'],
    damage: 25,
    requiresCamera: false,
    icon: Activity
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness Meditation',
    description: 'Focus on the present moment',
    type: 'meditation',
    duration: 90,
    instructions: ['Sit comfortably', 'Focus on your breath', 'Notice thoughts without judgment'],
    damage: 30,
    requiresCamera: false,
    icon: Brain
  },
  {
    id: 'affirmations',
    name: 'Positive Affirmations',
    description: 'Repeat empowering statements',
    type: 'affirmation',
    duration: 45,
    instructions: ['I am strong', 'I can handle this', 'I am worthy of peace'],
    damage: 20,
    requiresCamera: false,
    icon: Heart
  }
];

export default function MindQuestGame() {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'battle', // Start directly at battle phase, skip issue selection
    playerHealth: 100,
    challengeHealth: 100,
    currentTask: null,
    taskTimer: 0,
    score: 0,
    completedTasks: [],
    availableTasks: MENTAL_HEALTH_TASKS,
    cameraEnabled: false,
    breathingScore: 0,
    breathingRate: 0,
    isBreathingDetected: false,
    selectedIssue: MENTAL_HEALTH_ISSUES[0], // Auto-select first issue (Anxiety Shadow)
    streakCount: 0,
    lastTaskMetrics: null,
    lastTaskDamage: 0
  });
  
  const [exerciseMetrics, setExerciseMetrics] = useState<ExerciseMetrics | null>(null);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const exerciseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const latestMetricsRef = useRef<ExerciseMetrics | null>(null); // Store latest metrics
  const completingTaskRef = useRef(false); // Guard against double execution
  const timerRef = useRef<NodeJS.Timeout>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [breathingData, setBreathingData] = useState<number[]>([]);
  const [breathingRate, setBreathingRate] = useState(0);

  const selectIssue = (issue: MentalHealthIssue) => {
    setGameState(prev => ({
      ...prev,
      selectedIssue: issue,
      challengeHealth: issue.challengeHp,
      phase: 'preparation',
      completedTasks: [],
      streakCount: 0,
      cameraEnabled: false,
      breathingScore: 0,
      breathingRate: 0,
      isBreathingDetected: false
    }));
  };

  const startBattle = () => {
    setGameState(prev => ({
      ...prev,
      phase: 'battle'
    }));
  };

  const selectTask = (task: MentalHealthTask) => {
    console.log('🎯 Task selected:', task.name, 'Requires camera:', task.requiresCamera);
    
    setGameState(prev => ({
      ...prev,
      currentTask: task,
      taskTimer: task.duration,
      phase: 'task',
      breathingScore: 0,
      cameraEnabled: false // Reset camera state
    }));
    
    // Camera will be started by useEffect
    // Start task timer
    startTaskTimer(task);
  };

  const startTaskTimer = (task: MentalHealthTask) => {
    let taskCompleted = false; // Guard to prevent multiple calls
    
    timerRef.current = setInterval(() => {
      setGameState(prev => {
        const newTimer = prev.taskTimer - 1;
        // Only complete when timer actually reaches 0, not before
        if (newTimer === 0 && !taskCompleted) {
          taskCompleted = true; // Mark as completed
          console.log('⏰ Timer reached 0, calling completeTask...');
          // Use setTimeout to ensure the 0 is displayed before completing
          setTimeout(() => completeTask(task), 100);
        }
        return {
          ...prev,
          taskTimer: Math.max(0, newTimer) // Prevent negative values
        };
      });
    }, 1000);
  };

  const completeTask = async (task: MentalHealthTask) => {
    // Prevent double execution
    if (completingTaskRef.current) {
      console.log('⚠️ completeTask already running, skipping duplicate call');
      return;
    }
    
    completingTaskRef.current = true;
    console.log('🎯 completeTask called for:', task.name);
    console.log('🔍 isExerciseActive:', isExerciseActive);
    console.log('🔍 cameraEnabled:', gameState.cameraEnabled);
    
    // Clear timer first to prevent multiple calls
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }

    // CRITICAL: Get metrics DIRECTLY from detector, not from state
    let finalMetrics: ExerciseMetrics | null = null;
    
    // Clear the exercise interval FIRST
    if (exerciseIntervalRef.current) {
      clearInterval(exerciseIntervalRef.current);
      exerciseIntervalRef.current = null;
      console.log('✅ Cleared exercise interval');
    }
    
    if (isExerciseActive) {
      console.log('🏃 Exercise is active, getting final metrics...');
      
      // Try multiple sources for metrics (in order of preference):
      // 1. Latest from ref (most recent)
      // 2. Current from detector
      // 3. Stopped metrics
      
      finalMetrics = latestMetricsRef.current;
      console.log('📊 Metrics from ref:', finalMetrics);
      
      if (!finalMetrics) {
        finalMetrics = enhancedExerciseDetector.getCurrentMetrics();
        console.log('📊 Metrics from detector.getCurrentMetrics():', finalMetrics);
      }
      
      // Now stop the exercise
      const stoppedMetrics = enhancedExerciseDetector.stopExercise();
      console.log('🛑 Stopped exercise, returned:', stoppedMetrics);
      
      // Use stopped metrics if available and better
      if (stoppedMetrics) {
        finalMetrics = stoppedMetrics;
      }
      
      setIsExerciseActive(false);
      latestMetricsRef.current = null; // Clear ref
    } else {
      console.log('⚠️ Exercise not active, checking all sources...');
      // Try ref first, then detector
      finalMetrics = latestMetricsRef.current || enhancedExerciseDetector.getCurrentMetrics();
      console.log('📊 Metrics from fallback:', finalMetrics);
    }

    // Use final metrics or create default ones
    const metricsToUse = finalMetrics || {
      exerciseType: task.id,
      score: 50,
      accuracy: 70,
      reps: task.requiresCamera ? 0 : 5, // Show 0 reps if camera tracking failed
      duration: task.duration * 1000,
      feedback: task.requiresCamera 
        ? 'Exercise completed! AI tracking was unavailable - make sure camera is enabled and you are visible.' 
        : 'Exercise completed! Great job staying focused on the breathing technique.',
      isCorrectForm: true,
      performancePoints: task.requiresCamera ? 100 : 150,
      bonusPoints: 0
    };
    
    // Log warning if camera exercise but no real metrics
    if (task.requiresCamera && !finalMetrics) {
      console.warn('⚠️ Camera exercise completed but no AI metrics captured!');
      console.warn('🔍 Check: Was camera enabled?', gameState.cameraEnabled);
      console.warn('🔍 Check: Was exercise active?', isExerciseActive);
      console.warn('🔍 Check: Ref had data?', latestMetricsRef.current);
    }

    console.log('✅ Final metrics to use:', {
      performancePoints: metricsToUse.performancePoints,
      score: metricsToUse.score,
      accuracy: metricsToUse.accuracy,
      reps: metricsToUse.reps,
      bonusPoints: metricsToUse.bonusPoints,
      feedback: metricsToUse.feedback
    });
    
    console.log('🎯 CRITICAL - Metrics that will be shown on results screen:', metricsToUse);

    // Calculate damage based on exercise performance
    let taskDamage = task.damage;
    if (task.requiresCamera && gameState.cameraEnabled && finalMetrics) {
      const performanceBonus = Math.floor(finalMetrics.score / 10);
      const accuracyBonus = Math.floor(finalMetrics.accuracy / 20);
      const totalBonus = performanceBonus + accuracyBonus;
      taskDamage += totalBonus;
      
      console.log('📊 Damage calculation:', {
        baseDamage: task.damage,
        performanceBonus,
        accuracyBonus,
        totalBonus,
        finalDamage: taskDamage
      });
    }

    const damage = taskDamage + (gameState.streakCount * 5);
    const newChallengeHp = Math.max(0, gameState.challengeHealth - damage);
    const newStreak = gameState.streakCount + 1;
    const isVictory = newChallengeHp <= 0;

    console.log('✅ Task completion summary:', {
      taskName: task.name,
      baseDamage: task.damage,
      totalDamage: damage,
      metricsScore: metricsToUse.score,
      metricsAccuracy: metricsToUse.accuracy,
      performancePoints: metricsToUse.performancePoints,
      reps: metricsToUse.reps
    });

    // ALWAYS stop camera after task completion if it was used
    if (task.requiresCamera) {
      console.log('🎥 Stopping camera after task completion...');
      await stopCamera();
    }

    // Log comparison between what user saw and what will be displayed
    if (exerciseMetrics) {
      console.log('⚠️ SCORE COMPARISON:');
      console.log('  During task (what user saw):', {
        performancePoints: exerciseMetrics.performancePoints,
        score: exerciseMetrics.score,
        reps: exerciseMetrics.reps
      });
      console.log('  Results screen (what will show):', {
        performancePoints: metricsToUse.performancePoints,
        score: metricsToUse.score,
        reps: metricsToUse.reps
      });
      
      if (exerciseMetrics.performancePoints !== metricsToUse.performancePoints) {
        console.error('❌ MISMATCH DETECTED! Scores are different!');
        console.error('  User saw:', exerciseMetrics.performancePoints);
        console.error('  Will show:', metricsToUse.performancePoints);
      } else {
        console.log('✅ Scores match!');
      }
    }
    
    // Go to results phase to show score
    setGameState(prev => ({
      ...prev,
      challengeHealth: newChallengeHp,
      completedTasks: [...prev.completedTasks, task.id],
      score: prev.score + damage,
      streakCount: newStreak,
      phase: 'results',
      taskTimer: 0,
      lastTaskMetrics: metricsToUse,
      lastTaskDamage: damage
    }));

    // Show victory message if boss defeated
    if (isVictory) {
      setTimeout(() => {
        toast.success('🎉 Victory! You conquered the MindQuest challenge!');
      }, 500);
    }
    
    // Reset guard after completion
    setTimeout(() => {
      completingTaskRef.current = false;
    }, 1000);
  };

  // Camera and breathing detection functions
  const startCamera = async () => {
    try {
      console.log('🎥 Starting camera...');
      
      if (!videoRef.current || !canvasRef.current) {
        console.error('Video or canvas element not ready');
        toast.error('Video or canvas element not ready. Please try again.');
        return;
      }

      console.log('✅ Video and canvas elements found');

      // Request camera access first
      const loadingToast = toast.loading('Requesting camera access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false 
      });
      
      console.log('✅ Camera stream obtained');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        await new Promise((resolve, reject) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = async () => {
              try {
                await videoRef.current?.play();
                console.log('✅ Video playing');
                resolve(true);
              } catch (err) {
                console.error('Error playing video:', err);
                reject(err);
              }
            };
            
            // Timeout after 5 seconds
            setTimeout(() => reject(new Error('Video load timeout')), 5000);
          } else {
            reject(new Error('Video ref lost'));
          }
        });

        toast.dismiss(loadingToast);
        toast.success('📹 Camera activated!');
        
        // Mark camera as enabled immediately
        setGameState(prev => ({ ...prev, cameraEnabled: true }));
        
        // Initialize enhanced exercise detector with video and canvas
        setTimeout(async () => {
          try {
            console.log('🤖 Initializing MediaPipe AI...');
            const initialized = await enhancedExerciseDetector.initialize(
              videoRef.current!,
              canvasRef.current!
            );
            
            if (initialized) {
              console.log('✅ MediaPipe initialized successfully');
              toast.success('🎯 AI exercise detection activated!');
              
              // Start the selected exercise
              if (gameState.currentTask) {
                startExerciseDetection(gameState.currentTask.id);
              }
            } else {
              console.warn('⚠️ MediaPipe initialization returned false');
              toast('⚠️ AI detection unavailable. Using basic tracking.', { icon: '⚠️' });
              if (gameState.currentTask) {
                startExerciseDetection(gameState.currentTask.id);
              }
            }
          } catch (error) {
            console.error('❌ MediaPipe initialization error:', error);
            toast('⚠️ AI detection unavailable. Using basic tracking.', { icon: '⚠️' });
            if (gameState.currentTask) {
              startExerciseDetection(gameState.currentTask.id);
            }
          }
        }, 1000); // Increased delay to ensure video is fully ready
      }
    } catch (error) {
      console.error('❌ Error accessing camera:', error);
      toast.dismiss();
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          toast.error('Camera permission denied. Please allow camera access and try again.');
        } else if (error.name === 'NotFoundError') {
          toast.error('No camera found. Please connect a camera and try again.');
        } else {
          toast.error(`Camera error: ${error.message}`);
        }
      } else {
        toast.error('Unable to access camera. Please check permissions.');
      }
    }
  };

  const stopCamera = async () => {
    console.log('🛑 Stopping camera...');
    console.log('🔍 streamRef.current:', streamRef.current);
    console.log('🔍 videoRef.current:', videoRef.current);
    
    try {
      // Stop exercise detection first (but don't call stopExercise again if already stopped)
      if (exerciseIntervalRef.current) {
        clearInterval(exerciseIntervalRef.current);
        exerciseIntervalRef.current = null;
        console.log('✅ Cleared exercise interval');
      }
      
      // Don't call stopExercise here - it's already called in completeTask
      if (isExerciseActive) {
        console.log('⚠️ Exercise still marked as active, setting to false');
        setIsExerciseActive(false);
      }
      
      // Cleanup MediaPipe/detector before stopping video
      console.log('🧹 Cleaning up MediaPipe detector...');
      await enhancedExerciseDetector.cleanup();
      console.log('✅ MediaPipe cleaned up');
      
      // Stop all video tracks - THIS IS CRITICAL
      if (streamRef.current) {
        console.log('🎥 Stopping video stream tracks...');
        const tracks = streamRef.current.getTracks();
        console.log('📹 Found tracks:', tracks.length);
        
        tracks.forEach(track => {
          console.log('🛑 Stopping track:', track.kind, track.label);
          track.stop();
        });
        streamRef.current = null;
        console.log('✅ All video tracks stopped');
      } else {
        console.log('⚠️ No stream to stop');
      }
      
      // Clear video source safely
      if (videoRef.current) {
        console.log('🎥 Clearing video element...');
        if (videoRef.current.srcObject) {
          videoRef.current.pause();
          videoRef.current.srcObject = null;
        }
        // Force remove any event listeners
        videoRef.current.onloadedmetadata = null;
        console.log('✅ Video element cleared');
      }
      
      // Update state to reflect camera is off
      setGameState(prev => ({ 
        ...prev, 
        cameraEnabled: false,
        breathingScore: 0,
        breathingRate: 0,
        isBreathingDetected: false
      }));
      
      setExerciseMetrics(null);
      latestMetricsRef.current = null;
      
      console.log('✅ Camera fully stopped and cleaned up');
      toast.success('📹 Camera turned off');
    } catch (error) {
      console.error('❌ Error stopping camera:', error);
      toast.error('Error stopping camera');
    }
  };

  const startExerciseDetection = async (exerciseType: string) => {
    if (!videoRef.current) return;

    // Map exercise ID to ExerciseType
    const exerciseTypeMap: Record<string, any> = {
      'deep-breathing': 'deep-breathing',
      'shoulder-rolls': 'shoulder-rolls',
      'neck-stretches': 'neck-stretches',
      'arm-raises': 'arm-raises',
      'meditation-posture': 'meditation-posture',
      'eye-exercises': 'eye-exercises'
    };

    const mappedType = exerciseTypeMap[exerciseType] || 'deep-breathing';
    const success = enhancedExerciseDetector.startExercise(mappedType);
    
    if (!success) {
      toast.error('Failed to start exercise detection.');
      return;
    }

    setIsExerciseActive(true);
    toast.success('🎯 Exercise tracking started!');
    
    // Start continuous exercise monitoring
    exerciseIntervalRef.current = setInterval(() => {
      const metrics = enhancedExerciseDetector.getCurrentMetrics();
      if (metrics) {
        latestMetricsRef.current = metrics; // Store in ref for immediate access
        setExerciseMetrics(metrics);
        
        console.log('📊 Real-time metrics update:', {
          performancePoints: metrics.performancePoints,
          score: metrics.score,
          reps: metrics.reps,
          accuracy: metrics.accuracy
        });
        
        // Update game state based on exercise performance
        setGameState(prev => ({
          ...prev,
          breathingScore: metrics.score,
          breathingRate: metrics.reps,
          isBreathingDetected: metrics.isCorrectForm
        }));
      }
    }, 100); // Check every 100ms for smooth real-time feedback
  };

  const startBreathingDetection = () => {
    const detectBreathing = () => {
      if (!videoRef.current || !canvasRef.current || !gameState.cameraEnabled) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Simple breathing detection based on chest area movement
      const imageData = ctx.getImageData(0, canvas.height * 0.3, canvas.width, canvas.height * 0.4);
      const brightness = calculateBrightness(imageData.data);
      
      setBreathingData(prev => {
        const newData = [...prev, brightness].slice(-30); // Keep last 30 readings
        
        // Calculate breathing rate from data variations
        if (newData.length >= 20) {
          const rate = calculateBreathingRate(newData);
          setBreathingRate(rate);
          
          // Update breathing detection status
          const isBreathing = rate >= 8 && rate <= 20; // Normal breathing range
          setGameState(prev => ({ 
            ...prev, 
            isBreathingDetected: isBreathing,
            breathingScore: prev.breathingScore + (isBreathing ? 1 : 0)
          }));
        }
        
        return newData;
      });
    };

    const interval = setInterval(detectBreathing, 200); // Check every 200ms
    return () => clearInterval(interval);
  };

  const calculateBrightness = (data: Uint8ClampedArray): number => {
    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
      total += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    return total / (data.length / 4);
  };

  const calculateBreathingRate = (data: number[]): number => {
    if (data.length < 10) return 0;
    
    // Find peaks and valleys to estimate breathing cycles
    let peaks = 0;
    const threshold = 2;
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] + threshold && data[i] > data[i + 1] + threshold) {
        peaks++;
      }
    }
    
    // Convert to breaths per minute (data spans ~6 seconds at 200ms intervals)
    return Math.round((peaks * 60) / 6);
  };

  const backToBattle = async () => {
    // Stop timer first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
    
    // Stop camera if active
    if (gameState.cameraEnabled) {
      await stopCamera();
    }

    setGameState(prev => ({
      ...prev,
      phase: 'battle',
      currentTask: null,
      taskTimer: 0,
      cameraEnabled: false,
      breathingScore: 0,
      breathingRate: 0,
      isBreathingDetected: false
    }));
  };

  const continueFromResults = () => {
    const isVictory = gameState.challengeHealth <= 0;
    
    setGameState(prev => ({
      ...prev,
      phase: isVictory ? 'victory' : 'battle',
      currentTask: null,
      lastTaskMetrics: null,
      lastTaskDamage: 0
    }));
  };

  const resetGame = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
    await stopCamera();
    setGameState({
      phase: 'issue-selection',
      playerHealth: 100,
      challengeHealth: 100,
      currentTask: null,
      taskTimer: 0,
      score: 0,
      completedTasks: [],
      availableTasks: MENTAL_HEALTH_TASKS,
      cameraEnabled: false,
      breathingScore: 0,
      breathingRate: 0,
      isBreathingDetected: false,
      selectedIssue: null,
      streakCount: 0,
      lastTaskMetrics: null,
      lastTaskDamage: 0
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting, cleaning up...');
      
      // Clear all intervals
      if (exerciseIntervalRef.current) {
        clearInterval(exerciseIntervalRef.current);
        exerciseIntervalRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = undefined;
      }
      
      // Cleanup detector first (before video)
      enhancedExerciseDetector.cleanup().catch(console.error);
      
      // Stop video tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          try {
            track.stop();
          } catch (e) {
            console.error('Error stopping track:', e);
          }
        });
        streamRef.current = null;
      }
      
      // Clear video element safely
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          videoRef.current.srcObject = null;
          videoRef.current.onloadedmetadata = null;
        } catch (e) {
          console.error('Error clearing video:', e);
        }
      }
    };
  }, []);

  // Handle camera initialization when task starts
  useEffect(() => {
    if (gameState.phase === 'task' && gameState.currentTask?.requiresCamera && !gameState.cameraEnabled) {
      console.log('📸 Task requires camera, initializing...');
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startCamera();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, gameState.currentTask]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-3">
            <Sword className="h-8 w-8" />
            Mental Health MindQuest
            <Shield className="h-8 w-8" />
          </CardTitle>
        </CardHeader>
      </Card>

      <AnimatePresence mode="wait">
        {/* Removed issue-selection and preparation phases - go directly to exercises */}

        {gameState.phase === 'battle' && gameState.selectedIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Therapeutic Exercises</h3>
                    <p className="text-sm text-gray-600">Choose an exercise to improve your mental wellbeing</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span className="font-bold">Score: {gameState.score}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      <span>Streak: {gameState.streakCount}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              {MENTAL_HEALTH_TASKS.map((task) => (
                <Card key={task.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => selectTask(task)}>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-4xl mb-3">
                        <task.icon className="h-10 w-10 mx-auto" />
                      </div>
                      <h4 className="font-bold mb-2">{task.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {task.duration}s
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {task.damage} dmg
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {gameState.phase === 'task' && gameState.currentTask && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className="text-center">
              <CardContent className="p-8">
                {/* Back Button */}
                <div className="flex justify-start mb-4">
                  <Button 
                    onClick={backToBattle} 
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ArrowUp className="h-4 w-4 rotate-180" />
                    Back to Battle
                  </Button>
                </div>

                <div className="text-6xl mb-6">
                  <gameState.currentTask.icon className="h-16 w-16 mx-auto" />
                </div>
                <h2 className="text-3xl font-bold mb-4">{gameState.currentTask.name}</h2>
                <p className="text-lg text-gray-600 mb-6">{gameState.currentTask.description}</p>
                
                <div className="mb-6">
                  <div className="text-4xl font-bold mb-2">{gameState.taskTimer}</div>
                  <Progress value={(gameState.taskTimer / gameState.currentTask.duration) * 100} className="h-4" />
                </div>

                <div className="space-y-2 mb-6">
                  {gameState.currentTask.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{instruction}</span>
                    </div>
                  ))}
                </div>

                {/* Camera monitoring for breathing tasks */}
                {gameState.currentTask.requiresCamera && (
                  <div className="mb-6 space-y-4">
                    <div className="flex justify-center gap-4">
                      <div className="relative w-48 h-36">
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          playsInline
                          className="absolute top-0 left-0 w-full h-full bg-gray-200 rounded-lg border-2 border-gray-300 object-cover"
                          style={{ transform: 'scaleX(-1)' }} // Mirror the video
                        />
                        <canvas
                          ref={canvasRef}
                          width={640}
                          height={480}
                          className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none"
                          style={{ transform: 'scaleX(-1)' }} // Mirror the canvas too
                        />
                        {!gameState.cameraEnabled && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
                            <div className="text-center">
                              <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm text-gray-500">Camera Starting...</p>
                            </div>
                          </div>
                        )}
                        {gameState.cameraEnabled && (
                          <div className="absolute top-2 left-2 z-10">
                            <Badge variant="outline" className="bg-black/50 text-white border-green-500">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI Tracking
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col justify-center space-y-2">
                        <div className="flex items-center gap-2">
                          {gameState.cameraEnabled ? (
                            <Camera className="h-5 w-5 text-green-500" />
                          ) : (
                            <CameraOff className="h-5 w-5 text-red-500" />
                          )}
                          <span className="text-sm">
                            {gameState.cameraEnabled ? 'Camera Active' : 'Camera Inactive'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${gameState.isBreathingDetected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                          <span className="text-sm">
                            {gameState.isBreathingDetected ? 'Breathing Detected' : 'No Breathing Detected'}
                          </span>
                        </div>
                        
                        <div className="text-sm">
                          <span className="font-medium">Rate: </span>
                          <span className={breathingRate >= 8 && breathingRate <= 20 ? 'text-green-600' : 'text-orange-600'}>
                            {breathingRate} bpm
                          </span>
                        </div>
                        
                        <div className="text-sm">
                          <span className="font-medium">Score: </span>
                          <span className="text-blue-600">{gameState.breathingScore}</span>
                        </div>
                      </div>
                    </div>
                    
                    {gameState.cameraEnabled && (
                      <div className="mt-4 space-y-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-700">AI Exercise Monitoring</span>
                            <Badge variant={gameState.isBreathingDetected ? "default" : "secondary"}>
                              {gameState.isBreathingDetected ? 'Correct Form' : 'Adjust Form'}
                            </Badge>
                          </div>
                          
                          {exerciseMetrics && (
                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                              <div>
                                <span className="text-gray-600">Reps Completed:</span>
                                <div className="font-semibold text-blue-600">{exerciseMetrics.reps}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Accuracy:</span>
                                <div className="font-semibold text-green-600">{Math.round(exerciseMetrics.accuracy)}%</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Score:</span>
                                <div className="font-semibold text-purple-600">{exerciseMetrics.score}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Duration:</span>
                                <div className="font-semibold text-orange-600">{Math.round(exerciseMetrics.duration / 1000)}s</div>
                              </div>
                            </div>
                          )}
                          
                          {exerciseMetrics && (
                            <div className="bg-white p-2 rounded text-xs text-gray-700 mb-2">
                              <strong>Feedback:</strong> {exerciseMetrics.feedback}
                            </div>
                          )}
                          
                          <Progress value={exerciseMetrics?.score || 0} className="mt-2" />
                        </div>
                        
                        <div className="relative bg-gray-100 rounded-lg overflow-hidden h-64">
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            muted
                            playsInline
                            className="absolute top-0 left-0 w-full h-full object-cover"
                            style={{ transform: 'scaleX(-1)' }}
                          />
                          <canvas
                            ref={canvasRef}
                            width={640}
                            height={480}
                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                            style={{ transform: 'scaleX(-1)' }}
                          />
                          <div className="absolute top-2 left-2 z-10">
                            <Badge variant="outline" className="bg-black/60 text-white border-blue-400">
                              <Camera className="h-3 w-3 mr-1" />
                              MediaPipe AI
                            </Badge>
                          </div>
                          {exerciseMetrics?.isCorrectForm && (
                            <div className="absolute top-2 right-2 z-10">
                              <Badge variant="default" className="bg-green-500 animate-pulse">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Perfect Form!
                              </Badge>
                            </div>
                          )}
                          {exerciseMetrics && exerciseMetrics.performancePoints && (
                            <div className="absolute bottom-2 left-2 right-2 z-10">
                              <div className="bg-black/70 text-white p-2 rounded-lg text-xs">
                                <div className="flex justify-between items-center">
                                  <span>Points: {exerciseMetrics.performancePoints}</span>
                                  <span>Bonus: +{exerciseMetrics.bonusPoints}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Position yourself so your chest/torso is visible for breathing detection
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <Wind className="h-5 w-5 animate-pulse" />
                  <span>Focus on your breathing and stay present</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {gameState.phase === 'results' && gameState.lastTaskMetrics && gameState.currentTask && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Task Completion Header */}
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">
                      <gameState.currentTask.icon className="h-12 w-12" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{gameState.currentTask.name}</h2>
                      <p className="text-purple-100">Exercise Completed!</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{gameState.lastTaskDamage}</div>
                    <p className="text-sm text-purple-100">Damage Dealt</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Card */}
            <ExerciseScoreCard
              totalPoints={gameState.lastTaskMetrics.performancePoints}
              accuracy={gameState.lastTaskMetrics.accuracy}
              consistency={75} // You can calculate this from the metrics
              reps={gameState.lastTaskMetrics.reps}
              grade={
                gameState.lastTaskMetrics.performancePoints >= 250 ? 'S' :
                gameState.lastTaskMetrics.performancePoints >= 200 ? 'A' :
                gameState.lastTaskMetrics.performancePoints >= 150 ? 'B' :
                gameState.lastTaskMetrics.performancePoints >= 100 ? 'C' : 'D'
              }
              feedback={gameState.lastTaskMetrics.feedback}
              bonusPoints={gameState.lastTaskMetrics.bonusPoints}
            />

            {/* Boss Status Update */}
            {gameState.selectedIssue && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-16 h-16 bg-gradient-to-br ${gameState.selectedIssue.color} rounded-full flex items-center justify-center text-2xl`}>
                        {gameState.selectedIssue.emoji}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{gameState.selectedIssue.name}</h3>
                        <p className="text-sm text-gray-600">
                          {gameState.challengeHealth <= 0 ? 'Defeated!' : `${gameState.challengeHealth} HP Remaining`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <span className="font-bold">Total Score: {gameState.score}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-500" />
                        <span>Streak: {gameState.streakCount}</span>
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={(gameState.challengeHealth / gameState.selectedIssue.challengeHp) * 100} 
                    className="h-4" 
                  />
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              {gameState.challengeHealth > 0 ? (
                <Button 
                  onClick={continueFromResults} 
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8"
                >
                  <Sword className="h-5 w-5 mr-2" />
                  Continue Battle
                </Button>
              ) : (
                <Button 
                  onClick={continueFromResults} 
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8"
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  View Victory
                </Button>
              )}
              <Button 
                onClick={resetGame} 
                variant="outline"
                size="lg"
              >
                New Challenge
              </Button>
            </div>
          </motion.div>
        )}

        {gameState.phase === 'victory' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardContent className="p-8">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-4xl font-bold mb-4">Victory!</h2>
                <p className="text-xl mb-6">You have successfully overcome your mental health challenge!</p>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <Trophy className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{gameState.score}</div>
                    <div className="text-sm opacity-90">Final Score</div>
                  </div>
                  <div className="text-center">
                    <Target className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{gameState.completedTasks.length}</div>
                    <div className="text-sm opacity-90">Tasks Completed</div>
                  </div>
                  <div className="text-center">
                    <Star className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{gameState.streakCount}</div>
                    <div className="text-sm opacity-90">Max Streak</div>
                  </div>
                </div>
                
                <Button onClick={resetGame} size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                  Play Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
