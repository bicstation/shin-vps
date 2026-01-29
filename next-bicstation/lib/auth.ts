/**
 * 🛠️ [VPS-CHECK-FINAL-FIXED] 統合認証ライブラリ
 * /home/maya/dev/shin-vps/next-bicstation/lib/auth.ts
 */

import { getSiteMetadata } from '../utils/siteConfig';

// --- 型定義 (Interfaces) ---
export interface AuthTokenResponse {
  access?: string;  // JWT使用時のためのオプション
  refresh?: string; // JWT使用時のためのオプション
  status?: string;  // Django Response用
  hasAccess?: boolean;
  user?: {
    id: number;
    username: string;
    name?: string;    // Django側が name で返す場合に対応
    email: string;
    site_group?: string;
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

// --- ヘルパー関数：ベースパスを考慮した「絶対URL」を取得 ---
/**
 * @param path 遷移先のパス (例: '/mypage')
 */
const getAbsoluteRedirectPath = (path: string = '/') => {
  if (typeof window === 'undefined') return '/';

  const origin = window.location.origin;
  
  // 💡 環境変数からベースパスを取得 (例: /bicstation)
  const envBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  
  // ベースパスのスラッシュ整形
  let basePath = envBasePath.startsWith('/') ? envBasePath : `/${envBasePath}`;
  if (basePath === '/') basePath = '';

  // パスのスラッシュ整形
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // 遷移先を構築（キャッシュバスターを付けて強制リロードを促す）
  const cacheBuster = `t=${Date.now()}`;
  const finalUrl = `${origin}${basePath}${normalizedPath}?${cacheBuster}`;

  console.log("🔍 [DEBUG] 生成された遷移先URL:", finalUrl);
  return finalUrl;
};

/**
 * 💡 APIのベースURLを環境に合わせて動的に構築する
 * 環境変数 NEXT_PUBLIC_API_URL がある場合はそれを最優先します。
 */
const getApiBaseUrl = () => {
  // 1. 環境変数が設定されている場合は最優先 (ローカル環境の http://localhost:8083/api など)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window === 'undefined') return '';

  const origin = window.location.origin;
  const pathname = window.location.pathname;

  // 2. VPS環境判定: URLに /bicstation が含まれている場合
  if (pathname.includes('/bicstation')) {
    return `${origin}/bicstation/api`;
  }

  // 3. デフォルトのフォールバック
  return `${origin}/api`;
};

// --- 認証関数 ---

/**
 * 💡 ユーザーログインを実行 (ローカル/VPS両対応・マイページ遷移版)
 */
export async function loginUser(username: string, password: string): Promise<AuthTokenResponse> {
  // APIベースURLの取得（修正された優先順位で取得）
  const API_BASE = getApiBaseUrl();
  console.log("🛠️ [VPS-FIX] ログイン用APIベースURL:", API_BASE);

  const { site_group, origin_domain } = getSiteMetadata();

  console.log("🚀 [DEBUG] 1. ログイン試行開始");
  // Djangoは末尾のスラッシュが必須
  const targetUrl = `${API_BASE}/auth/login/`;
  console.log("   - 宛先:", targetUrl);

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      // 💡 重要: クッキー(sessionid)をブラウザに保存させるために必須
      credentials: 'include', 
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
      throw new Error(errorData.error || errorData.detail || 'ログインに失敗しました。');
    }

    const data: AuthTokenResponse = await response.json();
    
    // Django側のレスポンス構造をチェック
    const isSuccess = data.status === "success" || data.hasAccess === true || !!data.access;

    console.log("✅ [DEBUG] 3. JSONパース成功:", { 
      isSuccess,
      user: data.user?.username || data.user?.name 
    });
    
    if (isSuccess && typeof window !== 'undefined') {
      console.log("💾 [DEBUG] 4. localStorageへの書き込み開始");
      
      try {
        // トークンがある場合は保存
        if (data.access) localStorage.setItem('access_token', data.access);
        if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
        
        // ユーザー情報の保存
        if (data.user) {
          const userData = {
            ...data.user,
            username: data.user.username || data.user.name 
          };
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('user_role', data.user.site_group || site_group);
        }
        
        console.log("   - ストレージ書き込み完了");
      } catch (storageErr) {
        console.error("❌ [DEBUG] localStorage書き込みエラー:", storageErr);
      }

      // 💡 ログイン成功時は「マイページ」へ誘導
      const redirectUrl = getAbsoluteRedirectPath('/mypage');
      
      console.log("🔄 [DEBUG] 5. 遷移を実行します (待機後)");
      
      // 💡 ストレージ反映待ち
      setTimeout(() => {
        console.log("✈️ [DEBUG] 最終遷移先へ移動:", redirectUrl);
        window.location.href = redirectUrl; 
      }, 300); 
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
  const API_BASE = getApiBaseUrl();
  const { site_group, origin_domain } = getSiteMetadata();

  const targetUrl = `${API_BASE}/auth/register/`;
  console.log("🚀 [DEBUG] 新規登録試行:", targetUrl);

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      email,     // 修正: 確実に email フィールドを送る
      password,
      site_group,
      origin_domain,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("❌ [DEBUG] 登録失敗:", errorData);
    // Djangoのバリデーションエラー（emailの重複など）を詳しく取得する
    const msg = errorData.email?.[0] || errorData.username?.[0] || errorData.detail || 'ユーザー登録に失敗しました。';
    throw new Error(msg);
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
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');

    // 💡 ログアウト時は「トップページ」へ誘導
    const redirectUrl = getAbsoluteRedirectPath('/');
    console.log("🔄 [DEBUG] トップページへ戻ります:", redirectUrl);
    
    window.location.href = redirectUrl;
  }
}