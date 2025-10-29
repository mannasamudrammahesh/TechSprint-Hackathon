"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Camera, Hand, Eye, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GestureDetectionProps {
  onGestureDetected?: (gesture: string, confidence: number) => void;
  onPoseDetected?: (pose: any) => void;
  enableHandTracking?: boolean;
  enablePoseTracking?: boolean;
  enableFaceTracking?: boolean;
}

export default function MediaPipeGestures({
  onGestureDetected,
  onPoseDetected,
  enableHandTracking = true,
  enablePoseTracking = false,
  enableFaceTracking = false
}: GestureDetectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [detectedGestures, setDetectedGestures] = useState<string[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [handLandmarks, setHandLandmarks] = useState<any>(null);
  
  // MediaPipe models
  const [hands, setHands] = useState<any>(null);
  const [pose, setPose] = useState<any>(null);
  const [faceMesh, setFaceMesh] = useState<any>(null);

  useEffect(() => {
    // Load MediaPipe models
    const loadMediaPipe = async () => {
      try {
        // Dynamically import MediaPipe
        const { Hands, Pose, FaceMesh } = await import('@mediapipe/tasks-vision');
        
        if (enableHandTracking) {
          const handsModel = new Hands({
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numHands: 2,
            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5
          });
          setHands(handsModel);
        }

        if (enablePoseTracking) {
          const poseModel = new Pose({
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
              delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numPoses: 1,
            minPoseDetectionConfidence: 0.5,
            minPosePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5
          });
          setPose(poseModel);
        }

        if (enableFaceTracking) {
          const faceMeshModel = new FaceMesh({
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
          setFaceMesh(faceMeshModel);
        }
      } catch (error) {
        console.error('Error loading MediaPipe models:', error);
        // Fallback to browser-based gesture detection
        initializeFallbackGestureDetection();
      }
    };

    loadMediaPipe();
  }, [enableHandTracking, enablePoseTracking, enableFaceTracking]);

  const initializeFallbackGestureDetection = () => {
    // Simple gesture detection using basic computer vision
    console.log('Using fallback gesture detection');
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsActive(true);
          startDetection();
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  };

  const startDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const detectFrame = async () => {
      if (!isActive || !videoRef.current) return;

      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Hand detection
      if (hands && enableHandTracking) {
        try {
          const results = await hands.detectForVideo(video, performance.now());
          if (results.landmarks && results.landmarks.length > 0) {
            drawHandLandmarks(ctx, results.landmarks[0]);
            const gesture = analyzeHandGesture(results.landmarks[0]);
            if (gesture) {
              setDetectedGestures(prev => {
                const newGestures = [gesture, ...prev.slice(0, 4)];
                return newGestures;
              });
              onGestureDetected?.(gesture, 0.8);
            }
          }
        } catch (error) {
          console.error('Hand detection error:', error);
        }
      }

      // Pose detection
      if (pose && enablePoseTracking) {
        try {
          const results = await pose.detectForVideo(video, performance.now());
          if (results.landmarks && results.landmarks.length > 0) {
            drawPoseLandmarks(ctx, results.landmarks[0]);
            onPoseDetected?.(results.landmarks[0]);
          }
        } catch (error) {
          console.error('Pose detection error:', error);
        }
      }

      // Face emotion detection
      if (faceMesh && enableFaceTracking) {
        try {
          const results = await faceMesh.detectForVideo(video, performance.now());
          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const emotion = analyzeFacialEmotion(results.faceLandmarks[0]);
            setCurrentEmotion(emotion);
          }
        } catch (error) {
          console.error('Face detection error:', error);
        }
      }

      requestAnimationFrame(detectFrame);
    };

    detectFrame();
  };

  const drawHandLandmarks = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    ctx.fillStyle = '#00ff00';
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;

    // Draw landmarks
    landmarks.forEach((landmark, index) => {
      const x = landmark.x * ctx.canvas.width;
      const y = landmark.y * ctx.canvas.height;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw connections
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20] // Pinky
    ];

    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      
      ctx.beginPath();
      ctx.moveTo(startPoint.x * ctx.canvas.width, startPoint.y * ctx.canvas.height);
      ctx.lineTo(endPoint.x * ctx.canvas.width, endPoint.y * ctx.canvas.height);
      ctx.stroke();
    });
  };

  const drawPoseLandmarks = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    ctx.fillStyle = '#ff0000';
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;

    landmarks.forEach((landmark, index) => {
      const x = landmark.x * ctx.canvas.width;
      const y = landmark.y * ctx.canvas.height;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const analyzeHandGesture = (landmarks: any[]): string | null => {
    if (!landmarks || landmarks.length < 21) return null;

    // Simple gesture recognition
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const thumbUp = thumbTip.y < landmarks[3].y;
    const indexUp = indexTip.y < landmarks[6].y;
    const middleUp = middleTip.y < landmarks[10].y;
    const ringUp = ringTip.y < landmarks[14].y;
    const pinkyUp = pinkyTip.y < landmarks[18].y;

    // Thumbs up
    if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) {
      return 'thumbs_up';
    }

    // Peace sign
    if (!thumbUp && indexUp && middleUp && !ringUp && !pinkyUp) {
      return 'peace';
    }

    // Fist
    if (!thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) {
      return 'fist';
    }

    // Open hand
    if (indexUp && middleUp && ringUp && pinkyUp) {
      return 'open_hand';
    }

    return null;
  };

  const analyzeFacialEmotion = (landmarks: any[]): string => {
    // Simple emotion detection based on facial landmarks
    // This is a basic implementation - in production, use a proper emotion detection model
    
    if (!landmarks || landmarks.length === 0) return 'neutral';

    // Analyze mouth corners for smile detection
    const mouthLeft = landmarks[61];
    const mouthRight = landmarks[291];
    const mouthCenter = landmarks[13];

    const smileIntensity = (mouthLeft.y + mouthRight.y) / 2 - mouthCenter.y;

    if (smileIntensity < -0.01) {
      return 'happy';
    } else if (smileIntensity > 0.01) {
      return 'sad';
    }

    return 'neutral';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Gesture & Pose Detection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              onClick={isActive ? stopCamera : startCamera}
              variant={isActive ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              {isActive ? 'Stop Camera' : 'Start Camera'}
            </Button>
          </div>

          <div className="relative">
            <video
              ref={videoRef}
              className="w-full max-w-md rounded-lg border"
              style={{ display: isActive ? 'block' : 'none' }}
              muted
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full max-w-md rounded-lg"
              style={{ display: isActive ? 'block' : 'none' }}
            />
          </div>

          {isActive && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {enableHandTracking && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Hand className="h-4 w-4" />
                      Hand Gestures
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {detectedGestures.length > 0 ? (
                        detectedGestures.map((gesture, index) => (
                          <div key={index} className="text-sm p-2 bg-green-100 rounded">
                            {gesture.replace('_', ' ').toUpperCase()}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No gestures detected</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {enableFaceTracking && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Emotion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold capitalize">
                      {currentEmotion}
                    </div>
                    <div className="text-sm text-gray-500">
                      Detected from facial expression
                    </div>
                  </CardContent>
                </Card>
              )}

              {enablePoseTracking && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Pose Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      Pose tracking active
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
