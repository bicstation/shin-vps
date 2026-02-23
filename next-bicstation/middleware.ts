// /home/maya/dev/shin-vps/next-bicstation/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);

  // 1. サイドバー用：現在のパスをヘッダーにセット（Server Componentで読み取る用）
  requestHeaders.set('x-url', pathname);

  // 2. 管理画面の認証チェック（/bicstation を除去）
  const isAuthenticated = request.cookies.get('bicstation_auth'); 
  const isConsolePage = pathname.startsWith('/console'); // /bicstation を削除

  if (isConsolePage && !isAuthenticated) {
    // リダイレクト先も適切なパス（例: /login）に修正してください
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// 監視対象の設定
export const config = {
  matcher: [
    /*
     * 静的ファイル、API、画像などを除外したすべてのパスを対象にする
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};