/**
 * =====================================================================
 * 🌉 Django-Bridge 統合サービス層 (v7.6 - Middleware Linked)
 * 🛡️ Maya's Logic: 指揮系統一本化・Middleware判定再利用
 * =====================================================================
 * 🚀 修正ポイント:
 * 1. 【Middleware連携】x-django-hostヘッダーを優先し、再判定のコストとリスクを排除。
 * 2. 【引数伝播】すべてのfetchロジックへ確定したhost（身分証）を確実に渡す。
 * 3. 【一括置換】内部URL置換時にsiteConfig由来のbaseUrlを適用。
 * =====================================================================
 */

import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import { getDjangoBaseUrl } from './config';
import { 
    resolveApiUrl as commonResolveApiUrl, 
    getDjangoHeaders, 
    handleResponseWithDebug 
} from './django/client';

// 🚀 各ドメイン専門ロジック
import { fetchPCProducts as fetchPCProductsLogic } from './django/pc';
import { getUnifiedProducts as getAdultProductsLogic } from './django/adult';
import { fetchPostList as fetchNewsLogic, fetchPostData as fetchNewsDetail } from './django/posts';

import { DjangoApiResponse } from './types';

/**
 * 🔄 【共通機能】内部URL・一括置換ユーティリティ
 */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    const baseUrl = getDjangoBaseUrl();
    if (!baseUrl) return data;
    
    // siteConfig側でクリーニング済みのURLを使用
    const cleanBaseUrl = baseUrl;

    if (typeof data === 'object') {
        try {
            let content = JSON.stringify(data);
            const internalPattern = /http:\/\/(django-v[23]|nginx-wp-v[23]|wordpress-.+v[23]|api-[a-z-]+-host|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
            content = content.replace(internalPattern, cleanBaseUrl).replace(/([^:])\/\//g, '$1/'); 
            return JSON.parse(content);
        } catch (e) { return data; }
    }
    return data;
};

/**
 * 🛰️ 【安全なプロジェクト検知】
 * Middlewareでセットされたヘッダーを最優先し、不一致を物理的に防ぎます。
 */
const resolveCurrentMetadata = async (manualHost?: string) => {
    let host = manualHost || "";

    try {
        const { headers } = await import('next/headers');
        const headerList = await headers();

        // 🛡️ Middlewareが焼いた「判定済みHost」があればそれを信じる
        const preCalculatedHost = headerList.get('x-django-host');
        if (preCalculatedHost && !manualHost) {
            // すでに判定済みなら、その情報をベースにメタデータを取得
            return getSiteMetadata(preCalculatedHost);
        }

        // ヘッダーがない場合はブラウザのHostヘッダーから判定
        host = host || headerList.get('host') || "";
    } catch (e) {
        // ビルド時などのフォールバック
        host = host || process.env.NEXT_PUBLIC_SITE_DOMAIN || "";
    }

    return getSiteMetadata(host);
};

/**
 * 🚀 【司令塔】統合コンテンツ・スイッチャー
 */
export async function fetchDjangoBridgeContent(params: any = {}): Promise<DjangoApiResponse<any>> {
    const meta = await resolveCurrentMetadata(params?.host);
    const contentType = params?.content_type || 'post';

    // django_host (身分証) を各ロジックに注入
    const contextHost = meta.django_host;

    // 1. 記事コンテンツ
    if (contentType === 'news' || contentType === 'post') {
        return await fetchNewsLogic(params?.limit || 12, params?.offset || 0, contextHost);
    }

    // 2. 商品コンテンツ (site_group により分岐)
    if (meta.site_group === 'adult') {
        return await getAdultProductsLogic({ 
            ...params, 
            site_group: meta.site_tag, 
            host: contextHost 
        });
    }
    
    return await fetchPCProductsLogic({ 
        ...params, 
        site_group: meta.site_tag, 
        host: contextHost 
    });
}

/**
 * 📄 記事リスト取得のメインゲート
 */
export async function fetchPostList(limit = 12, offset = 0, projectHost?: string) {
    const meta = await resolveCurrentMetadata(projectHost);
    return await fetchNewsLogic(limit, offset, meta.django_host);
}

/**
 * 📰 記事詳細取得のメインゲート
 */
export async function fetchPostData(id: string, projectHost?: string) {
    const meta = await resolveCurrentMetadata(projectHost);
    return await fetchNewsDetail(id, meta.django_host);
}

/**
 * 💎 エイリアス & 互換性維持
 */
export { 
    fetchNewsLogic as fetchNewsArticles,
    fetchNewsLogic as getSiteMainPosts,
    fetchPCProductsLogic as fetchPCProducts,
    getAdultProductsLogic as getAdultProducts,
    getAdultProductsLogic as getUnifiedProducts
};