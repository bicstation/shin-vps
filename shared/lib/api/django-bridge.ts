/**
 * =====================================================================
 * 🌉 Django-Bridge 統合サービス層 (v7.1 - Multi-Domain Migration)
 * =====================================================================
 */

import { getWpConfig, getDjangoBaseUrl } from './config';
import { 
    resolveApiUrl as commonResolveApiUrl, 
    getDjangoHeaders, 
    handleResponseWithDebug 
} from './django/client';

// 🚀 各専門ロジック（v7.0以降を想定）
import { fetchPCProducts as fetchPCProductsLogic } from './django/pc';
import { getUnifiedProducts as getAdultProductsLogic } from './django/adult';
import { fetchNewsArticles as fetchNewsLogic, fetchPostData as fetchNewsDetail } from './django/news';

import { DjangoApiResponse } from './types';

/**
 * 🔄 【共通機能】ドメイン・一括置換ユーティリティ
 * 修正: api-xxx-host 形式を置換対象に追加し、ブラウザでの画像表示を保証
 */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    const baseUrl = getDjangoBaseUrl();
    if (!baseUrl) return data;
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');

    if (typeof data === 'object') {
        try {
            let content = JSON.stringify(data);
            // 🚀 重要: api-xxx-host を含むすべての内部パターンをカバー
            const internalPattern = /http:\/\/(django-v[23]|nginx-wp-v[23]|wordpress-.+v[23]|api-[a-z-]+-host|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
            content = content.replace(internalPattern, cleanBaseUrl).replace(/([^:])\/\//g, '$1/'); 
            return JSON.parse(content);
        } catch (e) { return data; }
    }
    return data;
};

/**
 * 🚀 【司令塔】統合コンテンツ・スイッチャー
 * 修正: content_type を見て、ニュースなのか製品なのかを正しく判断
 */
export async function fetchDjangoBridgeContent(params: any = {}): Promise<DjangoApiResponse<any>> {
    const siteGroup = params?.site_group || process.env.PROJECT_NAME || 'bicstation';
    const contentType = params?.content_type || 'post';

    // 1. ニュース/記事のリクエストであれば、サイトを問わずニュースロジックへ
    if (contentType === 'news' || contentType === 'post') {
        return await fetchNewsLogic(params?.limit || 12, params?.offset || 0, siteGroup);
    }

    // 2. 製品(product)リクエストの場合の振り分け
    if (siteGroup.includes('tiper') || siteGroup.includes('avflash') || siteGroup.includes('saving')) {
        return await getAdultProductsLogic(params);
    }
    
    return await fetchPCProductsLogic(params);
}

/**
 * 📰 ニュース・記事取得
 */
export const fetchNewsArticles = fetchNewsLogic;
export const fetchPostData = fetchNewsDetail;

// NewsListPage から直接呼ばれるメイン関数
export async function fetchPostList(postType = 'post', limit = 12, offset = 0, project?: string) {
    // 確実に news.ts の v7.0 ロジックへパスを通す
    return await fetchNewsLogic(limit, offset, project);
}

/**
 * 💎 エイリアス設定
 */
export { fetchPostList as getSiteMainPosts };
export const fetchPCProducts = fetchPCProductsLogic;
export const getAdultProducts = getAdultProductsLogic;
export const getUnifiedProducts = getAdultProductsLogic;