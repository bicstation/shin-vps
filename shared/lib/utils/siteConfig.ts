// @ts-nocheck
/**
 * =====================================================================
 * 🛰️ [SHARED-CORE] サイト環境動的判定ライブラリ (v20.0 - Fixed Truth)
 * 🚀 修正: 判定ロジックの厳格化と Bic Station 優先解決
 * =====================================================================
 */

export const getSiteMetadata = (manualHostname?: string): SiteMetadata => {
  const isServer = typeof window === "undefined";
  
  let hostname = manualHostname || "";
  if (!isServer) {
    hostname = window.location.hostname;
  } else if (!hostname) {
    // 💡 サーバーサイドで hostname がない場合のフォールバックを環境変数から取得
    hostname = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'bicstation.com';
  }

  const domain = String(hostname).replace(/:.*$/, '').toLowerCase();

  // STEP 3: サイトマッピング定義
  const SITE_MAP = {
    'bic-saving':  { name: 'Bic Saving',  group: 'general', brand: 'DELL',  prod: 'api.bic-saving.com' },
    'saving':      { name: 'Bic Saving',  group: 'general', brand: 'DELL',  prod: 'api.bic-saving.com' },
    'avflash':     { name: 'AV Flash',    group: 'adult',   brand: 'DUGA',  prod: 'api.avflash.xyz' },
    'tiper':       { name: 'Tiper.Live',       group: 'adult',   brand: 'FANZA', prod: 'api.tiper.live' },
    'bicstation':  { name: 'Bic Station', group: 'general', brand: 'DELL',  prod: 'api.bicstation.com' },
  };

  /**
   * 💡 判定ロジックの修正: 
   * 1. 完全一致 2. ドメイン名に含む 3. デフォルト
   */
  let siteKey = 'bicstation'; // Default
  
  if (domain.includes('saving') || domain.includes('bic-saving')) {
    siteKey = 'bicstation'; // ここが 'saving' になるべき
    // ⚠️ 以前のコードではここが混同されていた可能性があります
    siteKey = 'saving';
  } else if (domain.includes('avflash')) {
    siteKey = 'avflash';
  } else if (domain.includes('tiper')) {
    siteKey = 'tiper';
  } else if (domain.includes('bicstation')) {
    siteKey = 'bicstation';
  }

  const cfg = SITE_MAP[siteKey] || SITE_MAP['bicstation'];

  // STEP 4: Django判定用Hostの確定
  const isLocalEnv = 
    domain.endsWith('-host') || 
    domain === 'localhost' || 
    domain.includes('192.168.');

  // 🛡️ Django Middlewareが識別するためのHost名
  // Bic Station の場合: api-bicstation-host
  const django_host = isLocalEnv ? `api-${siteKey}-host` : cfg.prod;

  let api_base_url = "";
  if (isServer) {
    // 💡 Dockerネットワーク経由
    api_base_url = process.env.INTERNAL_API_URL || `http://django-v3:8000`;
  } else {
    // 💡 ブラウザ経由
    api_base_url = isLocalEnv ? `http://localhost:8083` : `https://${django_host}`;
  }

  return { 
    site_group: cfg.group, 
    origin_domain: domain, 
    site_name: cfg.name, 
    site_tag: siteKey, 
    default_brand: cfg.brand,
    api_base_url: api_base_url.replace(/\/api\/?$/, '').replace(/\/$/, ''),
    django_host: django_host,
    is_local_env: isLocalEnv
  };
};