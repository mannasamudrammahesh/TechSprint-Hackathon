import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio_file') as File;
    const sessionId = formData.get('session_id') as string || 'default';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Forward to Python backend
    const backendFormData = new FormData();
    backendFormData.append('audio_file', audioFile);
    backendFormData.append('session_id', sessionId);

    const backendResponse = await fetch(`${process.env.PYTHON_BACKEND_URL || 'http://localhost:8000'}/stt`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!backendResponse.ok) {
      throw new Error('Backend STT failed');
    }

    const result = await backendResponse.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('STT API Error:', error);
    return NextResponse.json(
      { error: 'Speech-to-text processing failed' },
      { status: 500 }
    );
  }
}
