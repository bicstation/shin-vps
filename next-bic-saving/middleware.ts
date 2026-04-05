// /home/maya/shin-dev/shin-vps/next-bic-saving/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 🌉 SHIN-VPS v5.0: ドメイン識別・強制刻印ロジック
 * 🚀 修正内容: 
 * 1. 内部リクエストや静的ファイルの除外。
 * 2. Django Bridge が要求する 'x-django-host' ヘッダーに 'saving' を強制注入。
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 静的ファイル、画像、APIリクエスト、faviconなどは判定から除外してスルー
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. 新しいヘッダーオブジェクトを作成
  const requestHeaders = new Headers(request.headers);

  // ✅ 現在のパスをセット（サイドバーのアクティブ表示等に利用）
  requestHeaders.set('x-url', pathname);

  /**
   * 🎯 【最重要】ドメイン・アイデンティティの固定
   * このコンテナは Bic-Saving 専用です。
   * Django Bridge (SSR) が Identity Resolved: undefined となるのを防ぎ、
   * Django ViewSet が正確に site='saving' を抽出できるように身分を証明します。
   */
  requestHeaders.set('x-django-host', 'saving');

  // 3. 修正したヘッダーをリクエストに反映させて次へ渡す
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * 🛡️ マッチャー設定
 * 静的ファイル以外のすべてのルートで実行するように設定。
 */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};