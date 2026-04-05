/**
 * 📝 記事取得サービス (shared/lib/api/django/posts.ts)
 * 🛡️ Zenith v8.9 - [ULTIMATE_DOMAIN_CLEANUP]
 * 修正内容:
 * - siteTag 生成時に .split('.') を追加し、avflash.xyz などのドメイン拡張子を完全に除去。
 * - 全ての識別子を強制的に小文字化し、DBの site__exact 検索に適合させる。
 * - project 引数からのポート番号・パス・ホスト接尾辞の徹底洗浄。
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
     * 🛡️ [CRITICAL CLEANUP] サイト識別子の「絶対洗浄」
     * 'avflash.xyz', 'api-tiper-host:8083', 'saving.live/' 等を全て純粋なIDに変換する
     */
    const siteTag = (project || 'bicstation')
        .split(':')[0]             // 1. ポート番号除去 (:8083)
        .split('/')[0]             // 2. パス除去 (/)
        .split('.')[0]             // 🔥 3. ドメイン拡張子除去 (.xyz, .live, .com)
        .replace('api-', '')       // 4. プレフィックス除去
        .replace('-host', '')      // 5. サフィックス除去
        .toLowerCase()             // 6. DB検索用小文字化
        .trim();

    // サイト名に 'saving' が含まれる場合は一律 'saving' として扱う補正
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
    
    // project からドメイン名・ポートを徹底除去
    const cleanProject = (project || '')
        .split(':')[0]
        .split('.')[0]
        .toLowerCase();
        
    const url = commonResolveApiUrl(`posts/${cleanId}/`, cleanProject);
    const { data, status } = await fetchPostRaw(url, { next: { revalidate: 60 } }, cleanProject);

    if (status === 200 && data) {
        // フィルタリング用のサイト判定
        const siteTag = cleanProject.replace('api-', '').replace('-host', '').replace(/\//g, '');
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