// /shared/lib/utils/siteConfig.ts
// @ts-nocheck

export interface SiteMetadata {
  site_group: 'general' | 'adult';
  site_name: string;
  site_tag: string;
  site_prefix: string;
  api_port: number;
  api_base_url: string;
  django_host: string;
  is_local_env: boolean;
  theme_color: string;
}

/**
 * 🗺️ SITE_MAP
 */
const SITE_MAP = {
  saving: {
    name: 'ビック的節約生活',
    tag: 'saving',
    prefix: 'bs',
    port: 8000,
    group: 'general',
    prod: 'api.bic-saving.com',
    color: '#3b82f6',
  },
  bicstation: {
    name: 'Bic Station',
    tag: 'bicstation',
    prefix: 'general',
    port: 8000,
    group: 'general',
    prod: 'api.bicstation.com',
    color: '#10b981',
  },
  nabejuku: {
    name: 'なべ塾',
    tag: 'nabejuku',
    prefix: 'general',
    port: 8000,
    group: 'general',
    prod: 'api.nabejuku.com',
    color: '#6366f1',
  },
  avflash: {
    name: 'AV Flash',
    tag: 'avflash',
    prefix: 'adult',
    port: 8000,
    group: 'adult',
    prod: 'api.avflash.xyz',
    color: '#ef4444',
  },
  tiper: {
    name: 'Tiper.Live',
    tag: 'tiper',
    prefix: 'adult',
    port: 8000,
    group: 'adult',
    prod: 'api.tiper.live',
    color: '#f59e0b',
  },
};

/**
 * 💡 メインロジック（超シンプル版）
 */
export const getSiteMetadata = (manualHostname?: string): SiteMetadata => {
  const isServer = typeof window === 'undefined';

  // ① ホスト取得
  let hostname = manualHostname || '';

  if (!isServer) {
    hostname = window.location.hostname;
  } else {
    hostname = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'bicstation.com';
  }

  const domain = String(hostname)
    .split('/')[0]
    .split(':')[0]
    .toLowerCase();

  // ② サイト判定
  let siteKey = 'bicstation';

  if (domain.includes('saving')) siteKey = 'saving';
  else if (domain.includes('avflash')) siteKey = 'avflash';
  else if (domain.includes('tiper')) siteKey = 'tiper';
  else if (domain.includes('nabejuku')) siteKey = 'nabejuku';

  const cfg = SITE_MAP[siteKey] || SITE_MAP['bicstation'];

  // ③ ローカル判定
  const isLocalEnv =
    domain === 'localhost' ||
    domain === '127.0.0.1' ||
    domain.includes('192.168.');

  // ④ API URL（ここが最重要）
  let api_base_url = '';

  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (envUrl && envUrl.length > 1) {
    api_base_url = envUrl;
  } else {
    api_base_url = isLocalEnv
      ? `http://localhost:${cfg.port}/api`
      : `https://${cfg.prod}/api`;
  }

  // ⑤ クリーンアップ（最低限）
  api_base_url = api_base_url
    .replace(/\/+$/, '')
    .replace(/\/api$/, '') + '/api';

  // ⑥ tag / prefix クリーン
  const cleanTag = cfg.tag.replace(/\/+$/, '').trim();
  const cleanPrefix = cfg.prefix.replace(/^\/+|\/+$/g, '').trim();

  return {
    site_group: cfg.group,
    site_name: cfg.name,
    site_tag: cleanTag,
    site_prefix: cleanPrefix,
    api_port: cfg.port,
    api_base_url,
    django_host: cfg.prod,
    is_local_env: isLocalEnv,
    theme_color: cfg.color,
  };
};

/**
 * 🔧 ヘルパー
 */
export const getDjangoBaseUrl = (manualHostname?: string): string => {
  return getSiteMetadata(manualHostname).api_base_url;
};

export const getSiteTag = (manualHostname?: string): string => {
  return getSiteMetadata(manualHostname).site_tag;
};

export const getSitePrefix = (manualHostname?: string): string => {
  return getSiteMetadata(manualHostname).site_prefix;
};

export const getSiteColor = (manualHostname?: string): string => {
  return getSiteMetadata(manualHostname).theme_color;
};

export default getSiteMetadata;