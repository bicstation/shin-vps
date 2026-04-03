// @ts-nocheck
/**
 * =====================================================================
 * 🛰️ [SHARED-CORE] サイト環境動的判定ライブラリ (v19.9 - Final Truth)
 * ---------------------------------------------------------------------
 * 🚀 修正ポイント:
 * 1. 【判定の一本化】サイト名、グループ、Host、URLをすべてここで確定。
 * 2. 【二重パス排除】api_base_url から /api を徹底除去。
 * 3. 【Hostヘッダー確定】Djangoが識別するための django_host を生成。
 * =====================================================================
 */

export interface SiteMetadata {
  site_group: 'general' | 'adult';
  origin_domain: string;
  site_name: 'Tiper' | 'AV Flash' | 'Bic Saving' | 'Bic Station';
  site_tag: string;
  default_brand: 'FANZA' | 'DMM' | 'DUGA' | 'DELL';
  api_base_url: string;   // 物理接続先
  django_host: string;    // 🛡️ Django判定用Host (api-avflash-host等)
  is_local_env: boolean;
}

export const getSiteMetadata = (manualHostname?: string): SiteMetadata => {
  const isServer = typeof window === "undefined";
  
  // STEP 1: ホスト名の特定 (最優先: 引数 > ブラウザ > 環境変数)
  let hostname = manualHostname || "";
  if (!isServer) {
    hostname = window.location.hostname;
  } else if (!hostname) {
    hostname = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'bicstation-host';
  }

  const domain = String(hostname).replace(/:.*$/, '').toLowerCase();

  // STEP 2: 物理環境判定
  const isLocalEnv = 
    domain.endsWith('-host') || 
    domain === 'localhost' || 
    domain.includes('192.168.');

  // STEP 3: サイトマッピング定義
  const SITE_MAP = {
    bicstation: { name: 'Bic Station', group: 'general', brand: 'DELL',  prod: 'api.bicstation.com' },
    saving:     { name: 'Bic Saving',  group: 'general', brand: 'DELL',  prod: 'api.bic-saving.com' },
    avflash:    { name: 'AV Flash',    group: 'adult',   brand: 'DUGA',  prod: 'api.avflash.xyz' },
    tiper:      { name: 'Tiper',       group: 'adult',   brand: 'FANZA', prod: 'api.tiper.live' },
  };

  const siteKey = Object.keys(SITE_MAP).find(k => domain.includes(k)) || 'bicstation';
  const cfg = SITE_MAP[siteKey];

  // STEP 4: Djangoへの「身分証(Host)」と「接続先(URL)」の確定
  const django_host = isLocalEnv ? `api-${siteKey}-host` : cfg.prod;

  let api_base_url = "";
  if (isServer) {
    // サーバーサイド: Docker内部ネットワーク直撃 (http://django-v3:8000)
    api_base_url = (process.env.INTERNAL_API_URL || `http://django-v3:8000`);
  } else {
    // クライアントサイド: Traefik(8083) または 本番URL
    api_base_url = isLocalEnv ? `http://localhost:8083` : `https://${django_host}`;
  }

  // 末尾の /api を除去して client.ts での重複を防止
  const cleanBaseUrl = api_base_url.replace(/\/api\/?$/, '').replace(/\/$/, '');

  return { 
    site_group: cfg.group, 
    origin_domain: domain, 
    site_name: cfg.name, 
    site_tag: siteKey, 
    default_brand: cfg.brand,
    api_base_url: cleanBaseUrl,
    django_host: django_host,
    is_local_env: isLocalEnv
  };
};

export const getSiteColor = (siteName: string): string => {
  const colors: Record<string, string> = { 
    'Bic Saving': '#28a745', 'saving': '#28a745',
    'Tiper': '#e83e8c', 'tiper': '#e83e8c',
    'AV Flash': '#ffc107', 'avflash': '#ffc107',
    'Bic Station': '#007bff', 'bicstation': '#007bff'
  };
  return colors[siteName] || '#007bff';
};