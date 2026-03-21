/**
 * =====================================================================
 * 🌉 Django-Bridge サービス層 (Maya's Logic v6.2 - Bicstation Fix)
 * =====================================================================
 * 物理パス: /shared/lib/api/django-bridge.ts
 * 修正内容: 
 * 1. fetchNewsArticles の URL 生成時にスラッシュを確実に付与
 * 2. プロジェクト判定の優先順位を整理し、Bicstation 記事の確実な取得を担保
 * =====================================================================
 */

import { getWpConfig, IS_SERVER, getDjangoBaseUrl } from './config';
import { resolveApiUrl as commonResolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from './django/client';
import { 
    PCProduct, 
    AdultProduct, 
    DjangoApiResponse, 
    MakerCount 
} from './types';

/**
 * 🔄 【置換】ドメイン・一括置換ユーティリティ
 */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    if (typeof data === 'object') {
        try {
            let content = JSON.stringify(data);
            const baseUrl = getDjangoBaseUrl();
            if (!baseUrl) return data;

            const cleanBaseUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');
            const internalPattern = /http:\/\/(django-v[23]|nginx-wp-v[23]|wordpress-.+v[23]|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
            
            content = content.replace(internalPattern, cleanBaseUrl);
            content = content.replace(/([^:])\/\//g, '$1/'); 
            
            return JSON.parse(content);
        } catch (e) {
            return data;
        }
    }
    if (typeof data === 'string') {
        const baseUrl = getDjangoBaseUrl();
        if (!baseUrl) return data;
        const cleanBaseUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');
        return data.replace(/http:\/\/(django-v[23]|127\.0\.0\.1|localhost)(:[0-9]+)?/g, cleanBaseUrl);
    }
    return data;
};

/**
 * 🛠️ 【通信】共通 Fetch ラッパー
 */
async function fetchFromBridge<T>(url: string, options: any = {}): Promise<{ data: any, status: number }> {
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
        
        return { 
            data: replaceInternalUrls(data), 
            status: res.status 
        };
    } catch (e: any) {
        console.error(`🚨 [Bridge Fatal Error]: ${url} | ${e.message}`);
        return { 
            data: null, 
            status: 500 
        };
    }
}

// --- 📝 統合コンテンツ取得 (各サイトの振り分け) ---

export async function fetchDjangoBridgeContent(params: any = {}): Promise<DjangoApiResponse<any>> {
    // サイトグループの判定。環境変数または引数から取得。Bicstationは 'bicstation' または 'pc'
    const siteGroup = params?.site_group || process.env.PROJECT_NAME || 'pc';
    
    if (siteGroup.includes('bicstation') || siteGroup === 'pc') {
        return await fetchPCProducts(params);
    } else if (siteGroup.includes('tiper') || siteGroup.includes('avflash') || siteGroup.includes('saving')) {
        return await getAdultProducts(params);
    }

    // いずれにも該当しない場合は安全策としてニュース記事リストを返す
    return await fetchPostList('post', params?.limit, params?.offset);
}

// --- 📰 ニュース記事 (Articleモデル) 取得機能 ---

/**
 * 📰 プロジェクトごとのニュース記事を取得
 * @param project 引数で指定があれば優先、なければ環境変数、最後は 'pc'
 */
export async function fetchNewsArticles(limit = 12, offset = 0, project?: string): Promise<DjangoApiResponse<any>> {
    // 🚀 【修正】Bicstationの場合は確実に 'bicstation' を優先するように調整
    let projectSlug = project || process.env.PROJECT_NAME || 'pc';
    
    // Bicstation環境で実行されている場合、'pc' ではなく 'bicstation' としてリクエストを投げる
    if (projectSlug === 'pc' && typeof window === 'undefined') {
        // サーバーサイド判定時に Bicstation 用であることを補完
        // (環境変数が 'pc' になってしまっている場合の救済処置)
        if (process.env.NEXT_PUBLIC_SITE_NAME?.includes('bicstation')) {
            projectSlug = 'bicstation';
        }
    }

    const query = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ordering: '-created_at',
        project: projectSlug, 
        is_exported: 'true'   
    });
    
    // 🚀 【重要修正】 `news/` の末尾スラッシュを確実に付与
    // Django REST Framework の期待する形式 `api/news/?query` に合わせる
    const url = commonResolveApiUrl(`news/?${query.toString()}`);
    
    const { data } = await fetchFromBridge<any>(url, { next: { revalidate: 300 } });
    
    const results = (data?.results || []).map((item: any) => ({
        ...item,
        id: item.id.toString(),
        slug: item.slug || item.id.toString(),
        image: item.main_image_url || item.thumbnail || '/no-image.jpg',
        date: item.created_at || item.date,
        body_text: item.body_text || item.content,
        content: item.body_text || item.content
    }));

    return { 
        results: results, 
        count: data?.count || 0 
    };
}

// --- 📝 記事リスト取得 (旧Markdown互換関数) ---

export async function fetchPostList(postType: string = 'post', limit = 12, offset = 0): Promise<DjangoApiResponse<any>> {
    return await fetchNewsArticles(limit, offset);
}

/**
 * 📝 特定の記事詳細データを取得 (スラッグまたはID)
 */
export async function fetchPostData(postType: string = 'post', identifier: string): Promise<any> {
    // 🚀 【修正】詳細取得時もスラッシュを確実に付与
    const url = commonResolveApiUrl(`news/${identifier}/`);
    const { data, status } = await fetchFromBridge<any>(url, { next: { revalidate: 60 } });

    if (status === 200 && data) {
        return {
            ...data,
            slug: data.slug || data.id.toString(),
            date: data.created_at || data.date,
            image: data.main_image_url || data.thumbnail || '/no-image.jpg',
            content: data.body_text || data.content,
            body_text: data.body_text || data.content,
            description: data.title,
        };
    }
    return null;
}

// --- 🔞 アダルトコンテンツ機能 (unified-products) ---

export async function getAdultProducts(params: any = {}): Promise<DjangoApiResponse<AdultProduct>> {
    const safeParams = params || {};
    const query = new URLSearchParams({
        limit: (safeParams.limit || 20).toString(),
        offset: (safeParams.offset || 0).toString(),
        ordering: safeParams.ordering || '-id',
        ...(safeParams.site_group && { site_group: safeParams.site_group }),
        ...(safeParams.keyword && { keyword: safeParams.keyword }),
        ...(safeParams.category && { category: safeParams.category })
    });
    
    const url = commonResolveApiUrl(`adult/unified-products/?${query.toString()}`);
    const { data } = await fetchFromBridge<AdultProduct>(url, { next: { revalidate: 60 } });
    
    return { 
        results: data?.results || [], 
        count: data?.count || 0 
    };
}

// --- 💻 PC製品・ランキング機能 ---

export async function fetchPCProducts(params: any = {}): Promise<DjangoApiResponse<PCProduct>> {
    const safeParams = params || {};
    const query = new URLSearchParams({
        limit: (safeParams.limit || 10).toString(),
        offset: (safeParams.offset || 0).toString(),
        ordering: safeParams.ordering || '-id',
        ...(safeParams.maker && { maker: safeParams.maker }),
        ...(safeParams.site_group && { site_group: safeParams.site_group }),
        ...(safeParams.attribute && { attribute: safeParams.attribute }),
        ...(safeParams.keyword && { keyword: safeParams.keyword })
    });
    
    const url = commonResolveApiUrl(`general/pc-products/?${query.toString()}`);
    const { data } = await fetchFromBridge<PCProduct>(url);
    
    return { 
        results: data?.results || [], 
        count: data?.count || 0 
    };
}

// --- 🏷️ メーカー集計取得 ---

export async function fetchMakerCounts(siteGroup: string): Promise<MakerCount[]> {
    const url = commonResolveApiUrl(`general/maker-counts/?site_group=${siteGroup}`);
    const { data } = await fetchFromBridge<MakerCount[]>(url, { next: { revalidate: 3600 } });
    return data || [];
}

// エイリアス設定
export { fetchPostList as getSiteMainPosts };
export { getAdultProducts as getUnifiedProducts };