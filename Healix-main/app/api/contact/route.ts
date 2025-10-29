import { NextRequest, NextResponse } from "next/server";
import { ContactEmailTemplate } from "@/components/email-template";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
// Configure Resend with longer timeout and retry settings
const resend = resendApiKey ? new Resend(resendApiKey, {
  fetchOptions: {
    timeout: 30000, // 30 seconds timeout instead of default 10s
  }
}) : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    console.log("📧 Contact form submission received:", { name, email });

    // Validate the input
    if (!name || !email || !message) {
      console.error("❌ Missing required fields");
      return NextResponse.json(
        { error: "Please fill in all fields" },
        { status: 400 },
      );
    }

    // Validate name (2-50 characters, letters and spaces only)
    if (!/^[a-zA-Z\s]{2,50}$/.test(name.trim())) {
      console.error("❌ Invalid name format");
      return NextResponse.json(
        { error: "Please enter a valid name (2-50 characters, letters only)" },
        { status: 400 },
      );
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.error("❌ Invalid email format");
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    // Validate message length
    if (message.trim().length < 10) {
      console.error("❌ Message too short");
      return NextResponse.json(
        { error: "Message must be at least 10 characters long" },
        { status: 400 },
      );
    }

    if (message.trim().length > 1000) {
      console.error("❌ Message too long");
      return NextResponse.json(
        { error: "Message must be less than 1000 characters" },
        { status: 400 },
      );
    }

    // Check if Resend is configured
    if (!resendApiKey || !resend) {
      console.error("❌ Resend API key not configured");
      console.error("⚠️ Please add RESEND_API_KEY to .env.local");
      console.error("⚠️ Get your key from: https://resend.com/api-keys");
      return NextResponse.json(
        { error: "Email service not configured. Please add RESEND_API_KEY to environment variables." },
        { status: 503 },
      );
    }

    // Check if API key is still the placeholder
    if (resendApiKey.includes("REPLACE_WITH_YOUR_ACTUAL_KEY")) {
      console.error("❌ Using placeholder API key");
      console.error("⚠️ Please replace the placeholder with your real Resend API key");
      console.error("⚠️ Get your key from: https://resend.com/api-keys");
      return NextResponse.json(
        { error: "Email service not configured properly. Please add your real Resend API key." },
        { status: 503 },
      );
    }

    // Send email using Resend with retry logic
    console.log("📤 Sending email via Resend...");
    console.log("🔑 Using API key:", resendApiKey.substring(0, 10) + "...");
    
    let data;
    let lastError;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📨 Attempt ${attempt}/${maxRetries}...`);
        
        data = await resend.emails.send({
          from: "Healix Contact Form <onboarding@resend.dev>",
          to: process.env.CONTACT_EMAIL || "help.healix@gmail.com",
          subject: `New Contact Form Message from ${name}`,
          react: ContactEmailTemplate({
            name: name.trim(),
            email: email.trim(),
            message: message.trim()
          }) as React.ReactElement,
        });
        
        console.log("✅ Email sent successfully:", data);
        break; // Success, exit retry loop
        
      } catch (err: any) {
        lastError = err;
        console.error(`❌ Attempt ${attempt} failed:`, err.message);
        
        if (attempt < maxRetries) {
          const delay = attempt * 2000; // 2s, 4s, 6s
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // If all retries failed, throw the last error
    if (!data && lastError) {
      throw lastError;
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully! We'll get back to you within 24 hours.",
      data
    }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Error sending email:", error);
    console.error("❌ Error details:", {
      message: error?.message,
      cause: error?.cause,
      code: error?.code,
      name: error?.name
    });

    // Handle specific error types
    if (error?.message?.includes("API key") || error?.statusCode === 401) {
      console.error("🔑 API Key issue detected");
      return NextResponse.json(
        { error: "Email service configuration error. Please verify your Resend API key." },
        { status: 503 },
      );
    }

    if (error?.message?.includes("rate limit") || error?.statusCode === 429) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a few minutes." },
        { status: 429 },
      );
    }

    // Handle network/timeout errors
    if (error?.code === "UND_ERR_CONNECT_TIMEOUT" || error?.message?.includes("timeout") || error?.message?.includes("fetch failed")) {
      console.error("🌐 Network connectivity issue detected");
      console.error("💡 Possible causes:");
      console.error("   - Firewall blocking api.resend.com");
      console.error("   - Network proxy configuration");
      console.error("   - DNS resolution issues");
      console.error("   - Internet connection problems");
      
      return NextResponse.json(
        { 
          error: "Network connection error. Please check your internet connection and firewall settings, then try again.",
          details: "Unable to reach email service (api.resend.com). This may be due to firewall or network restrictions."
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Failed to send email. Please try again later or contact us directly at help.healix@gmail.com" },
      { status: 500 },
    );
  }
}
