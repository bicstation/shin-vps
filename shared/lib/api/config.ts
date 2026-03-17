/**
 * =====================================================================
 * 🌍 API 環境設定 (shared/lib/api/config.ts)
 * 🛡️ Maya's Logic: v5.7.1 パス同期・二重 /api 排除版
 * =====================================================================
 */

// ✅ エイリアスパスが通らない場合、相対パス '../utils/siteConfig' に調整してください
import { getSiteMetadata } from '../utils/siteConfig';

/** 🛠️ 実行環境フラグ */
export const IS_SERVER = typeof window === 'undefined';

/** 📝 ドメインとサイトキーの対応定義 (Maya's Universe) */
const DOMAIN_MAP: Record<string, { host: string; siteKey: string }> = {
    'bicstation.com':  { host: 'bicstation.com', siteKey: 'station' },
    'bic-saving.com':  { host: 'bic-saving.com', siteKey: 'saving' },
    'tiper.live':      { host: 'tiper.live', siteKey: 'tiper' },
    'avflash.xyz':     { host: 'avflash.xyz', siteKey: 'avflash' },
    'localhost':       { host: 'tiper.live', siteKey: 'tiper' }, 
};

/**
 * 💡 API 接続設定の解決
 * baseUrl には "/api" を含めず、純粋なプロトコル+ホストのみを保持します。
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
        // 🚀 Server: 内部コンテナ通信 (末尾の /api を除去)
        const rawUrl = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://django-v3:8000';
        baseUrl = rawUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
    } else {
        // 🌐 Client: 現在のオリジン
        baseUrl = window.location.origin;
    }

    return {
        baseUrl: baseUrl, 
        host: config.host,
        siteKey: config.siteKey
    };
};

/**
 * 🛠️ Django 直接参照用のベースURL取得 (メディア・一括置換用)
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