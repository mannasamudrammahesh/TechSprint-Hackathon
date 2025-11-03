"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import HealixLogo from "@/components/HealixLogo";
import { useAuth } from "@/contexts/AuthContext";
import styles from "@/styles/Root.module.css";

export default function MobileNavbar() {
  const [showMenu, setShowMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Prefetch all navigation routes on mount for instant navigation
  useEffect(() => {
    const routes = ['/Home', '/Chat', '/Therapy', '/music', '/settings', '/Contact'];
    routes.forEach(route => {
      router.prefetch(route);
    });
  }, [router]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  return (
    <>
      {/* Mobile-only navbar - hidden on desktop and tablet */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: '#d6e2ea' }}>
        <div className="flex p-2 sm:p-3 items-center justify-between font-bold">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <HealixLogo width={28} height={28} textSize="text-lg sm:text-xl" />
            </Link>
          </div>

          <div
            className={`flex flex-col gap-1 transition-all ease-in-out duration-300 ${styles.menu} ${showMenu ? styles.click : ""}`}
            onClick={toggleMenu}
          >
            <div className={`w-6 h-1 bg-black ${styles.menuli}`}></div>
            <div className={`w-6 h-1 bg-black ${styles.menuli}`}></div>
            <div className={`w-6 h-1 bg-black ${styles.menuli}`}></div>
          </div>

          {/* Close button for mobile menu - shown when menu is open */}
          {showMenu && (
            <button
              onClick={closeMenu}
              className="fixed top-3 right-3 text-black hover:text-gray-700 z-[100]"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <div
            className={`flex gap-4 items-center ${styles.mobileMenubar} ${showMenu ? styles.click : ""}`}
          >
            <ul className="flex gap-4">
              <li>
                <Link href="/Home" className={`${styles.a} text-sm`} onClick={closeMenu}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/Chat" className={`${styles.a} text-sm`} onClick={closeMenu}>
                  Counselling
                </Link>
              </li>
              <li>
                <Link href="/Therapy" className={`${styles.a} text-sm`} onClick={closeMenu}>
                  Therapist
                </Link>
              </li>
              <li>
                <Link href="/music" className={`${styles.a} text-sm`} onClick={closeMenu}>
                  Music Therapy
                </Link>
              </li>
            </ul>
            {user && (
              <>
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="hover:opacity-80 transition-opacity"
                    aria-label="User menu"
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105"
                      style={{ backgroundColor: 'rgb(59, 130, 246)', color: '#ffffff' }}
                    >
                      {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                      <button
                        onClick={async () => { await signOut(); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
                <Link
                  href="/settings"
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1.5 px-3 rounded flex items-center gap-1 text-sm"
                  onClick={closeMenu}
                >
                  <Settings className="h-3 w-3" />
                </Link>
              </>
            )}
            <Link 
              href="/Contact" 
              className="text-white font-bold py-1.5 px-3 rounded text-sm text-center hover:opacity-80 transition-opacity"
              style={{ backgroundColor: 'rgb(59 130 246 / var(--tw-bg-opacity, 1))' }}
              onClick={closeMenu}
            >
              Contact
            </Link>
            {!user && (
              <Link 
                href="/sign-in" 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded text-sm text-center"
                onClick={closeMenu}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
      {/* Mobile spacer to prevent content from going under the fixed navbar */}
      <div className="md:hidden h-12 sm:h-14"></div>
    </>
  );
}