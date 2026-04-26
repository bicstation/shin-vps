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
 * SHIN-VPS v3.9 ではドメイン判別を行うため、パスに site_prefix を含めません。
 * 環境変数 NEXT_PUBLIC_API_URL が設定されている場合はそれを優先します。
 */

const getTargetApiBase = (): string => {
  if (typeof window !== 'undefined') {
    return "http://localhost:8083/api"; // ← 強制でOK（まず動かす）
  }
  return '/api';
};


/**
 * 💡 リダイレクトパスを生成
 * 物理構造が /app/console/... や /app/mypage/... となっているため、
 * URLに仮想的な prefix (general等) を含めず、物理パスへ直接飛ばします。
 */
const getAbsoluteRedirectPath = (path: string = '/') => {
  if (typeof window === 'undefined') return '/';
  
  const origin = window.location.origin;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // ⚠️ 物理ディレクトリ構造（/console, /mypage等）に合わせ、余計なパスを挟まない
  const fullPath = `${origin}${normalizedPath}`.replace(/\/+$/, '');
  
  // ブラウザキャッシュによるリダイレクトループや古い情報の表示を防ぐためタイムスタンプを付与
  return `${fullPath || origin}/?t=${Date.now()}`;
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
    // 一般ユーザー登録後はマイページへ
    window.location.href = getAbsoluteRedirectPath('/mypage');
  }
  
  return data;
}

/**
 * 🔑 ログイン処理
 */
export async function loginUser(username: string, password: string): Promise<AuthTokenResponse> {
  console.log("🔥 loginUser START");
  const API_BASE = getTargetApiBase();
  const { site_group, origin_domain } = getSiteMetadata();
  
  console.log('📡 Auth Attempt:', `${API_BASE}/auth/login/`);
  // console.log("🚀 BEFORE FETCH");
  // const response = await fetch(`${API_BASE}/auth/login/`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   // credentials: 'include',
  //   body: JSON.stringify({ username, password, site_group, origin_domain }),
  // });

  // console.log("STATUS:", response.status);
  // console.log("✅ AFTER FETCH");

  try {
    console.log("🚀 BEFORE FETCH");

    const response = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    console.log("✅ AFTER FETCH");

  } catch (e) {
    console.error("🔥 FETCH ERROR:", e);
  }


  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = response.status === 404 ? '認証エンドポイントが見つかりません。' : 'ログインに失敗しました。';
    throw new Error(errorData.error || errorData.detail || msg);
  }

  const data: AuthTokenResponse = await response.json();

  console.log("LOGIN RESPONSE:", data);
  console.log("USER:", data.user);
  console.log("IS_STAFF:", data.user?.is_staff);
  
  if ((data.status === "success" || data.access) && typeof window !== 'undefined') {
    if (data.access) localStorage.setItem('access_token', data.access);
    if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify({ 
        ...data.user, 
        username: data.user.username || data.user.name 
      }));
    }
     // 🔥 これ追加（超重要）
    window.dispatchEvent(new Event('authChanged'));
    
    // ユーザー権限に基づいて物理パスを決定
    // 管理者(is_staff)は /console/dashboard、一般は /mypage
    const targetPath = data.user?.is_staff ? '/console/dashboard' : '/mypage';
    window.location.href = getAbsoluteRedirectPath(targetPath);
  }
  return data;
}

/**
 * 🚪 ログアウト処理
 * 全ての認証情報をクリアし、物理ルートパスへリダイレクトします。
 */
export function logoutUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.clear();
    // ログアウト後はトップページ (/) へ
    window.location.href = getAbsoluteRedirectPath('/');
  }
}

/**
 * 👤 ローカルストレージからログイン中のユーザー情報を取得
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

/**
 * 🛡️ アクセストークンの取得
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}