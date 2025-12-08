import React from 'react';
import { ShapeType, PALETTES, ControlMode } from '../types';
import { MousePointer2, Activity, Volume2, VolumeX, Hand, Wind, User } from 'lucide-react';

interface ControlsProps {
  currentShape: ShapeType;
  onShapeChange: (s: ShapeType) => void;
  currentColor: number;
  onColorChange: (c: number) => void;
  tension: number;
  isAudioOn: boolean;
  onToggleAudio: () => void;
  controlMode: ControlMode;
  onControlModeChange: (m: ControlMode) => void;
}

const Controls: React.FC<ControlsProps> = ({
  currentShape,
  onShapeChange,
  currentColor,
  onColorChange,
  tension,
  isAudioOn,
  onToggleAudio,
  controlMode,
  onControlModeChange
}) => {
  return (
    <div className="w-full">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 md:p-4 shadow-2xl">
        
        {/* Top Row: Tension, Audio, Mode - Mobile Responsive */}
        <div className="mb-3 md:mb-4 flex items-center space-x-2 md:space-x-3">
          {/* Mode Switcher */}
          <div className="flex bg-black/40 rounded-full p-1 border border-white/10">
             <button
                onClick={() => onControlModeChange(ControlMode.HAND)}
                className={`p-1 md:p-1.5 rounded-full transition-all ${controlMode === ControlMode.HAND ? 'bg-cyan-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                title="Hand Control"
             >
                <Hand className="w-3 h-3 md:w-4 md:h-4" />
             </button>
             <button
                onClick={() => onControlModeChange(ControlMode.AUDIO_BREATH)}
                className={`p-1 md:p-1.5 rounded-full transition-all ${controlMode === ControlMode.AUDIO_BREATH ? 'bg-emerald-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                title="Microphone Breath"
             >
                <Wind className="w-3 h-3 md:w-4 md:h-4" />
             </button>
             <button
                onClick={() => onControlModeChange(ControlMode.VISUAL_BREATH)}
                className={`p-1 md:p-1.5 rounded-full transition-all ${controlMode === ControlMode.VISUAL_BREATH ? 'bg-purple-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                title="Visual Breath (Camera)"
             >
                <User className="w-3 h-3 md:w-4 md:h-4" />
             </button>
          </div>

          {/* Tension Bar */}
          <Activity className={`w-3 h-3 md:w-4 md:h-4 ${tension > 0.8 ? 'text-red-400' : 'text-cyan-400'}`} />
          <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ease-out ${tension > 0.8 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)]'}`}
              style={{ width: `${tension * 100}%` }}
            />
          </div>
          
          <button 
            onClick={onToggleAudio}
            className="p-1.5 md:p-2 rounded-full hover:bg-white/10 transition-colors text-white/80"
            title={isAudioOn ? "Mute Sound" : "Enable Sound"}
          >
            {isAudioOn ? <Volume2 className="w-3 h-3 md:w-4 md:h-4 text-cyan-400" /> : <VolumeX className="w-3 h-3 md:w-4 md:h-4" />}
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          
          {/* Shape Selector - Mobile Responsive */}
          <div className="flex flex-wrap justify-center gap-1 md:gap-2">
            {Object.values(ShapeType).map((shape) => (
              <button
                key={shape}
                onClick={() => onShapeChange(shape)}
                className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 border ${
                  currentShape === shape
                    ? 'bg-white/20 border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105'
                    : 'bg-transparent border-transparent text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                {shape}
              </button>
            ))}
          </div>

          <div className="w-px h-8 bg-white/20 hidden md:block"></div>

          {/* Color Picker - Mobile Responsive */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {PALETTES.map((p) => (
              <button
                key={p.name}
                onClick={() => onColorChange(p.hex)}
                className={`w-5 h-5 md:w-6 md:h-6 rounded-full transition-all duration-300 border-2 ${
                  currentColor === p.hex
                    ? 'border-white scale-125 shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                    : 'border-transparent opacity-70 hover:opacity-100 hover:scale-110'
                }`}
                style={{ backgroundColor: `rgb(${p.rgb[0]}, ${p.rgb[1]}, ${p.rgb[2]})` }}
                title={p.name}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="text-center mt-2 text-white/30 text-xs font-light tracking-widest uppercase flex items-center justify-center gap-2">
        {controlMode === ControlMode.HAND && (
            <>
                <MousePointer2 className="w-3 h-3" />
                <span className="hidden sm:inline">Hand/Mouse • Open = Expand • Closed = Contract</span>
                <span className="sm:hidden">Hand Control Active</span>
            </>
        )}
        {controlMode === ControlMode.AUDIO_BREATH && (
            <>
                <Wind className="w-3 h-3" />
                <span className="hidden sm:inline">Mic Breath • Inhale (Silent) = Expand • Exhale (Loud) = Contract</span>
                <span className="sm:hidden">Microphone Active</span>
            </>
        )}
        {controlMode === ControlMode.VISUAL_BREATH && (
            <>
                <User className="w-3 h-3" />
                <span className="hidden sm:inline">Visual Breath • Shoulders Up (Inhale) = Expand • Shoulders Down = Contract</span>
                <span className="sm:hidden">Camera Active</span>
            </>
        )}
      </div>
    </div>
  );
};

export default Controls;