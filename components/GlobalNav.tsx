"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import { Settings } from "lucide-react";
import HealixLogo from "@/components/HealixLogo";
import styles from "@/styles/Root.module.css";

export default function GlobalNav() {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="flex p-10 items-center justify-between font-bold">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center">
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

          <div
            className={`flex gap-8 items-center ${styles.menubar} ${showMenu ? styles.click : ""}`}
          >
            <ul className="flex gap-5">
              <li>
                <Link href="/Home" className={`${styles.a}`}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/Chat" className={`${styles.a}`}>
                  Counseling
                </Link>
              </li>
              <li>
                <Link href="/Therapy" className={`${styles.a}`}>
                  Therapist
                </Link>
              </li>
              <li>
                <Link href="/music" className={`${styles.a}`}>
                  Music Therapy
                </Link>
              </li>
            </ul>
            <UserButton />
            <Link
              href="/settings"
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              <Link href="/Contact">Contact Us</Link>
            </button>
          </div>
        </div>
      </nav>
      {/* Spacer to prevent content from going under fixed nav */}
      <div className="h-[88px]"></div>
    </>
  );
}
