import { NextResponse } from 'next/server';
export async function GET() {
  const adsContent = "google.com, pub-9068876333048216, DIRECT, f08c47fec0942fa0";
  return new NextResponse(adsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'inline',
    },
  });
}
