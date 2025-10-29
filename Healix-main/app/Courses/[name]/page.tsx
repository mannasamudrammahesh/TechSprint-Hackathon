// @ts-nocheck
"use client";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import {
  useRive,
  RiveState,
  useStateMachineInput,
  StateMachineInput,
  Layout,
  Fit,
  Alignment,
} from "rive-react";
import styles from "@/styles/styles.module.css";
import "@/styles/LoginFormComponent.css";
import Confetti from "@/components/Confetti";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { StickyBackButton } from "@/components/BackButton";
import { useShouldReduceMotion } from "@/utils/useIsMobile";

// Lazy load Markdown for better performance
const Markdown = dynamic(() => import("react-markdown"), {
  ssr: false,
  loading: () => <div className="animate-pulse">Loading content...</div>
});

export default function Page({ params }: { params: { name: string } }) {
  const name = params.name;
  const [score, setScore] = useState(0);
  const [count, setCount] = useState(0);
  const [chosen, setChosen] = useState<string | undefined>(undefined);
  const [content, setContent] = useState<any>();
  const [question, setQuestion] = useState<any>();
  const [progress, setProgress] = useState(0);
  const [inputLookMultiplier, setInputLookMultiplier] = useState(0);
  const inputRef = useRef(null);
  const [response, setResponse] = useState("");
  const [output, setOutput] = useState("The response will appear here...");
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shouldReduceMotion = useShouldReduceMotion();

  const onSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setOutput("The response will appear here...");
    toast.success(
      "Healix is analyzing your quiz performance for " + name
    );

    try {
      // Enhanced prompt for Llama to analyze quiz performance
      const analysisPrompt = `You are a compassionate mental health professional analyzing a personality quiz result.

**Quiz Details:**
- Mental Health Issue: ${name}
- Score: ${score} out of 30 (Lower scores indicate better mental health)
- Assessment: ${score <= 10 ? 'Excellent - Minimal symptoms, healthy mental state' : score <= 20 ? 'Moderate - Some symptoms present, monitor and practice self-care' : 'Significant - Many symptoms present, strongly recommend professional support'}

**Task:**
Based on this quiz performance, provide a comprehensive diagnosis and guidance in the following structure:

1. **Assessment Summary**: Brief overview of what the score indicates
2. **Key Observations**: What this score suggests about their current state
3. **Recommended Actions**: Specific, actionable steps they should take
4. **Professional Support**: When and how to seek professional help
5. **Self-Care Strategies**: Daily practices to improve their wellbeing
6. **Encouragement**: Supportive message to end on a positive note

Please be empathetic, specific, and provide practical guidance. Format your response with clear paragraphs and sections.`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userPrompt: analysisPrompt,
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (!data.reply && !data.text) {
        toast.error("No response from Healix, please try again");
        return;
      }

      // Get the response text (handle both reply and text fields)
      const responseText = data.reply || data.text;

      setResponse(responseText);
      setShowCelebration(true);
      toast.success("Healix analysis complete!");
    } catch (error) {
      console.error("Error getting Healix analysis:", error);
      toast.error("Failed to get analysis. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (response.length === 0) return;
    setOutput("");
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex < response.length) {
        setOutput((prev) => prev + response[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 10);

    return () => clearInterval(typingInterval);
  }, [response]);

  const STATE_MACHINE_NAME = "Login Machine";

  const { rive: riveInstance, RiveComponent }: RiveState = useRive({
    src: "/bear.riv",
    stateMachines: STATE_MACHINE_NAME,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
  });

  const trigSuccessInput: StateMachineInput = useStateMachineInput(
    riveInstance,
    STATE_MACHINE_NAME,
    "trigSuccess"
  );
  const trigFailInput: StateMachineInput = useStateMachineInput(
    riveInstance,
    STATE_MACHINE_NAME,
    "trigFail"
  );

  const readFile = async (name: string) => {
    const markdown = await import(`@/data/${name}.d.ts`);
    return markdown.data;
  };

  const onNext = () => {
    if (!chosen) {
      toast.error("Please select an option");
      return;
    }

    const currentScore = parseInt(chosen.split("+")[1]);
    setScore(score + currentScore);
    setCount(count + 1);
    setProgress(((count + 1) / content?.questions.length) * 100);

    // Show panda happy when user picks LOW score (healthy answer)
    // Show panda sad when user picks HIGH score (concerning answer)
    if (currentScore === 0) {
      trigSuccessInput.fire();
    } else if (currentScore === 3) {
      trigFailInput.fire();
    }

    if (count + 1 < content?.questions.length) {
      setQuestion(content?.questions[count + 1]);
    } else {
      onSubmit();
    }

    setChosen(undefined);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const content = await readFile(name);
        setContent(content);
        setQuestion(content?.questions[0]);
      } catch (error) {
        toast.error("Error reading file");
      }
    };
    fetchData();
  }, [name]);

  useEffect(() => {
    if (inputRef?.current && !inputLookMultiplier) {
      setInputLookMultiplier(inputRef.current.offsetWidth / 100);
    }
  }, [inputRef]);

  const celebrationVariants = shouldReduceMotion ? {
    hidden: { opacity: 1 },
    visible: { opacity: 1 },
  } : {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = shouldReduceMotion ? {
    hidden: { opacity: 1 },
    visible: { opacity: 1 },
  } : {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const getMedalInfo = () => {
    // Lower score = Better mental health (fewer symptoms)
    // 0-10: Excellent mental health (Gold) - minimal symptoms
    // 11-20: Moderate concerns (Silver) - some symptoms present
    // 21-30: Significant concerns (Bronze) - many symptoms, seek help
    if (score <= 10) return { type: "Gold", color: "text-yellow-500", src: "/icons/goldmedal.svg", message: "Excellent! You show minimal symptoms." };
    if (score <= 20) return { type: "Silver", color: "text-gray-400", src: "/icons/silvermedal.svg", message: "Good, but some areas need attention." };
    return { type: "Bronze", color: "text-amber-600", src: "/icons/bronzemedal.svg", message: "Consider seeking professional support." };
  };

  return (
    <div className="around relative min-h-screen">
      <Toaster />
      <div className="fixed left-3 md:left-6 z-50 top-20 md:top-32">
        <StickyBackButton />
      </div>
      {progress < 100 ? (
        <>
          <div className="rive-container">
            <div className="rive-wrapper">
              <RiveComponent className="rive-container" />
            </div>
          </div>
          <div className="flex flex-col mt-2 md:mt-5 items-center min-h-screen gap-3 md:gap-6 pb-20 px-4">
            <Progress value={progress} className={cn("w-[95%] sm:w-[90%] md:w-[70%] lg:w-[60%]")} />
            {question && (
              <>
                <div className="w-[95%] sm:w-[90%] md:w-[70%] lg:w-[60%] flex justify-center">
                  <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-center px-2">{question.question}</h1>
                </div>
                <RadioGroup value={chosen} onValueChange={setChosen} className="w-full max-w-md px-2">
                  {question.options?.map((option: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 p-1.5 md:p-2">
                      <RadioGroupItem value={option} id={`r${index}`} />
                      <Label htmlFor={`r${index}`} className="text-xs sm:text-sm md:text-base cursor-pointer leading-relaxed">{option.split("+")[0]}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <Button onClick={onNext} className="w-full max-w-xs md:w-auto text-sm md:text-base h-9 md:h-10">
                  {count === content?.questions.length - 1 ? "Finish" : "Next"}
                </Button>
              </>
            )}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-300 py-1.5 md:py-3 text-center px-3 md:px-4">
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 leading-tight">
                <strong>Disclaimer:</strong> These are general questions for informational purposes only and are not suggested by a doctor.
              </p>
            </div>
          </div>
        </>
      ) : (
        <motion.div
          className="flex flex-col items-center min-h-screen gap-4 md:gap-6 py-6 md:py-10 pb-20 px-4"
          initial="hidden"
          animate="visible"
          variants={celebrationVariants}
        >
          <Confetti />
          <motion.h1 variants={itemVariants} className="text-lg sm:text-xl md:text-2xl lg:text-3xl mt-2 font-bold text-center px-4">
            You scored {score} out of 30
          </motion.h1>

          <motion.div variants={itemVariants} className="flex items-center flex-col gap-2 md:gap-5">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-center px-4">
              You earned a{" "}
              <span className={`font-black ${getMedalInfo().color}`}>
                {getMedalInfo().type} Medal
              </span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-center max-w-md px-4 leading-relaxed">{getMedalInfo().message}</p>
            {shouldReduceMotion ? (
              <>
                <div className="hidden md:block">
                  <Image
                    src={getMedalInfo().src}
                    width={150}
                    height={150}
                    alt={`${getMedalInfo().type} medal`}
                  />
                </div>
                <div className="md:hidden">
                  <Image
                    src={getMedalInfo().src}
                    width={100}
                    height={100}
                    alt={`${getMedalInfo().type} medal`}
                  />
                </div>
              </>
            ) : (
              <>
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="hidden md:block"
                >
                  <Image
                    src={getMedalInfo().src}
                    width={150}
                    height={150}
                    alt={`${getMedalInfo().type} medal`}
                  />
                </motion.div>
                <div className="md:hidden">
                  <Image
                    src={getMedalInfo().src}
                    width={100}
                    height={100}
                    alt={`${getMedalInfo().type} medal`}
                  />
                </div>
              </>
            )}
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mt-1 text-center px-4">
            Based on the personality test, here's your diagnosis for{" "}
            <span className="text-red-500">{name}</span>
          </motion.h1>
          <motion.div variants={itemVariants} className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[1200px]">
            <Card className={cn("p-4 md:p-6 lg:p-8 whitespace-normal w-full")}>
              <div className={cn(styles.textwrapper, "min-h-[200px] md:min-h-[300px] max-h-[50vh] md:max-h-[60vh] overflow-y-auto")}>
                <Markdown
                  className={cn("w-full h-full prose prose-sm md:prose-base max-w-none dark:prose-invert")}
                  components={{
                    p: ({ node, ...props }) => {
                      // Check if paragraph contains bullet points
                      const content = props.children?.toString() || '';
                      if (content.startsWith('•')) {
                        // Convert to proper list item
                        return <li className="mb-2 leading-relaxed list-disc ml-6">{content.substring(1).trim()}</li>;
                      }
                      return <p className="mb-4 leading-relaxed" {...props} />;
                    },
                    h1: ({ node, ...props }) => <h1 className="text-2xl md:text-3xl font-bold mt-6 mb-4" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-xl md:text-2xl font-bold mt-5 mb-3" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg md:text-xl font-bold mt-4 mb-2" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-2 leading-relaxed" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold text-gray-900 dark:text-gray-100" {...props} />,
                    hr: ({ node, ...props }) => <hr className="my-6 border-gray-300 dark:border-gray-600" {...props} />,
                  }}
                >
                  {output
                    .replace(/<br\s*\/?>/gi, '\n\n')
                    .replace(/^• /gm, '- ')
                    .replace(/\n• /g, '\n- ')
                  }
                </Markdown>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full max-w-xs md:w-auto">
            <Button
              onClick={() => {
                setProgress(0);
                setScore(0);
                setCount(0);
                setQuestion(content?.questions[0]);
                setShowCelebration(false);
                setResponse("");
                setOutput("The response will appear here...");
              }}
              className="w-full md:w-auto"
            >
              Restart Quiz
            </Button>
          </motion.div>

          <div className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-300 py-2 md:py-3 text-center px-4">
            <p className="text-xs md:text-sm text-gray-600">
              <strong>Disclaimer:</strong> These are general questions for informational purposes only and are not suggested by a doctor.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}