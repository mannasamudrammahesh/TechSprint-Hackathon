import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle both text-based and image-based emotion detection
    const { text, image, use_advanced } = body;

    if (!text && !image) {
      return NextResponse.json({ error: 'No text or image provided' }, { status: 400 });
    }

    // Determine which backend endpoint to use
    const endpoint = image ? '/facial-emotion-detect' : '/emotion-detect';
    const payload = image ? { image, use_advanced: use_advanced !== false } : { text };

    console.log(`🎭 Emotion detection request: ${endpoint} (advanced: ${use_advanced !== false})`);

    // Forward to Python backend
    const backendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
    const backendResponse = await fetch(`${backendUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!backendResponse.ok) {
      console.error('Backend emotion detection failed:', await backendResponse.text());
      // Return fallback response
      return NextResponse.json({
        emotion: 'neutral',
        confidence: 0.5,
        face_detected: false,
        rive_trigger: 'idle',
        method: 'fallback',
        fallback: true
      });
    }

    const result = await backendResponse.json();
    console.log(`✅ Emotion detected: ${result.emotion} (${result.confidence})`);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Emotion Detection API Error:', error);
    // Return fallback response instead of error
    return NextResponse.json({
      emotion: 'neutral',
      confidence: 0.5,
      face_detected: false,
      rive_trigger: 'idle',
      method: 'error',
      error: 'Emotion detection processing failed',
      fallback: true
    });
  }
}
