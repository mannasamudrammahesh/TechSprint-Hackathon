import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { Camera, AlertCircle, RefreshCw, User } from 'lucide-react';

interface VisualBreathTrackerProps {
  onBreathUpdate: (tension: number) => void;
  onStreamReady?: (stream: MediaStream) => void;
  onStreamEnd?: (stream: MediaStream) => void;
}

const VisualBreathTracker: React.FC<VisualBreathTrackerProps> = ({ onBreathUpdate, onStreamReady, onStreamEnd }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationFrameRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);
  const currentStreamRef = useRef<MediaStream | null>(null);
  
  // Rolling buffer for auto-calibration
  const historyRef = useRef<number[]>([]);
  const BUFFER_SIZE = 150; // Approx 5 seconds at 30fps

  const setupMediaPipe = async () => {
    try {
      setIsLoading(true);
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      
      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 1
      });
      
      startCamera();
    } catch (err) {
      console.error(err);
      setError("Failed to load Pose model.");
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      // Clean up any existing stream first
      if (currentStreamRef.current) {
        currentStreamRef.current.getTracks().forEach(track => track.stop());
        if (onStreamEnd) onStreamEnd(currentStreamRef.current);
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 320 }, 
          height: { ideal: 240 }, 
          facingMode: "user",
          frameRate: { ideal: 30 }
        }
      });
      
      currentStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', predictWebcam);
        setPermissionGranted(true);
        setIsLoading(false);
        
        // Register stream with parent for cleanup
        if (onStreamReady) onStreamReady(stream);
      }
    } catch (err) {
      console.error(err);
      setError("Camera access denied.");
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (currentStreamRef.current) {
      currentStreamRef.current.getTracks().forEach(track => track.stop());
      if (onStreamEnd) onStreamEnd(currentStreamRef.current);
      currentStreamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setPermissionGranted(false);
  };

  const predictWebcam = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const poseLandmarker = poseLandmarkerRef.current;

    if (video && poseLandmarker && canvas) {
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        const results = poseLandmarker.detectForVideo(video, performance.now());
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Flip context for mirror effect
            ctx.save();
            ctx.scale(-1, 1);
            ctx.translate(-canvas.width, 0);

            if (results.landmarks && results.landmarks.length > 0) {
                const landmarks = results.landmarks[0];
                
                // Track Shoulders (11: Left, 12: Right)
                const leftShoulder = landmarks[11];
                const rightShoulder = landmarks[12];
                const nose = landmarks[0];

                // Calculate average shoulder Y height
                // Note: In MediaPipe, Y increases downwards (0 is top, 1 is bottom)
                // Inhale -> Shoulders UP -> Y decreases
                // Exhale -> Shoulders DOWN -> Y increases
                const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;

                // Dynamic Calibration
                const history = historyRef.current;
                history.push(avgShoulderY);
                if (history.length > BUFFER_SIZE) history.shift();

                // Calculate range
                const min = Math.min(...history);
                const max = Math.max(...history);
                const range = max - min;

                let tension = 0.5;
                
                // Only process if we have enough movement data to avoid noise
                if (range > 0.01) { 
                    // Normalize position within user's range
                    // 0.0 = Highest position (Inhale) -> We want Expand (Tension 0)
                    // 1.0 = Lowest position (Exhale) -> We want Contract (Tension 1)
                    
                    const normalized = (avgShoulderY - min) / range;
                    // Clamp
                    tension = Math.max(0, Math.min(1, normalized));
                }

                onBreathUpdate(tension);

                // Draw Visual Feedback (Shoulder Line)
                ctx.beginPath();
                ctx.moveTo(leftShoulder.x * canvas.width, leftShoulder.y * canvas.height);
                ctx.lineTo(rightShoulder.x * canvas.width, rightShoulder.y * canvas.height);
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 4;
                ctx.stroke();

                // Draw Nodes
                [leftShoulder, rightShoulder, nose].forEach(pt => {
                    ctx.beginPath();
                    ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 4, 0, 2 * Math.PI);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                });
            }
            ctx.restore();
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(predictWebcam);
  };

  useEffect(() => {
    setupMediaPipe();
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute top-16 right-2 md:top-4 md:right-4 z-50">
      <div className={`relative overflow-hidden rounded-lg border border-cyan-500/30 bg-black/50 backdrop-blur-sm transition-all duration-300 ${permissionGranted ? 'w-24 h-18 md:w-32 md:h-24' : 'w-auto p-3 md:p-4'}`}>
        
        {/* Video Element (Hidden logic, shown visually via canvas) */}
        <video 
          ref={videoRef} 
          className="absolute inset-0 w-full h-full object-cover opacity-0" 
          autoPlay 
          playsInline 
          muted 
        />
        
        {/* Canvas for overlays */}
        <canvas
            ref={canvasRef}
            width={320}
            height={240}
            className={`absolute inset-0 w-full h-full object-cover transform scale-x-100 ${!permissionGranted ? 'hidden' : ''}`} 
        />

        {/* Loading / Error States */}
        {!permissionGranted && (
          <div className="flex flex-col items-center justify-center space-y-2 text-white/80">
            {isLoading ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                <span className="text-xs">Loading Pose AI...</span>
              </>
            ) : error ? (
              <>
                <AlertCircle className="w-6 h-6 text-red-500" />
                <span className="text-xs whitespace-nowrap">{error}</span>
                <button 
                  onClick={setupMediaPipe}
                  className="mt-2 px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  Retry
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center">
                 <Camera className="w-6 h-6 mb-1" />
                 <span className="text-xs">Camera Needed</span>
              </div>
            )}
          </div>
        )}

        {/* Overlay for tracking status */}
        {permissionGranted && (
          <div className="absolute bottom-1 right-1 flex items-center gap-1">
             <span className="text-[10px] text-cyan-400 font-mono bg-black/50 px-1 rounded">BODY</span>
             <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualBreathTracker;