// @ts-nocheck
/**
 * =====================================================================
 * 🌍 API 接続基盤設定 (Zenith v12.5 - Single Truth Infrastructure)
 * =====================================================================
 * 🛡️ [鋼鉄の導線：地盤セクション]
 * このファイルは「どこに物理的なサーバーがあるか」を確定させる役割を持ちます。
 * * 🗺️ 通信ルートの可視化:
 * [入口] Next.js SSR/Client
 * ↓
 * [判定] config.ts: getWpConfig() -> baseUrl を確定 (http://django-v3:8000/api)
 * ↓
 * [結合] client.ts: resolveApiUrl() -> Prefixを付与 (/api/general/...)
 * ↓
 * [出口] Django API
 * =====================================================================
 */

import { getSiteMetadata } from '../utils/siteConfig';

/** 🛠️ 実行環境フラグ (Node.js 上かブラウザ上か) */
export const IS_SERVER = typeof window === 'undefined';

/**
 * 💡 API 接続設定の解決 (Base URL Resolver)
 * ---------------------------------------------------------------------
 * 役割: クエリやパスを一切持たない「純粋な基底URL」のみを特定する。
 * 注意: ここで /general や /bs を付与してはいけない（client.ts の役割）。
 * ---------------------------------------------------------------------
 */
export const getWpConfig = (manualHost?: string) => {
    // 1. 識別子 (ホスト名) の特定
    // SSR時は環境変数を、Client時はブラウザのURLを優先。
    const identifier = manualHost || (IS_SERVER ? process.env.NEXT_PUBLIC_SITE_DOMAIN : window.location.hostname);

    // 2. サイトメタデータを取得 (siteConfig.ts から「地図」を借りる)
    const meta = getSiteMetadata(identifier || "");
    const siteTag = meta.site_tag || 'bicstation';

    /**
     * 🚀 通信先 (baseUrl) の決定ロジック
     * -----------------------------------------------------------------
     * SSR (Server Side Rendering): Dockerネットワーク内での直接通信。
     * Client (Browser): インターネット越し（https://...）の通信。
     * -----------------------------------------------------------------
     */
    let baseUrl = meta.api_base_url || ""; // デフォルトは siteConfig の算出値を信頼

    if (IS_SERVER) {
        /**
         * 🛡️ サーバーサイド (SSR) 通信の強制ルール
         * 1. INTERNAL_API_URL (環境変数) があれば最優先。
         * 2. なければ Docker コンテナ名 'django-v3' (8000ポート) を使用。
         * 🚨 注意: ここで 8083 に流れるのを防ぐため、デフォルトを 8000 に固定。
         */
        const internalRoot = process.env.INTERNAL_API_URL 
            ? process.env.INTERNAL_API_URL.replace(/\/+$/, '')
            : 'http://django-v3:8000/api'; // コンテナ名を最新の django-v3 に固定
        
        baseUrl = internalRoot;
    }

    /**
     * 🚨 [正規化] 徹底的なクリーンアップ
     * 二重スラッシュ、末尾スラッシュ、予期せぬクエリパラメータをここで排除。
     * client.ts がパスを結合する際の「純粋な土台」を作る。
     */
    const cleanBaseUrl = baseUrl
        .split('?')[0]           // クエリが含まれていたら除去
        .replace(/\/+$/, '')     // 末尾のスラッシュを全削除
        .replace(/\/api$/, '');  // 末尾が /api なら一旦除去（結合時に再度付与するため）

    return {
        /** * 🚀 物理的な通信先 (末尾スラッシュ・クエリ・Prefixなし)
         * 例: http://django-v3:8000
         */
        baseUrl: `${cleanBaseUrl}/api`, // 常に /api で終わる形に整える

        /** 🛡️ Django 識別用 Host 名 (HTTPヘッダー Host: 用) */
        host: meta.django_host || `${siteTag}.com`,

        /** サイト識別用タグ (bicstation, saving 等) */
        siteKey: siteTag,

        /** Django側の入り口接頭辞 (general, bs 等) */
        sitePrefix: meta.site_prefix
    };
};

/** 🛠️ Django 直接参照用のベースURL取得エイリアス */
export const getDjangoBaseUrl = () => getWpConfig().baseUrl;

/** 🚀 API 全体設定オブジェクト */
export const API_CONFIG = {
    // get アクセサにすることで、呼び出し時の最新 meta 状態を反映させる
    get djangoBase() { return getDjangoBaseUrl(); },
    get wp() { return getWpConfig(); },
    timeout: 10000,
};