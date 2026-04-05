/**
 * =====================================================================
 * 🌍 API 環境設定 (shared/lib/api/config.ts)
 * 🛡️ SHIN-VPS v5.3 [Internal Routing via Traefik Gateway]
 * =====================================================================
 */
import { getSiteMetadata } from '../utils/siteConfig';

/** 🛠️ 実行環境フラグ */
export const IS_SERVER = typeof window === 'undefined';

/**
 * 💡 API 接続設定の解決
 */
export const getWpConfig = (manualHost?: string) => {
    // 1. 識別子の特定 (最優先: 環境変数 NEXT_PUBLIC_SITE_DOMAIN)
    const identifier = manualHost || (IS_SERVER ? process.env.NEXT_PUBLIC_SITE_DOMAIN : window.location.hostname);

    // 🛰️ サイトメタデータを取得
    const meta = getSiteMetadata(identifier || "");

    /**
     * 🚀 通信先 (baseUrl) の決定
     * 提督の指示に従い、サーバーサイド(SSR)では 'api-xxx-host:8083' を使用します。
     */
    let baseUrl = meta.api_base_url;

    if (IS_SERVER) {
        // サイト名 (saving, avflash等) に応じた内部ホスト名を構築
        const siteTag = meta.site_tag; // getSiteMetadata から返される識別子
        
        // 例: api-saving-host:8083
        baseUrl = `http://api-${siteTag}-host:8083`;
    }

    return {
        /** * 🚀 物理的な通信先
         * SSR時: http://api-saving-host:8083
         * ブラウザ時: https://api.bic-saving.com (metaの値)
         */
        baseUrl: baseUrl, 

        /** * 🛡️ Django 識別用 Host 名
         * Traefik や Django が振り分けに使用する本来のドメイン名
         */
        host: meta.django_host,

        /** サイト識別用キー (saving, avflash 等) */
        siteKey: meta.site_tag
    };
};

/** 🛠️ Django 直接参照用のベースURL取得 */
export const getDjangoBaseUrl = () => getWpConfig().baseUrl;

/** 🚀 API 全体設定オブジェクト */
export const API_CONFIG = {
    get djangoBase() { return getDjangoBaseUrl(); },
    get wp() { return getWpConfig(); },
    timeout: 10000,
};