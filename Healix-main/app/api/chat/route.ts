import { NextRequest, NextResponse } from "next/server";

// Backend API configuration
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

/**
 * POST /api/chat
 * Forwards chat requests to Python backend with Llama 4 Scout
 * NO predefined responses - everything is dynamic from AI
 */
export async function POST(req: NextRequest) {
  console.log("=".repeat(70));
  console.log("🔵 Frontend API Route Called");
  console.log("=".repeat(70));

  try {
    // Parse request body as JSON
    const body = await req.json();
    console.log("📝 Request Body:", body);

    // Extract parameters (support multiple formats)
    const userPrompt = body.userPrompt || body.text || body.message || "";
    const sessionId =
      body.session_id || body.sessionId || `session-${Date.now()}`;
    const language = body.language || "en";
    const conversationHistory = body.conversationHistory || [];

    // Validate input
    if (!userPrompt || userPrompt.trim() === "") {
      return NextResponse.json(
        {
          error: "No input provided",
          text: "Please provide a message to get a response.",
        },
        { status: 400 },
      );
    }

    console.log("🚀 Forwarding to Python backend...");
    console.log(`   Backend URL: ${BACKEND_URL}/chat`);
    console.log(`   User Input: "${userPrompt.substring(0, 100)}..."`);
    console.log(`   Session ID: ${sessionId}`);
    console.log(`   Language: ${language}`);

    // Call Python backend with Llama 4 Scout
    let backendResponse;
    try {
      // Use 127.0.0.1 instead of localhost for better compatibility
      const backendUrl = BACKEND_URL.replace('localhost', '127.0.0.1');
      
      backendResponse = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: userPrompt,
          session_id: sessionId,
          language: language,
          conversation_history: conversationHistory,
        }),
        cache: 'no-store',
      });
    } catch (fetchError: any) {
      console.error("❌ Failed to connect to backend:", fetchError.message);
      return NextResponse.json(
        {
          text: `Unable to connect to the AI backend server. Please ensure:\n\n1. The backend server is running (check the "Healix Backend" window)\n2. It's running on port 8000\n3. Look for "Llama Scout AI initialized successfully" in the backend logs\n\nError: ${fetchError.message}`,
          error: true,
          errorType: "CONNECTION_FAILED",
          backendUrl: BACKEND_URL,
        },
        { status: 503 },
      );
    }

    console.log(`📡 Backend Response Status: ${backendResponse.status}`);

    if (!backendResponse.ok) {
      let errorText = "";
      try {
        errorText = await backendResponse.text();
      } catch (e) {
        errorText = "Unable to read error response";
      }
      console.error("❌ Backend Error:", errorText);
      console.error(`❌ Status Code: ${backendResponse.status}`);

      // Return detailed error message
      return NextResponse.json(
        {
          text: `The AI backend returned an error (Status: ${backendResponse.status}).\n\nPossible causes:\n1. Llama Scout AI not initialized\n2. API key issue\n3. Backend crashed\n\nCheck the "Healix Backend" window for detailed error logs.\n\nError: ${errorText}`,
          error: true,
          errorType: "BACKEND_ERROR",
          statusCode: backendResponse.status,
          details: errorText,
        },
        { status: backendResponse.status },
      );
    }

    // Parse backend response with error handling
    let data;
    try {
      const responseText = await backendResponse.text();
      console.log(`📄 Raw Response: ${responseText.substring(0, 200)}...`);

      data = JSON.parse(responseText);
      console.log("✅ Backend Response Received");
      console.log(`   Response Length: ${data.reply?.length || 0} chars`);
      console.log(`   Preview: ${data.reply?.substring(0, 150)}...`);
    } catch (jsonError: any) {
      console.error("❌ Failed to parse backend response as JSON");
      console.error(`   JSON Error: ${jsonError.message}`);

      return NextResponse.json(
        {
          text: `The backend returned an invalid response. This usually means:\n\n1. Backend crashed or encountered an error\n2. Backend is not properly initialized\n3. Llama Scout AI failed to start\n\nCheck the "Healix Backend" window for error details.\n\nTechnical: JSON parse error at position ${jsonError.message}`,
          error: true,
          errorType: "INVALID_JSON",
          details: jsonError.message,
        },
        { status: 500 },
      );
    }

    // Return response in format frontend expects
    return NextResponse.json({
      text:
        data.reply ||
        data.response ||
        "I'm here to help. Could you tell me more?",
      language: data.language || language,
      category: null, // Dynamic responses don't need predefined categories
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("=".repeat(70));
    console.error("❌ CRITICAL ERROR IN API ROUTE");
    console.error("   Error Type:", error.constructor.name);
    console.error("   Error Message:", error.message);
    console.error("   Stack:", error.stack);
    console.error("=".repeat(70));

    // Determine specific error message
    let errorMessage = "An unexpected error occurred in the chat system.";

    if (error.message.includes("fetch")) {
      errorMessage =
        "Failed to connect to backend server. Is it running on port 8000?";
    } else if (error.message.includes("JSON")) {
      errorMessage = "Backend returned invalid response. Check backend logs.";
    } else if (error.message.includes("timeout")) {
      errorMessage =
        "Request timed out. The AI might be processing a complex request.";
    }

    // Return detailed error
    return NextResponse.json(
      {
        text: `🚨 Critical Error: ${errorMessage}\n\nTechnical details: ${error.message}\n\nWhat to check:\n1. Is the "Healix Backend" window open and running?\n2. Does it show "Starting Healix AI Backend on port 8000"?\n3. Does it show "Llama Scout AI initialized successfully"?\n4. Are there any red error messages in the backend window?\n\nIf the backend is not running, please run: START_FIXED.bat`,
        error: true,
        errorType: "CRITICAL_ERROR",
        details: error.message,
        stack: error.stack,
        backendUrl: BACKEND_URL,
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/chat
 * Health check endpoint
 */
export async function GET() {
  try {
    // Check if backend is reachable
    const healthCheck = await fetch(`${BACKEND_URL}/health`, {
      method: "GET",
    });

    const isHealthy = healthCheck.ok;

    return NextResponse.json({
      status: isHealthy ? "ok" : "backend_unavailable",
      backend_url: BACKEND_URL,
      backend_healthy: isHealthy,
      message: isHealthy
        ? "Chat API is ready - using Llama 4 Scout for all responses"
        : "Backend server is not responding - please start it with 'python main.py'",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        backend_url: BACKEND_URL,
        backend_healthy: false,
        message: "Cannot connect to backend server",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
