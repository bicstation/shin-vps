/**
 * 📰 ニュース・記事取得サービス (shared/lib/api/django/news.ts)
 * 🛡️ Maya's Logic v6.4 - 属性解除・復旧仕様
 */
import { resolveApiUrl as commonResolveApiUrl, handleResponseWithDebug, getDjangoHeaders } from './client';
import { getWpConfig, getDjangoBaseUrl } from '../config';

/** 🔄 内部URL置換 (VPSの内部ホスト名を公開URLへ) */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    const baseUrl = getDjangoBaseUrl();
    if (!baseUrl) return data;
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');
    
    const content = JSON.stringify(data);
    const internalPattern = /http:\/\/(django-v[23]|nginx-wp-v[23]|wordpress-.+v[23]|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
    
    try {
        const replaced = content.replace(internalPattern, cleanBaseUrl).replace(/([^:])\/\//g, '$1/');
        return JSON.parse(replaced);
    } catch (e) {
        return data;
    }
};

/** 🛠️ ニュース専用 Fetch */
async function fetchNewsRaw(url: string, options: any = {}) {
    const { host } = getWpConfig();
    const res = await fetch(url, {
        ...options,
        headers: { ...getDjangoHeaders(), 'Host': host, ...(options.headers || {}) },
        signal: AbortSignal.timeout(10000)
    });
    const data = await handleResponseWithDebug(res, url);
    return { data: replaceInternalUrls(data), status: res.status };
}

/** 📰 プロジェクトごとのニュース記事を取得 (属性解除版) */
export async function fetchNewsArticles(limit = 12, offset = 0, project?: string) {
    const query = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ordering: '-created_at',
    });

    // 🚀 属性解除: project や is_exported の絞り込みを一旦緩和
    if (project && project !== 'all') {
        query.append('project', project);
    }

    const url = commonResolveApiUrl(`news/?${query.toString()}`);
    const { data } = await fetchNewsRaw(url, { next: { revalidate: 300 } });

    const results = (data?.results || []).map((item: any) => ({
        ...item,
        id: item.id.toString(),
        slug: item.slug || item.id.toString(),
        image: item.main_image_url || item.thumbnail || '/images/common/no-image.jpg',
        content: item.body_text || item.content,
    }));

    return { results, count: data?.count || 0 };
}

/** 📝 特定の記事詳細データを取得 */
export async function fetchPostData(postType: string = 'post', identifier: string) {
    const url = commonResolveApiUrl(`news/${identifier}/`);
    const { data, status } = await fetchNewsRaw(url, { next: { revalidate: 60 } });

    if (status === 200 && data) {
        return {
            ...data,
            id: data.id.toString(),
            image: data.main_image_url || data.thumbnail || '/images/common/no-image.jpg',
            content: data.body_text || data.content,
        };
    }
    return null;
}