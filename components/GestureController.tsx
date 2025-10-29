"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Hand, Fist, Square, Scissors } from 'lucide-react';

interface GestureControllerProps {
  onGesture?: (gesture: string) => void;
  enabled?: boolean;
}

export default function GestureController({ 
  onGesture, 
  enabled = false 
}: GestureControllerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastGesture, setLastGesture] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simple gesture detection based on hand landmarks
  const detectGesture = (landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return null;

    // Simplified gesture detection logic
    // In a real implementation, you would use MediaPipe Hands
    const thumb = landmarks[4];
    const index = landmarks[8];
    const middle = landmarks[12];
    const ring = landmarks[16];
    const pinky = landmarks[20];

    // Check if fingers are extended (simplified logic)
    const thumbExtended = thumb.y < landmarks[3].y;
    const indexExtended = index.y < landmarks[6].y;
    const middleExtended = middle.y < landmarks[10].y;
    const ringExtended = ring.y < landmarks[14].y;
    const pinkyExtended = pinky.y < landmarks[18].y;

    const extendedFingers = [thumbExtended, indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;

    // Gesture mapping
    if (extendedFingers === 0) return 'fist'; // ✊ Fist = Attack
    if (extendedFingers === 5) return 'open_palm'; // ✋ Open Palm = Defend
    if (extendedFingers === 2 && indexExtended && middleExtended) return 'two_fingers'; // ✌️ Two Fingers = Special Power
    if (extendedFingers === 1 && indexExtended) return 'point'; // 👆 Point = Select

    return null;
  };

  const startGestureDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsDetecting(true);
        setError(null);
      }
    } catch (err) {
      setError('Failed to access camera for gesture detection');
      console.error('Camera access error:', err);
    }
  };

  const stopGestureDetection = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsDetecting(false);
  };

  // Process video frames for gesture detection
  const processFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isDetecting) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // In a real implementation, you would:
    // 1. Send frame to MediaPipe Hands
    // 2. Get hand landmarks
    // 3. Detect gesture from landmarks
    // 4. Trigger appropriate action

    // For now, we'll simulate gesture detection
    // This is where you would integrate MediaPipe Hands
    const mockLandmarks = []; // Would be populated by MediaPipe
    const gesture = detectGesture(mockLandmarks);

    if (gesture && gesture !== lastGesture) {
      setLastGesture(gesture);
      onGesture?.(gesture);
    }

    requestAnimationFrame(processFrame);
  };

  useEffect(() => {
    if (isDetecting) {
      processFrame();
    }
  }, [isDetecting, lastGesture]);

  const getGestureIcon = (gesture: string) => {
    switch (gesture) {
      case 'fist': return <Fist className="h-4 w-4" />;
      case 'open_palm': return <Square className="h-4 w-4" />;
      case 'two_fingers': return <Scissors className="h-4 w-4" />;
      case 'point': return <Hand className="h-4 w-4" />;
      default: return <Hand className="h-4 w-4" />;
    }
  };

  const getGestureAction = (gesture: string) => {
    switch (gesture) {
      case 'fist': return 'Attack';
      case 'open_palm': return 'Defend';
      case 'two_fingers': return 'Special Power';
      case 'point': return 'Select';
      default: return 'Unknown';
    }
  };

  const getGestureColor = (gesture: string) => {
    switch (gesture) {
      case 'fist': return 'bg-red-500';
      case 'open_palm': return 'bg-blue-500';
      case 'two_fingers': return 'bg-purple-500';
      case 'point': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-80 shadow-lg border-2 border-orange-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Hand className="h-5 w-5" />
          Gesture Controller
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="p-3 bg-orange-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isDetecting ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium">
              Gesture Detection: {isDetecting ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={startGestureDetection}
            disabled={isDetecting}
            className="flex-1 px-3 py-2 bg-green-500 text-white rounded text-sm disabled:bg-gray-400"
          >
            Start Detection
          </button>
          <button
            onClick={stopGestureDetection}
            disabled={!isDetecting}
            className="flex-1 px-3 py-2 bg-red-500 text-white rounded text-sm disabled:bg-gray-400"
          >
            Stop Detection
          </button>
        </div>

        {/* Video Preview */}
        {isDetecting && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-32 object-cover rounded border"
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
          </div>
        )}

        {/* Last Gesture */}
        {lastGesture && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              {getGestureIcon(lastGesture)}
              <span className="text-sm font-medium">
                Last Gesture: {getGestureAction(lastGesture)}
              </span>
            </div>
          </div>
        )}

        {/* Gesture Mapping */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Gesture Mapping:</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Fist className="h-4 w-4 text-red-500" />
              <Badge variant="outline" className="flex-1 justify-center">
                ✊ Fist → Attack
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Square className="h-4 w-4 text-blue-500" />
              <Badge variant="outline" className="flex-1 justify-center">
                ✋ Open Palm → Defend
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-purple-500" />
              <Badge variant="outline" className="flex-1 justify-center">
                ✌️ Two Fingers → Special Power
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Hand className="h-4 w-4 text-green-500" />
              <Badge variant="outline" className="flex-1 justify-center">
                👆 Point → Select
              </Badge>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <p>🤚 Gesture detection requires camera access</p>
          <p>🎮 Works with active games and AR features</p>
          <p>📱 Hold hand in front of camera</p>
          <p className="text-orange-600 font-medium">Note: MediaPipe integration needed for full functionality</p>
        </div>
      </CardContent>
    </Card>
  );
}
