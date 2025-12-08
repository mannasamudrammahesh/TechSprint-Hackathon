import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HandData } from '../types';
import { Camera, AlertCircle, RefreshCw } from 'lucide-react';

interface HandTrackerProps {
  onHandUpdate: (data: HandData) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const animationFrameRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);

  const calculateTension = (landmarks: any[]): number => {
    // Landmarks: 0=wrist, 5=index_mcp, 8=index_tip, 9=middle_mcp, 12=middle_tip, etc.
    const wrist = landmarks[0];
    
    // Calculate palm size (distance from wrist to middle finger knuckle (9))
    const palmSize = Math.sqrt(
      Math.pow(wrist.x - landmarks[9].x, 2) +
      Math.pow(wrist.y - landmarks[9].y, 2) +
      Math.pow(wrist.z - landmarks[9].z, 2)
    );

    // Calculate average distance of fingertips to wrist
    const tips = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky
    let totalTipDist = 0;
    
    tips.forEach(idx => {
      const d = Math.sqrt(
        Math.pow(wrist.x - landmarks[idx].x, 2) +
        Math.pow(wrist.y - landmarks[idx].y, 2) +
        Math.pow(wrist.z - landmarks[idx].z, 2)
      );
      totalTipDist += d;
    });

    const avgTipDist = totalTipDist / 5;

    // Normalize: 
    // If hand is open, avgTipDist is roughly 2x palmSize.
    // If hand is closed, avgTipDist is roughly 0.8x palmSize.
    
    // Ratio: Large = Open, Small = Closed
    const ratio = avgTipDist / (palmSize || 0.001);

    // Map Ratio to Tension (0 to 1)
    // Open (Ratio ~2.5) -> Tension 0
    // Fist (Ratio ~1.0) -> Tension 1
    
    // Clamping and inverting
    // let tension = 1.0 - ((ratio - 1.0) / 1.5); 
    // Refined heuristic:
    let tension = 0;
    if (ratio > 2.2) tension = 0.0;
    else if (ratio < 0.9) tension = 1.0;
    else {
      // Linear interpolate between 0.9 and 2.2
      tension = 1.0 - (ratio - 0.9) / (2.2 - 0.9);
    }

    return Math.max(0, Math.min(1, tension));
  };

  const setupMediaPipe = async () => {
    try {
      setIsLoading(true);
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      
      handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
      });
      
      startCamera();
    } catch (err) {
      console.error(err);
      setError("Failed to load AI models.");
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', predictWebcam);
        setPermissionGranted(true);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Camera access denied.");
      setIsLoading(false);
    }
  };

  const predictWebcam = () => {
    const video = videoRef.current;
    const handLandmarker = handLandmarkerRef.current;

    if (video && handLandmarker) {
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        const results = handLandmarker.detectForVideo(video, performance.now());

        if (results.landmarks && results.landmarks.length > 0) {
          const tension = calculateTension(results.landmarks[0]);
          onHandUpdate({ tension, isPresent: true });
        } else {
          onHandUpdate({ tension: 0, isPresent: false });
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(predictWebcam);
  };

  useEffect(() => {
    setupMediaPipe();
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute top-4 right-4 z-50">
      <div className={`relative overflow-hidden rounded-lg border border-white/20 bg-black/50 backdrop-blur-sm transition-all duration-300 ${permissionGranted ? 'w-32 h-24' : 'w-auto p-4'}`}>
        
        {/* Video Element (Hidden logic, shown visually) */}
        <video 
          ref={videoRef} 
          className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${!permissionGranted ? 'hidden' : ''}`} 
          autoPlay 
          playsInline 
          muted 
        />

        {/* Loading / Error States */}
        {!permissionGranted && (
          <div className="flex flex-col items-center justify-center space-y-2 text-white/80">
            {isLoading ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                <span className="text-xs">Loading AI...</span>
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
          <div className="absolute bottom-1 right-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HandTracker;