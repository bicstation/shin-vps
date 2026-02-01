/**
 * 🛠️ [SHARED-FINAL-REVISED] 汎用サイト設定管理ライブラリ
 * 複数のドメイン運用に対応し、プロキシ環境下（内部IP検出時）でも正確にサイトを判定します。
 */

export interface SiteMetadata {
  site_group: 'general' | 'adult';
  origin_domain: string;
  site_name: string;
  site_prefix: string;
}

export const getSiteMetadata = (manualHostname?: string): SiteMetadata => {
  let hostname = manualHostname || '';
  let detectionSource = 'manual';

  if (typeof window !== "undefined") {
    // 1. クライアントサイド: ブラウザのURLから取得
    hostname = window.location.hostname;
    detectionSource = 'browser-location';
  } else if (!hostname) {
    // 2. サーバーサイド: リクエストヘッダーから取得
    try {
      const { headers } = require('next/headers');
      const headerList = headers();
      
      /**
       * 💡 優先順位:
       * 1. x-forwarded-host: プロキシ（Traefik）が本来のドメイン名を格納する場所
       * 2. host: 直接のリクエスト先（Docker内部ネットワーク経由だとIPになる場合がある）
       */
      hostname = headerList.get('x-forwarded-host') || headerList.get('host') || 'localhost';
      detectionSource = headerList.get('x-forwarded-host') ? 'x-forwarded-host' : 'host-header';
    } catch (e) {
      hostname = 'localhost';
      detectionSource = 'error-fallback';
    }
  }

  // ポート番号が含まれる場合は除去
  const domain = hostname.split(':')[0].toLowerCase();
  
  // 💡 [修正ポイント] 環境変数からのバックアップ判定
  // コンテナ起動時に渡している NEXT_PUBLIC_BASE_PATH を取得
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  let site_name = 'Bic Station'; // デフォルト
  let site_group: 'general' | 'adult' = 'general';

  /**
   * 判定ロジックの優先度:
   * 1. ドメイン名にキーワードが含まれるか (tiper-host など)
   * 2. ベースパス設定から推測するか (内部IP 172.x.x.x 対策)
   */
  if (domain.includes('tiper') || basePath === '/tiper') {
    site_name = 'Tiper';
    site_group = 'adult';
  } else if (domain.includes('avflash') || basePath === '/avflash') {
    site_name = 'AV Flash';
    site_group = 'adult';
  } else if (domain.includes('saving') || basePath === '/saving') {
    site_name = 'Bic Saving';
    site_group = 'general';
  } else if (domain.includes('bicstation') || basePath === '/bicstation') {
    site_name = 'Bic Station';
    site_group = 'general';
  }

  // 🔍 デバッグログ (サーバーのターミナルとブラウザのコンソールの両方に出力)
  const isServer = typeof window === "undefined";
  const logPrefix = isServer ? "[SERVER-DEBUG]" : "[CLIENT-DEBUG]";
  const logColor = isServer ? "\x1b[33m" : "color: #00dbde; font-weight: bold; background: #000; padding: 2px 5px;";

  if (isServer) {
    console.log(`${logColor}${logPrefix} Host: ${hostname} (via ${detectionSource}) | BasePath: ${basePath} -> Site: ${site_name}\x1b[0m`);
  } else {
    console.log(`%c${logPrefix} Host: ${hostname} (via ${detectionSource}) | BasePath: ${basePath} -> Site: ${site_name}`, logColor);
  }

  return { site_group, origin_domain: domain, site_name, site_prefix: basePath };
};

/**
 * 🎨 サイトごとのテーマカラー
 */
export const getSiteColor = (siteName: string): string => {
  const colors: Record<string, string> = {
    'Bic Saving': '#28a745',
    'Tiper':      '#e83e8c',
    'AV Flash':   '#ffc107',
    'Bic Station': '#007bff'
  };
  return colors[siteName] || '#007bff';
};