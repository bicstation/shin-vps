// @ts-nocheck
/**
 * =====================================================================
 * 🛰️ [SHARED-CORE] サイト環境動的判定ライブラリ (v21.7 - Hybrid Port Edition)
 * =====================================================================
 * 🚀 修正点: 
 * 1. 【ハイブリッド・ポート】VPS(8000)とローカル(8083)をドメイン名から自動判別。
 * 2. 【SSR最適化】Docker内部ネットワーク越しの通信において、適切なポートを選択。
 * 3. 【入力浄化】ポート番号やパスの混入を排除し、判定精度を維持。
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

  /**
   * 🛡️ [PURE_DOMAIN_SNIPER]
   * ポート番号やパスを除去して、判定用の純粋なドメイン名のみを抽出
   */
  const domain = String(hostname)
    .split('/')[0]      // 1. パス部分を除去
    .split(':')[0]      // 2. ポート番号を除去
    .toLowerCase();

  const SITE_MAP = {
    'saving':       { name: 'Bic Saving',     group: 'general', brand: 'DELL',  prod: 'api.bic-saving.com', external: false, prefix: '' },
    'avflash':      { name: 'AV Flash',       group: 'adult',   brand: 'DUGA',  prod: 'api.avflash.xyz',     external: false, prefix: '' },
    'tiper':        { name: 'Tiper.Live',     group: 'adult',   brand: 'FANZA', prod: 'api.tiper.live',      external: false, prefix: '' },
    'bicstation':   { name: 'Bic Station',    group: 'general', brand: 'DELL',  prod: 'api.bicstation.com',  external: false, prefix: '' },
    'bic-erog':     { name: 'Bic的なAV動画',    group: 'adult',   brand: 'FANZA', prod: 'api.bic-erog.com',    external: true,  prefix: '' },
    'adult-search': { name: 'シークレットXYZ', group: 'adult',   brand: 'FANZA', prod: 'api.adult-search.xyz', external: true,  prefix: '' },
  };

  // --- 🎯 STEP 1: siteKey の判定 ---
  let siteKey = 'bicstation';
  if (domain.includes('avflash')) {
    siteKey = 'avflash';
  } else if (domain.includes('tiper')) {
    siteKey = 'tiper';
  } else if (domain.includes('bic-erog')) {
    siteKey = 'bic-erog';
  } else if (domain.includes('adult-search') || domain.includes('adult')) {
    siteKey = 'adult-search';
  } else if (domain.includes('saving')) {
    siteKey = 'saving';
  } else if (domain.includes('bicstation')) {
    siteKey = 'bicstation';
  }

  const cfg = SITE_MAP[siteKey] || SITE_MAP['bicstation'];

  // ローカル環境、またはDocker内部通信用エイリアス(-host)の判定
  const isLocalEnv = domain.endsWith('-host') || domain === 'localhost' || domain.includes('192.168.');

  /**
   * 🛡️ [HYBRID_PORT_DETECTOR]
   * VPS用の共通エイリアス "django-api-host" が含まれる場合は本番ポート 8000
   * それ以外のローカル開発 (-host 等) は 8083 を使用
   */
  const internalPort = domain.includes('django-api-host') ? '8000' : '8083';

  // 通信先のホスト名を決定
  const django_host = (isLocalEnv && !cfg.external) ? `api-${siteKey}-host` : cfg.prod;

  let api_base_url = "";
  
  if (cfg.external) {
    api_base_url = `https://${cfg.prod}`;
  } else if (isServer) {
    /**
     * 🚀 サーバーサイド (SSR) 通信プロトコル
     * VPS (django-api-host) なら 8000、ローカルなら各 siteKey-host:8083 へ
     */
    api_base_url = isLocalEnv 
        ? `http://${domain}:${internalPort}` 
        : `https://${cfg.prod}`;
  } else {
    /**
     * 💻 クライアントサイド (Browser) 通信
     */
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