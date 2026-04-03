/**
 * 📝 記事取得サービス (shared/lib/api/django/posts.ts)
 * 🛡️ Maya's Logic v7.6 - SHIN-VPS v3.9 [POSTS UNIFICATION - FINAL]
 */
import { resolveApiUrl as commonResolveApiUrl, handleResponseWithDebug, getDjangoHeaders } from './client';
import { getWpConfig, getDjangoBaseUrl } from '../config';
import { UnifiedPost, DjangoApiResponse } from '../types'; // 型をインポート

/** 🔄 内部URL置換 (Traefik/Container ホスト名対応) */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    const baseUrl = getDjangoBaseUrl();
    if (!baseUrl) return data;
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');
    const content = JSON.stringify(data);
    
    const internalPattern = /http:\/\/(django-v[23]|nginx-wp-v[23]|wordpress-.+v[23]|api-[a-z-]+-host|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
    
    try {
        const replaced = content.replace(internalPattern, cleanBaseUrl).replace(/([^:])\/\//g, '$1/');
        return JSON.parse(replaced);
    } catch (e) { return data; }
};

/** 🛠️ 記事リソース専用 Fetch */
async function fetchPostRaw(url: string, options: any = {}) {
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

/** 📰 プロジェクトごとの記事リストを取得 (UnifiedPost形式で返却) */
export async function fetchPostList(
    limit = 12, 
    offset = 0, 
    project?: string
): Promise<{ results: UnifiedPost[], count: number }> {
    
    const isGeneralSite = ['bicstation', 'saving', 'bicstation-host', 'saving-host'].includes(project || '');
    const fetchLimit = isGeneralSite ? limit * 3 : limit; // 一般サイトはフィルタリング分多めに取得

    const query = new URLSearchParams({
        limit: fetchLimit.toString(),
        offset: offset.toString(),
        ordering: '-created_at',
    });

    if (project && project !== 'all') {
        query.append('project', project);
    }

    const url = commonResolveApiUrl(`posts/?${query.toString()}`);
    const { data } = await fetchPostRaw(url, { next: { revalidate: 300 } });

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
        // 優先順位を明確にして「画像なし」を回避
        image: item.main_image_url || 
               (item.images_json && item.images_json[0]?.url) || 
               item.thumbnail || 
               '/images/common/no-image.jpg',
        // 本文の統合
        content: item.body_main || item.body_text || item.content || "",
        // v5.1 物理カラムの保証
        is_adult: !!item.is_adult,
        site: item.site || 'unknown',
    }));

    return { results, count: data?.count || 0 };
}

/** 📝 特定の記事詳細データを取得 */
export async function fetchPostData(id: string, project?: string): Promise<UnifiedPost | null> {
    const url = commonResolveApiUrl(`posts/${id}/`);
    const { data, status } = await fetchPostRaw(url, { next: { revalidate: 60 } });

    if (status === 200 && data) {
        // 安全ガード
        if (data.is_adult === true && ['bicstation', 'saving'].includes(project || '')) {
            return null;
        }

        return {
            ...data,
            id: data.id.toString(),
            slug: data.slug || data.id.toString(),
            image: data.main_image_url || 
                   (data.images_json && data.images_json[0]?.url) || 
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