/**
 * =====================================================================
 * 🛠️ [SHARED-CORE] サイト環境動的判定ライブラリ (v15.2 Optimized)
 * ---------------------------------------------------------------------
 * 🚀 Next.js 15+ の headers() 非同期化に伴う実行時エラーを完全に封殺。
 * 🚀 ホスト名判定を安全な環境変数とマニュアル入力に委譲。
 * 🚀 常に「初期値」を保証し、サイトグループの undefined エラーを根絶。
 * =====================================================================
 */

export interface SiteMetadata {
  site_group: 'general' | 'adult';
  origin_domain: string;
  site_name: string;
  site_prefix: string;
  default_brand: 'FANZA' | 'DMM' | 'DUGA' | 'DELL';
}

/**
 * 🌐 サイトのメタデータを取得するメイン関数
 * @param manualHostname サーバー側では必ず headers().get('host') 等を外から渡すことを推奨
 */
export const getSiteMetadata = (manualHostname?: string): SiteMetadata => {
  let hostname = manualHostname || '';
  const isServer = typeof window === "undefined";

  // --- STEP 1: ホスト名の取得ロジックの安定化 ---
  if (!isServer) {
    // クライアントサイド: ブラウザの window オブジェクトから取得
    hostname = window.location.hostname;
  } else if (!hostname) {
    /**
     * 🚨 [CRITICAL FIX] Next.js 15+ 対策
     * サーバーコンテキスト外での headers() 呼び出しによるクラッシュを避けるため、
     * 環境変数 (NEXT_PUBLIC_SITE_DOMAIN) をフォールバックとして利用。
     */
    hostname = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'localhost';
  }

  // ポート番号（:8000等）が含まれる場合は除去して正規化
  const domain = String(hostname || 'localhost').replace(/:.*$/, '').toLowerCase();
  
  // ベースパス判定用（サブディレクトリ運用時などに備える）
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  // --- STEP 2: ブランド判定（デフォルト値を Bicstation に設定して安全性を確保） ---
  let site_name = 'Bicstation'; 
  let site_group: 'general' | 'adult' = 'general';
  let default_brand: 'FANZA' | 'DMM' | 'DUGA' | 'DELL' = 'DELL';

  // A. Tiper 判定 (アダルト)
  if (domain.includes('tiper') || basePath.includes('tiper')) {
    site_name = 'Tiper'; 
    site_group = 'adult'; 
    default_brand = 'FANZA';
  } 
  // B. AV Flash 判定 (アダルト)
  else if (domain.includes('avflash') || basePath.includes('avflash')) {
    site_name = 'AV Flash'; 
    site_group = 'adult'; 
    default_brand = 'DUGA';
  } 
  // C. Bic Saving 判定 (一般)
  else if (domain.includes('saving') || basePath.includes('saving')) {
    site_name = 'Bic Saving'; 
    site_group = 'general'; 
    default_brand = 'DMM';
  } 
  // D. Bicstation 判定 (一般 / 開発環境)
  else if (domain.includes('bicstation') || domain.includes('localhost') || domain.includes('0.0.0.0')) {
    site_name = 'Bicstation'; 
    site_group = 'general'; 
    default_brand = 'DELL'; 
  }
  // E. その他・フォールバック (Blog)
  else {
    site_name = 'Blog'; 
    site_group = 'general'; 
    default_brand = 'DMM';
  }

  // 🛡️ 構造体の不備を防ぐため、常にこの形式で返却
  return { 
    site_group, 
    origin_domain: domain, 
    site_name, 
    site_prefix: 'blog', 
    default_brand 
  };
};

/**
 * 🎨 サイトごとのブランディングカラーを取得
 */
export const getSiteColor = (siteName: string): string => {
  const colors: Record<string, string> = { 
    'Bic Saving': '#28a745', 
    'Tiper':      '#e83e8c', 
    'AV Flash':   '#ffc107',
    'Bicstation': '#007bff', 
    'Blog':       '#6c757d' 
  };
  return colors[siteName] || '#007bff';
};

/**
 * ⚠️ 【重要】静的なエクスポートは避け、常に getSiteMetadata() を通じて取得してください。
 * Next.js 15+ のビルド時/実行時の環境差異による undefined バグを防ぐためです。
 */