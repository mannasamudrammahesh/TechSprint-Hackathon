"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, CameraOff, Hand, Eye, Activity, AlertCircle } from 'lucide-react';

interface GestureHandlerProps {
  onGestureDetected: (gesture: string, landmarks: any) => void;
  onBreathingDetected: (isBreathing: boolean, rate: number) => void;
  isEnabled: boolean;
}

// Simple gesture detection using basic computer vision techniques
export default function GestureHandler({ 
  onGestureDetected, 
  onBreathingDetected, 
  isEnabled 
}: GestureHandlerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectedGestures, setDetectedGestures] = useState<string[]>([]);
  const [breathingData, setBreathingData] = useState({ isBreathing: false, rate: 0 });
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const gestureHistoryRef = useRef<string[]>([]);
  const breathingHistoryRef = useRef<number[]>([]);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      setCameraError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraPermission('granted');
        setIsActive(true);
        startDetection();
      }
    } catch (error) {
      console.error('Camera initialization error:', error);
      setCameraError('Camera access denied or not available');
      setCameraPermission('denied');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsActive(false);
  }, []);

  // Basic gesture detection using pixel analysis
  const detectGestures = useCallback((imageData: ImageData) => {
    const { data, width, height } = imageData;
    
    // Simple hand detection based on skin color and movement
    let skinPixels = 0;
    let totalPixels = width * height;
    let centerMass = { x: 0, y: 0, count: 0 };
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Basic skin color detection
      if (r > 95 && g > 40 && b > 20 && 
          Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
          Math.abs(r - g) > 15 && r > g && r > b) {
        skinPixels++;
        const pixelIndex = i / 4;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        centerMass.x += x;
        centerMass.y += y;
        centerMass.count++;
      }
    }
    
    if (centerMass.count > 0) {
      centerMass.x /= centerMass.count;
      centerMass.y /= centerMass.count;
    }
    
    const skinRatio = skinPixels / totalPixels;
    
    // Gesture classification based on skin pixel distribution
    let detectedGesture = 'none';
    
    if (skinRatio > 0.15) {
      // High skin ratio - open palm
      detectedGesture = 'open_palm';
    } else if (skinRatio > 0.08 && skinRatio < 0.15) {
      // Medium skin ratio - fist or pointing
      detectedGesture = 'fist';
    } else if (skinRatio > 0.05 && skinRatio < 0.08) {
      // Low skin ratio - peace sign or fingers
      detectedGesture = 'peace';
    }
    
    return { gesture: detectedGesture, centerMass, skinRatio };
  }, []);

  // Simple breathing detection based on overall image brightness changes
  const detectBreathing = useCallback((imageData: ImageData) => {
    const { data } = imageData;
    let totalBrightness = 0;
    
    // Calculate average brightness
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      totalBrightness += brightness;
    }
    
    const avgBrightness = totalBrightness / (data.length / 4);
    
    // Add to breathing history
    breathingHistoryRef.current.push(avgBrightness);
    if (breathingHistoryRef.current.length > 30) { // Keep last 30 frames
      breathingHistoryRef.current.shift();
    }
    
    // Analyze breathing pattern
    if (breathingHistoryRef.current.length >= 20) {
      const recent = breathingHistoryRef.current.slice(-10);
      const older = breathingHistoryRef.current.slice(-20, -10);
      
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
      
      const change = Math.abs(recentAvg - olderAvg);
      const isBreathing = change > 2; // Threshold for breathing detection
      
      // Calculate approximate breathing rate
      let peaks = 0;
      for (let i = 1; i < breathingHistoryRef.current.length - 1; i++) {
        if (breathingHistoryRef.current[i] > breathingHistoryRef.current[i - 1] &&
            breathingHistoryRef.current[i] > breathingHistoryRef.current[i + 1]) {
          peaks++;
        }
      }
      
      const rate = (peaks / breathingHistoryRef.current.length) * 30 * 60; // Convert to BPM
      
      return { isBreathing, rate: Math.max(0, Math.min(30, rate)) };
    }
    
    return { isBreathing: false, rate: 0 };
  }, []);

  // Main detection loop
  const startDetection = useCallback(() => {
    const detect = () => {
      if (!videoRef.current || !canvasRef.current || !isActive) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx || video.readyState !== 4) {
        animationRef.current = requestAnimationFrame(detect);
        return;
      }
      
      // Draw video frame to canvas
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data for analysis
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Detect gestures
      const gestureResult = detectGestures(imageData);
      if (gestureResult.gesture !== 'none') {
        gestureHistoryRef.current.push(gestureResult.gesture);
        if (gestureHistoryRef.current.length > 5) {
          gestureHistoryRef.current.shift();
        }
        
        // Check for consistent gesture
        const recentGestures = gestureHistoryRef.current.slice(-3);
        if (recentGestures.every(g => g === gestureResult.gesture)) {
          setDetectedGestures(prev => {
            const newGestures = [...prev.slice(-4), gestureResult.gesture];
            onGestureDetected(gestureResult.gesture, gestureResult.centerMass);
            return newGestures;
          });
        }
      }
      
      // Detect breathing
      const breathingResult = detectBreathing(imageData);
      setBreathingData(breathingResult);
      onBreathingDetected(breathingResult.isBreathing, breathingResult.rate);
      
      // Draw detection overlay
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      if (gestureResult.centerMass.count > 0) {
        ctx.beginPath();
        ctx.arc(gestureResult.centerMass.x, gestureResult.centerMass.y, 20, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#00ff00';
        ctx.font = '16px Arial';
        ctx.fillText(gestureResult.gesture, gestureResult.centerMass.x - 30, gestureResult.centerMass.y - 30);
      }
      
      animationRef.current = requestAnimationFrame(detect);
    };
    
    detect();
  }, [isActive, detectGestures, detectBreathing, onGestureDetected, onBreathingDetected]);

  // Handle enable/disable
  useEffect(() => {
    if (isEnabled && !isActive) {
      initializeCamera();
    } else if (!isEnabled && isActive) {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isEnabled, isActive, initializeCamera, stopCamera]);

  const toggleCamera = () => {
    if (isActive) {
      stopCamera();
    } else {
      initializeCamera();
    }
  };

  const getGestureColor = (gesture: string) => {
    switch (gesture) {
      case 'fist': return 'bg-red-500';
      case 'open_palm': return 'bg-blue-500';
      case 'peace': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="bg-black/70 border-purple-500/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Hand className="h-5 w-5" />
          Gesture & Breathing Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera Controls */}
        <div className="flex items-center justify-between">
          <span className="text-white">Camera Status</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <Button
              onClick={toggleCamera}
              size="sm"
              variant={isActive ? "destructive" : "default"}
            >
              {isActive ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
              {isActive ? 'Stop' : 'Start'}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {cameraError && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <p className="text-red-300 text-sm">{cameraError}</p>
          </div>
        )}

        {/* Camera Permission */}
        {cameraPermission === 'denied' && (
          <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3">
            <p className="text-yellow-300 text-sm">
              Camera permission is required for gesture detection. Please allow camera access and refresh the page.
            </p>
          </div>
        )}

        {/* Video Feed */}
        {isActive && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full max-w-sm mx-auto rounded-lg border border-purple-500/50"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none opacity-80"
            />
          </div>
        )}

        {/* Detection Results */}
        <div className="space-y-3">
          {/* Recent Gestures */}
          <div>
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <Hand className="h-4 w-4" />
              Recent Gestures
            </h4>
            <div className="flex flex-wrap gap-1">
              {detectedGestures.slice(-5).map((gesture, index) => (
                <Badge key={index} className={`text-xs ${getGestureColor(gesture)}`}>
                  {gesture.replace('_', ' ')}
                </Badge>
              ))}
              {detectedGestures.length === 0 && (
                <span className="text-gray-400 text-sm">No gestures detected</span>
              )}
            </div>
          </div>

          {/* Breathing Detection */}
          <div>
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Breathing Detection
            </h4>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${breathingData.isBreathing ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-white">
                {breathingData.isBreathing ? 'Breathing Detected' : 'No Breathing Detected'}
              </span>
              {breathingData.rate > 0 && (
                <Badge variant="outline" className="text-xs">
                  {breathingData.rate.toFixed(1)} BPM
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Gesture Commands Help */}
        <div className="bg-purple-900/30 p-3 rounded-lg">
          <h4 className="text-purple-300 font-medium mb-2">Gesture Commands</h4>
          <div className="space-y-1 text-xs text-purple-200">
            <div>👊 <strong>Fist</strong> - Attack/Breathing Exercise</div>
            <div>✋ <strong>Open Palm</strong> - Defend/Affirmation</div>
            <div>✌️ <strong>Peace Sign</strong> - Heal/Grounding</div>
          </div>
        </div>

        {/* Technical Info */}
        <div className="bg-blue-900/30 p-3 rounded-lg">
          <h4 className="text-blue-300 font-medium mb-1">Detection Info</h4>
          <ul className="text-blue-200 text-xs space-y-1">
            <li>• Uses basic computer vision for gesture detection</li>
            <li>• Breathing detection based on image brightness changes</li>
            <li>• Works best with good lighting and clear background</li>
            <li>• Hold gestures steady for 2-3 seconds for recognition</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
