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

  // ローカル: http://localhost:3000/bicstation/
  // 本番: https://bicstation.com/
  let basePath = isLocal ? `${origin}/bicstation/` : `${origin}/`;
  
  const cacheBuster = `?t=${Date.now()}`;
  const finalPath = basePath + cacheBuster;

  console.log("🔍 [DEBUG] 生成された遷移先URL:", finalPath);
  return finalPath;
};

// --- 認証関数 ---

/**
 * 💡 ユーザーログインを実行 (デバッグ強化版)
 */
export async function loginUser(username: string, password: string): Promise<AuthTokenResponse> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://tiper.live/api';
  const { site_group, origin_domain } = getSiteMetadata();

  console.log("🚀 [DEBUG] 1. ログイン試行開始");
  console.log("   - 宛先:", `${API_BASE}/auth/login/`);
  console.log("   - 送信データ:", { username, site_group, origin_domain });

  try {
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

    console.log("📡 [DEBUG] 2. APIレスポンス受信");
    console.log("   - ステータス:", response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ [DEBUG] ログイン失敗レスポンス:", errorData);
      throw new Error(errorData.detail || 'ログインに失敗しました。ユーザー名またはパスワードを確認してください。');
    }

    const data: AuthTokenResponse = await response.json();
    console.log("✅ [DEBUG] 3. JSONパース成功:", { 
      hasAccess: !!data.access, 
      hasRefresh: !!data.refresh,
      user: data.user 
    });
    
    if (data.access && typeof window !== 'undefined') {
      console.log("💾 [DEBUG] 4. localStorageへの書き込み開始");
      
      try {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user_role', data.user?.site_group || site_group);
        
        // 書き込み確認
        const checkToken = localStorage.getItem('access_token');
        console.log("   - 書き込みチェック:", checkToken ? "成功 (OK)" : "失敗 (Empty!)");
      } catch (storageErr) {
        console.error("❌ [DEBUG] localStorage書き込みエラー:", storageErr);
      }

      const redirectUrl = getAbsoluteRedirectPath();
      
      console.log("🔄 [DEBUG] 5. 強制リフレッシュ遷移を実行します (300ms後)");
      
      setTimeout(() => {
        console.log("✈️ [DEBUG] window.location.replace 実行直前...");
        window.location.replace(redirectUrl);
      }, 300); 
    } else {
      console.warn("⚠️ [DEBUG] アクセストークンがないか、windowオブジェクトがありません");
    }

    return data;

  } catch (err: any) {
    console.error("🔥 [DEBUG] 通信または処理中に致命的エラー:", err);
    throw err;
  }
}

/**
 * 💡 新規ユーザー登録を実行
 */
export async function registerUser(username: string, email: string, password: string): Promise<RegisterResponse> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://tiper.live/api';
  const { site_group, origin_domain } = getSiteMetadata();

  console.log("🚀 [DEBUG] 新規登録試行:", `${API_BASE}/auth/register/`);

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
    console.error("❌ [DEBUG] 登録失敗:", errorData);
    throw new Error(errorData.detail || 'ユーザー登録に失敗しました。');
  }

  console.log("✅ [DEBUG] 登録成功");
  return await response.json();
}

/**
 * 💡 ログアウト処理
 */
export function logoutUser(): void {
  if (typeof window !== 'undefined') {
    console.log("🧹 [DEBUG] ログアウト実行: ストレージを消去します");
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');

    const redirectUrl = getAbsoluteRedirectPath();
    console.log("🔄 [DEBUG] トップページへ戻ります:", redirectUrl);
    window.location.replace(redirectUrl);
  }
}