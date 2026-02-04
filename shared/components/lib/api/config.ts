/**
 * =====================================================================
 * 🌍 API 環境設定 (shared/lib/api/config.ts)
 * ローカル(Traefik/Docker) と VPS(本番ドメイン) の通信差分を吸収
 * =====================================================================
 */
import { getSiteMetadata } from '../siteConfig';

// サーバーサイド判定
export const IS_SERVER = typeof window === 'undefined';

/**
 * 📝 WordPress接続用の設定を取得
 */
export const getWpConfig = () => {
    // 💡 防御的プログラミング: metadataが取れない場合のフォールバック
    const metadata = getSiteMetadata();
    const site_prefix = metadata?.site_prefix || '';
    
    // "/tiper/" から "tiper" を抽出
    const rawKey = site_prefix.replace(/\//g, '');
    const siteKey = rawKey || 'bicstation';
    
    // Traefikルールの Host(`b-tiper-host`) 等に合わせる（Nginx振り分け用）
    const hostHeader = `b-${siteKey}-host`; 

    let baseUrl = '';

    if (IS_SERVER) {
        // 1. SSR (Next.jsサーバーからNginxコンテナへ直接通信)
        // Dockerネットワーク名を使用。ポート80は明示。
        baseUrl = 'http://nginx-wp-v2:80'; 
    } else {
        // 2. ブラウザ (クライアント)
        // windowが存在する場合のみ location を使用。originを使うとプロトコル+ホストが一度に取れます。
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
    if (IS_SERVER) {
        // 💡 SSR: Djangoコンテナを直接(ポート8000)叩く
        // Traefikを介さないため、django.ts側で headers: { 'Host': 'localhost' } が必要
        return 'http://django-v2:8000';
    }
    
    // クライアントサイド (ブラウザ)
    if (typeof window !== 'undefined') {
        // 現在のホスト（localhost:8083 や blog.tiper.live）をベースにする
        return window.location.origin;
    }
    
    // ビルド時などのフォールバック
    return 'http://localhost:8083';
};