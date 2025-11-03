"use client";
import './globals.css';
import { UserSettingsProvider } from '@/contexts/UserSettingsContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
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
const MobileNavbar = dynamic(() => import('@/components/MobileNavbar'), {
  ssr: false,
  loading: () => <div className="md:hidden h-12 sm:h-14" />
});
const fallbackFonts = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const ProtectedRoute = dynamic(() => import('@/components/ProtectedRoute'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  )
});

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/' || pathname === '/Home';
  const isChatPage = pathname === '/Chat';
  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up' || pathname?.startsWith('/sign-');
  return (
    <ProtectedRoute>
      {!isHomePage && !isChatPage && !isAuthPage && <GlobalNavbar />}
      {!isAuthPage && <MobileNavbar />}
      {children}
      {!isAuthPage && <MicrophoneToggle />}
    </ProtectedRoute>
  );
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
        <AuthProvider>
          <UserSettingsProvider>
            <LayoutContent>
              {children}
            </LayoutContent>
            <VoiceMusicPlayer />
          </UserSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}