"use client";

import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { UserSettingsProvider } from '@/contexts/UserSettingsContext';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// Lazy load heavy components - only load when needed
const VoiceMusicPlayer = dynamic(() => import('@/components/VoiceMusicPlayer'), {
  ssr: false,
  loading: () => null
});

const MicrophoneToggle = dynamic(() => import('@/components/MicrophoneToggle'), {
  ssr: false,
  loading: () => null
});

const GlobalNavbar = dynamic(() => import('@/components/GlobalNavbar'), {
  ssr: false,
  loading: () => <div className="h-16 md:h-20 lg:h-28" />
});

// Remove Inter font import and just use system fonts
const fallbackFonts = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/' || pathname === '/Home';
  const isChatPage = pathname === '/Chat';

  return (
    <>
      {!isHomePage && !isChatPage && <GlobalNavbar />}
      {children}
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="theme-color" content="#3b82f6" />
          <meta name="google-site-verification" content="ZuJTAJvh7XaciFro6UMkmUpHDYjb5uvPh-B9JH0DSF8" />
          <link rel="icon" href="/logo.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/logo.svg" />
          <title>Healix - AI Mental Health Companion</title>
          <meta name="description" content="Healix provides AI-powered mental health counseling, support, and wellness tools. Chat with our compassionate AI companion powered by Gemini." />
        </head>
        <body style={{ fontFamily: fallbackFonts }} className="backg">
          <UserSettingsProvider>
            <LayoutContent>
              {children}
            </LayoutContent>
            <VoiceMusicPlayer />
            <MicrophoneToggle />
          </UserSettingsProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}