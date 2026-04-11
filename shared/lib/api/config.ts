/**
 * =====================================================================
 * 🌍 API 環境設定 (shared/lib/api/config.ts)
 * 🛡️ SHIN-VPS v5.5 [Universal Routing: Local & VPS compatible]
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【ポート競合解消】内部通信を 8000 ポートに完全固定し、8083 への漏れを防止。
 * 2. 【クエリ重複防止】baseUrl 側での ?site= 付与を廃止。client.ts 側に集約。
 * 3. 【正規化】末尾スラッシュを徹底的に除去し、エンドポイント結合時のバグを排除。
 * =====================================================================
 */
import { getSiteMetadata } from '../utils/siteConfig';

/** 🛠️ 実行環境フラグ */
export const IS_SERVER = typeof window === 'undefined';

/**
 * 💡 API 接続設定の解決
 */
export const getWpConfig = (manualHost?: string) => {
    // 1. 識別子 (ホスト名) の特定
    const identifier = manualHost || (IS_SERVER ? process.env.NEXT_PUBLIC_SITE_DOMAIN : window.location.hostname);

    // 🛰️ サイトメタデータを取得
    const meta = getSiteMetadata(identifier || "");
    const siteTag = meta.site_tag || 'bicstation';

    /**
     * 🚀 通信先 (baseUrl) の決定
     * 修正: ここでは「純粋なURL」のみを返し、パラメータ付与は client.ts に任せる
     */
    let baseUrl = meta.api_base_url || ""; // デフォルト

    if (IS_SERVER) {
        /**
         * 🛡️ サーバーサイド (SSR) 通信
         * 環境変数 INTERNAL_API_URL が 8083 になっていないか注意。
         * 指定がない場合は Docker ネットワーク内の django-api-host:8000 を強制。
         */
        const internalRoot = process.env.INTERNAL_API_URL 
            ? process.env.INTERNAL_API_URL.replace(/\/+$/, '')
            : 'http://django-api-host:8000/api';
        
        baseUrl = internalRoot;
    }

    // 🚨 二重スラッシュやクエリ重複を防ぐため、baseUrl をクリーンな状態に整える
    // 1. クエリパラメータが含まれている場合は、それ以前の部分を抽出（client.tsとの重複防止）
    const cleanBaseUrl = baseUrl.split('?')[0].replace(/\/+$/, '');

    return {
        /** * 🚀 物理的な通信先 (末尾スラッシュ・クエリなし)
         * SSR時: http://django-api-host:8000/api
         */
        baseUrl: cleanBaseUrl, 

        /** 🛡️ Django 識別用 Host 名 (ヘッダー用) */
        host: meta.django_host || `${siteTag}.com`,

        /** サイト識別用キー (bicstation, tiper 等) */
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