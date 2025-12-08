import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface BreathTrackerProps {
  onBreathUpdate: (intensity: number) => void;
  isActive: boolean;
  onStreamReady?: (stream: MediaStream) => void;
  onStreamEnd?: (stream: MediaStream) => void;
}

const BreathTracker: React.FC<BreathTrackerProps> = ({ onBreathUpdate, isActive, onStreamReady, onStreamEnd }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);
  const currentStreamRef = useRef<MediaStream | null>(null);

  const startListening = async () => {
    try {
      setError(null);
      
      // Clean up any existing stream first
      if (currentStreamRef.current) {
        currentStreamRef.current.getTracks().forEach(track => track.stop());
        if (onStreamEnd) onStreamEnd(currentStreamRef.current);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });
      
      currentStreamRef.current = stream;
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.9; // Smooth out jitter
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      setHasPermission(true);
      
      // Register stream with parent for cleanup
      if (onStreamReady) onStreamReady(stream);
      
      analyzeAudio();
    } catch (err) {
      console.error(err);
      setError("Microphone access denied.");
    }
  };

  const stopListening = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    
    if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
    }
    
    if (currentStreamRef.current) {
        currentStreamRef.current.getTracks().forEach(track => track.stop());
        if (onStreamEnd) onStreamEnd(currentStreamRef.current);
        currentStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setHasPermission(false);
  };

  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume
    let sum = 0;
    // We focus on lower-mid frequencies where breath wind noise usually sits
    const range = Math.floor(bufferLength * 0.5); 
    for (let i = 0; i < range; i++) {
      sum += dataArray[i];
    }
    const average = sum / range;

    // Normalize: Breath isn't usually extremely loud. 
    // Let's cap max expected input at 100 (out of 255) for a "full blow"
    const normalized = Math.min(Math.max((average - 5) / 50, 0), 1); // threshold 5 to remove floor noise
    
    // Invert or map? 
    // Sound (Exhale) = High value. Silence (Inhale) = Low value.
    onBreathUpdate(normalized);

    rafRef.current = requestAnimationFrame(analyzeAudio);
  };

  useEffect(() => {
    if (isActive) {
      startListening();
    } else {
      stopListening();
    }
    return () => {
      stopListening();
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 md:top-4 z-50 pointer-events-none">
        {/* Visual Feedback for Breath Mode - Mobile Responsive */}
        {error ? (
            <div className="bg-red-500/80 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full flex items-center gap-2 backdrop-blur-md">
                <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs font-bold">Mic Error</span>
            </div>
        ) : hasPermission ? (
            <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-1.5 md:px-6 md:py-2 rounded-full flex items-center gap-2 md:gap-3 backdrop-blur-md animate-pulse">
                <Mic className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs font-bold tracking-widest hidden sm:inline">LISTENING TO BREATH</span>
                <span className="text-xs font-bold tracking-widest sm:hidden">MIC ACTIVE</span>
            </div>
        ) : (
            <div className="bg-black/50 border border-white/20 text-white/50 px-4 py-1.5 md:px-6 md:py-2 rounded-full flex items-center gap-2 backdrop-blur-md">
                <MicOff className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs">Initializing...</span>
            </div>
        )}
    </div>
  );
};

export default BreathTracker;