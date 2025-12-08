import React, { useEffect, useRef } from 'react';

interface AudioEngineProps {
  isPlaying: boolean;
  tension: number; // 0.0 (open) to 1.0 (closed)
}

const AudioEngine: React.FC<AudioEngineProps> = ({ isPlaying, tension }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  // Initialize Audio Context
  useEffect(() => {
    if (!isPlaying) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // Master Gain (Volume)
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // Lowpass Filter (Controlled by tension)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    filter.Q.value = 1;
    filter.connect(masterGain);
    filterRef.current = filter;

    // Create a drone chord (C Major 9ish)
    // Frequencies: C3 (130.81), G3 (196.00), B3 (246.94), D4 (293.66)
    const freqs = [130.81, 196.00, 246.94, 293.66, 392.00]; 
    
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;

      // Individual gain for balance
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.1 / (i + 1); 
      
      // Slight detune for thickness
      osc.detune.value = (Math.random() - 0.5) * 10;

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      oscillatorsRef.current.push(osc);
    });

    return () => {
      ctx.close();
    };
  }, [isPlaying]);

  // Update Audio based on Tension
  useEffect(() => {
    if (!filterRef.current || !audioCtxRef.current) return;

    // Map Tension to Filter Frequency
    // Open Hand (0.0) -> High Frequency (Bright, Air) -> 2000Hz
    // Closed Hand (1.0) -> Low Frequency (Muffled, Underwater) -> 200Hz
    // Use exponential ramp for smooth transition
    
    const targetFreq = 2000 - (tension * 1800); 
    const currentTime = audioCtxRef.current.currentTime;
    
    filterRef.current.frequency.cancelScheduledValues(currentTime);
    filterRef.current.frequency.linearRampToValueAtTime(targetFreq, currentTime + 0.1);

  }, [tension]);

  return null; // Logic only component
};

export default AudioEngine;