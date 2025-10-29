import { EmailTemplate } from "@/components/email-template";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(request: NextRequest) {
  const reqBody = await request.json();
  const { imageURl, email } = reqBody;

  try {
    if (!resendApiKey || !resend) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 503 },
      );
    }
    if (!email || !imageURl) {
      return NextResponse.json(
        { error: "Missing email or imageURl" },
        { status: 400 },
      );
    }
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Your avatar is ready! 🌟🤩",
      react: EmailTemplate({ imageURl }),
    });
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
