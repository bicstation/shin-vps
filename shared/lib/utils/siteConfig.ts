// @ts-nocheck
/**
 * =====================================================================
 * 🛰️ [SHARED-CORE] サイト環境動的判定ライブラリ (v18.0)
 * ---------------------------------------------------------------------
 * 🚀 修正内容:
 * 1. 【重要】デフォルトのフォールバックを 'adult' から 'general' (Bic Station) へ変更。
 * 2. アドセンス審査対策として、判定不能なドメインは全て Bic Station として動作。
 * 3. DMM/FANZA等のアダルトブランドが一般サイトに漏れないよう初期値を厳格化。
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
    // サーバーサイドでは環境変数を使用。
    // 審査用ビルド時は NEXT_PUBLIC_SITE_DOMAIN に 'bicstation.com' を入れることを推奨
    hostname = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'bicstation-host';
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
   */
  let api_base_url = "https://api.tiper.live";
  
  if (isLocalEnv) {
    if (isServer) {
      api_base_url = "http://api-tiper-host:8083";
    } else {
      api_base_url = `http://${domain}:8083`;
    }
  }

  // --- STEP 3: サイト名・ブランドのマッピング ---
  // 🛡️ 審査防衛ロジック: 初期値を「一般・健全サイト」に固定
  let site_name: SiteMetadata['site_name'] = 'Bic Station';
  let site_group: SiteMetadata['site_group'] = 'general';
  let default_brand: SiteMetadata['default_brand'] = 'DELL';
  let debugReason = "";

  // 1. BICSTATION (最優先判定)
  if (domain.includes('bicstation')) {
    site_name = 'Bic Station'; site_group = 'general'; default_brand = 'DELL'; 
    debugReason = isLocalEnv ? "LOCAL_DEBUG: BIC_STATION" : "PRODUCTION: BIC_STATION";
  } 
  // 2. BIC-SAVING
  else if (domain.includes('saving')) {
    site_name = 'Bic Saving'; site_group = 'general'; default_brand = 'DELL'; // 念のため一般ブランドへ
    debugReason = isLocalEnv ? "LOCAL_DEBUG: BIC_SAVING" : "PRODUCTION: BIC_SAVING";
  } 
  // 3. AV FLASH (明示的な場合のみアダルト化)
  else if (domain.includes('avflash')) {
    site_name = 'AV Flash'; site_group = 'adult'; default_brand = 'DUGA';
    debugReason = isLocalEnv ? "LOCAL_DEBUG: AV_FLASH" : "PRODUCTION: AV_FLASH";
  } 
  // 4. TIPER (明示的な場合のみアダルト化)
  else if (domain.includes('tiper')) {
    site_name = 'Tiper'; site_group = 'adult'; default_brand = 'FANZA';
    debugReason = isLocalEnv ? "LOCAL_DEBUG: TIPER" : "PRODUCTION: TIPER";
  }
  // 5. その他（判定不能な場合）
  else {
    // 🛡️ 以前はここで Tiper/adult になっていたのを Bic Station に強制
    site_name = 'Bic Station'; site_group = 'general'; default_brand = 'DELL';
    debugReason = "SAFE_FALLBACK (BIC_STATION)";
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
    const logColor = site_group === 'adult' ? "#ff3860" : "#00d1b2";
    console.groupCollapsed(`%c🛡️ [SHIN-CORE] Environment: ${site_name}`, `color: white; background: ${logColor}; font-weight: bold; padding: 2px 4px; border-radius: 3px;`);
    console.log("📥 Domain Detected :", domain);
    console.log("🧠 Logic Reason    :", debugReason);
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