import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content } = body;

    console.log("🚀 IMAGE API START:", title);

    const res = await fetch('http://django-v3:8000/api/ai/generate-image/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });

    const text = await res.text();
    console.log("📡 DJANGO RESPONSE:", text);

    if (!res.ok) {
      throw new Error(`Django error: ${text}`);
    }

    const data = JSON.parse(text);

    console.log("✅ IMAGE OK:", data.imagePath);

    return NextResponse.json({
      imagePath: data.imagePath,
    });

  } catch (err: any) {
    console.error("🔥 IMAGE GENERATE ERROR:", err.message);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}