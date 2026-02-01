/**
 * 🛠️ [SHARED-FINAL] 統合認証ライブラリ (.tsx版)
 */

import { getSiteMetadata, SiteMetadata } from './siteConfig';

export interface AuthTokenResponse {
  access?: string;
  refresh?: string;
  status?: string;
  hasAccess?: boolean;
  user?: {
    id: number;
    username: string;
    name?: string;
    email: string;
    site_group?: string;
    is_staff?: boolean; 
  };
}

/**
 * 💡 APIのベースURLを動的に取得
 */
const getTargetApiBase = (): string => {
  if (typeof window !== 'undefined') {
    const { site_prefix } = getSiteMetadata();
    const origin = window.location.origin;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || `${origin}${site_prefix}/api`;
    return apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
  }
  return '/api';
};

/**
 * 💡 サイトプレフィックスを考慮したリダイレクトパスを生成
 */
const getAbsoluteRedirectPath = (path: string = '/') => {
  if (typeof window === 'undefined') return '/';
  const { site_prefix } = getSiteMetadata();
  const origin = window.location.origin;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${site_prefix}${normalizedPath}?t=${Date.now()}`;
};

/**
 * 🚀 ユーザー登録
 * 引数を個別に受け取れるようにし、呼び出し側の型エラーを解消します
 */
export async function registerUser(username: string, email: string, password: string): Promise<AuthTokenResponse> {
  const API_BASE = getTargetApiBase();
  const { site_group, origin_domain } = getSiteMetadata();

  const response = await fetch(`${API_BASE}/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      username,
      email,
      password,
      site_group, 
      origin_domain 
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || '登録に失敗しました。');
  }

  const data: AuthTokenResponse = await response.json();
  
  // 登録完了後の処理
  if (data.access && typeof window !== 'undefined') {
    localStorage.setItem('access_token', data.access);
    if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify({ 
        ...data.user, 
        username: data.user.username || data.user.name 
      }));
    }
    window.location.href = getAbsoluteRedirectPath('/mypage');
  }
  
  return data;
}

/**
 * 🔑 ログイン処理
 */
export async function loginUser(username: string, password: string): Promise<AuthTokenResponse> {
  const API_BASE = getTargetApiBase();
  const { site_group, origin_domain } = getSiteMetadata();
  
  const response = await fetch(`${API_BASE}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password, site_group, origin_domain }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || '認証に失敗しました。');
  }

  const data: AuthTokenResponse = await response.json();
  if ((data.status === "success" || data.access) && typeof window !== 'undefined') {
    if (data.access) localStorage.setItem('access_token', data.access);
    if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify({ ...data.user, username: data.user.username || data.user.name }));
    }
    const targetPath = data.user?.is_staff ? '/console/dashboard' : '/mypage';
    window.location.href = getAbsoluteRedirectPath(targetPath);
  }
  return data;
}

/**
 * 🚪 ログアウト処理
 */
export function logoutUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.clear();
    window.location.href = getAbsoluteRedirectPath('/');
  }
}

/**
 * 👤 ログイン中のユーザー情報を取得
 */
export function getAuthUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  try { return user ? JSON.parse(user) : null; } catch { return null; }
}