// /home/maya/shin-vps/shared/lib/utils/siteConfig.ts
// @ts-nocheck

export interface SiteMetadata {

  site_group: 'general' | 'adult';

  site_name: string;

  site_tag: string;

  site_prefix: string;

  api_port: number;

  /**
   * Public API URL
   * Browser access only
   */
  public_api_url: string;

  django_host: string;

  is_local_env: boolean;

  theme_color: string;
}

/**
 * =====================================================================
 * 🗺️ SITE MAP
 * =====================================================================
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
 * =====================================================================
 * 🌍 Site Metadata Resolver
 * =====================================================================
 */

export const getSiteMetadata = (
  manualHostname?: string
): SiteMetadata => {

  const isServer =
    typeof window === 'undefined';

  // ================================================================
  // ① Host Detection
  // ================================================================

  let hostname = manualHostname || '';

  if (!isServer) {

    hostname = window.location.hostname;

  } else {

    hostname =
      process.env.NEXT_PUBLIC_SITE_DOMAIN ||
      'bicstation.com';
  }

  const domain = String(hostname)
    .split('/')[0]
    .split(':')[0]
    .toLowerCase();

  // ================================================================
  // ② Site Detection
  // ================================================================

  let siteKey = 'bicstation';

  if (domain.includes('saving')) {
    siteKey = 'saving';
  }

  else if (domain.includes('avflash')) {
    siteKey = 'avflash';
  }

  else if (domain.includes('tiper')) {
    siteKey = 'tiper';
  }

  else if (domain.includes('nabejuku')) {
    siteKey = 'nabejuku';
  }

  const cfg =
    SITE_MAP[siteKey] ||
    SITE_MAP['bicstation'];

  // ================================================================
  // ③ Local Detection
  // ================================================================

  const isLocalEnv =

    domain === 'localhost' ||

    domain === '127.0.0.1' ||

    domain.includes('192.168.');

  // ================================================================
  // ④ Public API URL
  // ================================================================

  let public_api_url = '';

  if (isLocalEnv) {

    public_api_url =
      `http://localhost:${cfg.port}/api`;

  } else {

    public_api_url =
      `https://${cfg.prod}/api`;
  }

  // normalize
  public_api_url =
    public_api_url.replace(/\/+$/, '');

  // clean
  const cleanTag =
    cfg.tag.replace(/\/+$/, '').trim();

  const cleanPrefix =
    cfg.prefix
      .replace(/^\/+|\/+$/g, '')
      .trim();

  // ================================================================
  // ⑤ Return
  // ================================================================

  return {

    site_group: cfg.group,

    site_name: cfg.name,

    site_tag: cleanTag,

    site_prefix: cleanPrefix,

    api_port: cfg.port,

    public_api_url,

    django_host: cfg.prod,

    is_local_env: isLocalEnv,

    theme_color: cfg.color,
  };
};

/**
 * =====================================================================
 * 🔧 Helpers
 * =====================================================================
 */

export const getSiteTag = (
  manualHostname?: string
): string => {

  return getSiteMetadata(manualHostname).site_tag;
};

export const getSitePrefix = (
  manualHostname?: string
): string => {

  return getSiteMetadata(manualHostname).site_prefix;
};

export const getSiteColor = (
  manualHostname?: string
): string => {

  return getSiteMetadata(manualHostname).theme_color;
};

export default getSiteMetadata;