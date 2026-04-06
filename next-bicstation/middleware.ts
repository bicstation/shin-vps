// /home/maya/dev/shin-vps/next-bicstation/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSiteMetadata } from './shared/lib/utils/siteConfig';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 🛡️ [Fixed Truth] ホスト名が不安定な内部通信でも、この艦のアイデンティティを保証する
  const host = request.headers.get('host') || "";
  let meta = getSiteMetadata(host);

  // 🚨 救済措置: もしホスト名判定が不安定でも、このコンテナが bicstation であることを強制する
  if (!meta.site_tag || meta.site_tag === 'default') {
    meta.site_tag = 'bicstation';
    meta.django_host = 'bicstation';
  }

  const requestHeaders = new Headers(request.headers);

  /**
   * 🛰️ [QUAD-DOMAIN-REINFORCED] 
   * Django ViewSet が 100% 識別できるよう、あらゆる識別ヘッダーを網羅。
   */
  requestHeaders.set('x-url', pathname);
  requestHeaders.set('x-site-tag', meta.site_tag);
  requestHeaders.set('x-site-group', meta.site_group || 'main');
  requestHeaders.set('x-django-host', meta.django_host); // 命綱
  requestHeaders.set('x-project-id', meta.site_tag);     // Django Middleware用
  requestHeaders.set('x-is-local', String(meta.is_local_env));

  // 3. 管理画面認証
  const cookieName = `${meta.site_tag}_auth`;
  const isAuthenticated = request.cookies.get(cookieName);
  const isConsolePage = pathname.startsWith('/console');

  if (isConsolePage && pathname !== '/login') {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};