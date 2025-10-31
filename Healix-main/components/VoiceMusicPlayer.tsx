"use client";
import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaStop, FaVolumeUp, FaVolumeDown } from 'react-icons/fa';
import { useVoiceMusicAssistant } from '@/hooks/useVoiceMusicAssistant';
import { MusicService, MusicTrack } from '@/lib/musicService';
import toast from 'react-hot-toast';
export default function VoiceMusicPlayer() {
  const { state } = useVoiceMusicAssistant();
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showVolumeIndicator, setShowVolumeIndicator] = useState(false);
  const volumeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const musicService = MusicService.getInstance();
  useEffect(() => {
    musicService.onTrackChange((track) => {
      setCurrentTrack(track);
      if (track) {
        setShowPlayer(true);
      }
    });
    musicService.onPlayStateChange((playing) => {
      setIsPlaying(playing);
      if (!playing && !musicService.getCurrentTrack()) {
        setShowPlayer(false);
      }
    });
    musicService.onVolumeChange((newVolume) => {
      const newVol = Math.round(newVolume * 100);
      setVolume(newVol);
      showVolumeChange(newVol);
    });
    setVolume(Math.round(musicService.getVolume() * 100));
  }, [musicService]);
  useEffect(() => {
    const handleCloseMusicPlayer = () => {
      console.log('🚪 VoiceMusicPlayer: Received close player event');
      setShowPlayer(false);
      setCurrentTrack(null);
    };
    window.addEventListener('voice-close-music-player', handleCloseMusicPlayer);
    return () => {
      window.removeEventListener('voice-close-music-player', handleCloseMusicPlayer);
    };
  }, []);
  const handlePlayPause = () => {
    if (isPlaying) {
      musicService.pause();
      toast.success("Music paused");
    } else {
      musicService.resume();
      toast.success("Music resumed");
    }
  };
  const handleStop = () => {
    musicService.stop();
    toast.success("Music stopped");
  };
  const showVolumeChange = (newVol: number) => {
    setShowVolumeIndicator(true);
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeIndicator(false);
    }, 2000);
  };
  const handleVolumeUp = () => {
    const newVol = Math.min(100, volume + 10);
    setVolume(newVol);
    musicService.setVolume(newVol / 100);
    showVolumeChange(newVol);
    toast.success(`Volume: ${newVol}%`);
  };
  const handleVolumeDown = () => {
    const newVol = Math.max(0, volume - 10);
    setVolume(newVol);
    musicService.setVolume(newVol / 100);
    showVolumeChange(newVol);
    toast.success(`Volume: ${newVol}%`);
  };
  const handleVolumeSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value);
    setVolume(newVol);
    musicService.setVolume(newVol / 100);
    showVolumeChange(newVol);
  };
  useEffect(() => {
    return () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
    };
  }, []);
  if (!showPlayer) {
    return null;
  }
  return (
    <div className="fixed bottom-24 right-8 z-40 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 w-80 border-2 border-gray-200 dark:border-gray-700">
      {}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">🎵 Music Player</h3>
        <button
          onClick={() => setShowPlayer(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>
      {}
      {currentTrack && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg">
          <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
            {currentTrack.title}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
            {currentTrack.artist}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {currentTrack.category.charAt(0).toUpperCase() + currentTrack.category.slice(1)}
          </p>
        </div>
      )}
      {}
      {state.transcript && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-gray-700 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 italic">
            🎤 "{state.transcript}"
          </p>
        </div>
      )}
      {}
      <div className="flex justify-center items-center gap-3 mb-3">
        <button
          onClick={handleStop}
          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all hover:scale-110"
          title="Stop"
        >
          <FaStop size={16} />
        </button>
        <button
          onClick={handlePlayPause}
          className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all hover:scale-110"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
        </button>
      </div>
      {}
      <div className="mb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <button
            onClick={handleVolumeDown}
            className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition-all hover:scale-110"
            title="Volume Down"
          >
            <FaVolumeDown size={16} className="text-gray-700 dark:text-gray-300" />
          </button>
          <div className="flex-1 text-center">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {volume}%
            </span>
          </div>
          <button
            onClick={handleVolumeUp}
            className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition-all hover:scale-110"
            title="Volume Up"
          >
            <FaVolumeUp size={16} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>
        {}
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeSlider}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume}%, #e5e7eb ${volume}%, #e5e7eb 100%)`
            }}
          />
          {}
          {showVolumeIndicator && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
              <div className="text-center">
                <FaVolumeUp className="inline-block mb-1" />
                <p className="text-lg font-bold">{volume}%</p>
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-blue-500"></div>
            </div>
          )}
        </div>
      </div>
      {}
      <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
        <p className="font-semibold mb-1">🎤 Voice Commands:</p>
        <ul className="space-y-0.5 text-[10px]">
          <li>• "Play rain/forest/ocean/peaceful"</li>
          <li>• "Pause" / "Resume" / "Stop"</li>
          <li>• "Volume up" / "Volume down"</li>
          <li>• "Next" / "Previous"</li>
          <li>• "Exit music player" - Close player</li>
          <li>• "Goodbye" - Stop music & mic</li>
        </ul>
      </div>
    </div>
  );
}
