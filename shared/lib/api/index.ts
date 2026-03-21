/**
 * =====================================================================
 * 🛰️ SHIN-VPS 統合 API ゲートウェイ (shared/lib/api/index.ts)
 * 🛡️ Maya's Zenith v5.9: 接続性・引数透過性 最大化版
 * =====================================================================
 */

// 1. 基盤・設定のインポート
import { IS_SERVER as SERVER_CHECK } from './config';
import * as adultApi from './django/adult';
import * as pcApi from './django/pc';
import * as masterApi from './django/master';
import * as bridgeApi from './django-bridge';

/**
 * 🔗 1. 定数・環境フラグ
 */
export const IS_SERVER = SERVER_CHECK;

/**
 * 📰 2. ニュース・記事・統合ハブ (bridgeApi)
 * 🚀 ポイント: 分割代入による固定化を避け、透過的にリレーします
 */
export const {
    fetchNewsArticles,
    fetchPostData,
    fetchDjangoBridgeContent,
    fetchPostList
} = bridgeApi;

/**
 * 💡 互換用エイリアス: getSiteMainPosts
 * 引数 `project` (第4引数) を確実に Django-Bridge へ渡すためのラッパー
 */
export const getSiteMainPosts = (
    postType: string = 'post',
    limit: number = 12,
    offset: number = 0,
    project?: string // 🚀 これが Page.tsx からの 'bicstation' を受け取る！
) => bridgeApi.fetchPostList(postType, limit, offset, project);

/**
 * 🔞 3. アダルト専用 API (adultApi)
 */
export const {
    getUnifiedProducts,
    getAdultProductDetail,
    getAdultNavigationFloors,
    fetchAdultTaxonomyIndex,
    fetchActresses,
} = adultApi;

export const fetchUnifiedProducts = adultApi.getUnifiedProducts;

/**
 * 💻 4. PC・ランキング専用 API (pcApi)
 */
export const {
    fetchPCProducts,
    fetchPCProductDetail,
    fetchPCProductRanking,
    fetchPCSidebarStats
} = pcApi;

export const getPCProducts = pcApi.fetchPCProducts;

/**
 * 🏷️ 5. 共通マスターデータ (masterApi)
 */
export const {
    fetchGenres,
    fetchMakers,
    fetchSeries,
    fetchLabels,
    fetchDirectors,
    fetchAuthors
} = masterApi;

/**
 * 🛠️ 6. WordPress 互換レイヤー & ユーティリティ
 */

/** 🖼️ WPアイキャッチ画像解決 */
export function getWpFeaturedImage(post: any, size: 'thumbnail' | 'medium' | 'large' | 'full' = 'large'): string {
    if (!post?._embedded?.['wp:featuredmedia']?.[0]) {
        return '/images/common/no-image.jpg';
    }
    const media = post._embedded['wp:featuredmedia'][0];
    return media.media_details?.sizes?.[size]?.source_url || media.source_url;
}

/**
 * 🔄 7. 型定義の統合
 */
export * from './types';