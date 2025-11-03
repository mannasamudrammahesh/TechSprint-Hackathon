"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from '@/styles/Root.module.css'
import { Typewriter } from 'react-simple-typewriter'
import { Toaster } from "react-hot-toast";
export default function Home() {
    const router = useRouter();
    useEffect(() => {
        router.prefetch('/Guide-Eval');
        router.prefetch('/Chat');
        router.prefetch('/Therapy');
    }, [router]);
    return (
        <main className="px-4 md:px-8 lg:px-10 flex flex-col md:flex-row justify-around items-center gap-6 md:gap-4 pt-0 pb-4 md:py-0">
            <Toaster />
            {}
            <div className="w-full md:hidden flex justify-center order-1 -mt-2">
                <Image
                    src="/neurology.png"
                    alt="Healix Mental Health"
                    width={400}
                    height={400}
                    className="w-64 h-64 sm:w-80 sm:h-80 object-contain"
                    priority
                />
            </div>
            <div className="flex flex-col gap-3 md:gap-6 text-center md:text-left max-w-full md:max-w-[50%] order-2 px-4 md:px-0">
                <h1 className="font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight">
                    <span style={{ color: 'black', fontWeight: 'bold' }}>
                        <Typewriter
                            words={['What is Healix', 'AI Mental Support']}
                            loop={1000}
                            cursor
                            cursorStyle='_'
                            typeSpeed={70}
                            deleteSpeed={50}
                            delaySpeed={1000}
                        />
                    </span>
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl px-2 md:px-0 leading-relaxed">Healix is a platform for mental health awareness and support.</p>
                <Link href="/Guide-Eval" className={`font-bold text-xs sm:text-sm md:text-base lg:text-lg max-w-max py-2 px-4 md:py-2.5 md:px-6 lg:py-3 lg:px-10 rounded-sm transition-all ease-in-out duration-400 ${styles.button} relative mx-auto md:mx-0 mt-1 md:mt-0`}>
                    <p className={styles.p}>Get Started</p>
                </Link>
            </div>
            {}
            <div className="hidden md:flex w-auto justify-center order-3">
                <Image
                    src="/neurology.png"
                    alt="Healix Mental Health"
                    width={400}
                    height={400}
                    className="w-96 h-96 lg:w-[400px] lg:h-[400px] object-contain"
                    priority
                />
            </div>
        </main>
    );
}