// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 🧪 モック用の認証チェック（実際には Cookie や JWT を確認）
  const isAuthenticated = request.cookies.get('bicstation_auth'); 
  const isConsolePage = request.nextUrl.pathname.startsWith('/bicstation/console');

  // 未ログインで管理画面に入ろうとした場合、ログインへリダイレクト
  if (isConsolePage && !isAuthenticated) {
    return NextResponse.redirect(new URL('/bicstation/login', request.url));
  }

  return NextResponse.next();
}

// 監視対象のパスを指定
export const config = {
  matcher: ['/bicstation/console/:path*'],
};