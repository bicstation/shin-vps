/**
 * =====================================================================
 * 🌉 Django-Bridge 統合サービス層 (v7.0 - 分割統治・完全機能維持版)
 * =====================================================================
 * 修正内容: v6.3 の置換ロジックと共通 Fetch 機能を維持しつつ、
 * 各専門ドメイン (PC, Adult, News) へのゲートウェイとして機能。
 * =====================================================================
 */

import { getWpConfig, getDjangoBaseUrl } from './config';
import { 
    resolveApiUrl as commonResolveApiUrl, 
    getDjangoHeaders, 
    handleResponseWithDebug 
} from './django/client';

// 🚀 専門部隊からのインポート
import { fetchPCProducts as fetchPCProductsLogic } from './django/pc';
import { getUnifiedProducts as getAdultProductsLogic } from './django/adult';
import { fetchNewsArticles as fetchNewsLogic, fetchPostData as fetchNewsDetail } from './django/news';

import { 
    PCProduct, 
    AdultProduct, 
    DjangoApiResponse 
} from './types';

/**
 * 🔄 【共通機能】ドメイン・一括置換ユーティリティ
 * ※ v6.3 から継承。全ドメインのデータに対して実行
 */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    const baseUrl = getDjangoBaseUrl();
    if (!baseUrl) return data;
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');

    if (typeof data === 'object') {
        try {
            let content = JSON.stringify(data);
            const internalPattern = /http:\/\/(django-v[23]|nginx-wp-v[23]|wordpress-.+v[23]|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
            content = content.replace(internalPattern, cleanBaseUrl).replace(/([^:])\/\//g, '$1/'); 
            return JSON.parse(content);
        } catch (e) { return data; }
    }
    if (typeof data === 'string') {
        return data.replace(/http:\/\/(django-v[23]|127\.0\.0\.1|localhost)(:[0-9]+)?/g, cleanBaseUrl);
    }
    return data;
};

/**
 * 🛠️ 【共通機能】通信 Fetch ラッパー (fetchFromBridge)
 * ※ 各専門ロジックからも利用可能にするため維持
 */
export async function fetchFromBridge<T>(url: string, options: any = {}): Promise<{ data: any, status: number }> {
    const { host } = getWpConfig();
    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                ...getDjangoHeaders(),
                'Host': host,
                ...(options.headers || {}),
            },
            signal: AbortSignal.timeout(options.timeout || 10000)
        });
        const data = await handleResponseWithDebug(res, url);
        return { data: replaceInternalUrls(data), status: res.status };
    } catch (e: any) {
        console.error(`🚨 [Bridge Fatal Error]: ${url} | ${e.message}`);
        return { data: null, status: 500 };
    }
}

/**
 * 🚀 【司令塔】統合コンテンツ・スイッチャー
 */
export async function fetchDjangoBridgeContent(params: any = {}): Promise<DjangoApiResponse<any>> {
    const siteGroup = params?.site_group || process.env.PROJECT_NAME || 'pc';

    if (siteGroup.includes('bicstation') || siteGroup === 'pc') {
        return await fetchPCProductsLogic(params);
    } else if (siteGroup.includes('tiper') || siteGroup.includes('avflash') || siteGroup.includes('saving')) {
        return await getAdultProductsLogic(params);
    }
    return await fetchPostList('post', params?.limit, params?.offset, siteGroup);
}

/**
 * 📰 ニュース・記事取得
 */
export const fetchNewsArticles = fetchNewsLogic;
export const fetchPostData = fetchNewsDetail;

export async function fetchPostList(postType = 'post', limit = 12, offset = 0, project?: string) {
    return await fetchNewsLogic(limit, offset, project);
}

/**
 * 🖥️ PC製品取得
 */
export const fetchPCProducts = fetchPCProductsLogic;

/**
 * 🔞 アダルト製品取得
 */
export const getAdultProducts = getAdultProductsLogic;
export const getUnifiedProducts = getAdultProductsLogic;

/**
 * 💎 エイリアス設定
 */
export { fetchPostList as getSiteMainPosts };