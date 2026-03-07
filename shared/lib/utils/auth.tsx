/**
 * =====================================================================
 * 🔑 統合認証ライブラリ (shared/lib/api/auth.ts)
 * ユーザー登録・ログイン・ログアウトおよびトークン管理を担当
 * =====================================================================
 */
// /home/maya/shin-dev/shin-vps/shared/lib/auth.tsx

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
 * 🔴 修正: config.ts のロジックと整合性を取り、環境変数を最優先にします
 */
const getTargetApiBase = (): string => {
  if (typeof window !== 'undefined') {
    // 1. 環境変数を優先 (例: http://api-tiper-host:8083/api)
    const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envApiUrl) {
      return envApiUrl.endsWith('/') ? envApiUrl.slice(0, -1) : envApiUrl;
    }

    // 2. フォールバック: 現在のドメイン + site_prefix
    const { site_prefix } = getSiteMetadata();
    const origin = window.location.origin;
    return `${origin}${site_prefix}/api`.replace(/\/+$/, '');
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
  
  // キャッシュ回避のクエリパラメータを付与してリダイレクト
  return `${origin}${site_prefix}${normalizedPath}`.replace(/\/+$/, '') + `?t=${Date.now()}`;
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
    credentials: 'include', // 💡 Cookie(セッション)を許可
    body: JSON.stringify({ username, password, site_group, origin_domain }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || '認証に失敗しました。');
  }

  const data: AuthTokenResponse = await response.json();
  
  // ログイン成功時のトークン保存とリダイレクト
  if ((data.status === "success" || data.access) && typeof window !== 'undefined') {
    if (data.access) localStorage.setItem('access_token', data.access);
    if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify({ 
        ...data.user, 
        username: data.user.username || data.user.name 
      }));
    }
    
    // スタッフなら管理画面、一般ユーザーならマイページへ
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
 * 👤 ログイン中のユーザー情報をローカルストレージから取得
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