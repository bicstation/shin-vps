// @ts-nocheck
/**
 * =====================================================================
 * 📝 SHIN-VPS Content Hub Pipeline (Zenith v11.0 - Core_Editor Edition)
 * 🛡️ Maya's Logic: [ULTIMATE_GUARD_V3_INTEGRATED] 
 * 🚀 Purpose: Djangoの生データをフロントエンドの統合モデルへ変換
 * =====================================================================
 */

import { resolveApiUrl as commonResolveApiUrl, handleResponseWithDebug, getDjangoHeaders } from './client';
import { getDjangoBaseUrl } from '../config';
import { UnifiedPost } from '../types';

/** 🔄 内部URL置換 (画像やリンクのURLを公開用/プロキシ用に修正) */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    const baseUrl = getDjangoBaseUrl();
    if (!baseUrl) return data;
    
    const cleanBaseUrl = baseUrl.split('?')[0].replace(/\/api$/, '').replace(/\/$/, '');
    
    if (typeof data === 'object') {
        try {
            let content = JSON.stringify(data);
            // 内部ネットワーク用ホスト名を外部公開URLに置換
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

/** 🛠️ 記事リソース専用 Fetch (リトライ・タイムアウト保護付き) */
async function fetchPostRaw(url: string, options: any = {}, siteTag?: string) {
    const djangoHeaders = getDjangoHeaders(siteTag || 'bicstation');
    try {
        const res = await fetch(url, {
            ...options,
            headers: { ...djangoHeaders, ...(options.headers || {}) },
            signal: AbortSignal.timeout(10000) // 10s timeout
        });
        const data = await handleResponseWithDebug(res, url);
        return { data: replaceInternalUrls(data), status: res.status };
    } catch (e) {
        console.error(`🚨 [fetchPostRaw Error] URL: ${url}`, e);
        return { data: null, status: 500 };
    }
}

/** 📰 記事リストを取得 (Core_Editorのフィールド体系に対応) */
export async function fetchPostList(limit = 12, offset = 0, siteTag?: string, options: any = {}): Promise<{ results: UnifiedPost[], count: number }> {
    
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
    
    // 一般サイト向けの簡易フィルタリング
    if (!isAdultSector) {
        rawResults = rawResults.filter((item: any) => {
            if (!item) return false;
            const BAN_WORDS = ['セフレ', '中出し', 'アヘアヘ', '不倫', '熟女', 'エロ', 'AV'];
            const title = (item.title || "").toString();
            return item.is_pub && !item.is_adult && !BAN_WORDS.some(word => title.includes(word));
        });
    }

    const results: UnifiedPost[] = rawResults.slice(0, limit).map((item: any) => {
        if (!item) return null;

        // 画像選択ロジック
        let mainImg = '/images/common/no-image.jpg';
        if (item.images_json && Array.isArray(item.images_json) && item.images_json.length > 0) {
            mainImg = item.images_json[0].url || item.main_image_url || mainImg;
        } else if (item.main_image_url) {
            mainImg = item.main_image_url;
        }

        // Core_Editor モデルへのマッピング
        return {
            ...item,
            id: (item.id || "").toString(), 
            slug: (item.slug || item.id || "").toString(),
            title: (item.title || "UNTITLED_ARTICLE").toString(),
            image: mainImg,
            // Core_Editor の body_md を優先、なければ body_main
            content: item.body_md || item.body_main || item.body_text || "",
            summary: item.body_satellite || "",
            site: (item.site || finalSiteTag).toString().toLowerCase(),
            
            // シリーズ情報
            series: {
                slug: item.series_slug || "",
                episode_no: item.episode_no || 0
            },
            
            category: item.category ? {
                id: item.category.id || 0,
                name: (item.category.name || "未分類").toString(),
                slug: (item.category.slug || "uncategorized").toString().toLowerCase()
            } : { id: 0, name: "未分類", slug: "uncategorized" },
            
            author: (item.author_name || item.author?.username || "Maya").toString(),
            created_at: item.created_at || new Date().toISOString()
        };
    }).filter(Boolean);

    return { results, count: data?.count || results.length };
}

/** 📝 特定の記事詳細データを取得 (Markdown優先) */
export async function fetchPostData(id: string, siteTag?: string): Promise<UnifiedPost | null> {
    if (!id || id === 'undefined' || id === 'null') return null;
    
    const cleanId = id.toString().replace(/\/+$/, '');
    const finalSiteTag = (siteTag && typeof siteTag === 'string' ? siteTag : 'bicstation').toLowerCase();
    const isAdultSector = ['avflash', 'tiper', 'bic-erog'].includes(finalSiteTag);
        
    const url = commonResolveApiUrl(`posts/${cleanId}/?site=${finalSiteTag}`, finalSiteTag);
    const { data, status } = await fetchPostRaw(url, { next: { revalidate: 60 } }, finalSiteTag);

    if (!data) return null;

    let finalItem = data;
    // DRFのListResponseが返ってきた場合のハンドリング
    if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        finalItem = data.results[0];
    }

    if ((status === 200 || status === 304) && finalItem && finalItem.id !== undefined) {
        // セーフガード: 非成人向けサイトでの成人向けコンテンツ非表示
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
            // Core_Editor のフィールド構成を反映
            content: finalItem.body_md || finalItem.body_main || finalItem.body_text || "",
            summary: finalItem.body_satellite || "",
            image: primaryImage,
            is_adult: !!finalItem.is_adult,
            is_pub: !!finalItem.is_pub,
            site: (finalItem.site || finalSiteTag).toString().toLowerCase(),
            
            series: {
                slug: finalItem.series_slug || "",
                episode_no: finalItem.episode_no || 0
            },

            metadata: finalItem.extra_metadata || {},
            images: Array.isArray(finalItem.images_json) ? finalItem.images_json : [],
            
            category: finalItem.category ? {
                id: finalItem.category.id || 0,
                name: (finalItem.category.name || "未分類").toString(),
                slug: (finalItem.category.slug || "uncategorized").toString().toLowerCase()
            } : { id: 0, name: "未分類", slug: "uncategorized" },
            
            author: (finalItem.author_name || finalItem.author?.username || "Maya").toString(),
            updated_at: finalItem.updated_at || finalItem.created_at
        };
    }

    return null;
}

/** 🚀 エイリアス設定 */
export { fetchPostList as fetchNewsArticles };