/**
 * 📝 記事取得サービス (shared/lib/api/django/posts.ts)
 * 🛡️ Zenith v10.1 - [AVFLASH_CYBER_PATCH]
 * 🚀 修正内容: avflash/tiper プロジェクト時に検閲ロジックをバイパスする設定を追加。
 */
import { resolveApiUrl as commonResolveApiUrl, handleResponseWithDebug, getDjangoHeaders } from './client';
import { getDjangoBaseUrl } from '../config';
import { UnifiedPost } from '../types';

/** 🔄 内部URL置換 */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    const baseUrl = getDjangoBaseUrl();
    if (!baseUrl) return data;
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');
    if (typeof data === 'object') {
        try {
            let content = JSON.stringify(data);
            const internalPattern = /http:\/\/(django-v[23]|nginx-wp-v[23]|wordpress-.+v[23]|api-[a-z-]+-host|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
            content = content.replace(internalPattern, cleanBaseUrl).replace(/([^:])\/\//g, '$1/'); 
            return JSON.parse(content);
        } catch (e) { return data; }
    }
    return data;
};

/** 🛠️ 記事リソース専用 Fetch */
async function fetchPostRaw(url: string, options: any = {}, manualHost?: string) {
    const djangoHeaders = getDjangoHeaders(manualHost);
    const res = await fetch(url, {
        ...options,
        headers: { ...djangoHeaders, ...(options.headers || {}) },
        signal: AbortSignal.timeout(10000)
    });
    const data = await handleResponseWithDebug(res, url);
    return { data: replaceInternalUrls(data), status: res.status };
}

/** 📰 記事リストを取得 */
export async function fetchPostList(limit = 12, offset = 0, project?: string, options: any = {}): Promise<{ results: UnifiedPost[], count: number }> {
    // プロジェクト名の正規化
    const parts = (project || 'avflash').split(':')[0].split('/')[0].split('.');
    let rawTag = parts[0];
    if (rawTag === 'api' && parts.length > 1) { rawTag = parts[1]; }
    const siteTag = rawTag.replace('api-', '').replace('-host', '').toLowerCase().trim();
    const finalSiteTag = siteTag.includes('saving') ? 'saving' : siteTag;

    // アダルトセクター判定
    const isAdultSector = ['avflash', 'tiper'].includes(finalSiteTag);
    
    const queryParams = new URLSearchParams({
        limit: (['bicstation', 'saving'].includes(finalSiteTag) ? limit * 3 : limit).toString(),
        offset: offset.toString(),
        ordering: '-created_at',
    });
    if (finalSiteTag !== 'all') { queryParams.append('site', finalSiteTag); }

    const url = commonResolveApiUrl(`posts/?${queryParams.toString()}`, finalSiteTag); 
    const { data } = await fetchPostRaw(url, { ...options, next: { revalidate: 0 } }, finalSiteTag);

    let rawResults = data?.results || [];
    
    // 🛡️ フィルタリングロジック
    rawResults = rawResults.filter((item: any) => {
        // 🔥 AVFLASH / TIPER の場合は全ての検閲をバイパス
        if (isAdultSector) return true;

        // クリーンサイト用の検閲
        const BAN_WORDS = ['セフレ', '中出し', 'アヘアヘ', '不倫', '熟女', 'エロ', 'AV'];
        const title = item.title || "";
        return item.show_on_main && !item.is_adult && !BAN_WORDS.some(word => title.includes(word));
    });

    const results: UnifiedPost[] = rawResults.slice(0, limit).map((item: any) => {
        let mainImg = '/images/common/no-image.jpg';
        if (item.images_json && item.images_json.length > 0) {
            mainImg = item.images_json[0].url || item.main_image_url || mainImg;
        }

        return {
            ...item,
            id: item.id?.toString() || "", 
            slug: item.slug || item.id?.toString() || "",
            image: mainImg,
            content: item.body_main || item.body_text || "",
            site: item.site || 'unknown',
        };
    });
    return { results, count: data?.count || 0 };
}

/** 📝 特定の記事詳細データを取得 */
export async function fetchPostData(id: string, project?: string): Promise<UnifiedPost | null> {
    if (!id) return null;
    const cleanId = id.toString().replace(/\//g, '');
    
    const parts = (project || 'avflash').split(':')[0].split('/')[0].split('.');
    let rawProject = parts[0];
    if (rawProject === 'api' && parts.length > 1) { rawProject = parts[1]; }
    const cleanProject = rawProject.replace('api-', '').replace('-host', '').toLowerCase();

    // アダルトセクター判定
    const isAdultSector = ['avflash', 'tiper'].includes(cleanProject);
        
    const url = commonResolveApiUrl(`posts/${cleanId}/`, cleanProject);
    const { data, status } = await fetchPostRaw(url, { next: { revalidate: 0 } }, cleanProject);

    let finalItem = data;
    if (data && data.results && Array.isArray(data.results) && data.results.length > 0) {
        finalItem = data.results[0];
    }

    if (status === 200 && finalItem && finalItem.id !== undefined) {
        // 🛡️ 表示ガード
        // 🔥 AVFLASH / TIPER の場合は show_on_main が False でも強制表示
        if (!isAdultSector && !finalItem.show_on_main) {
            console.warn(`⚠️ [API] Post ${cleanId} is restricted for non-adult sector.`);
            return null;
        }

        let primaryImage = '/images/common/no-image.jpg';
        if (finalItem.images_json && Array.isArray(finalItem.images_json) && finalItem.images_json.length > 0) {
            primaryImage = finalItem.images_json[0].url || primaryImage;
        }

        return {
            ...finalItem,
            id: finalItem.id.toString(),
            title: finalItem.title || "NO_TITLE",
            content: finalItem.body_main || finalItem.body_text || "",
            image: primaryImage,
            is_adult: !!finalItem.is_adult,
            site: finalItem.site || 'unknown',
            metadata: finalItem.extra_metadata || {},
            images: finalItem.images_json || []
        };
    }

    console.error(`❌ [API-ERROR] Failed to fetch post ${cleanId}. Status: ${status}`);
    return null;
}

export const fetchNewsArticles = fetchPostList;