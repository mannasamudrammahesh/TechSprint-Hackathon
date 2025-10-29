"use client"

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import React from 'react'
import { Button } from "@/components/ui/button";
import styles from '@/styles/styles.module.css'
import "@/styles/LoginFormComponent.css";
import toast, { Toaster } from "react-hot-toast";
import { BeatLoader } from "react-spinners";
import { BackButton } from '@/components/BackButton';

// Lazy load Markdown for better performance
const Markdown = dynamic(() => import('react-markdown'), {
  ssr: false,
  loading: () => <div className="animate-pulse">Loading content...</div>
});

export default function Page({ params }: { params: { name: string } }) {

    const name = params.name;
    const [loading, setLoading] = useState(false);

    // const [image, setImage] = useState("");

    // const getImage = async (name: string) => {
    //     const response = await fetch("/api/imagen", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({
    //             name,
    //         }),
    //     });

    //     const data = await response.json();

    //     // get imageUrl from data
    //     console.log(data.imageURl);
    //     setImage(data.imageURl);
    //     return data;
    // }

    const [response, setResponse] = useState("");
    const [output, setOutput] = useState("The response will appear here...");

    const onSubmit = async () => {

        // clear the output
        setOutput("The response will appear here...");

        toast.success("Healix is creating comprehensive guidance for " + name);

        // set the loading state to true
        setLoading(true);

        try {
            // Enhanced prompt for Llama to provide comprehensive guidance
            const guidancePrompt = `You are a compassionate mental health expert providing comprehensive guidance about ${name}.

**Please provide detailed information in the following structure:**

1. **Understanding ${name}**: What is it and how does it manifest?
2. **Common Causes**: What typically triggers or causes ${name}?
3. **Symptoms to Watch For**: Key signs and symptoms people should be aware of
4. **Evidence-Based Treatments**: Professional treatment options that work
5. **Self-Help Strategies**: Practical daily strategies for managing ${name}
6. **When to Seek Help**: Clear guidance on when professional help is needed
7. **Support Resources**: Where to find additional help and support
8. **Hope and Recovery**: Encouraging message about recovery and improvement

Please be thorough, empathetic, and provide actionable information. Format your response with clear paragraphs and sections.`;

            // create a post request to the /api/chat endpoint
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userPrompt: guidancePrompt,
                }),
            });

            // get the response from the server
            const data = await response.json();

            setLoading(false);

            if (data.error) {
                toast.error(data.error);
                return;
            }

            // Handle both reply and text fields
            const responseText = data.reply || data.text;

            if (!responseText || responseText === "") {
                toast.error("No response from Healix!");
                return;
            }

            // set the response in the state
            setResponse(responseText);
            toast.success("Healix  guidance ready!");
        } catch (error) {
            console.error("Error getting Healix guidance:", error);
            setLoading(false);
            toast.error("Failed to get guidance. Please try again.");
        }
    };

    useEffect(() => {
        // update the response character by character in the output
        if (response.length === 0) return;

        setOutput("");

        for (let i = 0; i < response.length; i++) {
            setTimeout(() => {
                setOutput((prev) => prev + response[i]);
            }, i * 10);
        }

    }, [response]);

    return (
        <div className="min-h-screen backg dark:bg-gray-900">
            <Toaster />
            <div className="fixed left-3 md:left-6 z-50 top-20 md:top-32">
                <BackButton />
            </div>
            <div className="container mx-auto p-3 md:p-6 pt-4 px-4">
                <div className='flex flex-col items-center gap-4 md:gap-6 pt-4'>
                    <h1 className='text-2xl sm:text-3xl md:text-4xl font-extrabold mt-1 dark:text-white text-center'>{name}</h1>
                    {/* {image && <Image src={image} alt="image" width={300} height={300} />} */}
                    <h1 className='text-sm sm:text-base md:text-lg font-bold mt-1 dark:text-gray-200 text-center px-2'>Creating a response for what causes and cure for <span className="text-red-500">{name}</span></h1>
                    <Card className={cn("p-4 md:p-6 lg:p-8 whitespace-normal w-full max-w-[95vw] md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[1200px] bg-card dark:bg-gray-800")}>
                        <div className={cn(styles.textwrapper, response ? "min-h-[200px] md:min-h-[300px] overflow-y-auto" : "min-h-[20px] max-h-[300px] md:max-h-[400px] overflow-y-auto")} style={response ? { maxHeight: 'none' } : {}}>
                            <Markdown
                                className={cn("w-full h-full prose prose-sm md:prose-base max-w-none dark:prose-invert")}
                                components={{
                                    p: ({ node, ...props }) => {
                                        const content = props.children?.toString() || '';
                                        if (content.startsWith('•')) {
                                            return <li className="mb-1.5 md:mb-2 leading-relaxed list-disc ml-4 md:ml-6 dark:text-gray-200 text-sm md:text-base">{content.substring(1).trim()}</li>;
                                        }
                                        return <p className="mb-4 md:mb-8 leading-relaxed dark:text-gray-200 text-sm md:text-base" {...props} />;
                                    },
                                    h1: ({ node, ...props }) => <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mt-4 md:mt-8 mb-3 md:mb-5 dark:text-white" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-lg md:text-xl lg:text-2xl font-bold mt-4 md:mt-7 mb-2 md:mb-4 dark:text-white" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-base md:text-lg lg:text-xl font-bold mt-3 md:mt-6 mb-2 md:mb-3 dark:text-gray-100" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-4 md:pl-6 mb-4 md:mb-6 space-y-1.5 md:space-y-2 dark:text-gray-200" {...props} />,
                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-4 md:pl-6 mb-4 md:mb-6 space-y-1.5 md:space-y-2 dark:text-gray-200" {...props} />,
                                    li: ({ node, ...props }) => <li className="mb-1.5 md:mb-2 leading-relaxed dark:text-gray-200 text-sm md:text-base" {...props} />,
                                    strong: ({ node, ...props }) => <strong className="font-bold text-gray-900 dark:text-gray-100" {...props} />,
                                    hr: ({ node, ...props }) => <hr className="my-4 md:my-8 border-gray-300 dark:border-gray-600" {...props} />,
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
                    {loading ? (
                        <Button>
                            <BeatLoader color="white" size={8} />
                        </Button>
                    ) : (
                        <Button onClick={() => {
                            onSubmit();
                            // getImage(name);
                        }}>Get Details</Button>
                    )}
                </div>
            </div>
        </div>
    )
}