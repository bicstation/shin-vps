// /home/maya/dev/shin-vps/next-adult/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 🔞 SHIN-VPS v5.1: 成人向けドメイン(tiper)識別・刻印ロジック
 */
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

  // ✅ 重要：現在のパスをヘッダーにセット（サイドバーでの色付け用）
  requestHeaders.set('x-url', pathname);

  /**
   * 🎯 【最重要】ドメイン・アイデンティティの固定 (tiper)
   * Django ViewSet が site='tiper' で厳格にフィルタリングできるよう、
   * ここで「tiper」の刻印を二重に打ちます。
   */
  requestHeaders.set('x-django-host', 'tiper');
  requestHeaders.set('x-project-id', 'tiper'); 

  // SSR時の内部通信用Hostヘッダー保険
  requestHeaders.set('host', 'tiper.live');

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};