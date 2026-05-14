/**
 * =====================================================================
 * 🛡️ BICSTATION Middleware (v4.0 Stabilized for Next.js 15)
 * 物理パス:
 * /home/maya/shin-vps/next-bicstation/middleware.ts
 *
 * 修正内容:
 * - Next.js 15 の internal routes (/404 /500 /_not-found) を除外
 * - prerender 時の middleware 干渉を回避
 * - App Router 安定化
 * - Docker / Standalone 対応
 * =====================================================================
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSiteMetadata } from './shared/lib/utils/siteConfig';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /**
   * =================================================================
   * 🚨 Next.js Internal Routes Protection
   * =================================================================
   * Next.js 15 App Router の prerender / fallback に干渉しない
   * =================================================================
   */
  if (
    pathname === '/404' ||
    pathname === '/500' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_not-found') ||
    pathname.startsWith('/_error')
  ) {
    return NextResponse.next();
  }

  /**
   * =================================================================
   * 🛰️ Static / API Skip
   * =================================================================
   */
  if (
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  /**
   * =================================================================
   * 🛡️ Site Metadata Resolution
   * =================================================================
   */
  const host = request.headers.get('host') || '';

  let meta = getSiteMetadata(host);

  /**
   * 🚨 Emergency Fallback
   */
  if (!meta.site_tag || meta.site_tag === 'default') {
    meta.site_tag = 'bicstation';
    meta.django_host = 'bicstation';
  }

  /**
   * =================================================================
   * 🛰️ Custom Request Headers
   * =================================================================
   */
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set('x-url', pathname);
  requestHeaders.set('x-site-tag', meta.site_tag);
  requestHeaders.set('x-site-group', meta.site_group || 'main');
  requestHeaders.set('x-django-host', meta.django_host);
  requestHeaders.set('x-project-id', meta.site_tag);
  requestHeaders.set('x-is-local', String(meta.is_local_env));

  /**
   * =================================================================
   * 🔐 Console Authentication Handling
   * =================================================================
   * LocalStorage 認証との競合防止
   * =================================================================
   */
  const isConsolePage = pathname.startsWith('/console');

  if (isConsolePage && pathname !== '/login') {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  /**
   * =================================================================
   * 🚀 Default Pass
   * =================================================================
   */
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * =====================================================================
 * 🛰️ Middleware Matcher
 * =====================================================================
 * Next.js internal system routes を除外
 * =====================================================================
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|404|500).*)',
  ],
};