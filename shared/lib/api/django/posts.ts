/**
 * 📝 記事取得サービス (shared/lib/api/django/posts.ts)
 * 🛡️ Maya's Logic v7.8 - SHIN-VPS [POSTS UNIFICATION - HOST_STRICT_MODE]
 */
import { resolveApiUrl as commonResolveApiUrl, handleResponseWithDebug, getDjangoHeaders } from './client';
import { getWpConfig, getDjangoBaseUrl } from '../config';
import { UnifiedPost } from '../types';

/** 🔄 内部URL置換 (Traefik/Container ホスト名対応) */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    const baseUrl = getDjangoBaseUrl();
    if (!baseUrl) return data;
    
    // api-base-url から末尾のスラッシュ等を除去して純粋なベースURLを抽出
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');
    
    if (typeof data === 'object') {
        try {
            let content = JSON.stringify(data);
            /**
             * 🔍 内部ネットワーク用ドメインを網羅的に検知して置換
             */
            const internalPattern = /http:\/\/(django-v[23]|nginx-wp-v[23]|wordpress-.+v[23]|api-[a-z-]+-host|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
            content = content.replace(internalPattern, cleanBaseUrl).replace(/([^:])\/\//g, '$1/'); 
            return JSON.parse(content);
        } catch (e) { 
            return data; 
        }
    }
    return data;
};

/** * 🛠️ 記事リソース専用 Fetch 
 * 🚀 修正: manualHost を受け取り、Django への身分証 (Hostヘッダー) を確定させる
 */
async function fetchPostRaw(url: string, options: any = {}, manualHost?: string) {
    // getWpConfig に manualHost を渡して、そのサイト用の host (api-xxx-host) を取得
    const config = getWpConfig(manualHost);
    const targetHost = manualHost || config.host;

    const res = await fetch(url, {
        ...options,
        headers: { 
            ...getDjangoHeaders(), 
            // 🛡️ CRITICAL: Djangoの洗浄エンジンが識別するためのHost名
            'Host': targetHost, 
            'x-django-host': targetHost,
            ...(options.headers || {}) 
        },
        signal: AbortSignal.timeout(10000)
    });

    const data = await handleResponseWithDebug(res, url);
    return { data: replaceInternalUrls(data), status: res.status };
}

/** 📰 プロジェクトごとの記事リストを取得 (UnifiedPost形式で返却) */
export async function fetchPostList(
    limit = 12, 
    offset = 0, 
    project?: string, // 'bicstation', 'tiper', 'avflash' 等が渡される
    options: any = {} 
): Promise<{ results: UnifiedPost[], count: number }> {
    
    // 一般サイトかどうかの判定 (アダルト除外フィルタ用)
    const isGeneralSite = ['bicstation', 'saving', 'bicstation-host', 'saving-host'].includes(project || '');
    
    // 一般サイトはフィルタで減る分を考慮して多めに取得
    const fetchLimit = isGeneralSite ? limit * 3 : limit; 

    const query = new URLSearchParams({
        limit: fetchLimit.toString(),
        offset: offset.toString(),
        ordering: '-created_at',
    });

    /**
     * 🎯 Django API パラメータ設定
     * project がある場合は site パラメータとして付与
     */
    if (project && project !== 'all') {
        query.append('site', project); 
    }

    /**
     * 🛰️ URL解決
     * 🚀 [FIX]: commonResolveApiUrl にも project を渡し、
     * siteConfig 経由で api-xxx-host:8083 へのパスを生成させる
     */
    const url = commonResolveApiUrl(`posts/?${query.toString()}`, project); 

    // 🚀 fetchPostRaw に project (身分証) を渡して実行
    const { data } = await fetchPostRaw(url, { 
        ...options,
        next: { revalidate: 0 } 
    }, project);

    let rawResults = data?.results || [];

    /** 🛡️ フロントエンド・セーフティフィルタ (二重検閲) */
    if (isGeneralSite) {
        rawResults = rawResults.filter((item: any) => {
            if (item.is_adult === true) return false;

            const meta = item.extra_metadata || {};
            const isAdultMeta = meta.is_adult === true || meta.rating === 'adult';
            const BAN_WORDS = ['セフレ', '中出し', 'アヘアヘ', '不倫', '熟女', 'エロ', 'AV'];
            const title = item.title || "";
            const hasBanWord = BAN_WORDS.some(word => title.includes(word));

            return !isAdultMeta && !hasBanWord;
        });
    }

    // 🔄 UnifiedPost への変換処理
    const results: UnifiedPost[] = rawResults.slice(0, limit).map((item: any) => ({
        ...item,
        id: item.id.toString(),
        slug: item.slug || item.id.toString(),
        image: item.main_image_url || 
               (item.images_json && Array.isArray(item.images_json) && item.images_json[0]?.url) || 
               item.thumbnail || 
               '/images/common/no-image.jpg',
        content: item.body_main || item.body_text || item.content || "",
        is_adult: !!item.is_adult,
        site: item.site || 'unknown',
    }));

    return { results, count: data?.count || 0 };
}

/** 📝 特定の記事詳細データを取得 */
export async function fetchPostData(id: string, project?: string): Promise<UnifiedPost | null> {
    // 詳細取得時も Host 判定ができるよう project を渡す
    const url = commonResolveApiUrl(`posts/${id}/`, project);
    const { data, status } = await fetchPostRaw(url, { next: { revalidate: 60 } }, project);

    if (status === 200 && data) {
        // 一般サイトでのアダルトコンテンツ誤表示防止
        if (data.is_adult === true && ['bicstation', 'saving'].includes(project || '')) {
            return null;
        }

        return {
            ...data,
            id: data.id.toString(),
            slug: data.slug || data.id.toString(),
            image: data.main_image_url || 
                   (data.images_json && Array.isArray(data.images_json) && data.images_json[0]?.url) || 
                   data.thumbnail || 
                   '/images/common/no-image.jpg',
            content: data.body_main || data.body_text || data.content || "",
            is_adult: !!data.is_adult,
            site: data.site || 'unknown',
        };
    }
    return null;
}

export const fetchNewsArticles = fetchPostList;