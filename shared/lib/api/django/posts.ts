// /home/maya/shin-vps/shared/lib/api/django/posts.ts
// @ts-nocheck
/**
 * =====================================================================
 * 📝 記事取得サービス (Zenith v10.6 - Full Hardened Edition)
 * 🛡️ Maya's Logic: [ULTIMATE_GUARD_V2] 
 * =====================================================================
 */

import { resolveApiUrl as commonResolveApiUrl, handleResponseWithDebug, getDjangoHeaders } from './client';
import { getDjangoBaseUrl } from '../config';
import { UnifiedPost } from '../types';

/** 🔄 内部URL置換 (画像やリンクのURLを公開用に修正) */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    const baseUrl = getDjangoBaseUrl();
    if (!baseUrl) return data;
    
    const cleanBaseUrl = baseUrl.split('?')[0].replace(/\/api$/, '').replace(/\/$/, '');
    
    if (typeof data === 'object') {
        try {
            let content = JSON.stringify(data);
            const internalPattern = /http:\/\/(django-v[23]|django-api-host|nginx-wp-v[23]|wordpress-.+v[23]|api-[a-z-]+-host|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
            
            content = content.replace(internalPattern, cleanBaseUrl);
            content = content.replace(/([^:])\/\//g, '$1/'); 
            
            return JSON.parse(content);
        } catch (e) { 
            console.error("🚨 [URL_REPLACE_ERROR]", e);
            return data; 
        }
    }
    return data;
};

/** 🛠️ 記事リソース専用 Fetch */
async function fetchPostRaw(url: string, options: any = {}, siteTag?: string) {
    const djangoHeaders = getDjangoHeaders(siteTag || 'bicstation');
    try {
        const res = await fetch(url, {
            ...options,
            headers: { ...djangoHeaders, ...(options.headers || {}) },
            signal: AbortSignal.timeout(8000)
        });
        const data = await handleResponseWithDebug(res, url);
        return { data: replaceInternalUrls(data), status: res.status };
    } catch (e) {
        console.error(`🚨 [fetchPostRaw Error] URL: ${url}`, e);
        return { data: null, status: 500 };
    }
}

/** 📰 記事リストを取得 */
export async function fetchPostList(limit = 12, offset = 0, siteTag?: string, options: any = {}): Promise<{ results: UnifiedPost[], count: number }> {
    
    // 🛡️ siteTag を安全に正規化 (toLowerCase の爆発を防止)
    const finalSiteTag = (siteTag && typeof siteTag === 'string' ? siteTag : 'bicstation').toLowerCase();
    
    const isAdultSector = ['avflash', 'tiper', 'bic-erog'].includes(finalSiteTag);
    const isGeneralSite = ['bicstation', 'saving'].includes(finalSiteTag);
    
    const queryParams = new URLSearchParams({
        limit: (isGeneralSite ? limit * 3 : limit).toString(),
        offset: offset.toString(),
        ordering: '-created_at',
        site: finalSiteTag,
    });

    const url = commonResolveApiUrl(`posts/?${queryParams.toString()}`, finalSiteTag); 
    const { data } = await fetchPostRaw(url, { ...options, next: { revalidate: 300 } }, finalSiteTag);

    let rawResults = data?.results || (Array.isArray(data) ? data : []);
    
    if (!isAdultSector) {
        rawResults = rawResults.filter((item: any) => {
            if (!item) return false;
            const BAN_WORDS = ['セフレ', '中出し', 'アヘアヘ', '不倫', '熟女', 'エロ', 'AV'];
            const title = (item.title || "").toString();
            return item.show_on_main && !item.is_adult && !BAN_WORDS.some(word => title.includes(word));
        });
    }

    const results: UnifiedPost[] = rawResults.slice(0, limit).map((item: any) => {
        if (!item) return null;

        let mainImg = '/images/common/no-image.jpg';
        if (item.images_json && Array.isArray(item.images_json) && item.images_json.length > 0) {
            mainImg = item.images_json[0].url || item.main_image_url || mainImg;
        } else if (item.main_image_url) {
            mainImg = item.main_image_url;
        }

        return {
            ...item,
            id: (item.id || "").toString(), 
            slug: (item.slug || item.id || "").toString(),
            title: (item.title || "NO TITLE").toString(),
            image: mainImg,
            content: item.body_main || item.body_text || "",
            summary: item.body_satellite || "",
            site: (item.site || finalSiteTag).toString().toLowerCase(),
            
            category: item.category ? {
                id: item.category.id || 0,
                name: (item.category.name || "未分類").toString(),
                slug: (item.category.slug || "uncategorized").toString().toLowerCase() // 🛡️ category.slug ガード
            } : { id: 0, name: "未分類", slug: "uncategorized" },
            
            author: (item.author_name || item.author?.username || "Maya").toString()
        };
    }).filter(Boolean);

    return { results, count: data?.count || results.length };
}

/** 📝 特定の記事詳細データを取得 */
export async function fetchPostData(id: string, siteTag?: string): Promise<UnifiedPost | null> {
    // 🛡️ IDが文字列の "undefined" や "null" になっているケースを完全に排除
    if (!id || id === 'undefined' || id === 'null') return null;
    
    const cleanId = id.toString().replace(/\/+$/, '');
    const finalSiteTag = (siteTag && typeof siteTag === 'string' ? siteTag : 'bicstation').toLowerCase();

    const isAdultSector = ['avflash', 'tiper', 'bic-erog'].includes(finalSiteTag);
        
    const url = commonResolveApiUrl(`posts/${cleanId}/?site=${finalSiteTag}`, finalSiteTag);
    const { data, status } = await fetchPostRaw(url, { next: { revalidate: 60 } }, finalSiteTag);

    if (!data) return null;

    let finalItem = data;
    if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        finalItem = data.results[0];
    }

    if ((status === 200 || status === 304) && finalItem && finalItem.id !== undefined) {
        if (!isAdultSector && finalItem.is_adult) {
            return null;
        }

        let primaryImage = '/images/common/no-image.jpg';
        if (finalItem.images_json && Array.isArray(finalItem.images_json) && finalItem.images_json.length > 0) {
            primaryImage = finalItem.images_json[0].url || primaryImage;
        } else if (finalItem.main_image_url) {
            primaryImage = finalItem.main_image_url;
        }

        return {
            ...finalItem,
            id: (finalItem.id || "").toString(),
            title: (finalItem.title || "NO TITLE").toString(),
            content: finalItem.body_main || finalItem.body_text || "",
            summary: finalItem.body_satellite || "",
            image: primaryImage,
            is_adult: !!finalItem.is_adult,
            site: (finalItem.site || finalSiteTag).toString().toLowerCase(), // 🛡️ siteプロパティの文字列化を保証
            metadata: finalItem.extra_metadata || {},
            images: Array.isArray(finalItem.images_json) ? finalItem.images_json : [],
            
            category: finalItem.category ? {
                id: finalItem.category.id || 0,
                name: (finalItem.category.name || "未分類").toString(),
                slug: (finalItem.category.slug || "uncategorized").toString().toLowerCase() // 🛡️ category.slug ガード
            } : { id: 0, name: "未分類", slug: "uncategorized" },
            
            author: (finalItem.author_name || finalItem.author?.username || "Maya").toString()
        };
    }

    return null;
}

/** 🚀 エイリアス設定 */
export { fetchPostList as fetchNewsArticles };