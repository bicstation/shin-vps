// @ts-nocheck
/**
 * =====================================================================
 * 📰 ニュース・記事取得サービス (v7.0 - Logic Layer Sync)
 * 🛡️ Maya's Logic: site_tag 導線の完全同期 & 検閲強化版
 * =====================================================================
 */

import { resolveApiUrl as commonResolveApiUrl, handleResponseWithDebug, getDjangoHeaders } from './client';
import { getWpConfig, getDjangoBaseUrl } from '../config';

/** 🔄 内部URL置換 (画像やリンクの内部ドメインを公開URLへ) */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    const baseUrl = getDjangoBaseUrl();
    if (!baseUrl) return data;
    
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');
    const content = JSON.stringify(data);
    const internalPattern = /http:\/\/(django-v[23]|django-api-host|nginx-wp-v[23]|wordpress-.+v[23]|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
    
    try {
        const replaced = content.replace(internalPattern, cleanBaseUrl).replace(/([^:])\/\//g, '$1/');
        return JSON.parse(replaced);
    } catch (e) { return data; }
};

/** 🛠️ ニュース専用 Fetch 基盤 */
async function fetchNewsRaw(url: string, options: any = {}) {
    const { host } = getWpConfig();
    const res = await fetch(url, {
        ...options,
        headers: { 
            ...getDjangoHeaders(), 
            'Host': host, 
            ...(options.headers || {}) 
        },
        signal: AbortSignal.timeout(10000)
    });
    const data = await handleResponseWithDebug(res, url);
    return { data: replaceInternalUrls(data), status: res.status };
}

/** 📰 サイト別のニュース記事一覧を取得 */
export async function fetchNewsArticles(limit = 12, offset = 0, siteTag?: string) {
    // 一般サイトの場合はアダルト混入を防ぐため、フィルタリング用に多めに取得
    const isGeneralSite = siteTag === 'bicstation' || siteTag === 'saving';
    const fetchLimit = isGeneralSite ? limit * 5 : limit;

    const query = new URLSearchParams({
        limit: fetchLimit.toString(),
        offset: offset.toString(),
        ordering: '-created_at',
    });

    // client.ts (v11.0) の resolveApiUrl は内部で site=${siteTag} を自動付与するため
    // ここで敢えて project パラメータを重複させず、パスとして構築
    const url = commonResolveApiUrl(`news/?${query.toString()}`, siteTag);
    const { data } = await fetchNewsRaw(url, { next: { revalidate: 300 } });

    let rawResults = data?.results || [];

    /**
     * 🛡️ クリーン化ロジック (一般サイト用)
     */
    if (isGeneralSite) {
        rawResults = rawResults.filter((item: any) => {
            const meta = item.extra_metadata || {};
            
            // 1. メタデータのフラグチェック
            const isAdultFlag = meta.is_adult === true || meta.adult === true || meta.rating === 'adult';
            
            // 2. タイトル検閲 (保険)
            const BAN_WORDS = ['セフレ', '中出し', 'アヘアヘ', '不倫', '熟女', 'エロ', 'AV'];
            const title = item.title || "";
            const hasBanWord = BAN_WORDS.some(word => title.includes(word));

            return !isAdultFlag && !hasBanWord;
        });
    }

    const results = rawResults.slice(0, limit).map((item: any) => ({
        ...item,
        id: item.id.toString(),
        slug: item.slug || item.id.toString(),
        image: item.main_image_url || item.thumbnail || '/images/common/no-image.jpg',
        content: item.body_text || item.content,
    }));

    return { results, count: data?.count || 0 };
}

/** 📝 特定の記事詳細データを取得 */
export async function fetchPostData(identifier: string, siteTag?: string) {
    // IDやスラッシュの洗浄
    const cleanId = identifier.toString().replace(/\/+$/, '');
    const url = commonResolveApiUrl(`news/${cleanId}/`, siteTag);
    
    const { data, status } = await fetchNewsRaw(url, { next: { revalidate: 60 } });

    if (status === 200 && data) {
        // 詳細ページでのアダルト検閲 (直リンク・検索流入対策)
        const meta = data.extra_metadata || {};
        const isGeneralSite = siteTag === 'bicstation' || siteTag === 'saving';
        
        if (isGeneralSite && meta.is_adult === true) {
            console.warn(`🛡️ [Sanitize] Blocked adult content on general site: ${cleanId}`);
            return null;
        }

        return {
            ...data,
            id: data.id.toString(),
            image: data.main_image_url || data.thumbnail || '/images/common/no-image.jpg',
            content: data.body_text || data.content,
        };
    }
    return null;
}

// 互換性維持のためのリレーエクスポート
export const fetchPostList = fetchNewsArticles;