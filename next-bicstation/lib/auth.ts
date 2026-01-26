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

// --- ヘルパー関数：ベースパスを「絶対URL」で取得 ---
const getAbsoluteRedirectPath = () => {
  if (typeof window === 'undefined') return '/';

  const isLocal = window.location.hostname === 'localhost';
  const origin = window.location.origin;

  // 💡 VPS環境（bicstation.com）では、末尾スラッシュなしのURLを返し、
  // ブラウザに「ディレクトリ」ではなく「トップページそのもの」を認識させます。
  return isLocal ? `${origin}/bicstation/` : `${origin}`;
};

// --- 認証関数 ---

/**
 * 💡 ユーザーログインを実行
 */
export async function loginUser(username: string, password: string): Promise<AuthTokenResponse> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://tiper.live/api';
  const { site_group, origin_domain } = getSiteMetadata();

  console.log("1. APIログイン試行中:", `${API_BASE}/auth/login/`);

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
    throw new Error(errorData.detail || 'ログインに失敗しました。ユーザー名またはパスワードを確認してください。');
  }

  const data: AuthTokenResponse = await response.json();
  
  if (data.access && typeof window !== 'undefined') {
    // 2. ストレージへの保存
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('user_role', data.user?.site_group || site_group);

    console.log("3. 通信成功！リダイレクトを待機中...");

    // 🚀 修正ポイント: 
    // ブラウザの履歴に残さず（replace）、完全にページを再読み込みして遷移させます。
    // これにより、Headerコンポーネントのログインチェックが確実に発火します。
    const redirectUrl = getAbsoluteRedirectPath();
    
    setTimeout(() => {
      window.location.replace(redirectUrl);
    }, 100); // 100msの微小なディレイを入れて保存を確実にする
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
 */
export function logoutUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');

    const redirectUrl = getAbsoluteRedirectPath();
    window.location.replace(redirectUrl);
  }
}