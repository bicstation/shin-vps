/**
 * =====================================================================
 * 🌉 Django-Bridge サービス層 (Maya's Logic v5.6 - Stability & Safety)
 * =====================================================================
 * 修正内容: 
 * 1. client.ts v5.1 の URL 解決ルールに完全準拠
 * 2. 戻り値に具体的な型(PCProduct等)を割り当て、未使用インポート警告を解消
 * 物理パス: /shared/lib/api/django-bridge.ts
 * =====================================================================
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getWpConfig, IS_SERVER, getDjangoBaseUrl } from './config';
import { resolveApiUrl as commonResolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from './django/client';
// ✅ types から必要な型をすべてインポート (これで薄暗い警告が消えます)
import { 
    PCProduct, 
    AdultProduct, 
    DjangoApiResponse, 
    MakerCount 
} from './types';

const POSTS_PATH = path.join(process.cwd(), 'content', 'posts');

/**
 * 🔄 【置換】ドメイン・一括置換ユーティリティ
 */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    if (typeof data === 'object') {
        try {
            let content = JSON.stringify(data);
            const baseUrl = getDjangoBaseUrl();
            if (!baseUrl) return data;

            const cleanBaseUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');
            const internalPattern = /http:\/\/(django-v3|nginx-wp-v[23]|wordpress-.+v[23]|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
            
            content = content.replace(internalPattern, cleanBaseUrl);
            content = content.replace(/([^:])\/\//g, '$1/'); 
            
            return JSON.parse(content);
        } catch (e) {
            return data;
        }
    }
    if (typeof data === 'string') {
        const baseUrl = getDjangoBaseUrl();
        if (!baseUrl) return data;
        const cleanBaseUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');
        return data.replace(/http:\/\/(django-v3|nginx-wp-v[23]|127\.0\.0\.1|localhost)(:[0-9]+)?/g, cleanBaseUrl);
    }
    return data;
};

/**
 * 🛠️ 【通信】共通 Fetch ラッパー
 */
async function fetchFromBridge<T>(url: string, options: any = {}): Promise<{ data: DjangoApiResponse<T>, status: number }> {
    const { host } = getWpConfig();
    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                ...getDjangoHeaders(),
                'Host': host,
                ...(options.headers || {}),
            },
            signal: AbortSignal.timeout(options.timeout || 8000)
        });

        const data = await handleResponseWithDebug(res, url);
        
        return { 
            data: replaceInternalUrls(data) as DjangoApiResponse<T>, 
            status: res.status 
        };
    } catch (e: any) {
        console.error(`🚨 [Bridge Fatal Error]: ${url} | ${e.message}`);
        return { 
            data: { results: [], count: 0 } as DjangoApiResponse<T>, 
            status: 500 
        };
    }
}

// --- 📝 統合コンテンツ取得 ---

export async function fetchDjangoBridgeContent(params: any = {}): Promise<DjangoApiResponse<any>> {
    const siteGroup = params?.site_group || '';
    if (siteGroup === 'bicstation') {
        return await fetchPCProducts(params);
    } else if (siteGroup === 'tiper' || siteGroup === 'avflash') {
        return await getAdultProducts(params);
    }
    return await fetchPostList('post', params?.limit, params?.offset);
}

// --- 📰 ニュース記事 取得機能 ---

export async function fetchNewsArticles(limit = 12, offset = 0): Promise<DjangoApiResponse<any>> {
    const query = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ordering: '-created_at',
        is_exported: 'true'
    });
    const url = commonResolveApiUrl(`news?${query.toString()}`);
    const { data } = await fetchFromBridge<any>(url, { next: { revalidate: 300 } });
    
    return { 
        results: data?.results || [], 
        count: data?.count || 0 
    };
}

// --- 📝 記事コンテンツ機能 (Markdown File System) ---

export async function fetchPostList(postType: string = 'post', limit = 12, offset = 0): Promise<DjangoApiResponse<any>> {
    if (IS_SERVER) {
        try {
            if (fs.existsSync(POSTS_PATH)) {
                const files = fs.readdirSync(POSTS_PATH).filter(fn => fn.endsWith('.md'));
                if (files.length > 0) {
                    const posts = files.map(filename => {
                        try {
                            const filePath = path.join(POSTS_PATH, filename);
                            const fileContent = fs.readFileSync(filePath, 'utf-8');
                            const { data, content } = matter(fileContent);
                            return {
                                id: filename.replace('.md', ''),
                                slug: filename.replace('.md', ''),
                                title: data.title || 'No Title',
                                date: data.date || '',
                                image: data.image || '',
                                description: data.description || '',
                                body_text: content,
                                ...data
                            };
                        } catch (err) { return null; }
                    }).filter(Boolean);
                    posts.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    return { 
                        results: posts.slice(offset, offset + (limit || 12)), 
                        count: posts.length 
                    };
                }
            }
        } catch (e) {
            console.error("🚨 MD Loading Error:", e);
        }
    }
    return await fetchNewsArticles(limit, offset);
}

export async function fetchPostData(postType: string = 'post', identifier: string): Promise<any> {
    const mdFilePath = path.join(POSTS_PATH, `${identifier}.md`);
    if (IS_SERVER && fs.existsSync(mdFilePath)) {
        try {
            const fileContent = fs.readFileSync(mdFilePath, 'utf-8');
            const { data, content } = matter(fileContent);
            return { ...data, body_text: content };
        } catch (e) { console.error("🚨 MD Detail Error:", e); }
    }
    const url = commonResolveApiUrl(`news/${identifier}`);
    const { data } = await fetchFromBridge<any>(url);
    return data.results ? data.results[0] : data;
}

// --- 🔞 アダルトコンテンツ機能 ---

export async function getAdultProducts(params: any = {}): Promise<DjangoApiResponse<AdultProduct>> {
    const safeParams = params || {};
    const query = new URLSearchParams({
        limit: (safeParams.limit || 20).toString(),
        offset: (safeParams.offset || 0).toString(),
        ordering: safeParams.ordering || '-id',
    });
    const url = commonResolveApiUrl(`adult/unified-products?${query.toString()}`);
    // ✅ ジェネリクス <AdultProduct> を指定
    const { data } = await fetchFromBridge<AdultProduct>(url, { next: { revalidate: 60 } });
    return { results: data?.results || [], count: data?.count || 0 };
}

// --- 💻 PC製品・ランキング機能 ---

export async function fetchPCProducts(params: any = {}): Promise<DjangoApiResponse<PCProduct>> {
    const safeParams = params || {};
    const query = new URLSearchParams({
        limit: (safeParams.limit || 10).toString(),
        offset: (safeParams.offset || 0).toString(),
        ...(safeParams.maker && { maker: safeParams.maker }),
        ...(safeParams.site_group && { site_group: safeParams.site_group }),
        ...(safeParams.attribute && { attribute: safeParams.attribute })
    });
    const url = commonResolveApiUrl(`general/pc-products?${query.toString()}`);
    // ✅ ジェネリクス <PCProduct> を指定
    const { data } = await fetchFromBridge<PCProduct>(url);
    return { results: data?.results || [], count: data?.count || 0 };
}

export { fetchPostList as getSiteMainPosts };
export { getAdultProducts as getUnifiedProducts };