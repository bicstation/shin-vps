// /home/maya/dev/shin-vps/next-bicstation/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 静的ファイルや内部リクエスト、APIは即座にスルー（処理を軽くする）
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // favicon.ico や画像など
  ) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);

  // 2. サイドバー用：現在のパスをヘッダーにセット
  requestHeaders.set('x-url', pathname);

  // 3. 管理画面の認証チェック
  const isAuthenticated = request.cookies.get('bicstation_auth'); 
  const isConsolePage = pathname.startsWith('/console');

  if (isConsolePage && !isAuthenticated) {
    // ログインページ自体が /console 下にある場合は無限ループに注意
    if (pathname !== '/login') {
       return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// 監視対象をシンプルかつ確実に
export const config = {
  matcher: [
    // すべてのページリクエストに適用。ただし静的ファイル等は middleware 内部の if 文で除外
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};