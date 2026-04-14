// @ts-nocheck
/**
 * =====================================================================
 * 🌐 サイト構成管理 (Zenith v25.0 - Multi-Domain Engine)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【ビルドエラー解消】UIが要求する getSiteColor を追加。
 * 2. 【定数エクスポート】rss.xml 等が参照する siteConfig を export。
 * 3. 【SSR通信最適化】サーバーサイド通信時に django-v3 (8000番) を優先し ECONNREFUSED を回避。
 * 4. 【関数追加】fetch処理が要求する getDjangoBaseUrl を明示的に export。
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
  theme_color: string;
}

/**
 * 🗺️ サイト別コンフィグマップ
 */
const SITE_MAP = {
  'saving': { name: 'ビック的節約生活', tag: 'saving', group: 'general', brand: 'DELL', prod: 'api.bic-saving.com', external: false, prefix: '', color: '#3b82f6' },
  'avflash': { name: 'AV Flash', tag: 'avflash', group: 'adult', brand: 'DUGA', prod: 'api.avflash.xyz', external: false, prefix: '', color: '#ef4444' },
  'tiper': { name: 'Tiper.Live', tag: 'tiper', group: 'adult', brand: 'FANZA', prod: 'api.tiper.live', external: false, prefix: '', color: '#f59e0b' },
  'bicstation': { name: 'Bic Station', tag: 'bicstation', group: 'general', brand: 'DELL', prod: 'api.bicstation.com', external: false, prefix: '', color: '#10b981' },
  'bic-erog': { name: 'ビックAV動画', tag: 'bic-erog', group: 'adult', brand: 'FANZA', prod: 'api.bic-erog.com', external: true, prefix: '', color: '#ec4899' },
  'adult-search': { name: 'シークレットXYZ', tag: 'adult-search', group: 'adult', brand: 'FANZA', prod: 'api.adult-search.xyz', external: true, prefix: '', color: '#8b5cf6' },
};

/**
 * 🎯 メイン判定関数
 */
export const getSiteMetadata = (manualHostname?: string): SiteMetadata => {
  const isServer = typeof window === "undefined";
  
  let hostname = manualHostname || "";
  if (!isServer) {
    hostname = window.location.hostname;
  } else if (!hostname) {
    hostname = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'bicstation.com';
  }

  const domain = String(hostname).split('/')[0].split(':')[0].toLowerCase();

  let siteKey = 'bicstation';
  if (domain.includes('avflash')) siteKey = 'avflash';
  else if (domain.includes('tiper')) siteKey = 'tiper';
  else if (domain.includes('bic-erog')) siteKey = 'bic-erog';
  else if (domain.includes('adult-search') || domain.includes('adult')) siteKey = 'adult-search';
  else if (domain.includes('saving')) siteKey = 'saving';
  else if (domain.includes('bicstation')) siteKey = 'bicstation';

  const cfg = SITE_MAP[siteKey] || SITE_MAP['bicstation'];
  const isLocalEnv = domain.endsWith('-host') || domain === 'localhost' || domain.includes('192.168.');
  
  const django_host = (isLocalEnv && !cfg.external) ? `api-${siteKey}-host` : cfg.prod;

  let api_base_url = "";
  if (cfg.external) {
    api_base_url = `https://${cfg.prod}`;
  } else if (isServer) {
    /**
     * 🛡️ サーバーサイド通信 (SSR/Build時)
     * Docker 内部ネットワーク (http://django-v3:8000) を使用。
     * 192.168.65.254 (Host側) へのリダイレクトを防ぎ ECONNREFUSED を回避。
     */
    api_base_url = isLocalEnv ? `http://django-v3:8000/api` : `http://django-v3:8000/api`;
  } else {
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
    django_host: django_host,
    is_local_env: isLocalEnv,
    is_external: cfg.external,
    theme_color: cfg.color
  };
};

/**
 * 🎨 サイトカラー取得用
 */
export const getSiteColor = (manualHostname?: string): string => {
  return getSiteMetadata(manualHostname).theme_color;
};

/**
 * 🔌 APIフェッチ用 (重要: これがないと TypeError になります)
 */
export const getDjangoBaseUrl = (manualHostname?: string): string => {
  return getSiteMetadata(manualHostname).api_base_url;
};

/**
 * 🏷️ RSS/Metadata 用の定数
 */
export const siteConfig = getSiteMetadata();

export default getSiteMetadata;