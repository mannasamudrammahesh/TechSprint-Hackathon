"use client";

import styles from "@/styles/Root.module.css";
import Link from "next/link";
import { useState } from "react";
import { Settings, LogOut } from "lucide-react";
import HealixLogo from "@/components/HealixLogo";
import { useAuth } from "@/contexts/AuthContext";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuth();

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className={`${showMenu ? "overflow-hidden h-screen" : ""}`}>
      <nav className="relative">
        <div className="flex p-4 md:p-6 lg:p-10 items-center justify-between font-bold pb-4 md:pb-8 lg:pb-40">
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/" className="flex items-center">
              <HealixLogo width={30} height={30} textSize="text-xl md:text-2xl" />
            </Link>
          </div>
          <div
            className={`flex flex-col gap-1 transition-all ease-in-out duration-300 ${styles.menu} ${showMenu ? styles.click : ""}`}
            onClick={toggleMenu}
          >
            <div className={`w-6 md:w-8 h-1 bg-black ${styles.menuli}`}></div>
            <div className={`w-6 md:w-8 h-1 bg-black ${styles.menuli}`}></div>
            <div className={`w-6 md:w-8 h-1 bg-black ${styles.menuli}`}></div>
          </div>

          {/* Close button for mobile/tablet menu - shown when menu is open */}
          {showMenu && (
            <button
              onClick={closeMenu}
              className="fixed top-5 right-5 text-black hover:text-gray-700 xl:hidden z-[100]"
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
            className={`flex gap-4 md:gap-6 lg:gap-8 items-center ${styles.menubar} ${showMenu ? styles.click : ""}`}
          >
            <ul className="flex gap-3 md:gap-4 lg:gap-5">
              <li>
                <Link href="/Home" className={`${styles.a} text-sm md:text-base`} onClick={closeMenu}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/Chat" className={`${styles.a} text-sm md:text-base`} onClick={closeMenu}>
                  Counseling
                </Link>
              </li>
              <li>
                <Link href="/Therapy" className={`${styles.a} text-sm md:text-base`} onClick={closeMenu}>
                  Therapist
                </Link>
              </li>
              <li>
                <Link href="/music" className={`${styles.a} text-sm md:text-base`} onClick={closeMenu}>
                  Music Therapy
                </Link>
              </li>
            </ul>
            {user && (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="transition-all"
                    aria-label="User menu"
                  >
                    <div 
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base shadow-md hover:shadow-lg transition-all hover:scale-105"
                      style={{ backgroundColor: 'rgb(59, 130, 246)', color: '#ffffff' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(37, 99, 235)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(59, 130, 246)'}
                    >
                      {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                      <button
                        onClick={handleSignOut}
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
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1.5 px-3 md:py-2 md:px-4 rounded flex items-center gap-1 md:gap-2 text-sm md:text-base"
                  onClick={closeMenu}
                >
                  <Settings className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden md:inline">Settings</span>
                </Link>
              </>
            )}
            <Link
              href="/Contact"
              className="text-white font-bold py-1.5 px-3 md:py-2 md:px-4 rounded text-sm md:text-base text-center transition-all"
              style={{ backgroundColor: 'rgb(59 130 246 / var(--tw-bg-opacity, 1))' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(37, 99, 235)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(59 130 246 / var(--tw-bg-opacity, 1))'}
              onClick={closeMenu}
            >
              Contact
            </Link>
            {!user && (
              <Link
                href="/sign-in"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1.5 px-3 md:py-2 md:px-4 rounded text-sm md:text-base text-center"
                onClick={closeMenu}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
      {!showMenu ? children : ""}
    </div>
  );
}