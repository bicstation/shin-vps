/**
 * =====================================================================
 * 🛠️ [SHARED-CORE] サイト環境動的判定ライブラリ (v15 Optimized Version)
 * ---------------------------------------------------------------------
 * 🚀 Next.js 15+ の headers() 非同期化に伴う実行時エラーを完全に封殺。
 * 🚀 ホスト名判定を安全な環境変数とマニュアル入力に委譲。
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
 * @param manualHostname サーバー側では必ず headers().get('host') 等を外から渡してください
 */
export const getSiteMetadata = (manualHostname?: string): SiteMetadata => {
  let hostname = manualHostname || '';
  const isServer = typeof window === "undefined";

  // --- STEP 1: ホスト名の取得 ---
  if (!isServer) {
    // ブラウザ環境なら window から取得
    hostname = window.location.hostname;
  } else if (!hostname) {
    /**
     * 🚨 [CRITICAL FIX] Next.js 15+ 対策
     * 同期関数内で require('next/headers') を実行すると、サーバーサイドの実行コンテキスト
     * (AsyncLocalStorage) 外で呼ばれる可能性があり、モジュールごとクラッシュします。
     * そのため、サーバー側で manualHostname が無い場合は環境変数から取得します。
     */
    hostname = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'localhost';
  }

  // ポート番号が含まれる場合は削除して小文字化
  const domain = String(hostname || 'localhost').replace(/:.*$/, '').toLowerCase();
  
  // ベースパス（環境変数があれば優先）
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  // --- STEP 2: ブランド判定ロジック ---
  let site_name = 'Blog'; 
  let site_group: 'general' | 'adult' = 'general';
  let default_brand: 'FANZA' | 'DMM' | 'DUGA' | 'DELL' = 'DMM';

  // A. Tiper 判定
  if (domain.includes('tiper') || basePath.includes('tiper')) {
    site_name = 'Tiper'; 
    site_group = 'adult'; 
    default_brand = 'FANZA';
  } 
  // B. AV Flash 判定
  else if (domain.includes('avflash') || basePath.includes('avflash')) {
    site_name = 'AV Flash'; 
    site_group = 'adult'; 
    default_brand = 'DUGA';
  } 
  // C. Bic Saving 判定
  else if (domain.includes('saving') || basePath.includes('saving')) {
    site_name = 'Bic Saving'; 
    site_group = 'general'; 
    default_brand = 'DMM';
  } 
  // D. Bicstation 判定
  else if (domain.includes('bicstation') || domain.includes('localhost')) {
    site_name = 'Bicstation'; 
    site_group = 'general'; 
    default_brand = 'DELL'; 
  }
  // E. デフォルト
  else {
    site_name = 'Blog'; 
    site_group = 'general'; 
    default_brand = 'DMM';
  }

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