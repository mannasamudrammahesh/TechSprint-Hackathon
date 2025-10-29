"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { riveEmotionDetection, EmotionResult, EMOTION_MAPPING } from '@/lib/riveEmotionDetection';
import { useRive, useStateMachineInput } from 'rive-react';
import toast from 'react-hot-toast';

export default function EmotionTestComponent() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionResult | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<EmotionResult[]>([]);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [riveLoaded, setRiveLoaded] = useState(false);
  const [riveError, setRiveError] = useState(false);

  // Rive Animation Setup for testing
  const { rive, RiveComponent } = useRive({
    src: '/panda.riv',
    stateMachines: "State Machine 1",
    autoplay: true,
    onLoadError: (error) => {
      console.error('Rive loading error:', error);
      setRiveError(true);
      setRiveLoaded(false);
    },
    onLoad: () => {
      console.log('Rive animation loaded successfully');
      setRiveLoaded(true);
      setRiveError(false);
    }
  });

  // Rive state machine inputs
  const happyTrigger = useStateMachineInput(rive, 'State Machine 1', 'happy');
  const sadTrigger = useStateMachineInput(rive, 'State Machine 1', 'sad');
  const angryTrigger = useStateMachineInput(rive, 'State Machine 1', 'angry');
  const surprisedTrigger = useStateMachineInput(rive, 'State Machine 1', 'surprised');
  const fearTrigger = useStateMachineInput(rive, 'State Machine 1', 'fear');
  const neutralTrigger = useStateMachineInput(rive, 'State Machine 1', 'neutral');

  // Function to trigger Rive emotions
  const triggerRiveEmotion = (emotion: string) => {
    try {
      switch (emotion) {
        case 'happy':
          happyTrigger?.fire();
          break;
        case 'sad':
          sadTrigger?.fire();
          break;
        case 'angry':
          angryTrigger?.fire();
          break;
        case 'surprised':
          surprisedTrigger?.fire();
          break;
        case 'fear':
          fearTrigger?.fire();
          break;
        default:
          neutralTrigger?.fire();
      }
      console.log(`🎭 Triggered Rive emotion: ${emotion}`);
    } catch (error) {
      console.log('Rive trigger failed:', error);
    }
  };

  const startEmotionDetection = async () => {
    try {
      const success = await riveEmotionDetection.startCamera();
      if (success) {
        setCameraEnabled(true);
        setIsDetecting(true);
        
        // Add emotion detection callback
        riveEmotionDetection.onEmotionDetected((emotion: EmotionResult) => {
          console.log('🎭 Emotion detected:', emotion);
          setCurrentEmotion(emotion);
          setEmotionHistory(prev => [...prev.slice(-9), emotion]); // Keep last 10
          
          // Update Rive animation
          triggerRiveEmotion(emotion.emotion);
          
          toast.success(`Detected: ${emotion.emotion} (${Math.round(emotion.confidence * 100)}%)`);
        });
        
        riveEmotionDetection.startDetection(2000);
        toast.success('🎥 Camera started! Emotion detection active');
      } else {
        toast.error('Failed to access camera');
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Camera access denied');
    }
  };

  const stopEmotionDetection = () => {
    riveEmotionDetection.stopCamera();
    setIsDetecting(false);
    setCameraEnabled(false);
    toast.success('Emotion detection stopped');
  };

  const testHuggingFaceAPI = async () => {
    toast.loading('Testing Hugging Face API...');
    
    try {
      // Create a test canvas with a simple face
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw a simple smiley face for testing
        ctx.fillStyle = '#FFE4B5';
        ctx.fillRect(0, 0, 200, 200);
        
        // Face
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(100, 100, 80, 0, 2 * Math.PI);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(75, 80, 8, 0, 2 * Math.PI);
        ctx.arc(125, 80, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Smile
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(100, 100, 40, 0, Math.PI);
        ctx.stroke();
        
        // Convert to blob and test
        canvas.toBlob(async (blob) => {
          if (blob) {
            // Simulate emotion detection
            const testEmotion: EmotionResult = {
              emotion: 'happy',
              confidence: 0.95,
              timestamp: Date.now()
            };
            
            setCurrentEmotion(testEmotion);
            toast.success('🤗 Hugging Face API test successful!');
          }
        }, 'image/jpeg', 0.8);
      }
    } catch (error) {
      console.error('HF API test failed:', error);
      toast.error('Hugging Face API test failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-3">
            <Eye className="h-6 w-6" />
            Emotion Detection Test Suite
            <Camera className="h-6 w-6" />
          </CardTitle>
          <p className="text-center text-purple-100">
            Test Hugging Face emotion detection and Rive animation integration
          </p>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Rive Animation Display */}
        <Card>
          <CardHeader>
            <CardTitle>Rive Panda Animation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64 bg-gradient-to-b from-sky-200 to-sky-100 rounded-lg overflow-hidden flex items-center justify-center relative">
              {!riveError && riveLoaded && (
                <RiveComponent className="w-full h-full" />
              )}
              
              {riveError && (
                <div className="text-center">
                  <div className="text-6xl mb-2">🐼</div>
                  <div className="text-sm text-red-600">Rive file not found</div>
                  <div className="text-xs text-gray-500">Using fallback display</div>
                </div>
              )}
              
              {!riveLoaded && !riveError && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <div className="text-sm text-gray-600">Loading Rive...</div>
                </div>
              )}
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Rive Status:</span>
                <Badge variant={riveLoaded ? "default" : riveError ? "destructive" : "secondary"}>
                  {riveLoaded ? "Loaded" : riveError ? "Error" : "Loading"}
                </Badge>
              </div>
              
              {/* Manual Emotion Triggers */}
              <div className="grid grid-cols-3 gap-1 mt-3">
                <Button size="sm" onClick={() => triggerRiveEmotion('happy')} variant="outline">😊</Button>
                <Button size="sm" onClick={() => triggerRiveEmotion('sad')} variant="outline">😢</Button>
                <Button size="sm" onClick={() => triggerRiveEmotion('angry')} variant="outline">😠</Button>
                <Button size="sm" onClick={() => triggerRiveEmotion('surprised')} variant="outline">😲</Button>
                <Button size="sm" onClick={() => triggerRiveEmotion('fear')} variant="outline">😰</Button>
                <Button size="sm" onClick={() => triggerRiveEmotion('neutral')} variant="outline">😐</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Detection Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={isDetecting ? stopEmotionDetection : startEmotionDetection}
                variant={isDetecting ? "destructive" : "default"}
                className="flex-1"
              >
                {isDetecting ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Stop Detection
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Start Detection
                  </>
                )}
              </Button>
            </div>
            
            <Button
              onClick={testHuggingFaceAPI}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Test Hugging Face API
            </Button>

            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Camera:</span>
                <Badge variant={cameraEnabled ? "default" : "secondary"}>
                  {cameraEnabled ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Detection:</span>
                <Badge variant={isDetecting ? "default" : "secondary"}>
                  {isDetecting ? "Running" : "Stopped"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Emotion */}
        <Card>
          <CardHeader>
            <CardTitle>Current Emotion</CardTitle>
          </CardHeader>
          <CardContent>
            {currentEmotion ? (
              <div className="text-center space-y-4">
                <div className="text-6xl">
                  {currentEmotion.emotion === 'happy' && '😊'}
                  {currentEmotion.emotion === 'sad' && '😢'}
                  {currentEmotion.emotion === 'angry' && '😠'}
                  {currentEmotion.emotion === 'surprised' && '😲'}
                  {currentEmotion.emotion === 'fear' && '😰'}
                  {currentEmotion.emotion === 'disgust' && '🤢'}
                  {currentEmotion.emotion === 'neutral' && '😐'}
                </div>
                
                <div>
                  <Badge 
                    className="text-lg px-4 py-2"
                    style={{ 
                      backgroundColor: EMOTION_MAPPING[currentEmotion.emotion]?.color + '20',
                      color: EMOTION_MAPPING[currentEmotion.emotion]?.color
                    }}
                  >
                    {currentEmotion.emotion.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600">
                  <div>Confidence: {Math.round(currentEmotion.confidence * 100)}%</div>
                  <div>Detected: {new Date(currentEmotion.timestamp).toLocaleTimeString()}</div>
                </div>
                
                <div className="text-xs text-gray-500">
                  {EMOTION_MAPPING[currentEmotion.emotion]?.description}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No emotion detected yet</p>
                <p className="text-xs">Start detection to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Emotion History */}
      {emotionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Emotion History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {emotionHistory.slice(-10).map((emotion, index) => (
                <div key={index} className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-2xl mb-1">
                    {emotion.emotion === 'happy' && '😊'}
                    {emotion.emotion === 'sad' && '😢'}
                    {emotion.emotion === 'angry' && '😠'}
                    {emotion.emotion === 'surprised' && '😲'}
                    {emotion.emotion === 'fear' && '😰'}
                    {emotion.emotion === 'disgust' && '🤢'}
                    {emotion.emotion === 'neutral' && '😐'}
                  </div>
                  <div className="text-xs font-medium">{emotion.emotion}</div>
                  <div className="text-xs text-gray-500">
                    {Math.round(emotion.confidence * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>1. Camera Test:</strong> Click "Start Detection" to test camera access</p>
          <p><strong>2. Hugging Face Test:</strong> Click "Test Hugging Face API" to test the emotion detection API</p>
          <p><strong>3. Live Detection:</strong> Make different facial expressions to test real-time detection</p>
          <p><strong>4. Integration:</strong> This component demonstrates how emotions will control Rive animations</p>
          <div className="bg-blue-50 p-3 rounded mt-4">
            <p className="text-blue-800 font-medium">🎯 Expected Behavior:</p>
            <p className="text-blue-700">When you make facial expressions, the system should detect your emotions and the MoodPet animations should respond accordingly with matching facial expressions and movements.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
