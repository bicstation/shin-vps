// /home/maya/shin-dev/shin-vps/next-avflash/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 静的ファイルやAPIリクエスト（Next.js内部用）はスルー
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);

  // ✅ 重要：現在のパスをヘッダーにセット（パンくずリストやSSR判定用）
  requestHeaders.set('x-url', pathname);

  /**
   * ⚡ AV Flash [QUAD-DOMAIN-IDENTIFIER]
   * Django ViewSet が 'avflash' を確実に識別できるよう、
   * ヘッダーと内部プロキシ用の識別子を二重に刻印します。
   */
  
  // A: カスタムヘッダー（Django Middleware用）
  requestHeaders.set('x-django-host', 'avflash');
  requestHeaders.set('x-project-id', 'avflash');

  // B: Django側が Host ヘッダーを参照した場合の保険（ローカル/内部通信用）
  // 🚨 サーバーサイド fetch 時の Host ヘッダーを固定化
  requestHeaders.set('host', 'avflash.xyz');

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};