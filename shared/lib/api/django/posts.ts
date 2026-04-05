/**
 * 📝 記事取得サービス (shared/lib/api/django/posts.ts)
 * 🛡️ Zenith v8.7 - [TOTAL_PORT_CLEANUP]
 * 修正内容:
 * - project 引数からポート番号 (:8083 等) を物理的に切断。
 * - getDjangoHeaders() の結果を尊重し、Hostヘッダーの二重書き換えによる汚染を防止。
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
    // 🚀 [FIX] client.ts で生成された「正規化済みヘッダー」をベースにする
    // これにより、ここでの手動な Host 上書きによる事故を防ぐ
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
    
    // 🛡️ [CRITICAL FIX] サイト識別子の「絶対洗浄」
    // 入力が 'tiper-host:8083' でも 'tiper' に変換し、ポート番号を抹殺する
    const siteTag = (project || 'bicstation')
        .split(':')[0]             // 🔥 1. ポート番号を真っ先に切断
        .split('/')[0]             // 🔥 2. スラッシュ以降も切断
        .replace('api-', '')       // 3. プレフィックス除去
        .replace('-host', '')      // 4. サフィックス除去
        .trim();

    const isGeneralSite = ['bicstation', 'saving'].includes(siteTag);
    const fetchLimit = isGeneralSite ? limit * 3 : limit; 

    // クエリパラメータの構築
    const queryParams = new URLSearchParams({
        limit: fetchLimit.toString(),
        offset: offset.toString(),
        ordering: '-created_at',
    });

    // 🎯 Djangoが期待する「純粋なsite名」を付与
    if (siteTag !== 'all') {
        queryParams.append('site', siteTag); 
    }

    /**
     * 🛰️ URL解決の正規化
     * siteTag を渡すことで、resolveApiUrl 内での Host 解決もクリーンに行う
     */
    const baseEndpoint = 'posts/'; 
    const finalEndpoint = `${baseEndpoint}?${queryParams.toString()}`;
    const url = commonResolveApiUrl(finalEndpoint, siteTag); 

    const { data } = await fetchPostRaw(url, { 
        ...options,
        next: { revalidate: 0 } 
    }, siteTag);

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
    
    // 🔥 project からポートを除去して解決
    const cleanProject = (project || '').split(':')[0];
    const url = commonResolveApiUrl(`posts/${cleanId}/`, cleanProject);
    
    const { data, status } = await fetchPostRaw(url, { next: { revalidate: 60 } }, cleanProject);

    if (status === 200 && data) {
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