/**
<<<<<<< HEAD
 * 🛠️ [VPS-PROD-INTEGRATED] 統合認証ライブラリ
 * * 特徴:
 * 1. YAML/Docker環境変数を優先 (NEXT_PUBLIC_...)
 * 2. 実行環境のURLからサブパス(/bicstation)の有無を自動判別（ローカル/VPS両対応）
 * 3. 認証(bicstation.com)とデータ(tiper.live)の2ドメイン自動切換
 * 4. 冗長なデバッグログ完備
 * 5. 管理者(is_staff)と一般ユーザーの自動振り分け機能搭載
=======
 * 🛠️ [VPS-CHECK-FINAL-FIXED] 統合認証ライブラリ
 * /home/maya/dev/shin-vps/next-bicstation/lib/auth.ts
>>>>>>> 9acac766cbeb8f8e33c3fafebc8b06c24535c7fc
 */

import { getSiteMetadata } from '../utils/siteConfig';

// --- 1. 型定義 (Interfaces) ---

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
    is_staff?: boolean; // 🚀 権限判定用に追加
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

// --- 2. 内部ヘルパー関数 ---

/**
 * 💡 APIのベースURLを決定する
 * Docker/YAML で設定された環境変数を読み込み、用途別に切り替えます。
 */
const getTargetApiBase = (isAuthRequest: boolean = false): string => {
  if (isAuthRequest) {
    // ログイン・登録用：bicstation.com (CSRF/Session維持用)
    const authUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://bicstation.com/api';
    return authUrl.endsWith('/') ? authUrl.slice(0, -1) : authUrl;
  } else {
    // 一般データ取得用：tiper.live (メインAPIサーバー)
    const dataUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tiper.live/api';
    return dataUrl.endsWith('/') ? dataUrl.slice(0, -1) : dataUrl;
  }
};

/**
 * 💡 遷移先URLを絶対パスで構築
 * 現在のブラウザのURLを見て、/bicstation が含まれていればそれを維持します。
 */
const getAbsoluteRedirectPath = (path: string = '/') => {
  if (typeof window === 'undefined') return '/';
  
  const origin = window.location.origin;
  const currentPath = window.location.pathname;

  // 💡 自動判別ロジック：現在のURLに /bicstation が含まれているかチェック
  // これにより、ローカル環境のサブパス問題を自動で解決します。
  const hasSubPath = currentPath.startsWith('/bicstation');
  const prefix = hasSubPath ? '/bicstation' : '';

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  // キャッシュによる古いページの表示を防ぐためのバスター
  const cacheBuster = `t=${Date.now()}`;
  
  const finalUrl = `${origin}${prefix}${normalizedPath}?${cacheBuster}`;
  
  console.log(`🔍 [Redirect-Build] Mode: ${hasSubPath ? 'Local(Subpath)' : 'VPS(Root)'}`);
  console.log(`🔍 [Redirect-Build] Result -> ${finalUrl}`);
  
  return finalUrl;
};

<<<<<<< HEAD
// --- 3. メイン認証関数 ---
=======
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
>>>>>>> 9acac766cbeb8f8e33c3fafebc8b06c24535c7fc

/**
 * 💡 ユーザーログイン
 */
export async function loginUser(username: string, password: string): Promise<AuthTokenResponse> {
<<<<<<< HEAD
  const API_BASE = getTargetApiBase(true);
  const { site_group, origin_domain } = getSiteMetadata();

  console.log("🚀 [Auth-Flow] ログイン処理を開始します...");
  console.log(`📡 [Target] ${API_BASE}/auth/login/`);
=======
  // APIベースURLの取得（修正された優先順位で取得）
  const API_BASE = getApiBaseUrl();
  console.log("🛠️ [VPS-FIX] ログイン用APIベースURL:", API_BASE);

  const { site_group, origin_domain } = getSiteMetadata();

  console.log("🚀 [DEBUG] 1. ログイン試行開始");
  // Djangoは末尾のスラッシュが必須
  const targetUrl = `${API_BASE}/auth/login/`;
  console.log("   - 宛先:", targetUrl);
>>>>>>> 9acac766cbeb8f8e33c3fafebc8b06c24535c7fc

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 重要：Cookie(sessionid)をブラウザに保持させる
      body: JSON.stringify({ 
        username, 
        password, 
        site_group, 
        origin_domain 
      }),
    });

    console.log(`📡 [Response] Status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ [Auth-Error] ログイン失敗:", errorData);
      throw new Error(errorData.error || errorData.detail || '認証に失敗しました。');
    }

    const data: AuthTokenResponse = await response.json();
    
    // Django側の成功レスポンス判定
    const isSuccess = data.status === "success" || data.hasAccess === true || !!data.access;

    if (isSuccess && typeof window !== 'undefined') {
      console.log("✅ [Auth-Success] ユーザー情報を保存中...");
      
      // トークン情報の保存
      if (data.access) localStorage.setItem('access_token', data.access);
      if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
      
      // ユーザープロフィールの保存
      if (data.user) {
        const userData = {
          ...data.user,
          username: data.user.username || data.user.name
        };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('user_role', data.user.site_group || site_group);
      }

<<<<<<< HEAD
      // 🚀 [振り分け処理] 権限に応じて遷移先を変更
      // data.user.is_staff が true なら /admin/dashboard へ、それ以外は /mypage へ
      const targetPath = data.user?.is_staff ? '/admin/dashboard' : '/mypage';
=======
      // 💡 ログイン成功時は「マイページ」へ誘導
      const redirectUrl = getAbsoluteRedirectPath('/mypage');
>>>>>>> 9acac766cbeb8f8e33c3fafebc8b06c24535c7fc
      
      // 環境に応じた正しいパスへ遷移
      const destination = getAbsoluteRedirectPath(targetPath);
      console.log(`🔄 [Redirect] Role:${data.user?.is_staff ? 'Admin' : 'User'} -> ${destination}`);
      window.location.href = destination;
    }

    return data;
  } catch (err: any) {
    console.error("🔥 [Critical-Error] ログイン中に例外が発生しました:", err);
    throw err;
  }
}

/**
 * 💡 新規ユーザー登録
 */
export async function registerUser(username: string, email: string, password: string): Promise<RegisterResponse> {
<<<<<<< HEAD
  const API_BASE = getTargetApiBase(true);
  const { site_group, origin_domain } = getSiteMetadata();

  console.log("🚀 [Register-Flow] ユーザー登録を開始します...");
  console.log(`📡 [Target] ${API_BASE}/auth/register/`);
=======
  const API_BASE = getApiBaseUrl();
  const { site_group, origin_domain } = getSiteMetadata();

  const targetUrl = `${API_BASE}/auth/register/`;
  console.log("🚀 [DEBUG] 新規登録試行:", targetUrl);
>>>>>>> 9acac766cbeb8f8e33c3fafebc8b06c24535c7fc

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
<<<<<<< HEAD
    console.error("❌ [Register-Error] 登録失敗:", errorData);
    throw new Error(errorData.detail || errorData.error || 'アカウントの作成に失敗しました。');
  }

  console.log("✅ [Register-Success] 登録が完了しました。");
  return await response.json();
}

/**
 * 💡 ログイン中ユーザー情報の取得 (tiper.liveを使用)
 */
export async function fetchMe(): Promise<any> {
  const API_BASE = getTargetApiBase(false);
  const token = localStorage.getItem('access_token');

  console.log("📡 [Fetch-Me] ユーザープロフィールの同期中...");

  if (!token) {
    console.warn("⚠️ [Fetch-Me] トークンが見つかりません。");
    return null;
  }

  const response = await fetch(`${API_BASE}/auth/me/`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    },
    credentials: 'include'
  });

  if (!response.ok) {
    console.error("❌ [Fetch-Me-Error] プロフィールの取得に失敗しました。");
    throw new Error("セッションが無効です。");
=======
    console.error("❌ [DEBUG] 登録失敗:", errorData);
    // Djangoのバリデーションエラー（emailの重複など）を詳しく取得する
    const msg = errorData.email?.[0] || errorData.username?.[0] || errorData.detail || 'ユーザー登録に失敗しました。';
    throw new Error(msg);
>>>>>>> 9acac766cbeb8f8e33c3fafebc8b06c24535c7fc
  }

  return await response.json();
}

/**
 * 💡 ログアウト処理
 */
export function logoutUser(): void {
  if (typeof window !== 'undefined') {
    console.log("🧹 [Logout] セッションをクリアしています...");
    localStorage.clear();
    
    const destination = getAbsoluteRedirectPath('/');
    console.log(`🔄 [Logout-Redirect] ${destination}`);
    window.location.href = destination;
  }
}