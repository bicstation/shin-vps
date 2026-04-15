// /home/maya/shin-vps/shared/lib/api/django/news.ts
// @ts-nocheck
/**
 * =====================================================================
 * 📰 ニュース・記事取得サービス (Zenith v7.1 - Hardened)
 * 🛡️ Maya's Logic: 墜落防止ガード & カテゴリ・IDの文字列化を徹底
 * =====================================================================
 */

import { resolveApiUrl as commonResolveApiUrl, handleResponseWithDebug, getDjangoHeaders } from './client';
import { getWpConfig, getDjangoBaseUrl } from '../config';

/** 🔄 内部URL置換 */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    const baseUrl = getDjangoBaseUrl();
    if (!baseUrl) return data;
    
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');
    
    try {
        const content = JSON.stringify(data);
        const internalPattern = /http:\/\/(django-v[23]|django-api-host|nginx-wp-v[23]|wordpress-.+v[23]|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
        
        const replaced = content.replace(internalPattern, cleanBaseUrl).replace(/([^:])\/\//g, '$1/');
        return JSON.parse(replaced);
    } catch (e) { 
        console.error("🚨 [News URL Replace Error]", e);
        return data; 
    }
};

/** 🛠️ ニュース専用 Fetch 基盤 */
async function fetchNewsRaw(url: string, options: any = {}, siteTag?: string) {
    const { host } = getWpConfig();
    try {
        const res = await fetch(url, {
            ...options,
            headers: { 
                ...getDjangoHeaders(siteTag), 
                'Host': host, 
                ...(options.headers || {}) 
            },
            signal: AbortSignal.timeout(8000) // 🛡️ タイムアウト短縮
        });
        const data = await handleResponseWithDebug(res, url);
        return { data: replaceInternalUrls(data), status: res.status };
    } catch (e) {
        console.error(`🚨 [fetchNewsRaw Error] URL: ${url}`, e);
        return { data: null, status: 500 };
    }
}

/** 📰 サイト別のニュース記事一覧を取得 */
export async function fetchNewsArticles(limit = 12, offset = 0, siteTag?: string) {
    const finalSiteTag = (siteTag || 'bicstation').toString().toLowerCase();
    const isGeneralSite = ['bicstation', 'saving'].includes(finalSiteTag);
    const fetchLimit = isGeneralSite ? limit * 5 : limit;

    const query = new URLSearchParams({
        limit: fetchLimit.toString(),
        offset: offset.toString(),
        ordering: '-created_at',
    });

    const url = commonResolveApiUrl(`news/?${query.toString()}`, finalSiteTag);
    const { data } = await fetchNewsRaw(url, { next: { revalidate: 300 } }, finalSiteTag);

    // 🛡️ results が無い場合のガード
    let rawResults = data?.results || (Array.isArray(data) ? data : []);

    /**
     * 🛡️ クリーン化ロジック (一般サイト用)
     */
    if (isGeneralSite) {
        rawResults = rawResults.filter((item: any) => {
            if (!item) return false;
            const meta = item.extra_metadata || {};
            
            // 1. メタデータのフラグチェック
            const isAdultFlag = meta.is_adult === true || meta.adult === true || meta.rating === 'adult' || !!item.is_adult;
            
            // 2. タイトル検閲
            const BAN_WORDS = ['セフレ', '中出し', 'アヘアヘ', '不倫', '熟女', 'エロ', 'AV'];
            const title = (item.title || "").toString();
            const hasBanWord = BAN_WORDS.some(word => title.includes(word));

            return !isAdultFlag && !hasBanWord;
        });
    }

    // 🚀 整形
    const results = rawResults.slice(0, limit).map((item: any) => {
        if (!item) return null;
        // IDの安全な抽出
        const safeId = (item.id || item.pk || "").toString();
        
        return {
            ...item,
            id: safeId,
            slug: (item.slug || safeId).toString(),
            image: item.main_image_url || item.thumbnail || '/images/common/no-image.jpg',
            content: item.body_text || item.content || "",
            title: (item.title || "NO TITLE").toString(),
            // 🛡️ カテゴリスラッグの強制小文字化ガード
            category: item.category ? {
                ...item.category,
                slug: (item.category.slug || "news").toString().toLowerCase()
            } : { name: "ニュース", slug: "news" }
        };
    }).filter(Boolean);

    return { results, count: data?.count || results.length };
}

/** 📝 特定の記事詳細データを取得 */
export async function fetchPostData(identifier: string, siteTag?: string) {
    if (!identifier || identifier === 'undefined') return null;
    
    const finalSiteTag = (siteTag || 'bicstation').toString().toLowerCase();
    const cleanId = identifier.toString().replace(/\/+$/, '');
    const url = commonResolveApiUrl(`news/${cleanId}/`, finalSiteTag);
    
    const { data, status } = await fetchNewsRaw(url, { next: { revalidate: 60 } }, finalSiteTag);

    if ((status === 200 || status === 304) && data) {
        const meta = data.extra_metadata || {};
        const isGeneralSite = ['bicstation', 'saving'].includes(finalSiteTag);
        
        if (isGeneralSite && (meta.is_adult === true || data.is_adult === true)) {
            return null;
        }

        const safeId = (data.id || data.pk || cleanId).toString();

        return {
            ...data,
            id: safeId,
            image: data.main_image_url || data.thumbnail || '/images/common/no-image.jpg',
            content: data.body_text || data.content || "",
            title: (data.title || "NO TITLE").toString(),
            category: data.category ? {
                ...data.category,
                slug: (data.category.slug || "news").toString().toLowerCase()
            } : { name: "ニュース", slug: "news" }
        };
    }
    return null;
}

// 互換性維持
export const fetchPostList = fetchNewsArticles;