"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, Mic, MicOff, Heart, Waves } from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { Badge } from '@/components/ui/badge';
interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  url: string;
  category: 'meditation' | 'nature' | 'ambient' | 'classical' | 'binaural';
  description: string;
  benefits: string[];
}
const stressReliefTracks: Track[] = [
  {
    id: '1',
    title: 'Healix Meditation',
    artist: 'Healix Therapy',
    duration: '10:00',
    url: '/audio/therapy/meditation/healix.mp3',
    category: 'meditation',
    description: 'Soothing meditation music for deep relaxation and mental wellness',
    benefits: ['Reduces stress and anxiety', 'Promotes deep relaxation', 'Enhances mindfulness', 'Improves mental clarity']
  },
  {
    id: '2',
    title: 'Flute Meditation',
    artist: 'Mindful Music',
    duration: '12:00',
    url: '/audio/therapy/meditation/flute%20music.mp3',
    category: 'meditation',
    description: 'Peaceful flute music for meditation and relaxation',
    benefits: ['Improves mindfulness', 'Reduces anxiety', 'Enhances emotional regulation']
  },
  {
    id: '3',
    title: 'Forest Meditation',
    artist: 'Nature Sounds',
    duration: '10:00',
    url: '/audio/therapy/meditation/Forest%20meditation.mp3',
    category: 'nature',
    description: 'Guided forest meditation with ambient nature sounds',
    benefits: ['Reduces cortisol levels', 'Improves focus', 'Promotes relaxation']
  },
  {
    id: '4',
    title: 'Peaceful Rain',
    artist: 'Therapeutic Sounds',
    duration: '15:00',
    url: '/audio/therapy/meditation/rain%20music.mp3',
    category: 'nature',
    description: 'Gentle rainfall sounds to calm your mind and reduce anxiety',
    benefits: ['Promotes deep relaxation', 'Supports emotional healing', 'Reduces muscle tension']
  },
  {
    id: '5',
    title: 'Ambient Healing',
    artist: 'Ambient Sounds',
    duration: '18:00',
    url: '/audio/therapy/meditation/Ambient%20music.mp3',
    category: 'ambient',
    description: 'Soothing ambient tones designed for deep healing and restoration',
    benefits: ['Enhances cognitive function', 'Reduces stress', 'Improves mood stability']
  },
  {
    id: '6',
    title: 'Classical Serenity',
    artist: 'Classical Collection',
    duration: '20:00',
    url: '/audio/therapy/meditation/classical%20serenity.mp3',
    category: 'classical',
    description: 'Carefully selected classical pieces known for their calming effects',
    benefits: ['Synchronizes brainwaves', 'Enhances creativity', 'Promotes calm alertness']
  },
  {
    id: '7',
    title: 'Binaural Beats - Alpha Waves',
    artist: 'Brainwave Therapy',
    duration: '20:00',
    url: '/audio/therapy/meditation/binaural%20beats.mp3',
    category: 'binaural',
    description: 'Alpha wave frequencies (8-12 Hz) for relaxed awareness and creativity',
    benefits: ['Synchronizes brainwaves', 'Enhances creativity', 'Promotes calm alertness']
  }
];
export default function MusicPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const audioRefs = useRef<HTMLAudioElement[]>([]);
  const recognitionRef = useRef<any>(null);
  const categories = ['all', 'meditation', 'nature', 'ambient', 'classical', 'binaural'];
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        handleVoiceCommand(transcript);
      };
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    }
  }, [isListening]);
  const handleVoiceCommand = (command: string) => {
    console.log('Voice command:', command);
    if (command.includes('rain') || command.includes('rainfall')) {
      const track = stressReliefTracks.find(t => t.title.toLowerCase().includes('rain'));
      if (track) {
        const trackIndex = stressReliefTracks.indexOf(track);
        setCurrentTrack(trackIndex);
        setTimeout(() => playTrack(), 100);
      }
    } else if (command.includes('forest')) {
      const track = stressReliefTracks.find(t => t.title.toLowerCase().includes('forest'));
      if (track) {
        const trackIndex = stressReliefTracks.indexOf(track);
        setCurrentTrack(trackIndex);
        setTimeout(() => playTrack(), 100);
      }
    } else if (command.includes('ocean') || command.includes('wave')) {
      const track = stressReliefTracks.find(t => t.title.toLowerCase().includes('ocean'));
      if (track) {
        const trackIndex = stressReliefTracks.indexOf(track);
        setCurrentTrack(trackIndex);
        setTimeout(() => playTrack(), 100);
      }
    } else if (command.includes('peaceful') || command.includes('calm') || command.includes('healix')) {
      const track = stressReliefTracks.find(t => t.title === 'Healix Meditation');
      if (track) {
        const trackIndex = stressReliefTracks.indexOf(track);
        setCurrentTrack(trackIndex);
        setTimeout(() => playTrack(), 100);
      }
    } else if (command.includes('play') && !command.includes('pause')) {
      playTrack();
    } else if (command.includes('pause')) {
      pauseTrack();
    } else if (command.includes('resume') || command.includes('continue')) {
      playTrack();
    } else if (command.includes('stop')) {
      pauseTrack();
      const audio = audioRefs.current[currentTrack];
      if (audio) {
        audio.currentTime = 0;
      }
    } else if (command.includes('next') || command.includes('skip')) {
      console.log('🎵 Next command detected');
      nextTrack();
    } else if (command.includes('previous') || command.includes('back')) {
      console.log('🎵 Previous command detected');
      previousTrack();
    } else if (command.includes('volume up') || command.includes('louder')) {
      const newVolume = Math.min(1, volume + 0.1);
      setVolume(newVolume);
      const audio = audioRefs.current[currentTrack];
      if (audio) {
        audio.volume = newVolume;
      }
    } else if (command.includes('volume down') || command.includes('quieter')) {
      const newVolume = Math.max(0, volume - 0.1);
      setVolume(newVolume);
      const audio = audioRefs.current[currentTrack];
      if (audio) {
        audio.volume = newVolume;
      }
    } else if (command.includes('exit music') || command.includes('close music') || command.includes('exit player') || command.includes('close player')) {
      console.log('🚪 Exit music player command');
      pauseTrack();
      const audio = audioRefs.current[currentTrack];
      if (audio) {
        audio.currentTime = 0;
      }
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    } else if (command.includes('goodbye') || command.includes('bye')) {
      console.log('👋 Goodbye command');
      if (isPlaying) {
        pauseTrack();
        const audio = audioRefs.current[currentTrack];
        if (audio) {
          audio.currentTime = 0;
        }
      }
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  };
  const toggleVoiceListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };
  useEffect(() => {
    const audio = audioRefs.current[currentTrack];
    if (!audio) return;
    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      nextTrack();
    };
    const handleCanPlay = () => {
      setIsLoading(false);
    };
    const handleError = (e: any) => {
      console.error('Audio loading error:', e);
      setIsLoading(false);
      setIsPlaying(false);
    };
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.volume = volume;
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrack, volume]);
  const playTrack = async () => {
    const audio = audioRefs.current[currentTrack];
    if (!audio) return;
    try {
      setIsLoading(true);
      await audio.play();
      setIsPlaying(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      setIsLoading(false);
    }
  };
  const pauseTrack = () => {
    const audio = audioRefs.current[currentTrack];
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };
  const togglePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack();
    }
  };
  const nextTrack = () => {
    const wasPlaying = isPlaying;
    const currentAudio = audioRefs.current[currentTrack];
    if (currentAudio) {
      currentAudio.pause();
    }
    const filteredTracks = getFilteredTracks();
    const currentIndex = filteredTracks.findIndex(track => track.id === stressReliefTracks[currentTrack].id);
    const nextIndex = (currentIndex + 1) % filteredTracks.length;
    const nextTrackIndex = stressReliefTracks.findIndex(track => track.id === filteredTracks[nextIndex].id);
    setCurrentTrack(nextTrackIndex);
    setCurrentTime(0);
    if (wasPlaying) {
      setIsLoading(true);
      const nextAudio = audioRefs.current[nextTrackIndex];
      if (nextAudio) {
        nextAudio.currentTime = 0;
        nextAudio.volume = volume;
        nextAudio.play().then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        }).catch(error => {
          console.error('Error playing next track:', error);
          setIsLoading(false);
        });
      }
    } else {
      setIsPlaying(false);
    }
  };
  const previousTrack = () => {
    const wasPlaying = isPlaying;
    const currentAudio = audioRefs.current[currentTrack];
    if (currentAudio) {
      currentAudio.pause();
    }
    const filteredTracks = getFilteredTracks();
    const currentIndex = filteredTracks.findIndex(track => track.id === stressReliefTracks[currentTrack].id);
    const prevIndex = currentIndex === 0 ? filteredTracks.length - 1 : currentIndex - 1;
    const prevTrackIndex = stressReliefTracks.findIndex(track => track.id === filteredTracks[prevIndex].id);
    setCurrentTrack(prevTrackIndex);
    setCurrentTime(0);
    if (wasPlaying) {
      setIsLoading(true);
      const prevAudio = audioRefs.current[prevTrackIndex];
      if (prevAudio) {
        prevAudio.currentTime = 0;
        prevAudio.volume = volume;
        prevAudio.play().then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        }).catch(error => {
          console.error('Error playing previous track:', error);
          setIsLoading(false);
        });
      }
    } else {
      setIsPlaying(false);
    }
  };
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    const audio = audioRefs.current[currentTrack];
    if (audio) {
      audio.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };
  const toggleMute = () => {
    const audio = audioRefs.current[currentTrack];
    if (audio) {
      if (isMuted) {
        audio.volume = volume;
        setIsMuted(false);
      } else {
        audio.volume = 0;
        setIsMuted(true);
      }
    }
  };
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRefs.current[currentTrack];
    if (audio) {
      const newTime = (parseFloat(e.target.value) / 100) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  const getFilteredTracks = () => {
    if (selectedCategory === 'all') return stressReliefTracks;
    return stressReliefTracks.filter(track => track.category === selectedCategory);
  };
  const currentTrackData = stressReliefTracks[currentTrack];
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#d6e2ea' }}>
      <div className="container mx-auto p-3 md:p-6">
        { }
        <div className="text-center mb-4 md:mb-8 mt-3 md:mt-8 px-4">
          <div className="mb-2 md:mb-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600" style={{
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              paddingBottom: '0.25rem'
            }}>
              Stress Relief Music Therapy
            </h1>
          </div>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-2 leading-relaxed">
            Scientifically curated music tracks designed to reduce stress, anxiety, and promote mental wellness.
            Use voice commands or manual controls to enhance your therapeutic experience.
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          { }
          <div className="lg:col-span-2">
            <Card className="shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-xl md:text-2xl flex items-center gap-2 text-blue-800">
                  <Music className="h-5 w-5 md:h-6 md:w-6" />
                  Now Playing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-6 p-4 md:p-6">
                { }
                <div className="text-center">
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mb-1.5 md:mb-2">{currentTrackData.title}</h3>
                  <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-1.5 md:mb-2">{currentTrackData.artist}</p>
                  <Badge className="mb-2 md:mb-3 text-[10px] sm:text-xs md:text-sm">{currentTrackData.category}</Badge>
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mb-2 md:mb-4 px-2 leading-relaxed">{currentTrackData.description}</p>
                  { }
                  <div className="flex flex-wrap justify-center gap-1 md:gap-2 mb-2 md:mb-4 px-2">
                    {currentTrackData.benefits.map((benefit, index) => (
                      <span key={index} className="inline-flex items-center gap-0.5 md:gap-1 px-1.5 md:px-3 py-0.5 md:py-1 text-[9px] sm:text-[10px] md:text-xs bg-green-100 text-green-700 rounded-full">
                        <Heart className="h-2 w-2 md:h-3 md:w-3 flex-shrink-0" />
                        <span className="leading-tight">{benefit}</span>
                      </span>
                    ))}
                  </div>
                </div>
                { }
                <div className="space-y-1.5 md:space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={duration ? (currentTime / duration) * 100 : 0}
                    onChange={handleProgressChange}
                    className="w-full h-1.5 md:h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-[10px] sm:text-xs text-gray-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
                { }
                <div className="flex items-center justify-center space-x-2 md:space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={previousTrack}
                    className="rounded-full w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 p-0"
                  >
                    <SkipBack className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  </Button>
                  <Button
                    onClick={togglePlayPause}
                    disabled={isLoading}
                    className="rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 p-0 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 border-2 border-white border-t-transparent" />
                    ) : isPlaying ? (
                      <Pause className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                    ) : (
                      <Play className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextTrack}
                    className="rounded-full w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 p-0"
                  >
                    <SkipForward className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  </Button>
                </div>
                { }
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="p-1"
                  >
                    {isMuted ? <VolumeX className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <Volume2 className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                  </Button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-1.5 md:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                { }
                {stressReliefTracks.map((track, index) => (
                  <audio
                    key={track.id}
                    ref={(el) => { audioRefs.current[index] = el; }}
                    src={track.url}
                    preload="auto"
                  />
                ))}
              </CardContent>
            </Card>
          </div>
          { }
          <div>
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Waves className="h-4 w-4 md:h-5 md:w-5" />
                  Music Library
                </CardTitle>
                { }
                <div className="flex flex-wrap gap-1.5 md:gap-2 mt-3 md:mt-4">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="text-[10px] md:text-xs px-2 md:px-3 py-1"
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 md:max-h-96 overflow-y-auto">
                  {getFilteredTracks().map((track) => {
                    const actualIndex = stressReliefTracks.findIndex(t => t.id === track.id);
                    return (
                      <div
                        key={track.id}
                        onClick={() => {
                          const wasPlaying = isPlaying;
                          const currentAudio = audioRefs.current[currentTrack];
                          if (currentAudio) {
                            currentAudio.pause();
                          }
                          setCurrentTrack(actualIndex);
                          setCurrentTime(0);
                          if (wasPlaying) {
                            setTimeout(() => {
                              const newAudio = audioRefs.current[actualIndex];
                              if (newAudio) {
                                newAudio.currentTime = 0;
                                newAudio.volume = volume;
                                newAudio.play().catch(error => {
                                  console.error('Error playing track:', error);
                                });
                              }
                            }, 100);
                          } else {
                            setIsPlaying(false);
                          }
                        }}
                        className={`p-3 rounded cursor-pointer transition-colors ${actualIndex === currentTrack
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'hover:bg-gray-100 text-gray-700'
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <span className="font-medium block">{track.title}</span>
                            <span className="text-xs text-gray-500 block">{track.artist}</span>
                            <Badge variant="outline" className="text-xs mt-1">{track.category}</Badge>
                          </div>
                          <span className="text-xs text-gray-500 ml-2">{track.duration}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{track.description}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}