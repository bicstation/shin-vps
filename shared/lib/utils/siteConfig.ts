// @ts-nocheck
/**
 * =====================================================================
 * 🛰️ [SHARED-CORE] サイト環境動的判定ライブラリ (v17.2)
 * ---------------------------------------------------------------------
 * 🚀 更新内容:
 * 1. API_BASE の二重解決: Server(Docker) と Client(Browser) でホスト名を自動切替。
 * 2. ドメイン判定の厳格化: '-host' 検出時は PRODUCTION へのマッピングを抑制。
 * 3. プレビュー環境等、未知のドメインに対するフォールバックの強化。
 * =====================================================================
 */

export interface SiteMetadata {
  site_group: 'general' | 'adult';
  origin_domain: string;
  site_name: 'Tiper' | 'AV Flash' | 'Bic Saving' | 'Bic Station';
  site_prefix: string;
  default_brand: 'FANZA' | 'DMM' | 'DUGA' | 'DELL';
  api_base_url: string;
  is_local_env: boolean;
}

export const getSiteMetadata = (manualHostname?: string): SiteMetadata => {
  let hostname = manualHostname || '';
  const isServer = typeof window === "undefined";

  // --- STEP 1: ホスト名の正規化 ---
  if (!isServer) {
    hostname = window.location.hostname;
  } else if (!hostname) {
    // サーバーサイドでは環境変数、なければデフォルト値
    hostname = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'tiper-host';
  }

  // ポート番号除去
  const domain = String(hostname || 'localhost').replace(/:.*$/, '').toLowerCase();

  // --- STEP 2: 物理環境判定 ---
  const isLocalEnv = 
    domain.endsWith('-host') || 
    domain === 'localhost' || 
    domain === '127.0.0.1';

  /**
   * 🛰️ API通信先の動的解決
   * -----------------------------------------------------------------
   * LOCAL時: 
   * Server(Next.js) -> http://api-tiper-host:8083 (コンテナ間通信)
   * Client(Browser) -> http://tiper-host:8083     (hostsファイル解決)
   * PROD時: 
   * https://api.tiper.live (通常ポート)
   */
  let api_base_url = "https://api.tiper.live";
  
  if (isLocalEnv) {
    if (isServer) {
      // Server Component からの fetch 用
      api_base_url = "http://api-tiper-host:8083";
    } else {
      // ブラウザからの画像読み込み・API実行用
      // domain が 'tiper-host' 等であればそれを使用
      api_base_url = `http://${domain}:8083`;
    }
  }

  // --- STEP 3: サイト名・ブランドのマッピング ---
  let site_name: SiteMetadata['site_name'] = 'Tiper';
  let site_group: SiteMetadata['site_group'] = 'adult';
  let default_brand: SiteMetadata['default_brand'] = 'FANZA';
  let debugReason = "";

  if (domain.includes('avflash')) {
    site_name = 'AV Flash'; site_group = 'adult'; default_brand = 'DUGA';
    debugReason = isLocalEnv ? "LOCAL_DEBUG: AV_FLASH" : "PRODUCTION: AV_FLASH";
  } 
  else if (domain.includes('saving')) {
    site_name = 'Bic Saving'; site_group = 'general'; default_brand = 'DMM';
    debugReason = isLocalEnv ? "LOCAL_DEBUG: BIC_SAVING" : "PRODUCTION: BIC_SAVING";
  } 
  else if (domain.includes('bicstation')) {
    site_name = 'Bic Station'; site_group = 'general'; default_brand = 'DELL'; 
    debugReason = isLocalEnv ? "LOCAL_DEBUG: BIC_STATION" : "PRODUCTION: BIC_STATION";
  }
  else if (domain.includes('tiper')) {
    site_name = 'Tiper'; site_group = 'adult'; default_brand = 'FANZA';
    debugReason = isLocalEnv ? "LOCAL_DEBUG: TIPER" : "PRODUCTION: TIPER";
  }
  else {
    debugReason = "DEFAULT_FALLBACK (TIPER)";
  }

  const result: SiteMetadata = { 
    site_group, 
    origin_domain: domain, 
    site_name, 
    site_prefix: site_group === 'adult' ? '/adult' : '/blog', 
    default_brand,
    api_base_url,
    is_local_env: isLocalEnv
  };

  // --- 🛰️ 司令官専用 F12 DEBUG SYSTEM ---
  if (!isServer) {
    const logColor = isLocalEnv ? "#00d1b2" : "#ff3860";
    console.groupCollapsed(`%c🛡️ [SHIN-CORE] Environment: ${isLocalEnv ? 'LOCAL' : 'PRODUCTION'}`, `color: ${logColor}; font-weight: bold; border: 1px solid ${logColor}; padding: 2px 4px;`);
    console.log("📥 Domain Detected :", domain);
    console.log("🧠 Logic Reason    :", debugReason);
    console.log("🛰️ API Destination :", api_base_url);
    console.log("🚀 Full Metadata   :", result);
    console.groupEnd();
  }

  return result;
};

/**
 * 🎨 サイトカラー取得
 */
export const getSiteColor = (siteName: string): string => {
  const colors: Record<string, string> = { 
    'Bic Saving': '#28a745', 
    'saving':     '#28a745',
    'Tiper':      '#e83e8c', 
    'tiper':      '#e83e8c',
    'AV Flash':   '#ffc107',
    'avflash':    '#ffc107',
    'Bic Station': '#007bff', 
    'bicstation':  '#007bff',
    'Blog':       '#6c757d' 
  };
  return colors[siteName] || '#007bff';
};