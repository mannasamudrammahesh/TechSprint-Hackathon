"use client";

import styles from "@/styles/Root.module.css";
import Link from "next/link";
import { useState } from "react";
import { Settings, LogOut, User } from "lucide-react";
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
        {/* MODIFIED: Reduced padding for mobile (p-4 and pb-4) */}
        <div className="flex p-4 md:p-10 items-center justify-between font-bold pb-4 md:pb-40">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center ">
              <HealixLogo width={35} height={35} textSize="text-2xl" />
            </Link>
          </div>
          <div
            className={`flex flex-col gap-1 transition-all ease-in-out duration-300 ${styles.menu} ${showMenu ? styles.click : ""}`}
            onClick={toggleMenu}
          >
            <div className={`w-8 h-1 bg-black ${styles.menuli}`}></div>
            <div className={`w-8 h-1 bg-black ${styles.menuli}`}></div>
            <div className={`w-8 h-1 bg-black ${styles.menuli}`}></div>
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
            className={`flex gap-8 items-center ${styles.menubar} ${showMenu ? styles.click : ""}`}
          >
            <ul className="flex gap-5">
              <li>
                <Link href="/Home" className={`${styles.a}`} onClick={closeMenu}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/Chat" className={`${styles.a}`} onClick={closeMenu}>
                  Counseling
                </Link>
              </li>
              <li>
                <Link href="/Therapy" className={`${styles.a}`} onClick={closeMenu}>
                  Therapist
                </Link>
              </li>
              <li>
                <Link href="/music" className={`${styles.a}`} onClick={closeMenu}>
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
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shadow-md hover:shadow-lg transition-all hover:scale-105"
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
                      {/* Optional: Add profile/settings links here */}
                      {/* <Link
                        href="/profile"
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => {closeMenu(); setShowUserMenu(false);}}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link> */}
                      {/* <Link
                        href="/settings"
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 xl:hidden"
                        onClick={() => {closeMenu(); setShowUserMenu(false);}}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link> */}
                    </div>
                  )}
                </div>
                <Link
                  href="/settings"
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                  onClick={closeMenu}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </>
            )}
            <Link
              href="/Contact"
              className="text-white font-bold py-2 px-4 rounded text-center transition-all"
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
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center"
                onClick={closeMenu}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
      {/* Ensure children content only renders when menu is closed, as before */}
      {!showMenu ? children : ""}
    </div>
  );
}