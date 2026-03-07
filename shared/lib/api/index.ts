/**
 * =====================================================================
 * 🛰️ SHIN-VPS 統合 API ゲートウェイ (shared/lib/api/index.ts)
 * 🛡️ Maya's Zenith v3.7: 個別明示エクスポートによる「is not a function」完全封殺版
 * =====================================================================
 */
import { getSiteMetadata } from '../utils/siteConfig';

// 🚀 本体のロジックを一度すべてインポート
import * as adultApi from './django/adult';

/**
 * 🔗 1. 接続設定解決
 */
const IS_SERVER = typeof window === 'undefined';

export const getApiConfig = () => {
    const site = getSiteMetadata();
    const hostHeader = site.origin_domain || 'localhost';

    if (IS_SERVER) {
        // ✅ Djangoコンテナへの直接通信用ベースURL（末尾に /api を含めない）
        return {
            baseUrl: 'http://django-v3:8000',
            host: hostHeader
        };
    }
    // クライアントサイド (ブラウザ) 通信
    const envUrl = process.env.NEXT_PUBLIC_API_URL || '';
    return {
        baseUrl: envUrl.replace(/\/$/, '') || '/api',
        host: hostHeader
    };
};

/**
 * 🔞 2. アダルト統合ロジックの「個別・明示」エクスポート
 * 💡 修正の核心:
 * まとめて re-export せず、1つずつ変数に代入してエクスポートすることで、
 * Next.jsのビルドチャンク（chunks/xxx.js）内での未定義エラーを物理的に阻止します。
 */
export const getUnifiedProducts = adultApi.getUnifiedProducts;
export const getAdultProductDetail = adultApi.getAdultProductDetail;
export const getAdultNavigationFloors = adultApi.getAdultNavigationFloors; // ⚡ ログの犯人を個別確保
export const fetchAdultTaxonomyIndex = adultApi.fetchAdultTaxonomyIndex;
export const fetchGenres = adultApi.fetchGenres;
export const fetchMakers = adultApi.fetchMakers;
export const fetchActresses = adultApi.fetchActresses;
export const fetchSeries = adultApi.fetchSeries;

// 互換性維持のためのエイリアス
export const fetchUnifiedProducts = adultApi.getUnifiedProducts;

/**
 * 🛠️ 3. 共通 Fetch ラッパー
 */
async function fetchFromBridge(endpoint: string, options: any = {}) {
    const { baseUrl, host } = getApiConfig();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;

    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                'Host': host,
                'Accept': 'application/json',
                ...(options.headers || {}),
            }
        });

        if (!res.ok) {
            console.error(`[Bridge] HTTP_${res.status}: ${url}`);
            return { data: null, status: res.status };
        }
        const data = await res.json();
        return { data, status: 200 };
    } catch (e) {
        console.error(`[Bridge] Network Error: ${e}`);
        return { data: null, error: e };
    }
}

/**
 * 💻 4. PC製品 (BicStation用)
 */
export async function getPCProducts(params: any = {}) {
    const query = new URLSearchParams({
        limit: (params.limit || 10).toString(),
        offset: (params.offset || 0).toString(),
    });
    
    // ✅ Django v3 エンドポイントに合わせて /api プレフィックスを付与
    const { data } = await fetchFromBridge(`/api/pc-products/?${query.toString()}`, {
        next: { revalidate: 3600 }
    });
    return { results: data?.results || [], count: data?.count || 0 };
}

/**
 * 🛠️ 5. WordPress 連携 (Intelligence Reports)
 */
export async function getSiteMainPosts(offset = 0, perPage = 6, postType = 'posts') {
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
 */
export * from './types';