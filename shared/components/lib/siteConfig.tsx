/**
 * 🛠️ [SHARED-CORE] サイト環境動的判定ライブラリ (Diagnostic Version)
 * ---------------------------------------------------------------------
 * 【役割】
 * 404時やエラー時でも、F12コンソールに判定の「証拠」を強力に表示します。
 */

export interface SiteMetadata {
  site_group: 'general' | 'adult';
  origin_domain: string;
  site_name: string;
  site_prefix: string;
}

/**
 * 🌐 サイトのメタデータを取得するメイン関数
 */
export const getSiteMetadata = (manualHostname?: string): SiteMetadata => {
  let hostname = manualHostname || '';
  let detectionSource = 'manual';

  // --- STEP 1: ホスト名の取得 ---
  const isServer = typeof window === "undefined";

  if (!isServer) {
    // A. クライアントサイド: window.location を徹底調査
    hostname = window.location.hostname;
    detectionSource = `browser-location (URL: ${window.location.href})`;
  } else if (!hostname) {
    // B. サーバーサイド: Next.js ヘッダーを抽出
    try {
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
  
  // --- STEP 2: 環境変数の取得 ---
  // クライアント側でも NEXT_PUBLIC_ が付いていれば参照可能です
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  // --- STEP 3: サイト特定ロジック ---
  let site_name = 'Bic Station'; 
  let site_group: 'general' | 'adult' = 'general';

  // 判定フラグの可視化
  const isTiper = domain.includes('tiper') || basePath === '/tiper';
  const isAvFlash = domain.includes('avflash') || basePath === '/avflash';
  const isSaving = domain.includes('saving') || basePath === '/saving';
  const isBicStation = domain.includes('bicstation') || basePath === '/bicstation';

  if (isTiper) {
    site_name = 'Tiper';
    site_group = 'adult';
  } else if (isAvFlash) {
    site_name = 'AV Flash';
    site_group = 'adult';
  } else if (isSaving) {
    site_name = 'Bic Saving';
    site_group = 'general';
  } else if (isBicStation) {
    site_name = 'Bic Station';
    site_group = 'general';
  }

  // --- STEP 4: 強力なデバッグ出力 ---
  if (isServer) {
    // サーバーサイド（Dockerログに出力）
    const serverStyle = "\x1b[1m\x1b[33m"; // 太字黄色
    const reset = "\x1b[0m";
    console.log(`${serverStyle}[SERVER-DIAGNOSTIC]${reset}
    - Resolved Host: ${hostname}
    - Source: ${detectionSource}
    - BasePath Env: ${basePath}
    - Resulting Site: ${site_name}
    ------------------------------------------------`);
  } else {
    // クライアントサイド（ブラウザF12コンソールに出力）
    console.group(`%c🔍 SITE DETECTION: ${site_name}`, "color: white; background: #222; padding: 4px 8px; font-weight: bold;");
    console.log(`%cHost: %c${hostname}`, "color: gray;", "color: #00dbde; font-weight: bold;");
    console.log(`%cSource: %c${detectionSource}`, "color: gray;", "color: white;");
    console.log(`%cBasePath: %c${basePath}`, "color: gray;", "color: #ffc107; font-weight: bold;");
    console.log(`%cDomain Key: %c${domain}`, "color: gray;", "color: white;");
    console.groupEnd();
  }

  return { 
    site_group, 
    origin_domain: domain, 
    site_name, 
    site_prefix: '' 
  };
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