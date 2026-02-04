/**
 * 🛠️ [SHARED-CORE] サイト環境動的判定ライブラリ (Build Safe Version)
 * ---------------------------------------------------------------------
 */

export interface SiteMetadata {
  site_group: 'general' | 'adult';
  origin_domain: string;
  site_name: string;
  site_prefix: string;
}

/**
 * 🌐 サイトのメタデータを取得するメイン関数
 * @param manualHostname サーバーコンポーネントで headers().get('host') を渡す場合に利用
 */
export const getSiteMetadata = (manualHostname?: string): SiteMetadata => {
  let hostname = manualHostname || '';
  let detectionSource = 'manual';
  const isServer = typeof window === "undefined";

  // --- STEP 1: ホスト名の取得 ---
  if (!isServer) {
    hostname = window.location.hostname;
    detectionSource = `browser-location`;
  } else if (!hostname) {
    // 💡 ビルドエラー回避策: サーバーサイドかつ hostname がない場合、
    // Next.jsの headers() を動的に require するか、localhost をデフォルトにする
    try {
      // クライアント側で実行されないよう、ここだけで require する
      const { headers } = require('next/headers');
      const headerList = headers();
      const xForwardedHost = headerList.get('x-forwarded-host');
      const standardHost = headerList.get('host');
      
      hostname = xForwardedHost || standardHost || 'localhost';
      detectionSource = xForwardedHost ? 'x-forwarded-host' : 'host-header';
    } catch (e) {
      hostname = 'localhost';
      detectionSource = 'error-fallback';
    }
  }

  // ポート番号除去
  const domain = hostname.split(':')[0].toLowerCase();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  // --- STEP 2: サイト特定ロジック ---
  let site_name = 'Bic Station'; 
  let site_group: 'general' | 'adult' = 'general';
  let site_prefix = '';

  if (domain.includes('tiper') || basePath === '/tiper') {
    site_name = 'Tiper';
    site_group = 'adult';
    site_prefix = '/tiper';
  } else if (domain.includes('avflash') || basePath === '/avflash') {
    site_name = 'AV Flash';
    site_group = 'adult';
    site_prefix = '/avflash';
  } else if (domain.includes('saving') || basePath === '/saving') {
    site_name = 'Bic Saving';
    site_group = 'general';
    site_prefix = '/saving';
  } else {
    site_name = 'Bic Station';
    site_group = 'general';
    site_prefix = '/bicstation';
  }

  // --- STEP 3: デバッグ出力 ---
  if (isServer && process.env.NODE_ENV !== 'production') {
    // 開発中のログ出力
    // console.log(`[DIAGNOSTIC] ${site_name}`); 
  }

  return { site_group, origin_domain: domain, site_name, site_prefix };
};

/**
 * 🎨 サイトごとのブランディングカラー
 */
export const getSiteColor = (siteName: string): string => {
  const themeColors: Record<string, string> = {
    'Bic Saving': '#28a745',
    'Tiper':      '#e83e8c',
    'AV Flash':   '#ffc107',
    'Bic Station': '#007bff'
  };
  return themeColors[siteName] || '#007bff';
};