"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * Professional Microphone Toggle Button
 * Sticky throughout the website
 * Uses react-icons for professional appearance
 * Shows diagonal line when microphone is off
 * No blinking effects - clean and professional
 * Microphone starts OFF - user must click to activate
 */
export default function MicrophoneToggle() {
  const { user, loading } = useAuth();
  const { state, startListening, stopListening } = useVoiceAssistant();
  const [isMicActive, setIsMicActive] = useState(false);
  const isTogglingRef = useRef(false);

  // NO AUTO-START - Microphone stays OFF until user clicks the button
  // This ensures no microphone permission is requested on page load

  // Sync with voice assistant state - only update if not currently toggling
  useEffect(() => {
    if (!isTogglingRef.current) {
      setIsMicActive(state.isListening);
    }
  }, [state.isListening]);

  // Check if user is on mobile device
  const isMobile = () => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 768;
  };

  const toggleMicrophone = async () => {
    // Prevent rapid toggling
    if (isTogglingRef.current) {
      return;
    }

    // Check authentication for mobile users
    if (isMobile() && !user && !loading) {
      toast.error("Please sign in to use voice features on mobile", {
        icon: '🔒',
        duration: 3000,
      });
      return;
    }

    isTogglingRef.current = true;

    try {
      if (isMicActive) {
        // Turn OFF microphone
        await stopListening();
        setIsMicActive(false);
        toast.success("Microphone turned off", {
          icon: '🔴',
          duration: 2000,
        });
      } else {
        // Turn ON microphone
        await startListening();
        setIsMicActive(true);
        const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
        const message = userName 
          ? `Microphone active - Say "Hey Healix" ${userName}!`
          : "Microphone active - Say 'Hey Healix'";
        toast.success(message, {
          icon: '🟢',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Microphone toggle error:', error);
      toast.error("Failed to toggle microphone", {
        icon: '⚠️',
        duration: 2000,
      });
    } finally {
      // Reset toggle lock after a short delay
      setTimeout(() => {
        isTogglingRef.current = false;
      }, 300);
    }
  };

  // Check if mobile user needs authentication
  const needsAuth = isMobile() && !user && !loading;
  
  return (
    <button
      onClick={toggleMicrophone}
      className={`
        fixed bottom-20 right-4 z-50
        w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
        sm:bottom-24 sm:right-6 md:bottom-24 md:right-8
        rounded-full
        flex items-center justify-center
        shadow-2xl hover:shadow-3xl
        transition-all duration-300 ease-in-out
        hover:scale-105 active:scale-95
        ${needsAuth
          ? 'bg-gradient-to-br from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600'
          : isMicActive
          ? 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
          : 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
        }
        border-2 sm:border-3 md:border-4 border-white
        ${needsAuth ? 'opacity-75' : ''}
      `}
      aria-label={
        needsAuth 
          ? "Sign in required for voice features" 
          : isMicActive 
          ? "Turn off microphone" 
          : "Turn on microphone"
      }
      title={
        needsAuth
          ? "Sign in to use voice features on mobile"
          : isMicActive 
          ? "Microphone ON - Click to turn off" 
          : "Microphone OFF - Click to turn on"
      }
    >
      {needsAuth ? (
        <div className="relative">
          <FaMicrophoneSlash size={20} className="text-white sm:w-6 sm:h-6 md:w-7 md:h-7" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white"></div>
        </div>
      ) : isMicActive ? (
        <FaMicrophone size={20} className="text-white sm:w-6 sm:h-6 md:w-7 md:h-7" />
      ) : (
        <FaMicrophoneSlash size={20} className="text-white sm:w-6 sm:h-6 md:w-7 md:h-7" />
      )}
    </button>
  );
}
