/**
 * =====================================================================
 * 🌍 API 環境設定 (shared/lib/api/config.ts)
 * 3つのブログ系統（tiper統合 / saving / bicstation）を正しく振り分け
 * =====================================================================
 */
import { getSiteMetadata } from '../siteConfig';

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
         * avflash は tiper に統合するため、ここをデフォルトにします。
         * Hostヘッダーを b-tiper-host に固定することで、Nginx側での404を回避します。
         */
        siteKey = 'tiper';
        hostHeader = 'b-tiper-host';
    }

    let baseUrl = '';

    if (IS_SERVER) {
        // SSR: Next.js サーバーコンテナから Nginx コンテナへ直接通信
        // ポートは内部ネットワークの 80 を使用
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
        // 末尾の /api を除いたベース部分のみを返す
        return envApiUrl.replace(/\/api\/?$/, '');
    }

    // 2. サーバーサイド (SSR)
    if (IS_SERVER) {
        // docker-compose 内のサービス名で直接通信
        return 'http://django-v2:8000';
    }
    
    // 3. クライアントサイド (ブラウザ)
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    
    // 4. 最終的なフォールバック
    return 'http://localhost:8083';
};