"use client";

/**
 * Healix-themed loading components
 */

// Typing indicator for chat (like ChatGPT)
export function TypingIndicator() {
  return (
    <div className="flex gap-1.5 items-center px-4 py-3">
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
}

// Healix thinking indicator with heart pulse
export function HealixThinking() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        <div className="absolute inset-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-ping opacity-75"></div>
      </div>
      <span className="text-sm text-gray-600 animate-pulse">Healix is thinking...</span>
    </div>
  );
}

// Standard loading spinner
export function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}

// Page loading with Healix branding
export function PageLoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">💙</span>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Healix</h2>
        <p className="text-gray-600">Loading your mental health companion...</p>
      </div>
    </div>
  );
}

// Inline spinner
export function InlineLoadingSpinner({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-4"
  };

  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-blue-600`}></div>
  );
}
