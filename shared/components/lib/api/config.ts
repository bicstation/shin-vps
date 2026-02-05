/**
 * =====================================================================
 * 🌍 API 環境設定 (shared/components/lib/api/config.ts)
 * 3つのブログ系統（tiper統合 / saving / bicstation）を正しく振り分け
 * VPS: api.tiper.live / Local: api-tiper-host & 8083ポート対応版
 * =====================================================================
 */
import { getSiteMetadata } from '../../lib/siteConfig';

// サーバーサイド判定
export const IS_SERVER = typeof window === 'undefined';

/**
 * 📝 WordPress接続用の設定を取得
 */
export const getWpConfig = () => {
    // 💡 metadata から現在のサイト設定を取得
    const metadata = getSiteMetadata();
    const site_prefix = metadata?.site_prefix || '';
    
    // スラッシュを除去して判定用のキーを作成 ("/tiper/" -> "tiper")
    const rawKey = site_prefix.replace(/\//g, '');
    
    let siteKey = '';
    let hostHeader = '';

    // --- 振り分けロジック ---
    if (rawKey === 'saving') {
        /**
         * ① 節約ブログ系統
         */
        siteKey = 'saving';
        hostHeader = 'b-saving-host';
    } else if (rawKey === 'station' || rawKey === 'bicstation') {
        /**
         * ② 駅名ブログ系統
         */
        siteKey = 'station';
        hostHeader = 'b-bicstation-host';
    } else {
        /**
         * ③ アダルトブログ系統 (tiper, avflash, または Root '/')
         */
        siteKey = 'tiper';
        hostHeader = 'b-tiper-host';
    }

    let baseUrl = '';

    if (IS_SERVER) {
        // SSR: Next.js サーバーコンテナから Nginx コンテナへ直接通信
        baseUrl = 'http://nginx-wp-v2:80'; 
    } else {
        // ブラウザ: 現在閲覧しているドメインをベースにする
        baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    }

    return {
        baseUrl,
        host: hostHeader,
        siteKey
    };
};

/**
 * 💻 Django API接続用のベースURLを取得
 */
export const getDjangoBaseUrl = () => {
    // 1. 環境変数 (NEXT_PUBLIC_API_URL) があれば最優先
    const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envApiUrl) {
        return envApiUrl.replace(/\/api\/?$/, '');
    }

    // 2. サーバーサイド (SSR)
    if (IS_SERVER) {
        /**
         * 💡 重要修正ポイント:
         * ブラウザでの疎通確認（DRF画面）が http://api-tiper-host:8083/ で成功したため
         * SSR（サーバー間通信）でも同じホスト名とポートを明示的に指定します。
         */
        return 'http://api-tiper-host:8083'; 
    }
    
    // 3. クライアントサイド (ブラウザ)
    if (typeof window !== 'undefined') {
        /**
         * 💡 ローカル環境でブラウザから直接叩く場合も考慮。
         * ホスト名に tiper-host が含まれる場合は 8083 ポートを付与します。
         */
        const origin = window.location.origin;
        if (origin.includes('tiper-host')) {
            return 'http://api-tiper-host:8083';
        }
        return origin;
    }
    
    // 4. 最終的なフォールバック
    return 'http://api-tiper-host:8083';
};

// 設定値の確定
const djangoBase = getDjangoBaseUrl();
const wpConfig = getWpConfig();

/**
 * 💡 API 統合設定オブジェクト
 */
export const API_CONFIG = {
    djangoBase: djangoBase,
    // Django通信時に必要なHostヘッダーを保持（Traefik用）
    djangoHost: 'api-tiper-host',
    wp: wpConfig,
    timeout: 10000,
};

/**
 * 🔍 デバッグ情報の出力 (ブラウザのF12コンソール用)
 */
if (!IS_SERVER) {
    console.group("%c🚀 API CONFIG DEBUG", "color: white; background: #333; padding: 4px; border-radius: 4px;");
    console.log("%cDjango Base URL:", "color: #00ff00; font-weight: bold;", API_CONFIG.djangoBase);
    console.log("%cDjango Host Header:", "color: #00ff00;", API_CONFIG.djangoHost);
    console.log("%cWordPress Base URL:", "color: #00bfff; font-weight: bold;", API_CONFIG.wp.baseUrl);
    console.log("%cWordPress Host:", "color: #00bfff;", API_CONFIG.wp.host);
    console.log("%cSite Key:", "color: #ff8c00; font-weight: bold;", API_CONFIG.wp.siteKey);
    console.groupEnd();
}