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
        <div className="flex p-10 items-center justify-between font-bold pb-40">
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
            <Link
              href="/settings"
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
              onClick={closeMenu}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="hover:opacity-80 transition-opacity"
                aria-label="User menu"
              >
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold text-base shadow-md hover:shadow-lg transition-all hover:scale-105">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
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
              href="/Contact"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center"
              onClick={closeMenu}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </nav>
      {!showMenu ? children : ""}
    </div>
  );
}
