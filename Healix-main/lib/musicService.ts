"use client";
export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  url: string;
  category: 'meditation' | 'nature' | 'ambient' | 'classical' | 'binaural' | 'focus' | 'energy' | 'sleep';
  description: string;
  benefits: string[];
  keywords: string[]; 
}
export class MusicService {
  private static instance: MusicService;
  private audioElement: HTMLAudioElement | null = null;
  private currentTrack: MusicTrack | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.7;
  private onTrackChangeCallback?: (track: MusicTrack | null) => void;
  private onPlayStateChangeCallback?: (isPlaying: boolean) => void;
  private onVolumeChangeCallback?: (volume: number) => void;
  static getInstance(): MusicService {
    if (!MusicService.instance) {
      MusicService.instance = new MusicService();
    }
    return MusicService.instance;
  }
  onTrackChange(callback: (track: MusicTrack | null) => void): void {
    this.onTrackChangeCallback = callback;
  }
  onPlayStateChange(callback: (isPlaying: boolean) => void): void {
    this.onPlayStateChangeCallback = callback;
  }
  onVolumeChange(callback: (volume: number) => void): void {
    this.onVolumeChangeCallback = callback;
  }
  async playByKeyword(keyword: string): Promise<boolean> {
    const track = this.findTrackByKeyword(keyword);
    if (track) {
      await this.playTrack(track);
      return true;
    }
    return false;
  }
  async playByCategory(category: string): Promise<boolean> {
    const tracks = this.getTracksByCategory(category);
    if (tracks.length > 0) {
      const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
      await this.playTrack(randomTrack);
      return true;
    }
    return false;
  }
  async playRandomTherapeutic(): Promise<boolean> {
    const therapeuticTracks = musicTracks.filter(track => 
      ['meditation', 'nature', 'ambient'].includes(track.category)
    );
    if (therapeuticTracks.length > 0) {
      const randomTrack = therapeuticTracks[Math.floor(Math.random() * therapeuticTracks.length)];
      await this.playTrack(randomTrack);
      return true;
    }
    return false;
  }
  private findTrackByKeyword(keyword: string): MusicTrack | null {
    const normalizedKeyword = keyword.toLowerCase();
    return musicTracks.find(track => 
      track.keywords.some(k => k.toLowerCase().includes(normalizedKeyword)) ||
      track.title.toLowerCase().includes(normalizedKeyword) ||
      track.category.toLowerCase().includes(normalizedKeyword)
    ) || null;
  }
  private getTracksByCategory(category: string): MusicTrack[] {
    return musicTracks.filter(track => 
      track.category.toLowerCase() === category.toLowerCase()
    );
  }
  async playTrack(track: MusicTrack): Promise<void> {
    try {
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.removeEventListener('ended', this.handleTrackEnd);
      }
      this.audioElement = new Audio(track.url);
      this.audioElement.volume = this.volume;
      this.currentTrack = track;
      this.audioElement.addEventListener('ended', this.handleTrackEnd);
      this.audioElement.addEventListener('error', this.handleAudioError);
      await this.audioElement.play();
      this.isPlaying = true;
      this.onTrackChangeCallback?.(track);
      this.onPlayStateChangeCallback?.(true);
    } catch (error) {
      console.error('Error playing track:', error);
      this.isPlaying = false;
      this.onPlayStateChangeCallback?.(false);
      throw error;
    }
  }
  private handleTrackEnd = (): void => {
    this.isPlaying = false;
    this.onPlayStateChangeCallback?.(false);
  };
  private handleAudioError = (error: Event): void => {
    console.error('Audio playback error:', error);
    this.isPlaying = false;
    this.onPlayStateChangeCallback?.(false);
  };
  pause(): void {
    if (this.audioElement && this.isPlaying) {
      this.audioElement.pause();
      this.isPlaying = false;
      this.onPlayStateChangeCallback?.(false);
    }
  }
  resume(): void {
    if (this.audioElement && !this.isPlaying) {
      this.audioElement.play().then(() => {
        this.isPlaying = true;
        this.onPlayStateChangeCallback?.(true);
      }).catch(error => {
        console.error('Error resuming audio:', error);
      });
    }
  }
  stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.isPlaying = false;
      this.onPlayStateChangeCallback?.(false);
    }
  }
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    this.onVolumeChangeCallback?.(this.volume);
  }
  getVolume(): number {
    return this.volume;
  }
  getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }
  getIsPlaying(): boolean {
    return this.isPlaying;
  }
  getCurrentTime(): number {
    return this.audioElement?.currentTime || 0;
  }
  getDuration(): number {
    return this.audioElement?.duration || 0;
  }
  seekTo(time: number): void {
    if (this.audioElement) {
      this.audioElement.currentTime = time;
    }
  }
  getTracksByMood(mood: string): MusicTrack[] {
    const moodMap: Record<string, string[]> = {
      'stressed': ['meditation', 'nature', 'ambient'],
      'anxious': ['meditation', 'nature'],
      'sad': ['classical', 'ambient'],
      'tired': ['sleep', 'ambient'],
      'unfocused': ['focus', 'binaural'],
      'energetic': ['energy', 'classical']
    };
    const categories = moodMap[mood.toLowerCase()] || ['meditation'];
    return musicTracks.filter(track => categories.includes(track.category));
  }
  async playNext(): Promise<void> {
    try {
      if (!this.currentTrack) {
        await this.playRandomTherapeutic();
        return;
      }
      const currentIndex = musicTracks.findIndex(track => track.id === this.currentTrack?.id);
      if (currentIndex === -1) {
        await this.playTrack(musicTracks[0]);
        return;
      }
      const nextIndex = (currentIndex + 1) % musicTracks.length;
      await this.playTrack(musicTracks[nextIndex]);
    } catch (error) {
      console.error('Error playing next track:', error);
      throw error;
    }
  }
  async playPrevious(): Promise<void> {
    try {
      if (!this.currentTrack) {
        await this.playRandomTherapeutic();
        return;
      }
      const currentIndex = musicTracks.findIndex(track => track.id === this.currentTrack?.id);
      if (currentIndex === -1) {
        await this.playTrack(musicTracks[musicTracks.length - 1]);
        return;
      }
      const previousIndex = currentIndex === 0 ? musicTracks.length - 1 : currentIndex - 1;
      await this.playTrack(musicTracks[previousIndex]);
    } catch (error) {
      console.error('Error playing previous track:', error);
      throw error;
    }
  }
}
export const musicTracks: MusicTrack[] = [
  {
    id: '1',
    title: 'Healix Meditation',
    artist: 'Healix Therapy',
    duration: '10:00',
    url: '/audio/therapy/meditation/healix.mp3',
    category: 'meditation',
    description: 'Custom Healix meditation track for deep relaxation and mental wellness',
    benefits: ['Reduces stress and anxiety', 'Promotes deep relaxation', 'Enhances mindfulness', 'Improves mental clarity'],
    keywords: ['healix', 'meditation', 'peaceful', 'calm', 'relax', 'song', 'music', 'therapy', 'wellness', 'mindfulness', 'zen', 'tranquil']
  },
  {
    id: '2',
    title: 'Ambient Music',
    artist: 'Healix Therapy',
    duration: '10:00',
    url: '/audio/therapy/meditation/Ambient music.mp3',
    category: 'ambient',
    description: 'Soothing ambient music for relaxation',
    benefits: ['Reduces stress', 'Promotes relaxation', 'Enhances calm'],
    keywords: ['ambient', 'calm', 'relax', 'peaceful', 'soothing', 'background']
  },
  {
    id: '3',
    title: 'Binaural Beats',
    artist: 'Brainwave Therapy',
    duration: '15:00',
    url: '/audio/therapy/meditation/binaural beats.mp3',
    category: 'binaural',
    description: 'Binaural beats for focus and meditation',
    benefits: ['Enhances focus', 'Promotes meditation', 'Synchronizes brainwaves'],
    keywords: ['binaural', 'beats', 'focus', 'meditation', 'brainwave', 'concentration']
  },
  {
    id: '4',
    title: 'Classical Serenity',
    artist: 'Classical Therapy',
    duration: '20:00',
    url: '/audio/therapy/meditation/classical serenity.mp3',
    category: 'classical',
    description: 'Serene classical music for peace',
    benefits: ['Promotes peace', 'Reduces anxiety', 'Enhances mood'],
    keywords: ['classical', 'serene', 'peaceful', 'elegant', 'calm', 'sophisticated']
  },
  {
    id: '5',
    title: 'Flute Music',
    artist: 'Instrumental Therapy',
    duration: '18:00',
    url: '/audio/therapy/meditation/flute music.mp3',
    category: 'meditation',
    description: 'Gentle flute melodies for meditation',
    benefits: ['Promotes meditation', 'Reduces stress', 'Enhances tranquility'],
    keywords: ['flute', 'instrumental', 'meditation', 'gentle', 'peaceful', 'melodic']
  },
  {
    id: '6',
    title: 'Forest Meditation',
    artist: 'Nature Sounds',
    duration: '25:00',
    url: '/audio/therapy/meditation/Forest meditation.mp3',
    category: 'nature',
    description: 'Immersive forest sounds for meditation',
    benefits: ['Connects with nature', 'Reduces stress', 'Improves mood'],
    keywords: ['forest', 'nature', 'meditation', 'trees', 'birds', 'woodland', 'natural']
  },
  {
    id: '7',
    title: 'Rain Music',
    artist: 'Nature Sounds',
    duration: '30:00',
    url: '/audio/therapy/meditation/rain music.mp3',
    category: 'nature',
    description: 'Peaceful rain sounds for relaxation',
    benefits: ['Promotes sleep', 'Reduces anxiety', 'Enhances calm'],
    keywords: ['rain', 'nature', 'peaceful', 'water', 'storm', 'sleep', 'calming', 'rainfall']
  }
];
export const getMusicRecommendation = (userInput: string): MusicTrack | null => {
  const input = userInput.toLowerCase();
  if (input.includes('peaceful') || input.includes('song') || input.includes('calm') || input.includes('relax')) {
    const healixTrack = musicTracks.find(t => t.title === 'Healix Meditation');
    if (healixTrack) return healixTrack;
  }
  if (input.includes('stressed') || input.includes('stress')) {
    const healixTrack = musicTracks.find(t => t.title === 'Healix Meditation');
    if (healixTrack) return healixTrack;
    const stressTracks = musicTracks.filter(t => t.category === 'meditation' || t.category === 'nature');
    return stressTracks[Math.floor(Math.random() * stressTracks.length)];
  }
  if (input.includes('sleep') || input.includes('tired') || input.includes('bedtime')) {
    return musicTracks.find(t => t.category === 'sleep') || 
           musicTracks.find(t => t.keywords.includes('sleep')) || null;
  }
  if (input.includes('focus') || input.includes('work') || input.includes('study')) {
    return musicTracks.find(t => t.category === 'focus') ||
           musicTracks.find(t => t.category === 'binaural') || null;
  }
  if (input.includes('sad') || input.includes('down') || input.includes('depressed')) {
    return musicTracks.find(t => t.category === 'classical') ||
           musicTracks.find(t => t.category === 'ambient') || null;
  }
  const healixTrack = musicTracks.find(t => t.title === 'Healix Meditation');
  if (healixTrack) return healixTrack;
  return musicTracks.find(t => t.category === 'meditation') || null;
};
export const getVoiceResponse = (track: MusicTrack): string => {
  const responses = [
    `Playing "${track.title}" to help you ${track.benefits[0].toLowerCase()}.`,
    `I've selected "${track.title}" for you. This ${track.category} music will ${track.benefits[0].toLowerCase()}.`,
    `Now playing "${track.title}". Let the ${track.category} sounds guide you to a calmer state.`,
    `Starting "${track.title}". This therapeutic music is designed to ${track.benefits[0].toLowerCase()}.`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};
