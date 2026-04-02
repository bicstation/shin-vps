// @ts-nocheck
/**
 * =====================================================================
 * 🛰️ [SHARED-CORE] サイト環境動的判定ライブラリ (v18.5 - Multi-Env Bridge)
 * ---------------------------------------------------------------------
 * 🚀 修正ポイント:
 * 1. 【通信路の直結】INTERNAL_API_URL を最優先。末尾に /api を勝手に付けない。
 * 2. 【VPS/Local共存】VPS内部(django-v3)、Local(localhost)、本番(api.tiper.live)を自動切り替え。
 * 3. 【Next.js 15対応】headers() から渡されたドメインを優先してサイト判定。
 * =====================================================================
 */

export interface SiteMetadata {
  site_group: 'general' | 'adult';
  origin_domain: string;
  site_name: 'Tiper' | 'AV Flash' | 'Bic Saving' | 'Bic Station';
  site_tag: string;
  site_prefix: string;
  default_brand: 'FANZA' | 'DMM' | 'DUGA' | 'DELL';
  api_base_url: string;
  is_local_env: boolean;
}

export const getSiteMetadata = (manualHostname?: string): SiteMetadata => {
  let hostname = manualHostname || '';
  const isServer = typeof window === "undefined";

  // --- STEP 1: ホスト名の特定 ---
  if (!isServer) {
    hostname = window.location.hostname;
  } else if (!hostname) {
    // サーバーサイドで引数がない場合は環境変数を参照
    hostname = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'bicstation.com';
  }

  // ポート番号除去 (tiper-host:3000 -> tiper-host)
  const domain = String(hostname || 'localhost').replace(/:.*$/, '').toLowerCase();

  // --- STEP 2: 物理環境判定 (Composeの -host 指定に対応) ---
  const isLocalEnv = 
    domain.endsWith('-host') || 
    domain === 'localhost' || 
    domain === '127.0.0.1' ||
    domain.includes('192.168.');

  // --- STEP 3: サイト名・ブランド・タグのマッピング ---
  let site_name: SiteMetadata['site_name'] = 'Bic Station';
  let site_group: SiteMetadata['site_group'] = 'general';
  let site_tag = 'bicstation'; 
  let default_brand: SiteMetadata['default_brand'] = 'DELL';
  let api_subdomain = 'api.bicstation.com';
  let debugReason = "";

  // 判定ロジック：ドメイン文字列からサイトを特定
  if (domain.includes('bicstation')) {
    site_name = 'Bic Station'; site_tag = 'bicstation';
    default_brand = 'DELL'; api_subdomain = 'api.bicstation.com';
    debugReason = "TARGET: BIC_STATION";
  } 
  else if (domain.includes('saving')) {
    site_name = 'Bic Saving'; site_tag = 'saving';
    default_brand = 'DELL'; api_subdomain = 'api.bic-saving.com';
    debugReason = "TARGET: BIC_SAVING";
  } 
  else if (domain.includes('avflash')) {
    site_name = 'AV Flash'; site_tag = 'avflash'; site_group = 'adult';
    default_brand = 'DUGA'; api_subdomain = 'api.avflash.xyz';
    debugReason = "TARGET: AV_FLASH";
  } 
  else if (domain.includes('tiper')) {
    site_name = 'Tiper'; site_tag = 'tiper'; site_group = 'adult';
    default_brand = 'FANZA'; api_subdomain = 'api.tiper.live';
    debugReason = "TARGET: TIPER";
  }
  else {
    debugReason = "FALLBACK: BIC_STATION";
  }

  // --- STEP 4: API通信先の動的解決 (Timeout 対策) ---
  /**
   * 🚩 提督の VPS v3.9 設定に準拠
   * サーバーサイドでは INTERNAL_API_URL (http://django-v3:8000) をそのまま使う
   */
  const internalApi = process.env.INTERNAL_API_URL || process.env.API_INTERNAL_URL || process.env.DJANGO_URL;
  let api_base_url = "";

  if (isServer) {
    // サーバーサイド通信 (コンテナ間)
    // 環境変数が定義されていればそれを最優先（余計なパスは足さない）
    api_base_url = internalApi || `http://django-v3:8000`;
  } else {
    // クライアントサイド通信 (ブラウザ)
    // 1. 環境変数の公開URLがあれば使用、なければドメイン判定から生成
    api_base_url = process.env.NEXT_PUBLIC_API_URL || `https://${api_subdomain}/api`;

    // 2. ローカルブラウザ実行時の Traefik 窓口対応
    if (isLocalEnv) {
       // localhost:8083 (Traefik) 経由で API を叩く設定
       api_base_url = `http://localhost:8083/api`;
    }
  }

  const result: SiteMetadata = { 
    site_group, 
    origin_domain: domain, 
    site_name, 
    site_tag, 
    site_prefix: '', 
    default_brand,
    api_base_url,
    is_local_env: isLocalEnv
  };

  // --- 🛰️ デバッグログ ---
  if (isServer) {
    // サーバーのターミナルに表示 (Gateway Timeout 時にここが出るか確認)
    console.log(`[SHIN-BRIDGE]: ${domain} -> ${site_name} (API: ${api_base_url})`);
  }

  return result;
};

/**
 * 🎨 サイトカラー取得
 */
export const getSiteColor = (siteName: string): string => {
  const colors: Record<string, string> = { 
    'Bic Saving': '#28a745', 
    'saving':      '#28a745',
    'Tiper':       '#e83e8c', 
    'tiper':       '#e83e8c',
    'AV Flash':    '#ffc107',
    'avflash':     '#ffc107',
    'Bic Station': '#007bff', 
    'bicstation':  '#007bff',
    'Blog':        '#6c757d' 
  };
  return colors[siteName] || '#007bff';
};