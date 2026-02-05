/**
 * =====================================================================
 * 🛠️ [SHARED-CORE] サイト環境動的判定ライブラリ (Final Production Version)
 * ---------------------------------------------------------------------
 * サーバー・クライアント両方で安全に動作し、例外エラー（Digestエラー）を防止します。
 * =====================================================================
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
    // A. クライアントサイド: window.location を優先
    hostname = window.location.hostname;
    detectionSource = `browser-location`;
  } else if (!hostname) {
    // B. サーバーサイド: 引数がない場合のみ dynamic require で headers を取得
    try {
      /**
       * 💡 重要: 'next/headers' をファイルの先頭で import すると、
       * クライアントコンポーネントから読み込まれた際にビルドエラーになります。
       * そのため、サーバー実行時のみ動的に読み込みます。
       */
      const { headers } = require('next/headers');
      const headerList = headers();
      const xForwardedHost = headerList.get('x-forwarded-host');
      const standardHost = headerList.get('host');
      
      hostname = xForwardedHost || standardHost || 'localhost';
      detectionSource = xForwardedHost ? 'x-forwarded-host' : 'host-header';
    } catch (e) {
      // headers() が呼べない環境（ビルド時など）のフォールバック
      hostname = 'localhost';
      detectionSource = 'error-fallback';
    }
  }

  // ポート番号除去 (例: localhost:3000 -> localhost)
  const domain = hostname.split(':')[0].toLowerCase();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  // --- STEP 2: サイト特定ロジック ---
  let site_name = 'Bic Station'; 
  let site_group: 'general' | 'adult' = 'general';
  let site_prefix = '';

  // 💡 判定ロジック：ドメイン名またはベースパスで判定
  if (domain.includes('tiper') || basePath === '/tiper') {
    site_name = 'Tiper';
    site_group = 'adult';
    site_prefix = '';
  } else if (domain.includes('avflash') || basePath === '/avflash') {
    site_name = 'AV Flash';
    site_group = 'adult';
    site_prefix = '';
  } else if (domain.includes('saving') || basePath === '/saving') {
    site_name = 'Bic Saving';
    site_group = 'general';
    site_prefix = '';
  } else if (domain.includes('bicstation') || basePath === '/bicstation') {
    site_name = 'Bic Station';
    site_group = 'general';
    site_prefix = '';
  } else {
    // デフォルト設定
    site_name = 'Bic Station';
    site_group = 'general';
    site_prefix = '';
  }

  // --- STEP 3: デバッグ出力 ---
  if (isServer && process.env.NODE_ENV !== 'production') {
    // サーバーログに判定結果を出力（デバッグ用）
    console.log(`\x1b[1m\x1b[33m[DIAGNOSTIC]\x1b[0m Site: ${site_name} (Source: ${detectionSource})`);
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