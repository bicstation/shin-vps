// @ts-nocheck
/**
 * =====================================================================
 * 🌐 サイト構成管理 (Zenith v23.0 - Multi-Domain Engine)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【ビルドエラー解消】getSiteColor を追加し、UIコンポーネントとの不整合を修正。
 * 2. 【定数エクスポート】siteConfig (デフォルト設定) を明示的に export。
 * 3. 【URL正規化】api_base_url の構築ロジックを最新の Docker 構成に完全同期。
 * =====================================================================
 */

export interface SiteMetadata {
  site_group: 'general' | 'adult';
  origin_domain: string;
  site_name: string;
  site_tag: string;
  site_prefix: string;
  default_brand: string;
  api_base_url: string;
  django_host: string;
  is_local_env: boolean;
  is_external: boolean;
  theme_color: string; // 🎨 追加
}

/**
 * 🗺️ サイト別マスターマップ
 */
export const SITE_MAP = {
  'saving': { name: 'ビック的節約生活', tag: 'saving', group: 'general', brand: 'DELL', prod: 'api.bic-saving.com', external: false, prefix: '', color: '#3b82f6' },
  'avflash': { name: 'AV Flash', tag: 'avflash', group: 'adult', brand: 'DUGA', prod: 'api.avflash.xyz', external: false, prefix: '', color: '#ef4444' },
  'tiper': { name: 'Tiper.Live', tag: 'tiper', group: 'adult', brand: 'FANZA', prod: 'api.tiper.live', external: false, prefix: '', color: '#f59e0b' },
  'bicstation': { name: 'Bic Station', tag: 'bicstation', group: 'general', brand: 'DELL', prod: 'api.bicstation.com', external: false, prefix: '', color: '#10b981' },
  'bic-erog': { name: 'ビックAV動画', tag: 'bic-erog', group: 'adult', brand: 'FANZA', prod: 'api.bic-erog.com', external: true, prefix: '', color: '#ec4899' },
  'adult-search': { name: 'シークレットXYZ', tag: 'adult-search', group: 'adult', brand: 'FANZA', prod: 'api.adult-search.xyz', external: true, prefix: '', color: '#8b5cf6' },
};

/**
 * 💡 サイトメタデータの取得
 */
export const getSiteMetadata = (manualHostname?: string): SiteMetadata => {
  const isServer = typeof window === "undefined";
  
  // 1. ホスト名の判定
  let hostname = manualHostname;
  if (!hostname) {
    hostname = !isServer 
      ? window.location.hostname 
      : (process.env.NEXT_PUBLIC_SITE_DOMAIN || 'bicstation.com');
  }
  
  const domain = String(hostname).split('/')[0].split(':')[0].toLowerCase();

  // 2. サイトキーの決定
  let siteKey = 'bicstation';
  if (domain.includes('avflash')) siteKey = 'avflash';
  else if (domain.includes('tiper')) siteKey = 'tiper';
  else if (domain.includes('bic-erog')) siteKey = 'bic-erog';
  else if (domain.includes('adult-search') || domain.includes('adult')) siteKey = 'adult-search';
  else if (domain.includes('saving')) siteKey = 'saving';
  else if (domain.includes('bicstation')) siteKey = 'bicstation';

  const cfg = SITE_MAP[siteKey] || SITE_MAP['bicstation'];
  
  // 3. 環境判定
  const isLocalEnv = domain.endsWith('-host') || domain === 'localhost' || domain.includes('192.168.');
  
  // Docker 内部通信用のホスト名 (django-v3 サービス名へ固定)
  const django_host = (isLocalEnv && !cfg.external) ? `api-${siteKey}-host` : cfg.prod;

  // 4. API Base URL の構築
  let api_base_url = "";
  if (cfg.external) {
    api_base_url = `https://${cfg.prod}`;
  } else if (isServer) {
    // 🛡️ VPS内部通信ロジック: Docker サービス名 django-v3:8000 を優先
    // コンテナ間通信は HTTP 経由で行う (SSL証明書エラー回避)
    api_base_url = isLocalEnv ? `http://127.0.0.1:8083` : `http://django-v3:8000/api`;
  } else {
    // クライアントサイド通信
    api_base_url = isLocalEnv ? `http://localhost:8083` : `https://${django_host}`;
  }

  return { 
    site_group: cfg.group, 
    origin_domain: domain, 
    site_name: cfg.name, 
    site_tag: cfg.tag,
    site_prefix: cfg.prefix, 
    default_brand: cfg.brand, 
    api_base_url: api_base_url.replace(/\/api\/?$/, '').replace(/\/$/, ''),
    django_host, 
    is_local_env: isLocalEnv, 
    is_external: cfg.external,
    theme_color: cfg.color
  };
};

/**
 * 🎨 UI用: サイトカラー取得
 * ビルドエラー "getSiteColor is not a function" を防ぐために追加
 */
export const getSiteColor = (manualHostname?: string): string => {
  return getSiteMetadata(manualHostname).theme_color;
};

/**
 * 📦 定数としてのデフォルト設定
 * rss.xml 等で "siteConfig" を import している箇所への対応
 */
export const siteConfig = getSiteMetadata();

// デフォルトエクスポートも提供
export default getSiteMetadata;