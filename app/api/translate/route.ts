import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, source_lang, target_lang } = await request.json();

    if (!text || !source_lang || !target_lang) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Forward to Python backend
    const backendResponse = await fetch(`${process.env.PYTHON_BACKEND_URL || 'http://localhost:8000'}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        source_lang,
        target_lang
      }),
    });

    if (!backendResponse.ok) {
      throw new Error('Backend translation failed');
    }

    const result = await backendResponse.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Translation API Error:', error);
    return NextResponse.json(
      { error: 'Translation processing failed' },
      { status: 500 }
    );
  }
}
