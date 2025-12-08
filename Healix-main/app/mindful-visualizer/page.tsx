"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Camera, Mic, AlertCircle } from 'lucide-react';
import HandTracker from './components/HandTracker';
import ParticleSystem from './components/ParticleSystem';
import Controls from './components/Controls';
import AudioEngine from './components/AudioEngine';
import BreathTracker from './components/BreathTracker';
import VisualBreathTracker from './components/VisualBreathTracker';
import { ShapeType, HandData, PALETTES, ControlMode } from './types';

const MindfulVisualizerPage: React.FC = () => {
  const router = useRouter();
  const [shape, setShape] = useState<ShapeType>(ShapeType.DNA); 
  const [color, setColor] = useState<number>(PALETTES[0].hex);
  const [tension, setTension] = useState<number>(0.5);
  const [explode, setExplode] = useState<boolean>(false);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(false);
  const [controlMode, setControlMode] = useState<ControlMode>(ControlMode.HAND);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const prevTensionRef = useRef<number>(0.5);
  const activeStreamsRef = useRef<MediaStream[]>([]);
  const componentStreamsRef = useRef<Set<MediaStream>>(new Set());

  // Initialize component and show permission dialog
  useEffect(() => {
    setIsInitialized(true);
    
    // Cleanup function to stop all media streams when component unmounts
    return () => {
      cleanupAllMediaStreams();
    };
  }, []);

  // Cleanup when leaving the page (browser navigation)
  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanupAllMediaStreams();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause streams when tab is hidden to save resources
        pauseAllStreams();
      } else if (permissionsGranted) {
        // Resume streams when tab becomes visible again
        resumeAllStreams();
      }
    };

    const handlePageHide = () => {
      cleanupAllMediaStreams();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [permissionsGranted]);

  const requestPermissions = async () => {
    try {
      setPermissionError(null);
      
      // Request both camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // Store the stream for cleanup
      activeStreamsRef.current.push(stream);
      
      // Stop the test stream immediately - components will request their own
      stream.getTracks().forEach(track => {
        track.stop();
      });
      
      setPermissionsGranted(true);
      setShowPermissionDialog(false);
    } catch (error) {
      console.error('Permission denied:', error);
      let errorMessage = 'Camera and microphone access are required for the full experience.';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Please allow camera and microphone access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera or microphone found on your device.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera or microphone is already in use by another application.';
        }
      }
      
      setPermissionError(errorMessage);
      setPermissionsGranted(false);
    }
  };

  const registerStream = (stream: MediaStream) => {
    componentStreamsRef.current.add(stream);
    activeStreamsRef.current.push(stream);
  };

  const unregisterStream = (stream: MediaStream) => {
    componentStreamsRef.current.delete(stream);
    const index = activeStreamsRef.current.indexOf(stream);
    if (index > -1) {
      activeStreamsRef.current.splice(index, 1);
    }
  };

  const cleanupAllMediaStreams = () => {
    // Stop all active streams
    [...componentStreamsRef.current, ...activeStreamsRef.current].forEach(stream => {
      stream.getTracks().forEach(track => {
        if (track.readyState === 'live') {
          track.stop();
        }
      });
    });
    
    componentStreamsRef.current.clear();
    activeStreamsRef.current = [];
  };

  const pauseAllStreams = () => {
    componentStreamsRef.current.forEach(stream => {
      stream.getTracks().forEach(track => {
        if (track.readyState === 'live') {
          track.enabled = false;
        }
      });
    });
  };

  const resumeAllStreams = () => {
    componentStreamsRef.current.forEach(stream => {
      stream.getTracks().forEach(track => {
        if (track.readyState === 'live') {
          track.enabled = true;
        }
      });
    });
  };

  const handleGoBack = () => {
    cleanupAllMediaStreams();
    router.back();
  };

  const handleRetryPermissions = () => {
    setShowPermissionDialog(true);
    requestPermissions();
  };

  const handleHandUpdate = useCallback((data: HandData) => {
    if (controlMode !== ControlMode.HAND) return;

    // Smooth the tension input slightly to reduce jitter
    setTension(prev => {
      const smoothed = prev + (data.tension - prev) * 0.1;
      
      // Clap Detection: Rapid spike from Low to High
      if (prevTensionRef.current < 0.35 && smoothed > 0.8) {
         setExplode(true);
      }
      prevTensionRef.current = smoothed;
      return smoothed;
    });
  }, [controlMode]);

  const handleMicBreathUpdate = useCallback((intensity: number) => {
    if (controlMode !== ControlMode.AUDIO_BREATH) return;

    // Mic Breath logic:
    // Silence (0.0) -> Inhale -> Expand (Tension 0.0)
    // Sound (1.0) -> Exhale -> Contract/Push (Tension 1.0)
    setTension(prev => {
        const target = intensity; 
        const smoothed = prev + (target - prev) * 0.05;
        return smoothed;
    });
  }, [controlMode]);

  const handleVisualBreathUpdate = useCallback((visualTension: number) => {
      if (controlMode !== ControlMode.VISUAL_BREATH) return;

      // Visual Breath Logic (already normalized in tracker)
      // 0.0 (Shoulders Up/Inhale) -> Expand
      // 1.0 (Shoulders Down/Exhale) -> Contract
      setTension(prev => {
          const smoothed = prev + (visualTension - prev) * 0.08;
          return smoothed;
      });
  }, [controlMode]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden selection:bg-cyan-500/30">
      
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black z-[-1]" />

      {/* Permission Dialog */}
      {showPermissionDialog && isInitialized && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-8 max-w-md mx-4 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex gap-4">
                <Camera className="w-8 h-8 text-cyan-400" />
                <Mic className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
              Camera & Microphone Access
            </h2>
            <p className="text-white/80 text-sm md:text-base mb-6">
              The Mindful Visualizer uses your camera and microphone to track breathing and hand movements for an immersive meditation experience. Your data stays private and is processed locally on your device.
            </p>
            {permissionError && (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-200 text-sm">{permissionError}</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={requestPermissions}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isInitialized}
              >
                Grant Access
              </button>
              <button
                onClick={() => {
                  setShowPermissionDialog(false);
                  setPermissionsGranted(true);
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Skip (Limited)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* X Button */}
      <button
        onClick={handleGoBack}
        className="absolute top-4 left-4 md:top-8 md:left-4 z-20 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 text-white/80 hover:text-white group"
        title="Go Back"
      >
        <X className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Title - Mobile Responsive */}
      <div className="absolute top-4 left-16 md:top-8 md:left-20 z-10 pointer-events-none">
        <h1 className="text-lg sm:text-2xl md:text-4xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tighter opacity-90">
          MINDFUL VISUALIZER
        </h1>
        <p className="text-cyan-400/60 font-mono text-xs sm:text-sm mt-1 tracking-widest">
          INTERACTIVE BIO-FEEDBACK MEDITATION
        </p>
      </div>

      {/* 3D Scene */}
      <ParticleSystem 
        shape={shape} 
        tension={tension} 
        color={color} 
        explode={explode}
        onExplosionHandled={() => setExplode(false)}
      />

      {/* Audio Engine (Invisible) */}
      <AudioEngine isPlaying={isAudioOn} tension={tension} />

      {/* Inputs - Conditionally Rendered based on permissions and control mode */}
      {permissionsGranted && (
        <>
          {controlMode === ControlMode.HAND && (
              <HandTracker 
                onHandUpdate={handleHandUpdate}
                onStreamReady={registerStream}
                onStreamEnd={unregisterStream}
              />
          )}
          
          <BreathTracker 
            isActive={controlMode === ControlMode.AUDIO_BREATH} 
            onBreathUpdate={handleMicBreathUpdate}
            onStreamReady={registerStream}
            onStreamEnd={unregisterStream}
          />

          {controlMode === ControlMode.VISUAL_BREATH && (
              <VisualBreathTracker 
                onBreathUpdate={handleVisualBreathUpdate}
                onStreamReady={registerStream}
                onStreamEnd={unregisterStream}
              />
          )}
        </>
      )}

      {/* Permission Error Retry Button */}
      {!permissionsGranted && !showPermissionDialog && (
        <button
          onClick={handleRetryPermissions}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          Enable Camera & Mic
        </button>
      )}

      {/* UI Controls - Mobile Responsive */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-xs sm:max-w-md md:max-w-2xl px-4">
        <Controls 
          currentShape={shape} 
          onShapeChange={setShape} 
          currentColor={color} 
          onColorChange={setColor}
          tension={tension}
          isAudioOn={isAudioOn}
          onToggleAudio={() => setIsAudioOn(prev => !prev)}
          controlMode={controlMode}
          onControlModeChange={setControlMode}
        />
      </div>
    </div>
  );
};

export default MindfulVisualizerPage;