/**
 * 📝 記事取得サービス (shared/lib/api/django/posts.ts)
 * 🛡️ Maya's Logic v7.5 - SHIN-VPS v3.9 [POSTS UNIFICATION]
 * 💡 news.ts から改名し、エンドポイントを /api/posts/ に完全同期。
 */
import { resolveApiUrl as commonResolveApiUrl, handleResponseWithDebug, getDjangoHeaders } from './client';
import { getWpConfig, getDjangoBaseUrl } from '../config';

/** 🔄 内部URL置換 (Traefik/Container ホスト名対応) */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    const baseUrl = getDjangoBaseUrl();
    if (!baseUrl) return data;
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');
    const content = JSON.stringify(data);
    
    // v3.9 系の内部ドメインパターンを網羅
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

/** 📰 プロジェクト(ドメイン)ごとの記事リストを取得 */
export async function fetchPostList(limit = 12, offset = 0, project?: string) {
    // 一般サイト判定
    const isGeneralSite = ['bicstation', 'saving', 'bicstation-host', 'saving-host'].includes(project || '');
    
    // Django側の物理フィルタ(is_adult)があるため、取得数は最小限でOK
    const fetchLimit = isGeneralSite ? limit * 2 : limit; 

    const query = new URLSearchParams({
        limit: fetchLimit.toString(),
        offset: offset.toString(),
        ordering: '-created_at',
    });

    if (project && project !== 'all') {
        query.append('project', project);
    }

    // 🚩 エンドポイント: /api/posts/
    const url = commonResolveApiUrl(`posts/?${query.toString()}`);
    const { data } = await fetchPostRaw(url, { next: { revalidate: 300 } });

    let rawResults = data?.results || [];

    /**
     * 🛡️ フロントエンド・セーフティフィルタ (二重検閲)
     */
    if (isGeneralSite) {
        rawResults = rawResults.filter((item: any) => {
            // 1. 物理フラグチェック
            if (item.is_adult === true) return false;

            // 2. メタデータ & キーワードチェック
            const meta = item.extra_metadata || {};
            const isAdultMeta = meta.is_adult === true || meta.rating === 'adult';
            const BAN_WORDS = ['セフレ', '中出し', 'アヘアヘ', '不倫', '熟女', 'エロ', 'AV'];
            const title = item.title || "";
            const hasBanWord = BAN_WORDS.some(word => title.includes(word));

            return !isAdultMeta && !hasBanWord;
        });
    }

    const results = rawResults.slice(0, limit).map((item: any) => ({
        ...item,
        id: item.id.toString(),
        slug: item.slug || item.id.toString(),
        image: item.main_image_url || item.thumbnail || '/images/common/no-image.jpg',
        content: item.body_main || item.body_text || item.content, // v5.0 body_main 対応
    }));

    return { results, count: data?.count || 0 };
}

/** 📝 特定の記事詳細データを取得 */
export async function fetchPostData(id: string, project?: string) {
    // 🚩 エンドポイント: /api/posts/${id}/
    const url = commonResolveApiUrl(`posts/${id}/`);
    const { data, status } = await fetchPostRaw(url, { next: { revalidate: 60 } });

    if (status === 200 && data) {
        // 詳細ページでのアダルト混入防止
        if (data.is_adult === true) return null;

        return {
            ...data,
            id: data.id.toString(),
            image: data.main_image_url || data.thumbnail || '/images/common/no-image.jpg',
            content: data.body_main || data.body_text || data.content,
        };
    }
    return null;
}

// 💎 互換性のためのエイリアス
export const fetchNewsArticles = fetchPostList;