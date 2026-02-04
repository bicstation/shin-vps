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
 * 💡 page.tsx からの呼び出し (offset, limit) に完全対応
 */
export async function getSiteMainPosts(
    offset: number = 0, 
    limit: number = 12, 
    postType?: string
): Promise<{ results: WPPost[], count: number }> {
    // wordpress.ts の fetchPostList を呼び出す
    // fetchPostList(postType, limit, offset) の引数順序に注意
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
    const siteKey = config.siteKey; // config.ts で 'tiper', 'saving', 'station' に正規化済み
    
    /**
     * 💡 サイトごとのタクソノミーマッピング
     * avflash は config 側で tiper に統合されているため、tiper_category を参照します。
     */
    const taxNameMap: Record<string, string> = {
        'tiper': 'tiper_category',
        'saving': 'saving_category',
        'station': 'station_category'
    };
    
    const targetTaxonomy = taxNameMap[siteKey] || 'category';
    return await wp.fetchTaxonomyTerms(targetTaxonomy);
}

/**
 * 🔞 [Django] アダルト商品一覧取得
 */
export async function getAdultProducts(params: any = {}): Promise<{ results: AdultProduct[], count: number }> {
    return await django.getAdultProducts(params);
}

/**
 * 💻 [Django] 一般商品一覧取得
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