/**
 * =====================================================================
 * 🛰️ SHIN-VPS 統合 API ゲートウェイ (shared/lib/api/index.ts)
 * 🛡️ Maya's Zenith v5.8: 全専門家 統合・衝突回避・型安全版
 * =====================================================================
 */

// 1. 基盤・設定のインポート
import { IS_SERVER as SERVER_CHECK } from './config'; // 直下の config.ts を参照
import * as adultApi from './django/adult';
import * as pcApi from './django/pc';
import * as masterApi from './django/master'; // ✅ マスター専用線を統合
import * as bridgeApi from './django-bridge';

/**
 * 🔗 1. 定数・環境フラグ
 */
export const IS_SERVER = SERVER_CHECK;

/**
 * 📰 2. ニュース・記事・統合ハブ (bridgeApi)
 */
export const {
    fetchNewsArticles,
    fetchPostData,
    fetchDjangoBridgeContent,
    fetchPostList
} = bridgeApi;

// 互換用エイリアス
export const getSiteMainPosts = bridgeApi.fetchPostList;

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

// 互換用エイリアス
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

// 互換用エイリアス
export const getPCProducts = pcApi.fetchPCProducts;

/**
 * 🏷️ 5. 共通マスターデータ (masterApi)
 * 💡 ジャンル、メーカー、女優、シリーズ等、全ドメイン共通のマスター取得
 * 💡 ここで公開することで fetchPCMakers 等の命名重複を回避し、シンプルに扱えます
 */
export const {
    fetchGenres,
    fetchMakers, // 全ドメイン共通メーカー取得
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
 * 💡 types.ts ですべての共通型を管理しているため、これ一行で OK です
 */
export * from './types';