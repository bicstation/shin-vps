// @ts-nocheck
/**
 * =====================================================================
 * 🛰️ [SHARED-CORE] サイト環境動的判定ライブラリ (v21.9)
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
}

/**
 * 🎨 サイト別テーマカラー設定
 */
export const getSiteColor = (siteName: string): string => {
  const colors: Record<string, string> = {
    'Bic Station (ビックステーション)': '#0055ff',
    'ビック的節約生活': '#ff9900',
    'AV Flash (AVフラッシュ)': '#e60012',
    'Tiper.Live (タイパーライブ)': '#d4af37',
    'Bic的なAV動画': '#bc00ff',
    'シークレットXYZ': '#6a0dad',
  };
  return colors[siteName] || '#0055ff';
};

/**
 * 🗺️ サイト別コンフィグマップ
 * 修正点: 'saving' の名称を正しい日本語に修正。
 */
const SITE_MAP = {
  'saving': { 
    name: 'ビック的節約生活', 
    group: 'general', 
    brand: 'DELL', 
    prod: 'api.bic-saving.com', 
    external: false, 
    prefix: '' 
  },
  'avflash': { 
    name: 'AV Flash (AVフラッシュ)', 
    group: 'adult',  
    brand: 'DUGA',  
    prod: 'api.avflash.xyz',     
    external: false, 
    prefix: '' 
  },
  'tiper': { 
    name: 'Tiper.Live (タイパーライブ)', 
    group: 'adult',  
    brand: 'FANZA', 
    prod: 'api.tiper.live',      
    external: false, 
    prefix: '' 
  },
  'bicstation': { 
    name: 'Bic Station (ビックステーション)', 
    group: 'general', 
    brand: 'DELL',  
    prod: 'api.bicstation.com',  
    external: false, 
    prefix: '' 
  },
  'bic-erog': { 
    name: 'Bic的なAV動画', 
    group: 'adult',  
    brand: 'FANZA', 
    prod: 'api.bic-erog.com',    
    external: true,  
    prefix: '' 
  },
  'adult-search': { 
    name: 'シークレットXYZ', 
    group: 'adult',  
    brand: 'FANZA', 
    prod: 'api.adult-search.xyz', 
    external: true,  
    prefix: '' 
  },
};

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
  if (domain.includes('avflash')) { siteKey = 'avflash'; }
  else if (domain.includes('tiper')) { siteKey = 'tiper'; }
  else if (domain.includes('bic-erog')) { siteKey = 'bic-erog'; }
  else if (domain.includes('adult-search') || domain.includes('adult')) { siteKey = 'adult-search'; }
  else if (domain.includes('saving')) { siteKey = 'saving'; }
  else if (domain.includes('bicstation')) { siteKey = 'bicstation'; }

  const cfg = SITE_MAP[siteKey] || SITE_MAP['bicstation'];
  const isLocalEnv = domain.endsWith('-host') || domain === 'localhost' || domain.includes('192.168.');
  const internalPort = domain.includes('django-api-host') ? '8000' : '8083';
  const django_host = (isLocalEnv && !cfg.external) ? `api-${siteKey}-host` : cfg.prod;

  let api_base_url = "";
  if (cfg.external) {
    api_base_url = `https://${cfg.prod}`;
  } else if (isServer) {
    api_base_url = isLocalEnv ? `http://${domain}:${internalPort}` : `https://${cfg.prod}`;
  } else {
    api_base_url = isLocalEnv ? `http://localhost:${internalPort}` : `https://${django_host}`;
  }

  return { 
    site_group: cfg.group, 
    origin_domain: domain, 
    site_name: cfg.name, 
    site_tag: siteKey, 
    site_prefix: cfg.prefix,
    default_brand: cfg.brand,
    api_base_url: api_base_url.replace(/\/api\/?$/, '').replace(/\/$/, ''),
    django_host: django_host,
    is_local_env: isLocalEnv,
    is_external: cfg.external
  };
};