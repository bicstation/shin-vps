/**
 * =====================================================================
 * 🛰️ SHIN-VPS 統合 API ゲートウェイ (shared/lib/api/index.ts)
 * 🛡️ Maya's Zenith v6.0: master.ts 廃止・分散定義完全同期版
 * =====================================================================
 */

import { IS_SERVER as SERVER_CHECK } from './config';
import * as adultApi from './django/adult';
import * as pcApi from './django/pc';
import * as bridgeApi from './django-bridge';
// 🚀 master.ts は廃止されたためインポートしません

export const IS_SERVER = SERVER_CHECK;

/**
 * 📰 1. ニュース・記事・統合ハブ (bridgeApi)
 */
export const {
    fetchNewsArticles,
    fetchPostData,
    fetchDjangoBridgeContent,
    fetchPostList
} = bridgeApi;

// ✅ エラー対策: getWpFeaturedImage を明示的に export
export function getWpFeaturedImage(post: any, size: 'thumbnail' | 'medium' | 'large' | 'full' = 'large'): string {
    if (!post?._embedded?.['wp:featuredmedia']?.[0]) {
        return '/images/common/no-image.jpg';
    }
    const media = post._embedded['wp:featuredmedia'][0];
    return media.media_details?.sizes?.[size]?.source_url || media.source_url;
}

/** 互換用エイリアス */
export const getSiteMainPosts = (
    postType: string = 'post',
    limit: number = 12,
    offset: number = 0,
    project?: string
) => bridgeApi.fetchPostList(postType, limit, offset, project);

/**
 * 🔞 2. アダルト・出会い・求人 API (adultApi)
 */
export const {
    getUnifiedProducts,
    getAdultProductDetail,
    getAdultNavigationFloors,
    fetchAdultTaxonomyIndex,
    fetchActresses,
    // 🚀 今後ここに出会い系 (fetchMatching) や 求人 (fetchJobs) を追加していく
} = adultApi;

export const fetchUnifiedProducts = adultApi.getUnifiedProducts;

/**
 * 💻 3. PC・ランキング専用 API (pcApi)
 */
export const {
    fetchPCProducts,
    fetchPCProductDetail,
    fetchPCProductRanking,
    fetchPCSidebarStats,
    // ✅ エラー対策: ページ側が探している関数を追加 (実体があれば)
    fetchRelatedProducts,
    fetchPCPopularityRanking 
} = pcApi;

export const getPCProducts = pcApi.fetchPCProducts;

/**
 * 🏷️ 4. 共通マスターデータ (旧 masterApi 内容の振り分け先)
 * 各ファイルから必要なマスタ取得関数を個別に export します
 */
// アダルト系のマスタは adultApi から
export const {
    fetchGenres,
    fetchMakers,
    fetchSeries,
    fetchLabels,
    fetchDirectors,
} = adultApi;

// PC系・共通のマスタは pcApi または common 等から (必要に応じて)
export const {
    fetchAuthors
} = pcApi; 

/**
 * 🛠️ 5. エラー回避用エイリアス (masterApi 未定義エラー対策)
 * ページ側で `import { masterApi }` と書かれている箇所を救済します
 */
export const masterApi = {
    fetchGenres,
    fetchMakers,
    fetchSeries,
    fetchLabels,
    fetchDirectors,
    fetchAuthors,
    // 必要ならここに他をリレー
};

/**
 * 🔄 6. 型定義の統合
 */
export * from './types';