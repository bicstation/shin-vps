/**
 * =====================================================================
 * 🛡️ BICSTATION Middleware (v3.9 Optimized)
 * 物理パス: /home/maya/dev/shin-vps/next-bicstation/middleware.ts
 * 修正内容: CookieとLocalStorageの認証不整合によるループを解消
 * =====================================================================
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSiteMetadata } from './shared/lib/utils/siteConfig';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. 静的ファイルやAPIリクエストはスルー
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 🛡️ [Fixed Truth] 艦のアイデンティティを保証
  const host = request.headers.get('host') || "";
  let meta = getSiteMetadata(host);

  // 🚨 救済措置: bicstation であることを強制
  if (!meta.site_tag || meta.site_tag === 'default') {
    meta.site_tag = 'bicstation';
    meta.django_host = 'bicstation';
  }

  const requestHeaders = new Headers(request.headers);

  /**
   * 🛰️ [QUAD-DOMAIN-REINFORCED] Django ViewSet 識別ヘッダー
   */
  requestHeaders.set('x-url', pathname);
  requestHeaders.set('x-site-tag', meta.site_tag);
  requestHeaders.set('x-site-group', meta.site_group || 'main');
  requestHeaders.set('x-django-host', meta.django_host); 
  requestHeaders.set('x-project-id', meta.site_tag);     
  requestHeaders.set('x-is-local', String(meta.is_local_env));

  // 3. 🔐 管理画面認証の修正
  // 🔴 以前はここで Cookie がなければ一律リダイレクトしていましたが、
  // LocalStorage 認証との競合（無限ループ）を防ぐため、判定をページ側に委ねるか、
  // もしくは Cookie チェックを一旦パスさせます。
  const isConsolePage = pathname.startsWith('/console');
  
  if (isConsolePage && pathname !== '/login') {
    // 💡 [Maya's Logic 修正]: 
    // ブラウザの LocalStorage にトークンがある場合でも、Middleware（サーバー側）からは見えません。
    // ここで追い出してしまうと無限ループになるため、ヘッダーを付与して次に進めます。
    // 実際の認証チェックは各 Page の useEffect (checkAuth) で行われます。
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * 🛰️ マッチャー設定
 */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};