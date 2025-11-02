"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import HealixLogo from "@/components/HealixLogo";
import { useAuth } from "@/contexts/AuthContext";
import styles from "@/styles/Root.module.css";

export default function GlobalNavbar() {
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
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: '#d6e2ea' }}>
        <div className="flex p-3 sm:p-4 md:p-6 lg:p-10 items-center justify-between font-bold">
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/" className="flex items-center">
              <HealixLogo width={28} height={28} textSize="text-lg sm:text-xl md:text-2xl" />
            </Link>
          </div>

          <div
            className={`flex flex-col gap-1 transition-all ease-in-out duration-300 ${styles.menu} ${showMenu ? styles.click : ""}`}
            onClick={toggleMenu}
          >
            <div className={`w-6 sm:w-7 md:w-8 h-0.5 sm:h-1 bg-black ${styles.menuli}`}></div>
            <div className={`w-6 sm:w-7 md:w-8 h-0.5 sm:h-1 bg-black ${styles.menuli}`}></div>
            <div className={`w-6 sm:w-7 md:w-8 h-0.5 sm:h-1 bg-black ${styles.menuli}`}></div>
          </div>

          {/* Close button for mobile/tablet menu - shown when menu is open */}
          {showMenu && (
            <button
              onClick={closeMenu}
              className="fixed top-4 right-4 sm:top-5 sm:right-5 text-black hover:text-gray-700 xl:hidden z-[100] p-2 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6"
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
            className={`flex gap-3 sm:gap-4 md:gap-6 lg:gap-8 items-center ${styles.menubar} ${showMenu ? styles.click : ""}`}
          >
            <ul className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5">
              <li>
                <Link href="/Home" className={`${styles.a} text-xs sm:text-sm md:text-base py-2 px-1`} onClick={closeMenu}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/Chat" className={`${styles.a} text-xs sm:text-sm md:text-base py-2 px-1`} onClick={closeMenu}>
                  Counselling
                </Link>
              </li>
              <li>
                <Link href="/Therapy" className={`${styles.a} text-xs sm:text-sm md:text-base py-2 px-1`} onClick={closeMenu}>
                  Therapist
                </Link>
              </li>
              <li>
                <Link href="/music" className={`${styles.a} text-xs sm:text-sm md:text-base py-2 px-1`} onClick={closeMenu}>
                  Music Therapy
                </Link>
              </li>
            </ul>
            {user && (
              <>
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="hover:opacity-80 transition-opacity p-1"
                    aria-label="User menu"
                  >
                    <div
                      className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm md:text-base shadow-md hover:shadow-lg transition-all hover:scale-105"
                      style={{ backgroundColor: 'rgb(59, 130, 246)', color: '#ffffff' }}
                    >
                      {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-36 sm:w-40 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                      <button
                        onClick={async () => { await signOut(); }}
                        className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
                <Link
                  href="/settings"
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1.5 px-2.5 sm:px-3 md:py-2 md:px-4 rounded flex items-center gap-1 md:gap-2 text-xs sm:text-sm md:text-base"
                  onClick={closeMenu}
                >
                  <Settings className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  <span className="hidden md:inline">Settings</span>
                </Link>
              </>
            )}
            <Link
              href="/Contact"
              className="text-white font-bold py-1.5 px-2.5 sm:px-3 md:py-2 md:px-4 rounded text-xs sm:text-sm md:text-base text-center hover:opacity-80 transition-opacity"
              style={{ backgroundColor: 'rgb(59 130 246 / var(--tw-bg-opacity, 1))' }}
              onClick={closeMenu}
            >
              Contact
            </Link>
            {!user && (
              <Link
                href="/sign-in"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1.5 px-2.5 sm:px-3 md:py-2 md:px-4 rounded text-xs sm:text-sm md:text-base text-center"
                onClick={closeMenu}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
      {/* Spacer to prevent content from going under the fixed navbar */}
      <div className="h-14 sm:h-16 md:h-20 lg:h-28"></div>
    </>
  );
}