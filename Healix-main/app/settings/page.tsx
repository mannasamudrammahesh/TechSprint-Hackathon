"use client";

import React, { useState } from 'react';
import { useUserSettings } from '@/contexts/UserSettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  User, 
  Mic, 
  Volume2, 
  Hand, 
  Palette, 
  Bell, 
  Shield,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Home,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function SettingsPage() {
  // Add custom slider styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .slider::-webkit-slider-thumb {
        appearance: none;
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: #3b82f6;
        cursor: pointer;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      .slider::-moz-range-thumb {
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: #3b82f6;
        cursor: pointer;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      .slider::-webkit-slider-track {
        height: 8px;
        border-radius: 4px;
        background: #e5e7eb;
      }
      .slider::-moz-range-track {
        height: 8px;
        border-radius: 4px;
        background: #e5e7eb;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const { settings, updateSettings, resetSettings, isLoading } = useUserSettings();
  const [hasChanges, setHasChanges] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);

  // Update temp settings when settings change
  React.useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setTempSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    updateSettings(tempSettings);
    setHasChanges(false);
    toast.success('Settings saved successfully!');
  };

  const handleReset = () => {
    resetSettings();
    setHasChanges(false);
    toast.success('Settings reset to defaults!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading settings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 md:p-6" style={{ backgroundColor: '#d6e2ea' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8 px-2">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center justify-center gap-2 md:gap-3">
            <Settings className="h-7 w-7 md:h-10 md:w-10 text-blue-500" />
            Settings
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-gray-600">
            Customize your Healix experience with personalized settings
          </p>
        </div>

        {/* Save/Reset Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 md:mb-6 gap-3 sm:gap-2">
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Unsaved changes
              </Badge>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex items-center gap-1 md:gap-2 flex-1 sm:flex-initial text-xs md:text-sm"
            >
              <RotateCcw className="h-3 w-3 md:h-4 md:w-4" />
              Reset
            </Button>
            <Button
              onClick={saveSettings}
              disabled={!hasChanges}
              className="flex items-center gap-1 md:gap-2 flex-1 sm:flex-initial text-xs md:text-sm"
            >
              <Save className="h-3 w-3 md:h-4 md:w-4" />
              Save
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="profile" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-3">
              <User className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-3">
              <Mic className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Voice</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-3">
              <Volume2 className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Audio</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-3">
              <Palette className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Theme</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <User className="h-4 w-4 md:h-5 md:w-5" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">Your Name</Label>
                  <Input
                    id="userName"
                    value={tempSettings.userName}
                    onChange={(e) => handleSettingChange('userName', e.target.value)}
                    placeholder="Enter your name"
                  />
                  <p className="text-sm text-gray-500">
                    This name will be used by the voice assistant to greet you
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Wake Word</Label>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-lg font-semibold text-gray-800">"Hey Healix"</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Say "Hey Healix" to activate the voice assistant
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voice Settings */}
          <TabsContent value="voice" className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Mic className="h-4 w-4 md:h-5 md:w-5" />
                  Voice Recognition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="voiceEnabled">Enable Voice Assistant</Label>
                    <p className="text-sm text-gray-500">Allow voice commands and responses</p>
                  </div>
                  <Button
                    variant={tempSettings.voiceEnabled ? "default" : "outline"}
                    onClick={() => handleSettingChange('voiceEnabled', !tempSettings.voiceEnabled)}
                    className="w-20"
                  >
                    {tempSettings.voiceEnabled ? 'ON' : 'OFF'}
                  </Button>
                </div>

                <div className="space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="voiceLanguage">Voice Language</Label>
                    <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                  </div>
                  <select
                    id="voiceLanguage"
                    value={tempSettings.voiceLanguage}
                    disabled
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed opacity-60"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="es-ES">Spanish</option>
                    <option value="fr-FR">French</option>
                    <option value="de-DE">German</option>
                    <option value="it-IT">Italian</option>
                    <option value="pt-BR">Portuguese (Brazil)</option>
                    <option value="ja-JP">Japanese</option>
                    <option value="ko-KR">Korean</option>
                    <option value="zh-CN">Chinese (Simplified)</option>
                    {/* Indian languages */}
                    <option value="hi-IN">Hindi (India)</option>
                    <option value="te-IN">Telugu (India)</option>
                    <option value="kn-IN">Kannada (India)</option>
                    <option value="ta-IN">Tamil (India)</option>
                    <option value="ml-IN">Malayalam (India)</option>
                    <option value="mr-IN">Marathi (India)</option>
                    <option value="bn-IN">Bengali (India)</option>
                    <option value="gu-IN">Gujarati (India)</option>
                    <option value="pa-IN">Punjabi (India)</option>
                  </select>
                  <p className="text-sm text-gray-500">Multiple language support will be available in a future update</p>
                </div>



                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoActivate">Auto-Activate</Label>
                    <p className="text-sm text-gray-500">Automatically start listening for wake word</p>
                  </div>
                  <Button
                    variant={tempSettings.autoActivate ? "default" : "outline"}
                    onClick={() => handleSettingChange('autoActivate', !tempSettings.autoActivate)}
                    className="w-20"
                  >
                    {tempSettings.autoActivate ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audio Settings */}
          <TabsContent value="audio" className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Volume2 className="h-4 w-4 md:h-5 md:w-5" />
                  Audio Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="voiceSpeed">Speech Speed: {tempSettings.voiceSpeed}</Label>
                  <input
                    type="range"
                    id="voiceSpeed"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={tempSettings.voiceSpeed}
                    onChange={(e) => handleSettingChange('voiceSpeed', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Slow (0.5x)</span>
                    <span className="font-medium text-blue-600">Recommended: 0.9-1.1x</span>
                    <span>Fast (2.0x)</span>
                  </div>
                  <p className="text-xs text-gray-400">Optimal range for stress reduction: 0.9-1.1x speed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voicePitch">Speech Pitch: {tempSettings.voicePitch}</Label>
                  <input
                    type="range"
                    id="voicePitch"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={tempSettings.voicePitch}
                    onChange={(e) => handleSettingChange('voicePitch', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Low (0.5)</span>
                    <span className="font-medium text-blue-600">Recommended: 1.0-1.2</span>
                    <span>High (2.0)</span>
                  </div>
                  <p className="text-xs text-gray-400">Higher pitch (1.0-1.2) is more soothing and calming</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voiceVolume">Speech Volume: {Math.round(tempSettings.voiceVolume * 100)}%</Label>
                  <input
                    type="range"
                    id="voiceVolume"
                    min="0"
                    max="1"
                    step="0.1"
                    value={tempSettings.voiceVolume}
                    onChange={(e) => handleSettingChange('voiceVolume', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Quiet (0%)</span>
                    <span className="font-medium text-blue-600">Recommended: 70-90%</span>
                    <span>Loud (100%)</span>
                  </div>
                  <p className="text-xs text-gray-400">Moderate volume (70-90%) reduces stress and maintains clarity</p>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      // Import voice selector dynamically
                      import('@/lib/voiceSelection').then(({ voiceSelector }) => {
                        const testMessage = "Hello! This is a test of your voice settings. I'm your Healix assistant, here to support your mental health journey with a warm and caring voice.";
                        
                        const utterance = new SpeechSynthesisUtterance(testMessage);
                        utterance.rate = tempSettings.voiceSpeed;
                        utterance.pitch = tempSettings.voicePitch;
                        utterance.volume = tempSettings.voiceVolume;
                        utterance.lang = tempSettings.voiceLanguage;
                        
                        // Use voice selector to get optimal voice based on settings
                        const selectedVoice = voiceSelector.getOptimalVoice(
                          tempSettings.selectedVoice || 'auto',
                          tempSettings.voiceLanguage,
                          true // Prefer female voices
                        );
                        
                        if (selectedVoice) {
                          utterance.voice = selectedVoice;
                          console.log('Testing voice:', selectedVoice.name);
                          toast.success(`Testing: ${selectedVoice.name}`, { duration: 2000 });
                        } else {
                          toast.error('No suitable voice found', { duration: 2000 });
                        }
                        
                        speechSynthesis.cancel();
                        speechSynthesis.speak(utterance);
                      });
                    }}
                    className="w-full"
                    variant="outline"
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    Test Voice Settings
                  </Button>
                  <p className="text-xs text-gray-400">Click to hear how your current voice settings sound with the selected voice</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="soundEffects">Sound Effects</Label>
                    <p className="text-sm text-gray-500">Play sound effects for interactions</p>
                  </div>
                  <Button
                    variant={tempSettings.soundEffects ? "default" : "outline"}
                    onClick={() => handleSettingChange('soundEffects', !tempSettings.soundEffects)}
                    className="w-20"
                  >
                    {tempSettings.soundEffects ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gesture Settings */}
          <TabsContent value="gestures" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hand className="h-5 w-5" />
                  Gesture Recognition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="gestureEnabled">Enable Gestures</Label>
                    <p className="text-sm text-gray-500">Use hand gestures to control features</p>
                  </div>
                  <Button
                    variant={tempSettings.gestureEnabled ? "default" : "outline"}
                    onClick={() => handleSettingChange('gestureEnabled', !tempSettings.gestureEnabled)}
                    className="w-20"
                  >
                    {tempSettings.gestureEnabled ? 'ON' : 'OFF'}
                  </Button>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Gesture recognition requires camera access and works best with good lighting.
                    Make sure to allow camera permissions when prompted.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h4 className="font-medium">Gesture Mappings:</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">✊</span>
                      <span>Fist → Attack</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">✋</span>
                      <span>Open Palm → Defend</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">✌️</span>
                      <span>Two Fingers → Special</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">👆</span>
                      <span>Point → Select</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Palette className="h-4 w-4 md:h-5 md:w-5" />
                  Appearance & Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <select
                    id="theme"
                    value={tempSettings.theme}
                    onChange={(e) => {
                      handleSettingChange('theme', e.target.value);
                      // Apply theme immediately
                      if (e.target.value === 'dark') {
                        document.documentElement.classList.add('dark');
                      } else if (e.target.value === 'light') {
                        document.documentElement.classList.remove('dark');
                      } else {
                        // System theme
                        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                          document.documentElement.classList.add('dark');
                        } else {
                          document.documentElement.classList.remove('dark');
                        }
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="light">Light Theme</option>
                    <option value="dark">Dark Theme</option>
                    <option value="system">System Default</option>
                  </select>
                  <p className="text-xs text-gray-400">Theme changes apply immediately. Dark theme may help reduce eye strain.</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications">Notifications</Label>
                    <p className="text-sm text-gray-500">Show notification toasts</p>
                  </div>
                  <Button
                    variant={tempSettings.notifications ? "default" : "outline"}
                    onClick={() => handleSettingChange('notifications', !tempSettings.notifications)}
                    className="w-20"
                  >
                    {tempSettings.notifications ? 'ON' : 'OFF'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="privacyMode">Privacy Mode</Label>
                    <p className="text-sm text-gray-500">Limit data collection and processing</p>
                  </div>
                  <Button
                    variant={tempSettings.privacyMode ? "default" : "outline"}
                    onClick={() => handleSettingChange('privacyMode', !tempSettings.privacyMode)}
                    className="w-20"
                  >
                    {tempSettings.privacyMode ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <div className="mt-6 md:mt-8 text-center text-xs md:text-sm text-gray-500 px-4">
          <p>Settings are automatically saved and synced across your devices when signed in.</p>
        </div>
      </div>
    </div>
  );
}
