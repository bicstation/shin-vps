/**
 * 📝 記事取得サービス (shared/lib/api/django/posts.ts)
 * 🛡️ Zenith v9.0 - [THE_FINAL_BRIDGE]
 * 修正内容:
 * - api.bicstation.com 等のドメインから 'api' ではなく 'bicstation' を正確に抽出。
 * - ドメイン拡張子 (.xyz, .live) の除去と小文字化を徹底し、DjangoのDB照合を確実に成功させる。
 */
import { resolveApiUrl as commonResolveApiUrl, handleResponseWithDebug, getDjangoHeaders } from './client';
import { getWpConfig, getDjangoBaseUrl } from '../config';
import { UnifiedPost } from '../types';

/** 🔄 内部URL置換 (二重スラッシュ防止ロジック) */
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
        } catch (e) { 
            return data; 
        }
    }
    return data;
};

/** 🛠️ 記事リソース専用 Fetch */
async function fetchPostRaw(url: string, options: any = {}, manualHost?: string) {
    const djangoHeaders = getDjangoHeaders(manualHost);

    const res = await fetch(url, {
        ...options,
        headers: { 
            ...djangoHeaders, 
            ...(options.headers || {}) 
        },
        signal: AbortSignal.timeout(10000)
    });

    const data = await handleResponseWithDebug(res, url);
    return { data: replaceInternalUrls(data), status: res.status };
}

/** 📰 プロジェクトごとの記事リストを取得 */
export async function fetchPostList(
    limit = 12, 
    offset = 0, 
    project?: string, 
    options: any = {} 
): Promise<{ results: UnifiedPost[], count: number }> {
    
    /**
     * 🛡️ [ULTIMATE_CLEANUP] サイト識別子の「高精度抽出」
     * 例1: 'api.bicstation.com' -> ['api', 'bicstation', 'com'] -> 'bicstation'
     * 例2: 'avflash.xyz' -> ['avflash', 'xyz'] -> 'avflash'
     */
    const parts = (project || 'bicstation')
        .split(':')[0]   // ポート除去
        .split('/')[0]   // パス除去
        .split('.');     // ドメイン分割

    let rawTag = parts[0];

    // 🔥 [CRITICAL] 最初の節が 'api' の場合は、ドメイン主体である2番目の節を採用
    if (rawTag === 'api' && parts.length > 1) {
        rawTag = parts[1];
    }

    const siteTag = rawTag
        .replace('api-', '')       // api-xxx-host 形式の救済
        .replace('-host', '')      // サフィックス除去
        .toLowerCase()             // DB照合用（重要）
        .trim();

    // 'saving' を含むドメイン（bic-saving等）を 'saving' IDに正規化
    const finalSiteTag = siteTag.includes('saving') ? 'saving' : siteTag;

    const isGeneralSite = ['bicstation', 'saving'].includes(finalSiteTag);
    const fetchLimit = isGeneralSite ? limit * 3 : limit; 

    // クエリパラメータの構築
    const queryParams = new URLSearchParams({
        limit: fetchLimit.toString(),
        offset: offset.toString(),
        ordering: '-created_at',
    });

    // Djangoの site__exact フィルタに適合させる
    if (finalSiteTag !== 'all') {
        queryParams.append('site', finalSiteTag); 
    }

    /** 🛰️ URL解決の正規化 */
    const baseEndpoint = 'posts/'; 
    const finalEndpoint = `${baseEndpoint}?${queryParams.toString()}`;
    const url = commonResolveApiUrl(finalEndpoint, finalSiteTag); 

    const { data } = await fetchPostRaw(url, { 
        ...options,
        next: { revalidate: 0 } 
    }, finalSiteTag);

    let rawResults = data?.results || [];

    /** 🛡️ フロントエンド・セーフティフィルタ */
    if (isGeneralSite) {
        rawResults = rawResults.filter((item: any) => {
            if (item.is_adult === true) return false;
            const meta = item.extra_metadata || {};
            const isAdultMeta = meta.is_adult === true || meta.rating === 'adult';
            const BAN_WORDS = ['セフレ', '中出し', 'アヘアヘ', '不倫', '熟女', 'エロ', 'AV'];
            const title = item.title || "";
            return !isAdultMeta && !BAN_WORDS.some(word => title.includes(word));
        });
    }

    const results: UnifiedPost[] = rawResults.slice(0, limit).map((item: any) => ({
        ...item,
        id: item.id.toString(),
        slug: item.slug || item.id.toString(),
        image: item.main_image_url || '/images/common/no-image.jpg',
        content: item.body_main || item.body_text || item.content || "",
        is_adult: !!item.is_adult,
        site: item.site || 'unknown',
    }));

    return { results, count: data?.count || 0 };
}

/** 📝 特定の記事詳細データを取得 */
export async function fetchPostData(id: string, project?: string): Promise<UnifiedPost | null> {
    const cleanId = id.toString().replace(/\//g, '');
    
    // 詳細取得時もリスト取得時と同じ高精度ロジックを適用
    const parts = (project || '').split(':')[0].split('/')[0].split('.');
    let rawProject = parts[0];
    if (rawProject === 'api' && parts.length > 1) {
        rawProject = parts[1];
    }
    const cleanProject = rawProject.replace('api-', '').replace('-host', '').toLowerCase();
        
    const url = commonResolveApiUrl(`posts/${cleanId}/`, cleanProject);
    const { data, status } = await fetchPostRaw(url, { next: { revalidate: 60 } }, cleanProject);

    if (status === 200 && data) {
        const siteTag = cleanProject.replace(/\//g, '');
        if (data.is_adult === true && ['bicstation', 'saving'].includes(siteTag)) {
            return null;
        }

        return {
            ...data,
            id: data.id.toString(),
            image: data.main_image_url || '/images/common/no-image.jpg',
            content: data.body_main || data.body_text || "",
            is_adult: !!data.is_adult,
            site: data.site || 'unknown',
        };
    }
    return null;
}

export const fetchNewsArticles = fetchPostList;