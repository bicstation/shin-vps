// /home/maya/shin-dev/shin-vps/next-avflash/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 静的ファイルやAPIリクエストはスルー
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);

  // ✅ 重要：現在のパスをヘッダーにセット
  requestHeaders.set('x-url', pathname);

  /**
   * 🔞 AV Flash 専用識別子の刻印
   * Django ViewSet が site='avflash' でフィルタリングできるよう、
   * ここで身分証を発行します。
   */
  requestHeaders.set('x-django-host', 'avflash');

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};