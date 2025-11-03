"use client";

import Link from "next/link";
import { useState } from "react";
import HealixLogo from "@/components/HealixLogo";

export default function MobileNavbar() {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  return (
    <>
      {/* Mobile-only navbar - ALWAYS visible on mobile screens */}
      <div className="block sm:hidden fixed top-0 left-0 right-0 z-[9999]" style={{ backgroundColor: '#d6e2ea' }}>
        <div className="flex p-3 items-center justify-between font-bold">
          <div className="flex items-center gap-2">
            <Link href="/Home" className="flex items-center">
              <HealixLogo width={38} height={38} textSize="text-2xl" />
            </Link>
          </div>

          <div
            className="flex flex-col gap-1 cursor-pointer"
            onClick={toggleMenu}
          >
            <div className={`w-6 h-1 bg-black transition-all duration-300 ${showMenu ? 'rotate-45 translate-y-2' : ''}`}></div>
            <div className={`w-6 h-1 bg-black transition-all duration-300 ${showMenu ? 'opacity-0' : ''}`}></div>
            <div className={`w-6 h-1 bg-black transition-all duration-300 ${showMenu ? '-rotate-45 -translate-y-2' : ''}`}></div>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {showMenu && (
          <div className="fixed inset-0 z-40 flex flex-col items-center justify-center" style={{ backgroundColor: '#d6e2ea' }}>
            {/* Close button */}
            <button
              onClick={closeMenu}
              className="absolute top-3 right-3 text-black text-2xl font-bold z-50"
              aria-label="Close menu"
            >
              ×
            </button>

            {/* Menu items */}
            <div className="flex flex-col items-center gap-8">
              <ul className="flex flex-col items-center gap-6">
                <li>
                  <Link
                    href="/Home"
                    className="text-xl font-semibold text-black"
                    onClick={closeMenu}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/Chat"
                    className="text-xl font-semibold text-black"
                    onClick={closeMenu}
                  >
                    Counselling
                  </Link>
                </li>
                <li>
                  <Link
                    href="/Therapy"
                    className="text-xl font-semibold text-black"
                    onClick={closeMenu}
                  >
                    Therapist
                  </Link>
                </li>
                <li>
                  <Link
                    href="/music"
                    className="text-xl font-semibold text-black"
                    onClick={closeMenu}
                  >
                    Music Therapy
                  </Link>
                </li>
              </ul>

              <div className="flex flex-col items-center gap-4">
                <Link
                  href="/Contact"
                  className="bg-blue-500 text-white font-bold py-3 px-6 rounded text-lg"
                  onClick={closeMenu}
                >
                  Contact
                </Link>
                <Link
                  href="/sign-in"
                  className="bg-gray-500 text-white font-bold py-3 px-6 rounded text-lg"
                  onClick={closeMenu}
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile spacer */}
      <div className="block sm:hidden h-14"></div>
    </>
  );
}