/**
 * =====================================================================
 * 🛠️ [SHARED-CORE] サイト環境動的判定ライブラリ (Final Production Version)
 * ---------------------------------------------------------------------
 * 🚀 パス構造を /blog/ に共通化しつつ、ドメインからブランドを自動判定。
 * 🚀 ヘッドレスブログのコンテンツ出し分け基盤を提供します。
 * =====================================================================
 */

export interface SiteMetadata {
  site_group: 'general' | 'adult';
  origin_domain: string;
  site_name: string;
  site_prefix: string;
  default_brand: 'FANZA' | 'DMM' | 'DUGA' | 'DELL'; // DELLを追加
}

/**
 * 🌐 サイトのメタデータを取得するメイン関数
 * @param manualHostname サーバーコンポーネントで headers().get('host') を渡す場合に利用
 */
export const getSiteMetadata = (manualHostname?: string): SiteMetadata => {
  let hostname = manualHostname || '';
  const isServer = typeof window === "undefined";

  // --- STEP 1: ホスト名の取得 ---
  if (!isServer) {
    hostname = window.location.hostname;
  } else if (!hostname) {
    try {
      // 🚨 Next.js 15+ では headers() は Promise ですが、ここでは同期的な互換性のために require を使用
      const { headers } = require('next/headers');
      const headerList = headers();
      hostname = headerList.get('x-forwarded-host') || headerList.get('host') || 'localhost';
    } catch (e) {
      hostname = 'localhost';
    }
  }

  // ✅ ビルドエラーを物理的に回避する正規表現によるドメイン抽出
  const domain = String(hostname || 'localhost').replace(/:.*$/, '').toLowerCase();
  
  // ベースパス（もし環境変数にあれば優先）
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  // --- STEP 2: ブランド判定ロジック (共通パス /blog/ 運用版) ---
  let site_name = 'Blog'; 
  let site_group: 'general' | 'adult' = 'general';
  let default_brand: 'FANZA' | 'DMM' | 'DUGA' | 'DELL' = 'DMM';

  // A. Tiper 判定
  if (domain.includes('tiper') || basePath === '/tiper') {
    site_name = 'Tiper'; 
    site_group = 'adult'; 
    default_brand = 'FANZA';
  } 
  // B. AV Flash 判定
  else if (domain.includes('avflash') || basePath === '/avflash') {
    site_name = 'AV Flash'; 
    site_group = 'adult'; 
    default_brand = 'DUGA';
  } 
  // C. Bic Saving 判定
  else if (domain.includes('saving') || basePath === '/saving') {
    site_name = 'Bic Saving'; 
    site_group = 'general'; 
    default_brand = 'DMM';
  } 
  // D. Bicstation 判定 (明示的に追加)
  else if (domain.includes('bicstation') || domain.includes('localhost')) {
    site_name = 'Bicstation'; 
    site_group = 'general'; 
    default_brand = 'DELL'; // PCサイトとしてのデフォルト
  }
  // E. デフォルト (Blog)
  else {
    site_name = 'Blog'; 
    site_group = 'general'; 
    default_brand = 'DMM';
  }

  return { 
    site_group, 
    origin_domain: domain, 
    site_name, 
    site_prefix: 'blog', // 👈 共通パス /blog/ を使用するための識別子をセット
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
    'Bicstation': '#007bff', // 明示的に青を指定
    'Blog':       '#6c757d'  // Blogは汎用的なグレー系
  };
  return colors[siteName] || '#007bff';
};