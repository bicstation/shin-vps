/**
 * =====================================================================
 * 🌍 API 環境設定 (shared/lib/api/config.ts)
 * 🛡️ Maya's Logic: v3 統合・環境変数からの /api 排除・完全クリーン版
 * =====================================================================
 * 【責務】
 * 1. 実行環境（SSR or Client）に応じたベースURLの切り替え
 * 2. 環境変数に頼らない、コード主導の "/api" パス付与
 * 3. 内部コンテナ通信（django-v3:8000）の優先解決
 * =====================================================================
 */

import { getSiteMetadata } from '@shared/lib/utils/siteConfig';

/** * 🛠️ 実行環境フラグ
 */
export const IS_SERVER = typeof window === 'undefined';

/**
 * 📝 ドメインとサイトキーの対応定義 (Maya's Universe)
 */
const DOMAIN_MAP: Record<string, { host: string; siteKey: string }> = {
    'bicstation-host': { host: 'bicstation.com', siteKey: 'station' },
    'bicstation.com':  { host: 'bicstation.com', siteKey: 'station' },
    'saving-host':     { host: 'bic-saving.com', siteKey: 'saving' },
    'bic-saving.com':  { host: 'bic-saving.com', siteKey: 'saving' },
    'tiper-host':      { host: 'tiper.live', siteKey: 'tiper' },
    'tiper.live':      { host: 'tiper.live', siteKey: 'tiper' },
    'avflash-host':    { host: 'avflash.xyz', siteKey: 'avflash' },
    'avflash.xyz':     { host: 'avflash.xyz', siteKey: 'avflash' },
};

/**
 * 💡 WordPress / Django API 接続設定の解決
 */
export const getWpConfig = () => {
    const metadata = getSiteMetadata();
    const siteName = (metadata?.site_name || '').replace(/\s+/g, '').toLowerCase();
    const hostname = !IS_SERVER ? window.location.hostname : '';

    const config = DOMAIN_MAP[hostname] || 
                   DOMAIN_MAP[Object.keys(DOMAIN_MAP).find(k => k.includes(siteName)) || ''] || 
                   DOMAIN_MAP['tiper.live'];

    let baseUrl = '';
    
    if (IS_SERVER) {
        /**
         * 🚀 Server Side (SSR/ISR): 爆速の内部コンテナ通信
         * 環境変数 API_INTERNAL_URL または NEXT_PUBLIC_API_URL からホストを取得。
         * 末尾の /api を除去した上で、コード側で確実に "/api" を付与します。
         */
        const rawUrl = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://django-v3:8000';
        const cleanHost = rawUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
        baseUrl = `${cleanHost}/api`;
    } else {
        /**
         * 🌐 Client Side: ブラウザからのアクセス
         * Traefik (8083) を経由するため、現在の Origin に /api を付与。
         */
        baseUrl = window.location.origin + '/api';
    }

    return {
        baseUrl: baseUrl.replace(/\/$/, ''), // 二重スラッシュ防止
        host: config.host,
        siteKey: config.siteKey
    };
};

/**
 * 🛠️ Django 直接参照用のベースURL取得 (メディア・認証用)
 * 環境変数から /api を除いた「純粋なホスト」を返します。
 */
export const getDjangoBaseUrl = () => {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || '';
    
    if (rawUrl) {
        return rawUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
    }
    
    if (IS_SERVER) return 'http://django-v3:8000';
    return window.location.origin;
};

/**
 * 🚀 API 全体設定オブジェクト
 */
export const API_CONFIG = {
    get djangoBase() { return getDjangoBaseUrl(); },
    djangoHost: 'api-tiper-host', 
    get wp() { return getWpConfig(); },
    timeout: 10000,
};