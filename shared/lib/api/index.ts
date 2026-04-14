// @ts-nocheck
/**
 * =====================================================================
 * 🛰️ SHIN-VPS 統合 API ゲートウェイ (v6.1 Final)
 * 🛡️ Maya's Zenith: 指揮系統の完全一本化と SSR 導線確保
 * =====================================================================
 */

import { IS_SERVER as SERVER_CHECK } from './config';
import * as adultApi from './django/adult';
import * as pcApi from './django/pc';
import * as bridgeApi from './django-bridge';

// 🚀 master.ts 廃止に伴う完全同期
export const IS_SERVER = SERVER_CHECK;

/**
 * 📰 1. ニュース・記事・統合ハブ (Bridge API)
 * 内部で site_tag (tiper, saving 等) を使用するように修正済み
 */
export const {
    fetchNewsArticles,
    fetchPostData,
    fetchDjangoBridgeContent,
    fetchPostList
} = bridgeApi;

/** ✅ アイキャッチ画像取得ユーティリティ */
export function getWpFeaturedImage(post: any, size: 'thumbnail' | 'medium' | 'large' | 'full' = 'large'): string {
    if (!post?._embedded?.['wp:featuredmedia']?.[0]) {
        return '/images/common/no-image.jpg';
    }
    const media = post._embedded['wp:featuredmedia'][0];
    return media.media_details?.sizes?.[size]?.source_url || media.source_url;
}

/** 互換用エイリアス: 既存ページからの呼び出しを救済 */
export const getSiteMainPosts = (
    postType: string = 'post',
    limit: number = 12,
    offset: number = 0,
    project?: string
) => bridgeApi.fetchPostList(limit, offset, project);

/**
 * 🔞 2. アダルト・特化型コンテンツ API (adultApi)
 */
export const {
    getUnifiedProducts,
    getAdultProductDetail,
    getAdultNavigationFloors,
    fetchAdultTaxonomyIndex,
    fetchActresses,
    // 今後拡張予定のメソッド群
    fetchGenres,
    fetchMakers,
    fetchSeries,
    fetchLabels,
    fetchDirectors,
} = adultApi;

/** エイリアス統合 */
export const fetchUnifiedProducts = adultApi.getUnifiedProducts;

/**
 * 💻 3. PC・一般・ランキング API (pcApi)
 */
export const {
    fetchPCProducts,
    fetchPCProductDetail,
    fetchPCProductRanking,
    fetchPCSidebarStats,
    fetchRelatedProducts,
    fetchPCPopularityRanking,
    fetchAuthors
} = pcApi;

/** エイリアス統合 */
export const getPCProducts = pcApi.fetchPCProducts;

/**
 * 🛠️ 4. 互換性維持レイヤー (Legacy Support)
 * ページ側で `import { masterApi }` や個別インポートを行っている箇所を救済
 */

// 旧 master.ts の役割を各専門 API から集約
export const masterApi = {
    fetchGenres,
    fetchMakers,
    fetchSeries,
    fetchLabels,
    fetchDirectors,
    fetchAuthors,
    // 予期せぬ呼び出しへのフォールバック
    getWpFeaturedImage,
};

/**
 * 🔄 5. 型定義の統合
 * すべての型定義をここから再エクスポート
 */
export * from './types';

/**
 * =====================================================================
 * 📝 Maya's Note:
 * このゲートウェイを介することで、以下のメリットがあります：
 * 1. SSR時は config.ts により自動的に内部ネットワーク(django-api-host)経由で通信。
 * 2. クライアントサイドはドメインに応じた公開APIへ通信。
 * 3. ページ側は通信経路を意識せず、関数を呼ぶだけで適切な site_tag が付与される。
 * =====================================================================
 */