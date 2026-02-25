// /home/maya/dev/shin-vps/next-adult/middleware.ts
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

  // ✅ 重要：現在のパスをヘッダーにセット（サイドバーでの色付け用）
  requestHeaders.set('x-url', pathname);

  // ✅ アダルト版固有の認証チェック（必要であれば）
  // 例: 18歳確認フラグのチェックなど
  // const hasConfirmedAge = request.cookies.get('age_confirmed');
  // if (!hasConfirmedAge && pathname !== '/age-verification') {
  //   return NextResponse.redirect(new URL('/age-verification', request.url));
  // }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};