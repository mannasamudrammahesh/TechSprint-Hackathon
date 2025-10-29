import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, language = 'en', session_id = 'default' } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Forward to Python backend
    const backendResponse = await fetch(`${process.env.PYTHON_BACKEND_URL || 'http://localhost:8000'}/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        language,
        session_id
      }),
    });

    if (!backendResponse.ok) {
      throw new Error('Backend TTS failed');
    }

    // Stream the audio response
    const audioBuffer = await backendResponse.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename=speech.wav'
      }
    });

  } catch (error) {
    console.error('TTS API Error:', error);
    return NextResponse.json(
      { error: 'Text-to-speech processing failed' },
      { status: 500 }
    );
  }
}
