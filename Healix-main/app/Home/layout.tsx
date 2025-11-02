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

  const toggleMenu = () => setShowMenu((prev) => !prev);
  const closeMenu = () => setShowMenu(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className={showMenu ? "overflow-hidden h-screen" : ""}>
      {/* ---------- NAVBAR ---------- */}
      <nav className="relative bg-white">
        <div className="flex items-center justify-between px-4 py-4 md:px-10 md:py-6">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <HealixLogo width={35} height={35} textSize="text-2xl" />
          </Link>

          {/* Hamburger (mobile) */}
          <button
            onClick={toggleMenu}
            className="flex flex-col gap-1 md:hidden"
            aria-label="Toggle menu"
          >
            <span className={`block w-7 h-0.5 bg-black ${styles.menuli}`}></span>
            <span className={`block w-7 h-0.5 bg-black ${styles.menuli}`}></span>
            <span className={`block w-7 h-0.5 bg-black ${styles.menuli}`}></span>
          </button>

          {/* Desktop Links */}
          <div
            className={`hidden md:flex items-center gap-6 ${styles.menubar}`}
          >
            <ul className="flex gap-5">
              <li><Link href="/Home" className={styles.a} onClick={closeMenu}>Home</Link></li>
              <li><Link href="/Chat" className={styles.a} onClick={closeMenu}>Counseling</Link></li>
              <li><Link href="/Therapy" className={styles.a} onClick={closeMenu}>Therapist</Link></li>
              <li><Link href="/music" className={styles.a} onClick={closeMenu}>Music Therapy</Link></li>
            </ul>

            {user ? (
              <>
                {/* User Avatar Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu((p) => !p)}
                    className="transition-all"
                    aria-label="User menu"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shadow-md hover:shadow-lg transition-all hover:scale-105"
                      style={{ backgroundColor: "rgb(59, 130, 246)", color: "#fff" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgb(37, 99, 235)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgb(59, 130, 246)")}
                    >
                      {user?.user_metadata?.full_name?.charAt(0).toUpperCase() ||
                        user?.email?.charAt(0).toUpperCase() ||
                        "U"}
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
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
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                  onClick={closeMenu}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </>
            ) : null}

            <Link
              href="/Contact"
              className="text-white font-bold py-2 px-4 rounded transition-all"
              style={{ backgroundColor: "rgb(59 130 246 / var(--tw-bg-opacity, 1))" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgb(37, 99, 235)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgb(59 130 246 / var(--tw-bg-opacity, 1))")}
              onClick={closeMenu}
            >
              Contact
            </Link>

            {!user && (
              <Link
                href="/sign-in"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={closeMenu}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* ---------- MOBILE MENU OVERLAY ---------- */}
        {showMenu && (
          <div className="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center md:hidden">
            {/* Close button (top-right) */}
            <button
              onClick={closeMenu}
              className="absolute top-5 right-5 text-black hover:text-gray-700"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <ul className="flex flex-col gap-6 text-center text-lg font-medium">
              <li><Link href="/Home" className={styles.a} onClick={closeMenu}>Home</Link></li>
              <li><Link href="/Chat" className={styles.a} onClick={closeMenu}>Counseling</Link></li>
              <li><Link href="/Therapy" className={styles.a} onClick={closeMenu}>Therapist</Link></li>
              <li><Link href="/music" className={styles.a} onClick={closeMenu}>Music Therapy</Link></li>
            </ul>

            {user ? (
              <div className="mt-8 flex flex-col gap-4 items-center">
                <Link
                  href="/settings"
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded flex items-center gap-2"
                  onClick={closeMenu}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-red-600 hover:text-red-800 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="mt-8">
                <Link
                  href="/sign-in"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
                  onClick={closeMenu}
                >
                  Sign In
                </Link>
              </div>
            )}

            <Link
              href="/Contact"
              className="mt-6 text-white font-bold py-2 px-6 rounded"
              style={{ backgroundColor: "rgb(59 130 246 / var(--tw-bg-opacity, 1))" }}
              onClick={closeMenu}
            >
              Contact
            </Link>
          </div>
        )}
      </nav>

      {/* ---------- PAGE CONTENT ---------- */}
      <div className={showMenu ? "hidden" : ""}>{children}</div>
    </div>
  );
}