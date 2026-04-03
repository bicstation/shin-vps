// /home/maya/dev/shin-vps/next-bicstation/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSiteMetadata } from './shared/lib/utils/siteConfig';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. 静的ファイル・APIは最速でスルー
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 🛡️ [Single Truth] ここで一度だけ判定を行う
  const host = request.headers.get('host') || "";
  const meta = getSiteMetadata(host);

  // 2. レスポンス・ヘッダーの準備
  const requestHeaders = new Headers(request.headers);

  /**
   * 🛰️ 重要: 判定結果をヘッダーに「刻印」する
   * これにより、サーバーコンポーネント側で headers().get('x-django-host') を
   * 呼ぶだけで、再判定なしに正しい接続先が分かります。
   */
  requestHeaders.set('x-url', pathname);
  requestHeaders.set('x-site-tag', meta.site_tag);
  requestHeaders.set('x-site-group', meta.site_group);
  requestHeaders.set('x-django-host', meta.django_host); // 🛡️ API通信の命綱
  requestHeaders.set('x-is-local', String(meta.is_local_env));

  // 3. 管理画面認証 (クッキー名も動的に解決)
  const cookieName = `${meta.site_tag}_auth`;
  const isAuthenticated = request.cookies.get(cookieName);
  const isConsolePage = pathname.startsWith('/console');

  // ログインチェックとリダイレクト
  if (isConsolePage && pathname !== '/login') {
    if (!isAuthenticated) {
      // サイトごとのコンテキストを維持してログインへ
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. 判定済みヘッダーを抱えて次へ進む
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    // Next.jsの仕様に基づき、必要なパスだけを監視
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};