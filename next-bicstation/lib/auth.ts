/**
 * 🛠️ [VPS-PROD-FINAL] 統合認証ライブラリ
 * 1. 権限判定 (is_staff) による自動リダイレクト搭載
 * 2. 認証(bicstation.com)とデータ(tiper.live)の切替
 * 3. コンフリクトマーカーを完全に除去
 */

import { getSiteMetadata } from '../utils/siteConfig';

// --- 1. 型定義 ---
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

export interface RegisterResponse {
  message: string;
  user?: {
    id: number;
    username: string;
    email: string;
    site_group: string;
    origin_domain: string;
  };
}

// --- 2. 内部ヘルパー ---

const getTargetApiBase = (isAuthRequest: boolean = false): string => {
  if (isAuthRequest) {
    const authUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://bicstation.com/api';
    return authUrl.endsWith('/') ? authUrl.slice(0, -1) : authUrl;
  } else {
    const dataUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tiper.live/api';
    return dataUrl.endsWith('/') ? dataUrl.slice(0, -1) : dataUrl;
  }
};

const getAbsoluteRedirectPath = (path: string = '/') => {
  if (typeof window === 'undefined') return '/';
  const origin = window.location.origin;
  const currentPath = window.location.pathname;
  const hasSubPath = currentPath.startsWith('/bicstation');
  const prefix = hasSubPath ? '/bicstation' : '';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const cacheBuster = `t=${Date.now()}`;
  return `${origin}${prefix}${normalizedPath}?${cacheBuster}`;
};

// --- 3. 認証関数 ---

/**
 * 💡 ユーザーログイン
 */
export async function loginUser(username: string, password: string): Promise<AuthTokenResponse> {
  const API_BASE = getTargetApiBase(true);
  const { site_group, origin_domain } = getSiteMetadata();
  const targetUrl = `${API_BASE}/auth/login/`;

  try {
    const response = await fetch(targetUrl, {
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
    const isSuccess = data.status === "success" || data.hasAccess === true || !!data.access;

    if (isSuccess && typeof window !== 'undefined') {
      if (data.access) localStorage.setItem('access_token', data.access);
      if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
      if (data.user) {
        const userData = { ...data.user, username: data.user.username || data.user.name };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('user_role', data.user.site_group || site_group);
      }

      // 🚀 権限に応じた遷移先の決定
      const targetPath = data.user?.is_staff ? '/admin/dashboard' : '/mypage';
      window.location.href = getAbsoluteRedirectPath(targetPath);
    }
    return data;
  } catch (err: any) {
    throw err;
  }
}

/**
 * 💡 新規ユーザー登録
 */
export async function registerUser(username: string, email: string, password: string): Promise<RegisterResponse> {
  const API_BASE = getTargetApiBase(true);
  const { site_group, origin_domain } = getSiteMetadata();
  const targetUrl = `${API_BASE}/auth/register/`;

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, site_group, origin_domain }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = errorData.email?.[0] || errorData.username?.[0] || errorData.detail || '登録に失敗しました。';
    throw new Error(msg);
  }
  return await response.json();
}

/**
 * 💡 ログアウト
 */
export function logoutUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.clear();
    window.location.href = getAbsoluteRedirectPath('/');
  }
}