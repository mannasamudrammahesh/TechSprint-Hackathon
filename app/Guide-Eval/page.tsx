"use client";

import Image from "next/image"
import styles from '@/styles/career.module.css'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { BackButton } from '@/components/BackButton';

export default function Career() {

    const [selectedCareer, setSelectedCareer] = useState('Please select a concern to explore')
    const [careerDescription, setCareerDescription] = useState('')

    const router = useRouter();

    const handleClick = (e: any) => {

        const customValue = e.target.getAttribute('alt') as string;

        toast.success(`You selected ${customValue}`)

        const readFile = async (name: string) => {
            const markdown = await import(`@/data/${name}.d.ts`);
            const data = markdown.data;
            setCareerDescription(data[customValue])
            return markdown.data;
        }

        readFile("career")

        setSelectedCareer(customValue)

        // remove all selected classes
        const images = document.querySelectorAll('img');

        images.forEach((image) => {
            image.classList.remove(`${styles.imageSelected}`);
        });

        // add selected class to clicked image
        e.target.classList.add(`${styles.imageSelected}`);
    }

    const handleGetGuidance = () => {
        if (!selectedCareer || selectedCareer === 'Please select a concern to explore') {
            toast.error('Please select a concern to explore')
            return;
        }
        router.push(`/Guide-Eval/GetGuidance/${selectedCareer}`)
    }

    const handleEvaluate = () => {
        if (!selectedCareer || selectedCareer === 'Please select a concern to explore') {
            toast.error('Please select a concern to explore')
            return;
        }
        router.push(`/Courses/${selectedCareer}`)
    }

    return (
        <div className="container mx-auto p-3 md:p-6">
            <div className="fixed left-3 md:left-6 z-50 top-20 md:top-32">
                <BackButton />
            </div>
            <main className={`p-3 md:p-8 lg:p-10 flex flex-col md:flex-row mt-4 md:mt-10 ${styles.career} w-full gap-4 md:gap-0`}>
                <Toaster />
                <div className={`${styles.imageContainer}`}>
                    <Image src="/icons/anger.png" alt="Anger" width={60} height={60} onClick={handleClick} className="md:w-[80px] md:h-[80px]" />
                    <Image src="/icons/anxiety.png" alt="Anxiety" width={60} height={60} onClick={handleClick} className="md:w-[80px] md:h-[80px]" />
                    <Image src="/icons/bipolar.png" alt="Bipolar" width={60} height={60} onClick={handleClick} className="md:w-[80px] md:h-[80px]" />
                    <Image src="/icons/depression.png" alt="Depression" width={60} height={60} onClick={handleClick} className="md:w-[80px] md:h-[80px]" />
                    <Image src="/icons/weight-loss.png" alt="WeightLoss" width={60} height={60} onClick={handleClick} className="md:w-[80px] md:h-[80px]" />
                    <Image src="/icons/loneliness.png" alt="Loneliness" width={60} height={60} onClick={handleClick} className="md:w-[80px] md:h-[80px]" />
                    <Image src="/icons/fear.png" alt="Fear" width={60} height={60} onClick={handleClick} className="md:w-[80px] md:h-[80px]" />
                    <Image src="/icons/insomnia.png" alt="Insomnia" width={60} height={60} onClick={handleClick} className="md:w-[80px] md:h-[80px]" />
                    <Image src="/icons/listen.png" alt="HearingVoices" width={60} height={60} onClick={handleClick} className="md:w-[80px] md:h-[80px]" />
                    <Image src="/icons/panic-attack.png" alt="PanicAttack" width={60} height={60} onClick={handleClick} className="md:w-[80px] md:h-[80px]" />
                    <Image src="/icons/paranoia.png" alt="Paranoia" width={60} height={60} onClick={handleClick} className="md:w-[80px] md:h-[80px]" />
                    <Image src="/icons/phobia.png" alt="Phobia" width={60} height={60} onClick={handleClick} className="md:w-[80px] md:h-[80px]" />
                    <Image src="/icons/psychosis.png" alt="Psychosis" width={60} height={60} onClick={handleClick} className="md:w-[80px] md:h-[80px]" />
                    <Image src="/icons/schizophrenia.png" alt="Schizophrenia" width={60} height={60} onClick={handleClick} className="md:w-[80px] md:h-[80px]" />
                    <Image src="/icons/self-confidence.png" alt="SelfConfidence" width={60} height={60} onClick={handleClick} className="md:w-[80px] md:h-[80px]" />
                    <Image src="/icons/self-harm.png" alt="SelfHarm" width={60} height={60} onClick={handleClick} className="md:w-[80px] md:h-[80px]" />
                </div>
                <div className={`${styles.imageContent}`}>
                    <h1 className={`${styles.h1} text-center md:text-left text-xl sm:text-2xl md:text-3xl`}>{selectedCareer}</h1>
                    <p className={`${styles.p} text-center md:text-left text-sm sm:text-base md:text-lg`}>{careerDescription}</p>
                    <div className="mt-3 md:mt-5 flex flex-col gap-2 md:gap-3 w-full md:w-auto items-center md:items-start">
                        <Button onClick={handleGetGuidance} className={cn("w-[130px] sm:w-[140px] md:w-[200px] h-8 sm:h-9 md:h-10 text-xs sm:text-sm md:text-base")}>Get guidance</Button>
                        <Button onClick={handleEvaluate} className={cn("w-[130px] sm:w-[140px] md:w-[200px] h-8 sm:h-9 md:h-10 text-xs sm:text-sm md:text-base")}>Evaluate</Button>
                    </div>
                </div>
            </main>
        </div>
    )
}