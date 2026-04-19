/**
 * =====================================================================
 * 🔑 統合認証ライブラリ (shared/lib/auth.tsx)
 * v3.9 物理構造最適化版: 
 * URLから不要な site_prefix を完全に除去し、appディレクトリの構造に同期
 * =====================================================================
 */

import { getSiteMetadata } from './siteConfig';

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
 * SHIN-VPS v3.9 ではドメイン判別を行うため、パスに general 等を含めません
 */
const getTargetApiBase = (): string => {
  if (typeof window !== 'undefined') {
    const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envApiUrl && envApiUrl.startsWith('http')) {
      return envApiUrl.replace(/\/+$/, '');
    }
    const origin = window.location.origin;
    return `${origin}/api`.replace(/\/+$/, '');
  }
  return '/api';
};

/**
 * 💡 リダイレクトパスを生成 (重要修正)
 * 物理構造が /app/console/... となっているため、URLに site_prefix (general) 
 * を含めると404になります。ここでは prefix を完全に除去します。
 */
const getAbsoluteRedirectPath = (path: string = '/') => {
  if (typeof window === 'undefined') return '/';
  
  const origin = window.location.origin;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // ⚠️ 修正: site_prefix を使用せず、物理ディレクトリ構造に合わせる
  const fullPath = `${origin}${normalizedPath}`.replace(/\/+$/, '');
  
  // キャッシュ対策のタイムスタンプのみ付与
  return `${fullPath}?t=${Date.now()}`;
};

/**
 * 🚀 ユーザー登録
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
  
  console.log('📡 API Request to:', `${API_BASE}/auth/login/`);

  const response = await fetch(`${API_BASE}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password, site_group, origin_domain }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = response.status === 404 ? 'APIエンドポイントが見つかりません(404)' : '認証に失敗しました。';
    throw new Error(errorData.error || errorData.detail || msg);
  }

  const data: AuthTokenResponse = await response.json();
  
  if ((data.status === "success" || data.access) && typeof window !== 'undefined') {
    if (data.access) localStorage.setItem('access_token', data.access);
    if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify({ 
        ...data.user, 
        username: data.user.username || data.user.name 
      }));
    }
    
    // 物理パスに合わせて遷移 (/console/dashboard)
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
  try { 
    return user ? JSON.parse(user) : null; 
  } catch { 
    return null; 
  }
}