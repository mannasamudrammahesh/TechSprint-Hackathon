"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import HealixLogo from "@/components/HealixLogo";
import styles from "@/styles/Root.module.css";

export default function GlobalNavbar() {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  // Prefetch all navigation routes on mount for instant navigation
  useEffect(() => {
    const routes = ['/Home', '/Chat', '/Therapy', '/music', '/settings', '/Contact'];
    routes.forEach(route => {
      router.prefetch(route);
    });
  }, [router]);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: '#d6e2ea' }}>
        <div className="flex p-4 md:p-6 lg:p-10 items-center justify-between font-bold">
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
                  Counselling
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
            <UserButton />
            <Link
              href="/settings"
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1.5 px-3 md:py-2 md:px-4 rounded flex items-center gap-1 md:gap-2 text-sm md:text-base"
              onClick={closeMenu}
            >
              <Settings className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden md:inline">Settings</span>
            </Link>
            <Link 
              href="/Contact" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1.5 px-3 md:py-2 md:px-4 rounded text-sm md:text-base text-center"
              onClick={closeMenu}
            >
              Contact
            </Link>
          </div>
        </div>
      </nav>
      {/* Spacer to prevent content from going under the fixed navbar */}
      <div className="h-16 md:h-20 lg:h-28"></div>
    </>
  );
}
