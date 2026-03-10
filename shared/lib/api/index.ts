/**
 * =====================================================================
 * 🛰️ SHIN-VPS 統合 API ゲートウェイ (shared/lib/api/index.ts)
 * 🛡️ Maya's Zenith v3.9: Bridge統合・WP維持・型エラー封殺版
 * =====================================================================
 */
import { getSiteMetadata } from '../utils/siteConfig';

// 🚀 ロジックのインポート
import * as adultApi from './django/adult';
import * as bridgeApi from './django-bridge';

/**
 * 🔗 1. 接続設定解決
 */
export const IS_SERVER = typeof window === 'undefined';

export const getApiConfig = () => {
    const site = getSiteMetadata();
    const hostHeader = site.origin_domain || 'localhost';

    if (IS_SERVER) {
        return {
            baseUrl: 'http://django-v3:8000',
            host: hostHeader
        };
    }
    const envUrl = process.env.NEXT_PUBLIC_API_URL || '';
    return {
        baseUrl: envUrl.replace(/\/$/, '') || '/api',
        host: hostHeader
    };
};

/**
 * 📰 2. ニュース記事 & コンテンツ統合 (BicStation News / MD移行準備)
 * 💡 django-bridge 側の最適化されたロジックを明示的にエクスポート
 */
export const fetchNewsArticles = bridgeApi.fetchNewsArticles;
export const fetchPostData = bridgeApi.fetchPostData;
export const fetchDjangoBridgeContent = bridgeApi.fetchDjangoBridgeContent;

/**
 * 🔞 3. アダルト統合ロジック
 */
export const getUnifiedProducts = adultApi.getUnifiedProducts;
export const getAdultProductDetail = adultApi.getAdultProductDetail;
export const getAdultNavigationFloors = adultApi.getAdultNavigationFloors;
export const fetchAdultTaxonomyIndex = adultApi.fetchAdultTaxonomyIndex;
export const fetchGenres = adultApi.fetchGenres;
export const fetchMakers = adultApi.fetchMakers;
export const fetchActresses = adultApi.fetchActresses;
export const fetchSeries = adultApi.fetchSeries;
export const fetchUnifiedProducts = adultApi.getUnifiedProducts; // Alias

/**
 * 💻 4. PC製品 (BicStation用)
 * 💡 Bridge経由に差し替えることで URL置換ロジックを適用
 */
export const getPCProducts = bridgeApi.fetchPCProducts;

/**
 * 🛠️ 5. WordPress 連携 & 互換レイヤー
 * 💡 既存の WP 依存パーツも完全に維持します
 */
export async function getWpPosts(offset = 0, perPage = 6, postType = 'posts') {
    const { baseUrl, host } = getApiConfig();
    const url = `${baseUrl}/wp-json/wp/v2/${postType}?_embed&per_page=${perPage}&offset=${offset}`;

    try {
        const res = await fetch(url, {
            headers: { 'Host': host },
            next: { revalidate: 60 }
        });
        if (!res.ok) return { results: [], count: 0 };
        const data = await res.json();
        const total = parseInt(res.headers.get('X-WP-Total') || '0', 10);
        return { results: Array.isArray(data) ? data : [], count: total };
    } catch (e) {
        return { results: [], count: 0 };
    }
}

/**
 * 💡 getSiteMainPosts は将来的に MD/Django記事へスイッチできるよう 
 * Bridge 側の fetchPostList をエイリアスとして採用しつつ、WP機能も内部で保持
 */
export const getSiteMainPosts = bridgeApi.fetchPostList;

/** 🖼️ WPアイキャッチ画像解決 */
export function getWpFeaturedImage(post: any, size: 'thumbnail' | 'medium' | 'large' | 'full' = 'large'): string {
    if (!post?._embedded?.['wp:featuredmedia']?.[0]) {
        return '/images/common/no-image.jpg';
    }
    const media = post._embedded['wp:featuredmedia'][0];
    return media.media_details?.sizes?.[size]?.source_url || media.source_url;
}

/**
 * 🔄 6. 型定義の統合
 * 💡 ここで MakerCount 等が export されるため、bridge.ts のエラーが解消されます
 */
export * from './types';