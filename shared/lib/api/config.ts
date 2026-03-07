/**
 * =====================================================================
 * 🌍 API 環境設定 (shared/lib/api/config.ts)
 * 🛡️ Maya's Logic: v3 統合・「b-」「blog.」ドメイン矛盾の完全抹殺
 * =====================================================================
 * 【責務】
 * 1. 実行環境（SSR or Client）に応じたベースURLの切り替え
 * 2. ホスト名に基づくサイト識別（Hostヘッダー、サイトキー）の定義
 * 3. 内部コンテナ通信（django-v3:8000）の優先解決
 * =====================================================================
 */

/**
 * ✅ 修正: 物理パスに合わせて階層とエイリアスを正当化
 * 物理パス: shared/lib/utils/siteConfig.ts
 */
import { getSiteMetadata } from '@shared/lib/utils/siteConfig';

/** * 🛠️ 実行環境フラグ
 * window オブジェクトの有無で、Node.jsサーバーかブラウザかを判定します。
 */
export const IS_SERVER = typeof window === 'undefined';

/**
 * 📝 ドメインとサイトキーの対応定義 (Maya's Universe)
 * 旧世代の「blog.」や「b-」サブドメインを排除し、メインドメインに集約。
 * Hostヘッダーとして Django 側に渡すための正解データです。
 */
const DOMAIN_MAP: Record<string, { host: string; siteKey: string }> = {
    // ① BicStation (PC/ガジェット情報)
    'bicstation-host': { host: 'bicstation.com', siteKey: 'station' },
    'bicstation.com':  { host: 'bicstation.com', siteKey: 'station' },

    // ② 節約ブログ (Bic Saving)
    'saving-host':     { host: 'bic-saving.com', siteKey: 'saving' },
    'bic-saving.com':  { host: 'bic-saving.com', siteKey: 'saving' },

    // ③ TIPER (ライフスタイル総合)
    'tiper-host':      { host: 'tiper.live', siteKey: 'tiper' },
    'tiper.live':      { host: 'tiper.live', siteKey: 'tiper' },

    // ④ AVFLASH (レビュー・エンタメ)
    'avflash-host':    { host: 'avflash.xyz', siteKey: 'avflash' },
    'avflash.xyz':     { host: 'avflash.xyz', siteKey: 'avflash' },
};

/**
 * 💡 WordPress / Django API 接続設定の解決
 * 現在のホスト環境から、接続すべき API のベースURLと Host ヘッダーを導き出します。
 */
export const getWpConfig = () => {
    // サーバーサイドでは location が使えないため、siteConfig のメタデータから逆引きを試みる
    // 引数なしの場合、siteConfig 側で環境変数等を元に解決される想定
    const metadata = getSiteMetadata();
    const siteName = (metadata?.site_name || '').replace(/\s+/g, '').toLowerCase();
    
    // 現在のホスト名（ブラウザ時のみ）
    const hostname = !IS_SERVER ? window.location.hostname : '';

    /**
     * 🔍 Config の決定優先順位:
     * 1. 現在のホスト名 (Client)
     * 2. siteMetadata のサイト名 (Server/Client)
     * 3. デフォルト (tiper.live)
     */
    const config = DOMAIN_MAP[hostname] || 
                   DOMAIN_MAP[Object.keys(DOMAIN_MAP).find(k => k.includes(siteName)) || ''] || 
                   DOMAIN_MAP['tiper.live'];

    let baseUrl = '';
    
    if (IS_SERVER) {
        /**
         * 🚀 Server Side (SSR/ISR): 爆速の内部コンテナ通信
         * nginx-wp-v2 などの旧プロキシを経由せず、直接 Django サービス名を叩くことで
         * EAI_AGAIN (DNS解決エラー) やレイテンシを完全に回避します。
         */
        baseUrl = process.env.API_INTERNAL_URL || 'http://django-v3:8000/api';
    } else {
        /**
         * 🌐 Client Side: ブラウザからのアクセス
         * Origin を使用することで、現在のドメイン配下のプロキシパス経由で API を叩きます。
         */
        baseUrl = window.location.origin + '/api';
    }

    return {
        baseUrl: baseUrl.replace(/\/$/, ''), // 末尾スラッシュを除去
        host: config.host,
        siteKey: config.siteKey
    };
};

/**
 * 🛠️ Django 直接参照用のベースURL取得
 * メディアファイルや認証、カスタムエンドポイント用。
 */
export const getDjangoBaseUrl = () => {
    // 環境変数があれば最優先
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '');
    }
    
    // SSR 時は内部コンテナ、Client 時は Origin
    if (IS_SERVER) return 'http://django-v3:8000';
    return window.location.origin;
};

/**
 * 🚀 API 全体設定オブジェクト
 */
export const API_CONFIG = {
    get djangoBase() { return getDjangoBaseUrl(); },
    
    // 内部的な Django 通信用識別子
    djangoHost: 'api-tiper-host', 
    
    // 設定取得関数をラップして提供
    get wp() { return getWpConfig(); },
    
    // タイムアウト設定 (ms)
    timeout: 10000,
};