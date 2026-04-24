import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { title, content } = body;

    // 🔥 Django APIに投げる
    const res = await fetch('http://django-v3:8000/api/ai/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });

    if (!res.ok) {
      throw new Error('Django API error');
    }

    const data = await res.json();

    return NextResponse.json({
      url: data.imagePath,
    });

  } catch (err) {
    console.error('Image Generate Error:', err);

    return NextResponse.json(
      { error: 'Image generation failed' },
      { status: 500 }
    );
  }
}