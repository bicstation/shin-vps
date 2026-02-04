/**
 * =====================================================================
 * 🌟 SHIN-VPS 統合 API サービス層 (shared/lib/api/index.ts)
 * ページコンポーネントはこのファイルのみを参照します。
 * WordPress(wp) と Django(django) の各サービスを統合してエクスポートします。
 * =====================================================================
 */

import * as wp from './wordpress';
import * as django from './django';
import { getWpConfig } from './config';
import { WPPost, PCProduct, AdultProduct } from './types';

// 1. 型定義を再エクスポート
export * from './types';

/**
 * 📝 [WP] メイン投稿一覧を取得
 * @returns {Promise<{ results: WPPost[], count: number }>}
 */
export async function getSiteMainPosts(
    offset: number = 0, 
    limit: number = 12, 
    postType?: string
): Promise<{ results: WPPost[], count: number }> {
    return await wp.fetchPostList(postType, limit, offset);
}

/**
 * 📝 [WP] 個別記事取得
 */
export async function fetchPostData(postType: string, slug: string): Promise<WPPost | null> {
    return await wp.fetchPostData(postType, slug);
}

/**
 * 🏷️ [WP] カテゴリ一覧を取得
 * サイト設定(siteKey)に基づいて適切なタクソノミーからタームを取得します。
 */
export async function getSiteCategories(): Promise<any[]> {
    const config = getWpConfig();
    const siteKey = config.siteKey;
    
    // 💡 サイトごとのタクソノミーマッピング
    const taxNameMap: Record<string, string> = {
        'tiper': 'tiper_category',
        'avflash': 'avflash_category', // 🔞 AV Flash対応追加
        'saving': 'saving_category',
        'bicstation': 'station_category'
    };
    
    const targetTaxonomy = taxNameMap[siteKey] || 'category';
    return await wp.fetchTaxonomyTerms(targetTaxonomy);
}

/**
 * 🔞 [Django] アダルト商品一覧取得
 * tiper, avflash の共通データ取得に使用します。
 */
export async function getAdultProducts(params: any = {}): Promise<{ results: AdultProduct[], count: number }> {
    return await django.getAdultProducts(params);
}

/**
 * 💻 [Django] 一般商品一覧取得
 * 💡 修正済み: django.ts 側の関数名 fetchPCProducts を呼び出し
 */
export async function fetchPCProducts(params: any = {}): Promise<{ results: PCProduct[], count: number }> {
    return await django.fetchPCProducts(params);
}

/**
 * 💻 [Django] 商品詳細取得
 */
export async function fetchProductDetail(id: string): Promise<PCProduct | null> {
    return await django.fetchProductDetail(id);
}

/**
 * 🔞 [アダルト系専用] 最新商品取得
 * IDの降順で最新のアダルト製品を取得します。
 */
export async function getAdultLatest(offset: number = 0, limit: number = 20): Promise<{ results: AdultProduct[], count: number }> {
    return await django.getAdultProducts({ 
        offset, 
        limit, 
        ordering: '-id' 
    });
}

/**
 * 📊 [Django] 人気ランキング取得
 * 404エラーを回避するため、既存のリスト取得APIをスコア順で呼び出します。
 */
export async function getPopularityRanking(limit: number = 5): Promise<{ results: PCProduct[] }> {
    const data = await django.fetchPCProducts({ 
        limit, 
        ordering: '-spec_score' 
    });
    return { results: data.results || [] };
}

/**
 * 💻 [Hybrid] 商品詳細と関連WP記事をセットで取得
 * Djangoから商品情報を、WordPressから最新ガイド記事を同時に並列取得します。
 */
export async function getProductWithGuide(productId: string): Promise<{ product: PCProduct | null, relatedArticles: WPPost[] }> {
    try {
        const [product, relatedArticles] = await Promise.all([
            django.fetchProductDetail(productId),
            wp.fetchPostList(undefined, 3, 0)
        ]);
        
        return { 
            product, 
            relatedArticles: relatedArticles?.results || [] 
        };
    } catch (error) {
        console.error('[Hybrid Fetch Error]:', error);
        return { product: null, relatedArticles: [] };
    }
}