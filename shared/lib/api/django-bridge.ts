/**
 * =====================================================================
 * 🌉 Django-Bridge サービス層 (Maya's Logic v5.4 - Stability & Safety)
 * =====================================================================
 * 物理パス: /shared/lib/api/django-bridge.ts
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getWpConfig, IS_SERVER, getDjangoBaseUrl } from './config';
// 型定義
import { PCProduct, MakerCount } from './index'; 

// --- ✨ 【修正】環境を問わないパス解決 ---
const POSTS_PATH = path.join(process.cwd(), 'content', 'posts');

/**
 * 🔄 【修正済】ドメイン・一括置換ユーティリティ
 * 文字列でないデータや undefined が来ても落ちないようにガードを大幅強化
 */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;

    // オブジェクト/配列の場合は、一度文字列化して一括置換を試みる
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
            return data; // パースに失敗したら生データを返す
        }
    }

    // 文字列の場合の安全な置換
    if (typeof data === 'string') {
        const baseUrl = getDjangoBaseUrl();
        if (!baseUrl) return data;
        
        const cleanBaseUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');
        return data.replace(/http:\/\/(django-v3|nginx-wp-v[23]|127\.0\.0\.1|localhost)(:[0-9]+)?/g, cleanBaseUrl);
    }

    return data;
};

/**
 * 💡 【解決】内部URL解決ロジック
 */
const resolveApiUrl = (endpoint: string) => {
    const cleanEndpoint = endpoint.replace(/^\/?api\//, '').replace(/^\//, '');
    const baseUrl = getDjangoBaseUrl();
    const base = (baseUrl || '').replace(/\/$/, '');
    
    const hasQuery = cleanEndpoint.includes('?');
    const pathPart = hasQuery ? cleanEndpoint.split('?')[0] : cleanEndpoint;
    const queryPart = hasQuery ? '?' + cleanEndpoint.split('?')[1] : '';
    
    // Djangoの末尾スラッシュ厳格化に対応
    const slashedPath = pathPart.endsWith('/') ? pathPart : `${pathPart}/`;
    
    return `${base}/api/${slashedPath}${queryPart}`;
};

/**
 * 🛠️ 【通信】共通 Fetch ラッパー (エラーログ強化版)
 */
async function fetchFromBridge(url: string, options: any = {}) {
    const { host } = getWpConfig();
    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                'Host': host,
                'Accept': 'application/json',
                ...(options.headers || {}),
            },
            signal: AbortSignal.timeout(options.timeout || 8000)
        });

        if (!res.ok) {
            console.warn(`⚠️ [Bridge Status Error]: ${res.status} | URL: ${url}`);
            return { data: null, total: 0, status: res.status };
        }
        
        const data = await res.json();
        const total = parseInt(res.headers.get('X-WP-Total') || res.headers.get('X-Total-Count') || '0', 10);
        
        return { data: replaceInternalUrls(data), total, status: res.status };
    } catch (e: any) {
        console.error(`🚨 [Bridge Fatal Error]: ${url} | ${e.message}`);
        return { data: null, total: 0, error: e.message };
    }
}

// --- 📝 統合コンテンツ取得 (page.tsx 呼び出し用) ---

export async function fetchDjangoBridgeContent(params: any = {}) {
    const siteGroup = params?.site_group || '';
    if (siteGroup === 'bicstation') {
        return await fetchPCProducts(params);
    } else if (siteGroup === 'tiper' || siteGroup === 'avflash') {
        return await getAdultProducts(params);
    }
    return await fetchPostList('post', params?.limit, params?.offset);
}

// --- 📰 ニュース記事（Articleモデル）取得機能 ---

export async function fetchNewsArticles(limit = 12, offset = 0) {
    const query = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ordering: '-created_at',
        is_exported: 'true'
    });
    const url = resolveApiUrl(`news/?${query.toString()}`);
    const { data } = await fetchFromBridge(url, { next: { revalidate: 300 } });
    
    return { 
        results: data?.results || [], 
        count: data?.count || 0 
    };
}

// --- 📝 記事コンテンツ機能 (Markdown File System) ---

/**
 * ローカルの Markdown ファイルを優先し、なければ Django API へフォールバック
 */
export async function fetchPostList(postType: string = 'post', limit = 12, offset = 0) {
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
                                source_url: data.source_url || '',
                                ...data
                            };
                        } catch (err) {
                            return null;
                        }
                    }).filter(Boolean);

                    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    
                    return { 
                        results: posts.slice(offset, offset + (limit || 12)), 
                        count: posts.length 
                    };
                }
            }
        } catch (e) {
            console.error("🚨 MD Loading Error (Falling back to API):", e);
        }
    }

    // MDがない、または読み込み失敗時は API にフォールバック
    return await fetchNewsArticles(limit, offset);
}

/**
 * 個別記事の取得 (MDファイルを優先、なければ API)
 */
export async function fetchPostData(postType: string = 'post', identifier: string) {
    const mdFilePath = path.join(POSTS_PATH, `${identifier}.md`);

    if (IS_SERVER && fs.existsSync(mdFilePath)) {
        try {
            const fileContent = fs.readFileSync(mdFilePath, 'utf-8');
            const { data, content } = matter(fileContent);
            return { ...data, body_text: content };
        } catch (e) {
            console.error("🚨 MD Detail Read Error:", e);
        }
    }

    const url = resolveApiUrl(`news/${identifier}/`);
    const { data } = await fetchFromBridge(url);
    return data;
}

// --- 🔞 アダルトコンテンツ機能 ---

export async function getAdultProducts(params: any = {}) {
    const safeParams = params || {};
    const query = new URLSearchParams({
        limit: (safeParams.limit || 20).toString(),
        offset: (safeParams.offset || 0).toString(),
        ordering: safeParams.ordering || '-id',
        ...(safeParams.site_group && { site_group: safeParams.site_group })
    });
    const url = resolveApiUrl(`adult-products/?${query.toString()}`);
    const { data, total } = await fetchFromBridge(url, { next: { revalidate: 60 } });
    return { results: data?.results || [], count: data?.count || total };
}

// --- 💻 PC製品・ランキング機能 ---

export async function fetchPCProducts(params: any = {}) {
    const safeParams = params || {};
    const query = new URLSearchParams({
        limit: (safeParams.limit || 10).toString(),
        offset: (safeParams.offset || 0).toString(),
        ...(safeParams.maker && { maker: safeParams.maker }),
        ...(safeParams.site_group && { site_group: safeParams.site_group }),
        ...(safeParams.attribute && { attribute: safeParams.attribute })
    });
    const url = resolveApiUrl(`general/pc-products/?${query.toString()}`);
    const { data } = await fetchFromBridge(url);
    return { results: data?.results || [], count: data?.count || 0 };
}

/**
 * 互換性のためのエイリアス
 */
export { fetchPostList as getSiteMainPosts };
export { getAdultProducts as getUnifiedProducts };