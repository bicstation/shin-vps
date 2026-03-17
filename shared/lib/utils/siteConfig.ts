// @ts-nocheck
/**
 * =====================================================================
 * 🛰️ [SHARED-CORE] サイト環境動的判定ライブラリ (v17.0)
 * ---------------------------------------------------------------------
 * 🚀 特徴:
 * 1. hostsファイルのマッピング (-host) を判定の第一優先に設定。
 * 2. ドメイン名に '-host' があれば、強制的にローカルAPI (127.0.0.1) へ接続。
 * 3. 各サイト名のマッピングを hosts の定義と完全に同期。
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
    hostname = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'localhost';
  }

  // ポート番号除去
  const domain = String(hostname || 'localhost').replace(/:.*$/, '').toLowerCase();

  // --- STEP 2: 司令官定義の物理マッピングロジック ---
  // hostsファイルに定義された "-host" があればローカル確定
  const isLocalEnv = 
    domain.endsWith('-host') || 
    domain === 'localhost' || 
    domain === '127.0.0.1';

  // 通信先の決定 (hosts設定に基づき、ローカルなら 127.0.0.1 固定)
  const api_base_url = isLocalEnv 
    ? "http://127.0.0.1:8083" 
    : "https://api.tiper.live:8083";

  // --- STEP 3: サイト名・ブランドのマッピング ---
  let site_name: SiteMetadata['site_name'];
  let site_group: SiteMetadata['site_group'];
  let default_brand: SiteMetadata['default_brand'];
  let debugReason = "";

  // hostsファイルの設定に基づいたマッピング
  if (domain.includes('avflash')) {
    site_name = 'AV Flash'; site_group = 'adult'; default_brand = 'DUGA';
    debugReason = "Mapped by hosts: avflash-host -> avflash.xyz";
  } 
  else if (domain.includes('saving')) {
    site_name = 'Bic Saving'; site_group = 'general'; default_brand = 'DMM';
    debugReason = "Mapped by hosts: saving-host -> bic-saving.com";
  } 
  else if (domain.includes('bicstation')) {
    site_name = 'Bic Station'; site_group = 'general'; default_brand = 'DELL'; 
    debugReason = "Mapped by hosts: bicstation-host -> bicstation.com";
  }
  else if (domain.includes('tiper')) {
    site_name = 'Tiper'; site_group = 'adult'; default_brand = 'FANZA';
    debugReason = "Mapped by hosts: tiper-host -> tiper.live";
  }
  else {
    // 予備のデフォルト (localhostなどの場合)
    site_name = 'Tiper'; site_group = 'adult'; default_brand = 'FANZA';
    debugReason = "Default Mapping (Localhost/Unknown)";
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

export const getSiteColor = (siteName: string): string => {
  const colors: Record<string, string> = { 
    'Bic Saving': '#28a745', 
    'Tiper':      '#e83e8c', 
    'AV Flash':   '#ffc107',
    'Bic Station': '#007bff', 
    'Blog':       '#6c757d' 
  };
  return colors[siteName] || '#007bff';
};