/**
 * Lazy Loading Utilities for Performance Optimization
 * Helps reduce initial bundle size and improve page load times
 */

import dynamic from 'next/dynamic';

/**
 * Lazy load heavy AI/ML libraries only when needed
 */
export const lazyLoadTensorFlow = () => {
  return import('@tensorflow/tfjs').then(module => module);
};

export const lazyLoadFaceAPI = () => {
  return import('face-api.js').then(module => module);
};

export const lazyLoadMediaPipe = () => {
  return Promise.all([
    import('@mediapipe/pose'),
    import('@mediapipe/camera_utils'),
    import('@mediapipe/drawing_utils')
  ]);
};

/**
 * Preload critical resources for specific pages
 */
export const preloadForTherapyPage = () => {
  if (typeof window !== 'undefined') {
    // Preload MediaPipe models
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.binarypb';
    document.head.appendChild(link);
  }
};

export const preloadForChatPage = () => {
  if (typeof window !== 'undefined') {
    // Preload API route
    fetch('/api/chat', { method: 'HEAD' }).catch(() => {});
  }
};

/**
 * Dynamic component loaders with loading states
 */
export const DynamicBossBattleGame = dynamic(
  () => import('@/components/BossBattleGame'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading therapy game...</p>
        </div>
      </div>
    )
  }
);

export const DynamicVoiceAssistant = dynamic(
  () => import('@/components/VoiceAssistant'),
  {
    ssr: false,
    loading: () => null
  }
);
