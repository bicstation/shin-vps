// /home/maya/shin-dev/shin-vps/next-bic-saving/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 🌉 SHIN-VPS v5.1: ドメイン識別・強制刻印ロジック [SAVING-REINFORCED]
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 静的ファイル、画像、APIリクエスト、faviconなどはスルー
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);

  // ✅ 現在のパスをセット
  requestHeaders.set('x-url', pathname);

  /**
   * 🎯 【最重要】ドメイン・アイデンティティの固定 (Bic-Saving)
   * Django ViewSet が 'saving' を確実に抽出できるよう、
   * 複数の識別子ヘッダーをセットして網を張ります。
   */
  requestHeaders.set('x-django-host', 'saving');
  requestHeaders.set('x-project-id', 'saving'); // 🚨 追加：Django Middleware との互換性向上
  
  // SSR時のHostヘッダーを明示
  requestHeaders.set('host', 'bic-saving.com');

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};