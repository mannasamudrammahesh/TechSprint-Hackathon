import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { email, gender, userPrompt, selectedFile } = await req.json();

    if (!selectedFile) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ imageUrl: selectedFile, note: "AI key not configured, returning original image" });
    }

    // Placeholder: echo back selected image; could add prompt-based transformation later
    const imageUrl = selectedFile;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
