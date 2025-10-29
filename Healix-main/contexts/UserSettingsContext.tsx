"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSettings, saveUserSettings, createOrUpdateUserProfile } from '@/lib/supabaseService';

export interface UserSettings {
  assistantName: string;
  userName: string;
  voiceEnabled: boolean;
  voiceLanguage: string;
  selectedVoice: string;
  voiceSpeed: number;
  voicePitch: number;
  voiceVolume: number;
  gestureEnabled: boolean;
  autoActivate: boolean;
  wakeWord: string;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  soundEffects: boolean;
  privacyMode: boolean;
}

const defaultSettings: UserSettings = {
  assistantName: 'Healix',
  userName: '',
  voiceEnabled: true,
  voiceLanguage: 'en-US',
  selectedVoice: 'warm-female',
  voiceSpeed: 0.9,
  voicePitch: 1.1,
  voiceVolume: 0.8,
  gestureEnabled: false,
  autoActivate: false, // Microphone stays OFF until user clicks button
  wakeWord: 'healix',
  theme: 'system',
  notifications: true,
  soundEffects: true,
  privacyMode: false,
};

interface UserSettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetSettings: () => void;
  isLoading: boolean;
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
};

interface UserSettingsProviderProps {
  children: ReactNode;
}

export const UserSettingsProvider: React.FC<UserSettingsProviderProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from Supabase or localStorage
  useEffect(() => {
    if (authLoading) return;

    const loadSettings = async () => {
      try {
        let userSettings = defaultSettings;

        if (user) {
          // Load from localStorage first for instant access
          const stored = localStorage.getItem(`healix-settings-${user.id}`);
          if (stored) {
            userSettings = { ...defaultSettings, ...JSON.parse(stored) };
            setSettings(userSettings);
            setIsLoading(false);
          }

          // Then sync with Supabase in background (non-blocking)
          createOrUpdateUserProfile({
            clerk_user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || undefined,
            avatar_url: user.user_metadata?.avatar_url || undefined,
          }).catch(console.error);

          // Try to load from Supabase in background
          const supabaseSettings = await getUserSettings(user.id);
          
          if (supabaseSettings) {
            userSettings = {
              assistantName: supabaseSettings.assistant_name,
              userName: supabaseSettings.user_name || '',
              voiceEnabled: supabaseSettings.voice_enabled,
              voiceLanguage: supabaseSettings.voice_language,
              selectedVoice: supabaseSettings.selected_voice,
              voiceSpeed: Number(supabaseSettings.voice_speed),
              voicePitch: Number(supabaseSettings.voice_pitch),
              voiceVolume: Number(supabaseSettings.voice_volume),
              gestureEnabled: supabaseSettings.gesture_enabled,
              autoActivate: supabaseSettings.auto_activate,
              wakeWord: supabaseSettings.wake_word,
              theme: supabaseSettings.theme as 'light' | 'dark' | 'system',
              notifications: supabaseSettings.notifications,
              soundEffects: supabaseSettings.sound_effects,
              privacyMode: supabaseSettings.privacy_mode,
            };
          } else {
            // Fallback to localStorage
            const stored = localStorage.getItem(`healix-settings-${user.id}`);
            if (stored) {
              userSettings = { ...defaultSettings, ...JSON.parse(stored) };
            }
          }

          // Set user name from Supabase user data if not set
          if (!userSettings.userName && user.user_metadata?.full_name) {
            userSettings.userName = user.user_metadata.full_name;
          }
        } else {
          // For non-authenticated users, use localStorage
          const stored = localStorage.getItem('healix-settings-guest');
          if (stored) {
            userSettings = { ...defaultSettings, ...JSON.parse(stored) };
          }
        }

        setSettings(userSettings);
      } catch (error) {
        console.error('Error loading user settings:', error);
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user, authLoading]);

  // Save settings to Supabase and localStorage
  const saveSettings = async (newSettings: UserSettings) => {
    try {
      if (user) {
        // Save to Supabase
        await saveUserSettings({
          clerk_user_id: user.id,
          assistant_name: newSettings.assistantName,
          user_name: newSettings.userName,
          voice_enabled: newSettings.voiceEnabled,
          voice_language: newSettings.voiceLanguage,
          selected_voice: newSettings.selectedVoice,
          voice_speed: newSettings.voiceSpeed,
          voice_pitch: newSettings.voicePitch,
          voice_volume: newSettings.voiceVolume,
          gesture_enabled: newSettings.gestureEnabled,
          auto_activate: newSettings.autoActivate,
          wake_word: newSettings.wakeWord,
          theme: newSettings.theme,
          notifications: newSettings.notifications,
          sound_effects: newSettings.soundEffects,
          privacy_mode: newSettings.privacyMode,
        });

        // Also save to localStorage as backup
        localStorage.setItem(`healix-settings-${user.id}`, JSON.stringify(newSettings));
      } else {
        // For non-authenticated users, save to localStorage
        localStorage.setItem('healix-settings-guest', JSON.stringify(newSettings));
      }
    } catch (error) {
      console.error('Error saving user settings:', error);
      // Fallback to localStorage only
      const key = user ? `healix-settings-${user.id}` : 'healix-settings-guest';
      localStorage.setItem(key, JSON.stringify(newSettings));
    }
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };

  const resetSettings = () => {
    const resetSettings = { ...defaultSettings };
    if (user && user.user_metadata?.full_name) {
      resetSettings.userName = user.user_metadata.full_name;
    }
    setSettings(resetSettings);
    saveSettings(resetSettings);
  };

  return (
    <UserSettingsContext.Provider value={{
      settings,
      updateSettings,
      resetSettings,
      isLoading,
    }}>
      {children}
    </UserSettingsContext.Provider>
  );
};
