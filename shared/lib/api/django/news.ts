/**
 * 📰 ニュース・記事取得サービス (shared/lib/api/django/news.ts)
 * 🛡️ Maya's Logic v6.6 - BICSTATION & SAVING メタデータ・クリーン仕様
 */
import { resolveApiUrl as commonResolveApiUrl, handleResponseWithDebug, getDjangoHeaders } from './client';
import { getWpConfig, getDjangoBaseUrl } from '../config';

/** 🔄 内部URL置換 */
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
    } catch (e) { return data; }
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

/** 📰 プロジェクトごとのニュース記事を取得 (JSONメタデータ判定版) */
export async function fetchNewsArticles(limit = 12, offset = 0, project?: string) {
    // 一般サイト(bicstation/saving)の場合は、フィルタリングを見越して多めに取得
    const isGeneralSite = project === 'bicstation' || project === 'saving';
    const fetchLimit = isGeneralSite ? limit * 5 : limit; // 安全のため5倍取得

    const query = new URLSearchParams({
        limit: fetchLimit.toString(),
        offset: offset.toString(),
        ordering: '-created_at',
    });

    if (project && project !== 'all') {
        query.append('project', project);
    }

    const url = commonResolveApiUrl(`news/?${query.toString()}`);
    const { data } = await fetchNewsRaw(url, { next: { revalidate: 300 } });

    let rawResults = data?.results || [];

    /**
     * 🛡️ JSONメタデータによるクリーン化
     * extra_metadata 内のフラグを最優先でチェック
     */
    if (isGeneralSite) {
        rawResults = rawResults.filter((item: any) => {
            const meta = item.extra_metadata || {};
            
            // 1. JSON内のアダルトフラグをチェック (is_adult, adult_flag 等)
            const isAdultFlag = meta.is_adult === true || meta.adult === true || meta.rating === 'adult';
            
            // 2. 念のためキーワード検閲も併用 (メタデータが漏れた場合の保険)
            const BAN_WORDS = ['セフレ', '中出し', 'アヘアヘ', '不倫', '熟女', 'エロ', 'AV'];
            const title = item.title || "";
            const hasBanWord = BAN_WORDS.some(word => title.includes(word));

            // アダルトフラグが立っておらず、かつ禁止ワードも含んでいないものだけを通す
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
export async function fetchPostData(postType: string = 'post', identifier: string) {
    const url = commonResolveApiUrl(`news/${identifier}/`);
    const { data, status } = await fetchNewsRaw(url, { next: { revalidate: 60 } });

    if (status === 200 && data) {
        // 詳細ページでも念のため検閲（直リンク対策）
        const meta = data.extra_metadata || {};
        if (meta.is_adult === true) return null;

        return {
            ...data,
            id: data.id.toString(),
            image: data.main_image_url || data.thumbnail || '/images/common/no-image.jpg',
            content: data.body_text || data.content,
        };
    }
    return null;
}