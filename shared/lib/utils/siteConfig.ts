// @ts-nocheck
/**
 * =====================================================================
 * 🛰️ [SHARED-CORE] サイト環境動的判定ライブラリ (v21.5 - Absolute Integration)
 * 🚀 修正点: 
 * 1. 判定ロジックの優先順位を整理し、誤判定（bicstation -> saving）を防止。
 * 2. ドメインの完全一致に近い判定を導入。
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

export const getSiteColor = (siteName: string): string => {
  const colors: Record<string, string> = {
    'Bic Station': '#0055ff',
    'Bic Saving': '#ff9900',
    'AV Flash': '#e60012',
    'Tiper.Live': '#d4af37',
    'Bic的なAV動画': '#bc00ff',
    'シークレットXYZ': '#6a0dad',
  };
  return colors[siteName] || '#0055ff';
};

export const getSiteMetadata = (manualHostname?: string): SiteMetadata => {
  const isServer = typeof window === "undefined";
  
  let hostname = manualHostname || "";
  if (!isServer) {
    hostname = window.location.hostname;
  } else if (!hostname) {
    hostname = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'bicstation.com';
  }

  const domain = String(hostname).replace(/:.*$/, '').toLowerCase();

  const SITE_MAP = {
    'saving':       { name: 'Bic Saving',     group: 'general', brand: 'DELL',  prod: 'api.bic-saving.com', external: false, prefix: '' },
    'avflash':      { name: 'AV Flash',       group: 'adult',   brand: 'DUGA',  prod: 'api.avflash.xyz',     external: false, prefix: '' },
    'tiper':        { name: 'Tiper.Live',     group: 'adult',   brand: 'FANZA', prod: 'api.tiper.live',      external: false, prefix: '' },
    'bicstation':   { name: 'Bic Station',    group: 'general', brand: 'DELL',  prod: 'api.bicstation.com',  external: false, prefix: '' },
    'bic-erog':     { name: 'Bic的なAV動画',    group: 'adult',   brand: 'FANZA', prod: 'api.bic-erog.com',    external: true,  prefix: '' },
    'adult-search': { name: 'シークレットXYZ', group: 'adult',   brand: 'FANZA', prod: 'api.adult-search.xyz', external: true,  prefix: '' },
  };

  // --- 🎯 STEP 3: 判定ロジックの強化 (優先順位の適正化) ---
  let siteKey = 'bicstation';

  // 1. まずは「特化ドメイン」を先に判定
  if (domain.includes('avflash')) {
    siteKey = 'avflash';
  } else if (domain.includes('tiper')) {
    siteKey = 'tiper';
  } else if (domain.includes('bic-erog')) {
    siteKey = 'bic-erog';
  } else if (domain.includes('adult-search') || domain.includes('adult')) {
    siteKey = 'adult-search';
  } 
  // 2. 次に「saving」を判定 (bic-saving 等を拾う)
  else if (domain.includes('saving')) {
    siteKey = 'saving';
  }
  // 3. 最後に「bicstation」を判定 (デフォルト)
  else if (domain.includes('bicstation')) {
    siteKey = 'bicstation';
  }

  const cfg = SITE_MAP[siteKey] || SITE_MAP['bicstation'];

  const isLocalEnv = domain.endsWith('-host') || domain === 'localhost' || domain.includes('192.168.');

  const django_host = (isLocalEnv && !cfg.external) ? `api-${siteKey}-host` : cfg.prod;

let api_base_url = "";
  
  if (cfg.external) {
    api_base_url = `https://${cfg.prod}`;
  } else if (isServer) {
    /**
     * 🚀 提督、ここを修正しました！
     * django-v3:8000 を直接叩くのではなく、
     * それぞれの api-xxx-host:8083 を通るように強制します。
     * これにより Django 側に正しい Host ヘッダーが伝わります。
     */
    api_base_url = isLocalEnv 
        ? `http://api-${siteKey}-host:8083` // ローカル開発時は固有の門を通る
        : `https://${cfg.prod}`;           // 本番 VPS ではドメイン直
  } else {
    // クライアントサイド (ブラウザ)
    api_base_url = isLocalEnv ? `http://localhost:8083` : `https://${django_host}`;
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