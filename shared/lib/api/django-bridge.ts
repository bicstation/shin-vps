/**
 * =====================================================================
 * 🌉 Django-Bridge サービス層 (Maya's Logic v5.7 - Article Optimized)
 * =====================================================================
 * 修正内容: 
 * 1. fetchPostData のレスポンス処理を単一オブジェクト対応に修正
 * 2. Djangoのモデル名 (main_image_url等) を既存フロントのキー (image等) にマッピング
 * 3. APIエンドポイントの末尾スラッシュを補完し、404/301エラーを防止
 * 物理パス: /shared/lib/api/django-bridge.ts
 * =====================================================================
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getWpConfig, IS_SERVER, getDjangoBaseUrl } from './config';
import { resolveApiUrl as commonResolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from './django/client';
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
async function fetchFromBridge<T>(url: string, options: any = {}): Promise<{ data: any, status: number }> {
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
            data: replaceInternalUrls(data), 
            status: res.status 
        };
    } catch (e: any) {
        console.error(`🚨 [Bridge Fatal Error]: ${url} | ${e.message}`);
        return { 
            data: null, 
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
        // AIが投稿した直後の記事を表示するため、is_exported は必要に応じて調整
        is_exported: 'true' 
    });
    // 一覧取得用URL (末尾に / を付与するのがDjangoの標準)
    const url = commonResolveApiUrl(`news/?${query.toString()}`);
    const { data } = await fetchFromBridge<any>(url, { next: { revalidate: 300 } });
    
    return { 
        results: data?.results || [], 
        count: data?.count || 0 
    };
}

// --- 📝 記事コンテンツ機能 (Markdown File System + Django Hybrid) ---

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
    // Markdownがない場合は Django API のニュースを返す
    return await fetchNewsArticles(limit, offset);
}

/**
 * 📝 特定の記事データを取得
 */
export async function fetchPostData(postType: string = 'post', identifier: string): Promise<any> {
    // 1. Markdownファイルを優先確認
    const mdFilePath = path.join(POSTS_PATH, `${identifier}.md`);
    if (IS_SERVER && fs.existsSync(mdFilePath)) {
        try {
            const fileContent = fs.readFileSync(mdFilePath, 'utf-8');
            const { data, content } = matter(fileContent);
            return { ...data, body_text: content, content };
        } catch (e) { console.error("🚨 MD Detail Error:", e); }
    }

    // 2. Django API (Articleモデル) を確認
    // 詳細URLは /api/news/{id}/ の形式
    const url = commonResolveApiUrl(`news/${identifier}/`);
    const { data, status } = await fetchFromBridge<any>(url);

    if (status === 200 && data) {
        // results配列がない単一オブジェクトを想定し、キーをフロントエンド用にマッピング
        return {
            ...data,
            slug: data.id.toString(),
            date: data.created_at,
            image: data.main_image_url, // フロント用エイリアス
            content: data.body_text,    // フロント用エイリアス
            description: data.title,    // タイトルをディスクリプションに流用
        };
    }

    return null;
}

// --- 🔞 アダルトコンテンツ機能 ---

export async function getAdultProducts(params: any = {}): Promise<DjangoApiResponse<AdultProduct>> {
    const safeParams = params || {};
    const query = new URLSearchParams({
        limit: (safeParams.limit || 20).toString(),
        offset: (safeParams.offset || 0).toString(),
        ordering: safeParams.ordering || '-id',
    });
    const url = commonResolveApiUrl(`adult/unified-products/?${query.toString()}`);
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
    const url = commonResolveApiUrl(`general/pc-products/?${query.toString()}`);
    const { data } = await fetchFromBridge<PCProduct>(url);
    return { results: data?.results || [], count: data?.count || 0 };
}

export { fetchPostList as getSiteMainPosts };
export { getAdultProducts as getUnifiedProducts };