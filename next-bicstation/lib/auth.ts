console.log("🛠️ [VPS-CHECK-FINAL] THIS IS THE REAL FILE");
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

  const origin = window.location.origin;
  const isLocal = window.location.hostname === 'localhost';
  
  // 💡 NEXT_PUBLIC_BASE_PATH が設定されている場合はそれを優先、なければ空文字
  const envBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  
  // スラッシュの重複を防ぎつつパスを結合
  // 本番環境 (bicstation.com) では envBasePath は通常空、ローカルでは /bicstation など
  let path = envBasePath.startsWith('/') ? envBasePath : `/${envBasePath}`;
  if (path === '/') path = '';

  const cacheBuster = `?t=${Date.now()}`;
  const finalPath = `${origin}${path}/${cacheBuster}`;

  console.log("🔍 [DEBUG] 生成された遷移先URL:", finalPath);
  return finalPath;
};

// --- 認証関数 ---

/**
 * 💡 ユーザーログインを実行 (デバッグ強化版)
 */
export async function loginUser(username: string, password: string): Promise<AuthTokenResponse> {
  // 💡 環境変数のチェックログ
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL;
  console.log("🛠️ [VPS-CHECK] 使用するAPIベースURL:", API_BASE);

  const { site_group, origin_domain } = getSiteMetadata();

  console.log("🚀 [DEBUG] 1. ログイン試行開始");
  console.log("   - 宛先:", `${API_BASE}/auth/login/`);

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
      throw new Error(errorData.detail || 'ログインに失敗しました。');
    }

    const data: AuthTokenResponse = await response.json();
    console.log("✅ [DEBUG] 3. JSONパース成功:", { 
      hasAccess: !!data.access, 
      user: data.user?.username 
    });
    
    if (data.access && typeof window !== 'undefined') {
      console.log("💾 [DEBUG] 4. localStorageへの書き込み開始");
      
      try {
        // トークン名は他のコンポーネントと合わせる (access_token / refresh_token)
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        if (data.user) {
          localStorage.setItem('user_role', data.user.site_group || site_group);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        console.log("   - ストレージ書き込み完了");
      } catch (storageErr) {
        console.error("❌ [DEBUG] localStorage書き込みエラー:", storageErr);
      }

      const redirectUrl = getAbsoluteRedirectPath();
      
      console.log("🔄 [DEBUG] 5. 遷移を実行します (500msの待機後)");
      
      // 💡 少し長めに待機してストレージへの書き込みを確実に反映させる
      setTimeout(() => {
        console.log("✈️ [DEBUG] 最終遷移先へ移動:", redirectUrl);
        window.location.href = redirectUrl; // replace より確実にリロードを伴う href を使用
      }, 500); 
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
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL;
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
    
    localStorage.clear(); // 全削除の方が安全

    const redirectUrl = getAbsoluteRedirectPath();
    console.log("🔄 [DEBUG] トップページへ戻ります:", redirectUrl);
    window.location.href = redirectUrl;
  }
}