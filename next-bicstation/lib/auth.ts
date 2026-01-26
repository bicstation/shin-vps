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

// --- ヘルパー関数：ベースパスを取得 ---
/**
 * 💡 ローカル(localhost)なら /bicstation/、VPSなら / を返す
 * さらに、無限ループ防止のため現在のパスが /login の場合はトップを指すように調整
 */
const getBasePath = () => {
  if (typeof window === 'undefined') return '/';

  const isLocal = window.location.hostname === 'localhost';
  const currentPath = window.location.pathname;

  // 1. 基本となるベースパスを決定
  let basePath = isLocal ? '/bicstation/' : '/';

  // 2. 無限ループ防止ロジック
  // 現在のパスが /login を含む場合、リダイレクト先が自分自身にならないよう
  // 確実にトップページ（"/" または "/bicstation/"）へ飛ばす
  if (currentPath.includes('/login')) {
    return basePath;
  }

  return basePath;
};

// --- 認証関数 ---

/**
 * 💡 ユーザーログインを実行
 */
export async function loginUser(username: string, password: string): Promise<AuthTokenResponse> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://tiper.live/api';
  const { site_group, origin_domain } = getSiteMetadata();

  console.log("Attempting API login at:", `${API_BASE}/auth/login/`);

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
    // 1. トークン情報をブラウザに保存
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    
    // 2. ロール情報を保存
    const userRole = data.user?.site_group || site_group;
    localStorage.setItem('user_role', userRole);

    console.log("Login successful, redirecting to:", getBasePath());

    // 🚀 ログイン成功後のリダイレクト実行
    // href を書き換えることでページ全体をクリーンにリロードし、
    // Authコンテキストやステートを確実に更新させます。
    window.location.href = getBasePath(); 
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
    // 1. ストレージの破棄
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');

    // 🚀 ログアウト後のリダイレクト
    window.location.href = getBasePath();
  }
}