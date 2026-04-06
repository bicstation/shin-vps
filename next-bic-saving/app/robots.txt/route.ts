// app/robots.txt/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const robotsContent = `User-agent: *
Allow: /
Sitemap: https://bic-saving.com/sitemap.xml`;

  return new NextResponse(robotsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'inline',
    },
  });
}