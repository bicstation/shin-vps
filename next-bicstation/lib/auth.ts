// /home/maya/dev/shin-vps/next-bicstation/lib/auth.ts

import { getSiteMetadata } from '../utils/siteConfig';

// --- 型定義 (Interfaces) ---

export interface AuthTokenResponse {
  access: string;
  refresh: string;
  user?: {
    id: number;
    username: string;
    site_group: string;
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

// --- 認証関数 ---

/**
 * 💡 ユーザーログインを実行
 */
export async function loginUser(username: string, password: string): Promise<AuthTokenResponse> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://tiper.live/api';
  const { site_group, origin_domain } = getSiteMetadata();

  const response = await fetch(`${API_BASE}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      username, 
      password,
      site_group,
      origin_domain
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'ログインに失敗しました。');
  }

  const data: AuthTokenResponse = await response.json();
  
  if (data.access && typeof window !== 'undefined') {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    
    if (data.user?.site_group) {
      localStorage.setItem('user_role', data.user.site_group);
    } else {
      localStorage.setItem('user_role', site_group);
    }
  }

  return data;
}

/**
 * 💡 新規ユーザー登録を実行
 */
export async function registerUser(username: string, email: string, password: string): Promise<RegisterResponse> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://tiper.live/api';
  const { site_group, origin_domain } = getSiteMetadata();

  const response = await fetch(`${API_BASE}/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      email,
      password,
      site_group,
      origin_domain,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'ユーザー登録に失敗しました。');
  }

  return await response.json();
}

/**
 * 💡 ログアウト処理
 * 🚀 修正ポイント: URLから直接プレフィックスを特定してリダイレクトします
 */
export function logoutUser(): void {
  if (typeof window !== 'undefined') {
    // 1. ストレージの破棄
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');

    // 🚀 2. URLから直接プレフィックス（/bicstationなど）を取得
    // siteConfigに頼らず、現在のブラウザのパスから確実に抽出します
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const sitePrefix = pathSegments.length > 0 ? `/${pathSegments[0]}` : '';
    
    // sitePrefix が "/bicstation" なら "/bicstation/login" へ
    const redirectPath = `${sitePrefix}/login`;

    console.log("Logout redirect to:", redirectPath);
    
    // 強制リロード遷移で状態を完全にクリア
    window.location.href = redirectPath;
  }
}