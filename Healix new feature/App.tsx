
import React, { useState, useCallback, useRef } from 'react';
import HandTracker from './components/HandTracker';
import ParticleSystem from './components/ParticleSystem';
import Controls from './components/Controls';
import AudioEngine from './components/AudioEngine';
import BreathTracker from './components/BreathTracker';
import VisualBreathTracker from './components/VisualBreathTracker';
import { ShapeType, HandData, PALETTES, ControlMode } from './types';

const App: React.FC = () => {
  const [shape, setShape] = useState<ShapeType>(ShapeType.DNA); 
  const [color, setColor] = useState<number>(PALETTES[0].hex);
  const [tension, setTension] = useState<number>(0.5);
  const [explode, setExplode] = useState<boolean>(false);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(false);
  const [controlMode, setControlMode] = useState<ControlMode>(ControlMode.HAND);
  
  const prevTensionRef = useRef<number>(0.5);

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

      {/* Title */}
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tighter opacity-90">
          HEALIX VISUALIZER
        </h1>
        <p className="text-cyan-400/60 font-mono text-sm mt-1 tracking-widest">
          INTERACTIVE BIO-FEEDBACK
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

      {/* Inputs - Conditionally Rendered to manage resources */}
      {controlMode === ControlMode.HAND && (
          <HandTracker onHandUpdate={handleHandUpdate} />
      )}
      
      <BreathTracker 
        isActive={controlMode === ControlMode.AUDIO_BREATH} 
        onBreathUpdate={handleMicBreathUpdate} 
      />

      {controlMode === ControlMode.VISUAL_BREATH && (
          <VisualBreathTracker onBreathUpdate={handleVisualBreathUpdate} />
      )}

      {/* UI Controls */}
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
  );
};

export default App;
