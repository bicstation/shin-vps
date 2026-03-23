// @ts-nocheck
/**
 * =====================================================================
 * 🛰️ [SHARED-CORE] サイト環境動的判定ライブラリ (v18.1 - Multi-Domain API Fixed)
 * ---------------------------------------------------------------------
 * 🚀 修正内容:
 * 1. 【最重要】api_base_url の固定値を廃止。環境変数を最優先に。
 * 2. ドメイン判定に基づき、適切なAPIエンドポイントを動的に生成。
 * 3. 以前の「何でも Tiper API を見に行く」バグを完全に除去。
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
    // サーバーサイド（ビルド時）は環境変数を使用。
    hostname = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'bicstation.com';
  }

  // ポート番号除去
  const domain = String(hostname || 'localhost').replace(/:.*$/, '').toLowerCase();

  // --- STEP 2: 物理環境判定 ---
  const isLocalEnv = 
    domain.endsWith('-host') || 
    domain === 'localhost' || 
    domain === '127.0.0.1';

  // --- STEP 3: サイト名・ブランドのマッピング ---
  let site_name: SiteMetadata['site_name'] = 'Bic Station';
  let site_group: SiteMetadata['site_group'] = 'general';
  let default_brand: SiteMetadata['default_brand'] = 'DELL';
  let api_subdomain = 'api.bicstation.com'; // デフォルトのAPIドメイン
  let debugReason = "";

  // 1. BICSTATION
  if (domain.includes('bicstation')) {
    site_name = 'Bic Station'; site_group = 'general'; default_brand = 'DELL'; 
    api_subdomain = 'api.bicstation.com';
    debugReason = isLocalEnv ? "LOCAL_DEBUG: BIC_STATION" : "PRODUCTION: BIC_STATION";
  } 
  // 2. BIC-SAVING
  else if (domain.includes('saving')) {
    site_name = 'Bic Saving'; site_group = 'general'; default_brand = 'DELL';
    api_subdomain = 'api.bic-saving.com';
    debugReason = isLocalEnv ? "LOCAL_DEBUG: BIC_SAVING" : "PRODUCTION: BIC_SAVING";
  } 
  // 3. AV FLASH
  else if (domain.includes('avflash')) {
    site_name = 'AV Flash'; site_group = 'adult'; default_brand = 'DUGA';
    api_subdomain = 'api.avflash.xyz';
    debugReason = isLocalEnv ? "LOCAL_DEBUG: AV_FLASH" : "PRODUCTION: AV_FLASH";
  } 
  // 4. TIPER
  else if (domain.includes('tiper')) {
    site_name = 'Tiper'; site_group = 'adult'; default_brand = 'FANZA';
    api_subdomain = 'api.tiper.live';
    debugReason = isLocalEnv ? "LOCAL_DEBUG: TIPER" : "PRODUCTION: TIPER";
  }
  // 5. その他（判定不能な場合）
  else {
    site_name = 'Bic Station'; site_group = 'general'; default_brand = 'DELL';
    api_subdomain = 'api.bicstation.com';
    debugReason = "SAFE_FALLBACK (BIC_STATION)";
  }

  /**
   * 🛰️ API通信先の動的解決 (修正のキモ)
   * 1. NEXT_PUBLIC_API_URL があればそれを最優先（Docker Composeの指定を尊重）
   * 2. なければ、ドメイン判定に基づいた本番URLを生成
   * 3. ローカル環境ならポート 8083 を見る
   */
  let api_base_url = process.env.NEXT_PUBLIC_API_URL || `https://${api_subdomain}/api`;
  
  if (isLocalEnv) {
    if (isServer) {
      // Docker内部ネットワーク通信用
      api_base_url = `http://django-v3:8000/api`;
    } else {
      // ブラウザからのローカルアクセス用
      api_base_url = `http://${domain}:8083/api`;
    }
  }

  const result: SiteMetadata = { 
    site_group, 
    origin_domain: domain, 
    site_name, 
    site_prefix: '', 
    default_brand,
    api_base_url,
    is_local_env: isLocalEnv
  };

  // --- 🛰️ 司令官専用 F12 DEBUG SYSTEM ---
  if (!isServer) {
    const logColor = site_group === 'adult' ? "#ff3860" : "#00d1b2";
    console.groupCollapsed(`%c🛡️ [SHIN-CORE] Environment: ${site_name}`, `color: white; background: ${logColor}; font-weight: bold; padding: 2px 4px; border-radius: 3px;`);
    console.log("📥 Domain Detected :", domain);
    console.log("🔗 API Base URL     :", api_base_url);
    console.log("🧠 Logic Reason     :", debugReason);
    console.log("🚀 Full Metadata    :", result);
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