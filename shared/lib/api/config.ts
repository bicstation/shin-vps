// @ts-nocheck
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

const SITE_MAP = {
  'saving': { name: 'ビック的節約生活', tag: 'saving', group: 'general', brand: 'DELL', prod: 'api.bic-saving.com', external: false, prefix: '' },
  'avflash': { name: 'AV Flash', tag: 'avflash', group: 'adult', brand: 'DUGA', prod: 'api.avflash.xyz', external: false, prefix: '' },
  'tiper': { name: 'Tiper.Live', tag: 'tiper', group: 'adult', brand: 'FANZA', prod: 'api.tiper.live', external: false, prefix: '' },
  'bicstation': { name: 'Bic Station', tag: 'bicstation', group: 'general', brand: 'DELL', prod: 'api.bicstation.com', external: false, prefix: '' },
  'bic-erog': { name: 'ビックAV動画', tag: 'bic-erog', group: 'adult', brand: 'FANZA', prod: 'api.bic-erog.com', external: true, prefix: '' },
  'adult-search': { name: 'シークレットXYZ', tag: 'adult-search', group: 'adult', brand: 'FANZA', prod: 'api.adult-search.xyz', external: true, prefix: '' },
};

export const getSiteMetadata = (manualHostname?: string): SiteMetadata => {
  const isServer = typeof window === "undefined";
  let hostname = manualHostname || (!isServer ? window.location.hostname : process.env.NEXT_PUBLIC_SITE_DOMAIN || 'bicstation.com');
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
    // 🛡️ VPS内部通信は HTTP 8000 ポートへ (httpsを通すとSSRで失敗するため)
    api_base_url = isLocalEnv ? `http://127.0.0.1:8083` : `http://django-api-host:8000/api`;
  } else {
    api_base_url = isLocalEnv ? `http://localhost:8083` : `https://${django_host}`;
  }

  return { 
    site_group: cfg.group, origin_domain: domain, site_name: cfg.name, site_tag: cfg.tag,
    site_prefix: cfg.prefix, default_brand: cfg.brand, 
    api_base_url: api_base_url.replace(/\/api\/?$/, '').replace(/\/$/, ''),
    django_host, is_local_env: isLocalEnv, is_external: cfg.external
  };
};