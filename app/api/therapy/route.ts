import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { userPrompt } = reqBody;

    if (!GEMINI_API_KEY) {
      // graceful mock fallback
      const mock = `Supportive guidance: Practice deep breathing, try journaling, and consider talking to a trusted person. If you are in immediate danger, contact your local emergency number.`;
      return NextResponse.json({ text: mock, note: "AI key not configured, returning fallback guidance" }, { status: 200 });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.9,
        topP: 0.9,
        topK: 40,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    });

    const prompt = `You are a mental health professional providing supportive and empathetic responses. Please respond to the following: ${userPrompt}`;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out")), 15000);
    });

    const responsePromise = model.generateContent(prompt);
    const result = await Promise.race([responsePromise, timeoutPromise]);

    if (!result || typeof result === 'string') {
      throw new Error("Invalid response from AI service");
    }

    const response = await result.response;
    const text = response.text();

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: "Empty response received" }, { status: 500 });
    }

    return NextResponse.json({ text });

  } catch (error) {
    console.error("Error processing request:", error);

    let errorMessage = "Unable to process the prompt. Please try again.";
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        errorMessage = "API configuration error";
      } else if (error.message.includes("timed out")) {
        errorMessage = "Request timed out. Please try again.";
        statusCode = 504;
      } else if (error.message.includes("model not found")) {
        errorMessage = "Model configuration error. Please check your API access.";
        statusCode = 400;
      }
    }

    return NextResponse.json({ error: errorMessage, details: error.message }, { status: statusCode });
  }
}