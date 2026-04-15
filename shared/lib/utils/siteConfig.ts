// @ts-nocheck
/**
 * =====================================================================
 * 🌐 サイト構成管理 [Single Source of Truth: 真実の単一源]
 * =====================================================================
 * 🧭 このファイルが「通信の地図」の原典です。
 * * 【一本の導線ルール】
 * 入口 (Next.js) --[site_tag判定]--> [siteConfig] --[api_prefix決定]--> 出口 (Django)
 * * 🛠️ 最終修正ポイント:
 * 1. 【ポート統合】ログより 8000 ポートでの成功を確認したため、SSR時の全接続を 8000 に統一。
 * 2. 【スラッシュ浄化】site_tag 等の末尾に / が混入して %2F となる問題を徹底排除。
 * 3. 【SSR最適化】VPS環境の Docker ネットワーク名 django-v3 を優先。
 * =====================================================================
 */

export interface SiteMetadata {
  site_group: 'general' | 'adult';
  site_name: string;
  site_tag: string;
  site_prefix: string;      // Django側のURL接頭辞 (general, bs, adult)
  api_port: number;         // 通信用ポート番号
  api_base_url: string;     // 最終的なベースURL
  django_host: string;
  is_local_env: boolean;
  theme_color: string;
}

/**
 * 🗺️ SITE_MAP: 全ての「出口」を定義するマスターテーブル
 */
const SITE_MAP = {
  'saving': { 
    name: 'ビック的節約生活', 
    tag: 'saving', 
    prefix: 'bs', 
    port: 8000, // 👈 ログの結果を受け、8083拒否を避けるため 8000 に寄せる
    group: 'general', 
    prod: 'api.bic-saving.com', 
    color: '#3b82f6' 
  },
  'bicstation': { 
    name: 'Bic Station', 
    tag: 'bicstation', 
    prefix: 'general', 
    port: 8000, 
    group: 'general', 
    prod: 'api.bicstation.com', 
    color: '#10b981' 
  },
  'nabejuku': { 
    name: 'なべ塾', 
    tag: 'nabejuku', 
    prefix: 'general', 
    port: 8000, 
    group: 'general', 
    prod: 'api.nabejuku.com', 
    color: '#6366f1' 
  },
  'avflash': { 
    name: 'AV Flash', 
    tag: 'avflash', 
    prefix: 'adult', 
    port: 8000, 
    group: 'adult', 
    prod: 'api.avflash.xyz', 
    color: '#ef4444' 
  },
  'tiper': { 
    name: 'Tiper.Live', 
    tag: 'tiper', 
    prefix: 'adult', 
    port: 8000, 
    group: 'adult', 
    prod: 'api.tiper.live', 
    color: '#f59e0b' 
  },
};

/**
 * 💡 サイトメタデータ取得の核心ロジック
 */
export const getSiteMetadata = (manualHostname?: string): SiteMetadata => {
  const isServer = typeof window === "undefined";
  
  // 1. 識別名(hostname)の特定
  let hostname = manualHostname || "";
  if (!isServer) {
    hostname = window.location.hostname;
  } else {
    hostname = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'bicstation.com';
  }

  // ドメインから余計なポート番号やスラッシュを削ぎ落とす
  const domain = String(hostname).split('/')[0].split(':')[0].toLowerCase();

  // 2. サイトキーの特定
  let siteKey = 'bicstation';
  if (domain.includes('saving')) siteKey = 'saving';
  else if (domain.includes('avflash')) siteKey = 'avflash';
  else if (domain.includes('tiper')) siteKey = 'tiper';
  else if (domain.includes('nabejuku')) siteKey = 'nabejuku';

  const cfg = SITE_MAP[siteKey] || SITE_MAP['bicstation'];

  // 3. ローカル環境判定
  const isLocalEnv = 
    domain === 'localhost' || 
    domain === '127.0.0.1' || 
    domain === 'bicstation' || 
    domain === 'saving' ||
    domain.includes('192.168.');
  
  // 4. APIベースURLの構築 (SSR/Client/Local 全対応)
  let api_base_url = "";
  const forcedApiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (forcedApiUrl && forcedApiUrl.length > 1) {
    api_base_url = forcedApiUrl.replace(/\/+$/, '');
    if (!api_base_url.endsWith('/api')) api_base_url += '/api';
  } else if (isServer) {
    /**
     * 🛡️ サーバーサイド (SSR) 接続先
     * ログより django-v3:8000 が疎通することを確認済み。
     */
    api_base_url = `http://django-v3:8000/api`;
  } else {
    /**
     * 🌐 クライアントサイド (Browser) 接続先
     */
    api_base_url = isLocalEnv 
      ? `http://localhost:${cfg.port}/api` 
      : `https://${cfg.prod}/api`;
  }

  // 【最重要】タグやプレフィックスからスラッシュを徹底除去 (404 & %2F 対策)
  const cleanTag = cfg.tag.replace(/\/+$/, '').trim();
  const cleanPrefix = cfg.prefix.replace(/^\/+|\/+$/g, '').trim();

  return { 
    site_group: cfg.group, 
    site_name: cfg.name, 
    site_tag: cleanTag,
    site_prefix: cleanPrefix,
    api_port: cfg.port,
    api_base_url: api_base_url.replace(/\/+$/, ''), 
    django_host: isLocalEnv ? `api-${siteKey}-host` : cfg.prod,
    is_local_env: isLocalEnv,
    theme_color: cfg.color
  };
};

/**
 * =====================================================================
 * 🛠️ 外部用ヘルパー関数 (とりこぼし・ビルドエラー防止用)
 * =====================================================================
 */

export const getSiteColor = (manualHostname?: string): string => {
  return getSiteMetadata(manualHostname).theme_color;
};

export const getDjangoBaseUrl = (manualHostname?: string): string => {
  return getSiteMetadata(manualHostname).api_base_url;
};

export const getSiteTag = (manualHostname?: string): string => {
  return getSiteMetadata(manualHostname).site_tag;
};

export const getSitePrefix = (manualHostname?: string): string => {
  return getSiteMetadata(manualHostname).site_prefix;
};

export default getSiteMetadata;