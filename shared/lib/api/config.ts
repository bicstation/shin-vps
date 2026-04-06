/**
 * =====================================================================
 * 🌍 API 環境設定 (shared/lib/api/config.ts)
 * 🛡️ SHIN-VPS v5.4 [Universal Routing: Local & VPS compatible]
 * =====================================================================
 */
import { getSiteMetadata } from '../utils/siteConfig';

/** 🛠️ 実行環境フラグ */
export const IS_SERVER = typeof window === 'undefined';

/**
 * 💡 API 接続設定の解決
 * 🚀 修正ポイント: 
 * 1. サーバーサイド(SSR)通信先を Compose の alias (django-api-host) に統合
 * 2. クエリパラメータ ?site=xxx を自動付与し、Django ViewSet の判定を盤石化
 * 3. ポート番号を Compose (8000) と ローカル (8000) に完全同期
 */
export const getWpConfig = (manualHost?: string) => {
    // 1. 識別子の特定
    const identifier = manualHost || (IS_SERVER ? process.env.NEXT_PUBLIC_SITE_DOMAIN : window.location.hostname);

    // 🛰️ サイトメタデータを取得 (siteConfig.ts から site_tag: 'saving' 等を取得)
    const meta = getSiteMetadata(identifier || "");
    const siteTag = meta.site_tag || 'bicstation';

    /**
     * 🚀 通信先 (baseUrl) の決定
     * SSR(サーバー側) か ブラウザ(クライアント側) かで切り替え
     */
    let baseUrl = meta.api_base_url; // デフォルトはブラウザ用 (https://api.xxx.com/api)

    if (IS_SERVER) {
        /**
         * 🛡️ サーバーサイド (Next.jsコンテナ内) からの通信
         * VPS: http://django-api-host:8000/api
         * ローカル: http://localhost:8000/api (環境変数で上書き可能)
         */
        const internalHost = process.env.INTERNAL_API_URL || 'http://django-api-host:8000/api';
        
        // 🚨 重要: Django ViewSet の get_queryset 判定を確実に通すため
        // クエリパラメータに site 識別子を強制付与して通信
        baseUrl = `${internalHost}${internalHost.includes('?') ? '&' : '?'}site=${siteTag}`;
    }

    return {
        /** * 🚀 物理的な通信先
         * SSR時: http://django-api-host:8000/api?site=saving
         * ブラウザ時: https://api.bic-saving.com/api
         */
        baseUrl: baseUrl, 

        /** * 🛡️ Django 識別用 Host 名 (ヘッダー用)
         */
        host: meta.django_host || `${siteTag}.com`,

        /** サイト識別用キー (saving, tiper, avflash, bicstation) */
        siteKey: siteTag
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