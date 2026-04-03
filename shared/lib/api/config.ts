/**
 * =====================================================================
 * 🌍 API 環境設定 (shared/lib/api/config.ts)
 * 🛡️ Maya's Logic: Single Truth (siteConfig 依存) 統合版
 * =====================================================================
 * 🚀 修正ポイント:
 * 1. 独自判定を廃止し、getSiteMetadata() の結果に全責任を持たせました。
 * 2. サーバーサイド(SSR)とクライアントサイドで baseUrl / Host を自動同期。
 * 3. 二重パス (/api/api) の発生源を根本から遮断。
 * =====================================================================
 */
import { getSiteMetadata } from '../utils/siteConfig';

/** 🛠️ 実行環境フラグ */
export const IS_SERVER = typeof window === 'undefined';

/**
 * 💡 API 接続設定の解決
 * siteConfig.ts (v19.5+) で確定された「django_host」と「api_base_url」を
 * Next.js の通信用設定としてパッケージングします。
 */
export const getWpConfig = (manualHost?: string) => {
    // 🛰️ 唯一の真実であるサイトメタデータを取得
    const meta = getSiteMetadata(manualHost);

    return {
        /** * 🚀 物理的な通信先 (http://django-v3:8000 または https://api.xxx)
         * siteConfig 側で既に末尾の /api は除去済みです。
         */
        baseUrl: meta.api_base_url, 

        /** * 🛡️ Django Middleware 判定用の Host 名
         * ローカルなら 'api-avflash-host'、本番なら 'api.avflash.xyz' が自動で入ります。
         */
        host: meta.django_host,

        /** サイト識別用キー */
        siteKey: meta.site_tag
    };
};

/**
 * 🛠️ Django 直接参照用のベースURL取得
 */
export const getDjangoBaseUrl = () => {
    const config = getWpConfig();
    return config.baseUrl;
};

/**
 * 🚀 API 全体設定オブジェクト
 * 💡 djangoHost は固定値ではなく、実行時に動的に解決される getWpConfig().host を使用してください。
 */
export const API_CONFIG = {
    get djangoBase() { return getDjangoBaseUrl(); },
    // 🚩 djangoHost の直接指定は廃止し、wp.host を参照することを推奨
    get wp() { return getWpConfig(); },
    timeout: 10000,
};