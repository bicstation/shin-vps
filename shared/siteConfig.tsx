/**
 * 🛠️ [SHARED-FINAL] サイト設定管理ライブラリ
 * 4つのドメインと開発環境(localhost)の差異を吸収し、
 * 適切なサイト名、グループ、プレフィックスを返します。
 */

export interface SiteMetadata {
  site_group: 'general' | 'adult';
  origin_domain: string;
  site_name: string;
  site_prefix: string;
}

/**
 * 💡 現在のアクセス状況からサイトのメタデータを動的に取得
 * クライアントサイド(window)とサーバーサイドの両方で安全に動作するように設計。
 */
export const getSiteMetadata = (): SiteMetadata => {
  // --- 1. サーバーサイドレンダリング(SSR)時のデフォルト値 ---
  if (typeof window === "undefined") {
    return { 
      site_group: 'general', 
      origin_domain: 'localhost',
      site_name: 'Bic Station',
      site_prefix: '' 
    };
  }

  // --- 2. 実行環境の情報を取得 ---
  const hostname = window.location.hostname; // 例: localhost, tiper.live
  const pathname = window.location.pathname; // 例: /tiper/search

  // 初期値の設定
  let site_name = 'Bic Station';
  let site_prefix = '';
  let site_group: 'general' | 'adult' = 'general';

  // --- 3. 開発環境 (localhost / 127.0.0.1) の判定ロジック ---
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // パスの最初の階層からサイトを特定 (例: /saving/ -> saving)
    const firstPath = pathname.split('/')[1];

    switch (firstPath) {
      case 'saving':
        site_name = 'Bic Saving';
        site_prefix = '/saving';
        site_group = 'general';
        break;
      case 'tiper':
        site_name = 'Tiper';
        site_prefix = '/tiper';
        site_group = 'adult';
        break;
      case 'avflash':
        site_name = 'AV Flash';
        site_prefix = '/avflash';
        site_group = 'adult';
        break;
      case 'bicstation':
        site_name = 'Bic Station';
        site_prefix = '/bicstation';
        site_group = 'general';
        break;
      default:
        // デフォルトは Bic Station
        site_name = 'Bic Station';
        site_prefix = ''; 
        site_group = 'general';
    }
  } 
  // --- 4. 本番環境 (独自ドメイン) の判定ロジック ---
  else {
    if (hostname.includes('bic-saving.com')) {
      site_name = 'Bic Saving';
      site_group = 'general';
    } else if (hostname.includes('tiper.live')) {
      site_name = 'Tiper';
      site_group = 'adult';
    } else if (hostname.includes('avflash.xyz')) {
      site_name = 'AV Flash';
      site_group = 'adult';
    } else if (hostname.includes('bicstation.com')) {
      site_name = 'Bic Station';
      site_group = 'general';
    }
    
    // 本番環境ではドメイン自体がサイトを指すため、パスプレフィックスは不要
    site_prefix = '';
  }

  return { 
    site_group, 
    origin_domain: hostname, 
    site_name, 
    site_prefix 
  };
};

/**
 * 🎨 サイトごとのテーマカラーを動的に取得するユーティリティ
 */
export const getSiteColor = (siteName: string): string => {
  switch (siteName) {
    case 'Bic Saving': return '#28a745'; // 緑
    case 'Tiper':      return '#e83e8c'; // ピンク
    case 'AV Flash':   return '#ffc107'; // 黄
    case 'Bic Station':
    default:           return '#007bff'; // 青
  }
};