// @ts-nocheck
/**
 * =====================================================================
 * 🛰️ [SHARED-CORE] サイト環境動的判定ライブラリ (v22.0)
 * =====================================================================
 * 🚀 アップデート内容:
 * 1. 【識別子強化】site_tag を各コンフィグに明記し、メタデータとして返却。
 * 2. 【導線同期】Djangoへのクエリパラメータ等で利用する「純粋な識別子」を保証。
 */

export interface SiteMetadata {
  site_group: 'general' | 'adult';
  origin_domain: string;
  site_name: string;
  site_tag: string;     // 💡 システム識別子 (tiper, saving 等)
  site_prefix: string;
  default_brand: string;
  api_base_url: string;
  django_host: string;
  is_local_env: boolean;
  is_external: boolean;
}

/**
 * 🗺️ サイト別コンフィグマップ
 */
const SITE_MAP = {
  'saving': { 
    name: 'ビック的節約生活', 
    tag: 'saving',
    group: 'general', 
    brand: 'DELL', 
    prod: 'api.bic-saving.com', 
    external: false, 
    prefix: '' 
  },
  'avflash': { 
    name: 'AV Flash', 
    tag: 'avflash',
    group: 'adult',  
    brand: 'DUGA',  
    prod: 'api.avflash.xyz',     
    external: false, 
    prefix: '' 
  },
  'tiper': { 
    name: 'Tiper.Live', 
    tag: 'tiper',
    group: 'adult',  
    brand: 'FANZA', 
    prod: 'api.tiper.live',      
    external: false, 
    prefix: '' 
  },
  'bicstation': { 
    name: 'Bic Station', 
    tag: 'bicstation',
    group: 'general', 
    brand: 'DELL',  
    prod: 'api.bicstation.com',  
    external: false, 
    prefix: '' 
  },
  'bic-erog': { 
    name: 'ビックAV動画', 
    tag: 'bic-erog',
    group: 'adult',  
    brand: 'FANZA', 
    prod: 'api.bic-erog.com',    
    external: true,  
    prefix: '' 
  },
  'adult-search': { 
    name: 'シークレットXYZ', 
    tag: 'adult-search',
    group: 'adult',  
    brand: 'FANZA', 
    prod: 'api.adult-search.xyz', 
    external: true,  
    prefix: '' 
  },
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

  // --- 🎯 siteKey の判定 ---
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
  
  // django_host は物理的な通信先ホスト名として維持
  const django_host = (isLocalEnv && !cfg.external) ? `api-${siteKey}-host` : cfg.prod;

  let api_base_url = "";
  if (cfg.external) {
    api_base_url = `https://${cfg.prod}`;
  } else if (isServer) {
    // 💡 サーバーサイド通信
    api_base_url = isLocalEnv ? `http://${domain}:${internalPort}` : `https://${cfg.prod}`;
  } else {
    // 💡 クライアントサイド通信
    api_base_url = isLocalEnv ? `http://localhost:${internalPort}` : `https://${django_host}`;
  }

  return { 
    site_group: cfg.group, 
    origin_domain: domain, 
    site_name: cfg.name, 
    site_tag: cfg.tag, // 💡 コンフィグから明示的に取得
    site_prefix: cfg.prefix,
    default_brand: cfg.brand,
    api_base_url: api_base_url.replace(/\/api\/?$/, '').replace(/\/$/, ''),
    django_host: django_host,
    is_local_env: isLocalEnv,
    is_external: cfg.external
  };
};