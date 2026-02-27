/**
 * =====================================================================
 * 🌍 API 環境設定 (shared/components/lib/api/config.ts)
 * 3つのドメイン系統（BicStation / Saving / Tiper・AVFLASH）完全対応版
 * =====================================================================
 */
import { getSiteMetadata } from '../../lib/siteConfig';

export const IS_SERVER = typeof window === 'undefined';

/**
 * 📝 ドメインとHostヘッダー・サイトキーの対応定義
 */
const DOMAIN_MAP: Record<string, { host: string; siteKey: string }> = {
    // ① BicStation系統
    'b-bicstation-host': { host: 'b-bicstation-host', siteKey: 'station' },
    'bicstation-host':   { host: 'b-bicstation-host', siteKey: 'station' },
    'blog.bicstation.com': { host: 'b-bicstation-host', siteKey: 'station' },
    'bicstation.com':      { host: 'b-bicstation-host', siteKey: 'station' },

    // ② 節約ブログ系統 (saving)
    'b-bic-saving-host': { host: 'b-saving-host', siteKey: 'saving' },
    'saving-host':       { host: 'b-saving-host', siteKey: 'saving' },
    'blog.bic-saving.com': { host: 'b-saving-host', siteKey: 'saving' },
    'bic-saving.com':      { host: 'b-saving-host', siteKey: 'saving' },

    // ③ TIPER / AVFLASH 系統
    'b-tiper-host':    { host: 'b-tiper-host', siteKey: 'tiper' },
    'tiper-host':      { host: 'b-tiper-host', siteKey: 'tiper' },
    'blog.tiper.live': { host: 'b-tiper-host', siteKey: 'tiper' },
    'tiper.live':      { host: 'b-tiper-host', siteKey: 'tiper' },
    'avflash.xyz':     { host: 'b-tiper-host', siteKey: 'avflash' },
};

export const getWpConfig = () => {
    // 閲覧中のホスト名を取得
    const hostname = !IS_SERVER ? window.location.hostname : '';
    const metadata = getSiteMetadata();
    const prefix = (metadata?.site_prefix || '').replace(/\//g, '');

    // マップから設定を取得（見つからない場合はtiperをデフォルトに）
    const config = DOMAIN_MAP[hostname] || DOMAIN_MAP[prefix] || DOMAIN_MAP['b-tiper-host'];

    let baseUrl = '';
    if (IS_SERVER) {
        // SSR時はDocker内部ネットワークへ
        baseUrl = 'http://nginx-wp-v2:80';
    } else {
        // クライアント側はブラウザのOrigin（/genを含まない）を使用
        baseUrl = window.location.origin;
    }

    return {
        baseUrl,
        host: config.host,
        siteKey: config.siteKey
    };
};

export const getDjangoBaseUrl = () => {
    const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envApiUrl) return envApiUrl.replace(/\/api\/?$/, '');

    if (IS_SERVER) return 'http://api-tiper-host:8083';

    if (typeof window !== 'undefined') {
        const origin = window.location.origin;
        if (origin.includes('-host')) {
            const url = new URL(origin);
            return `${url.protocol}//${url.hostname}:8083`;
        }
        return origin;
    }
    return 'http://api-tiper-host:8083';
};

export const API_CONFIG = {
    get djangoBase() { return getDjangoBaseUrl(); },
    djangoHost: 'api-tiper-host',
    get wp() { return getWpConfig(); },
    timeout: 10000,
};