/**
 * =====================================================================
 * 🌉 Django-Bridge 統合サービス層 (v7.8 - Final Production)
 * 🛡️ Maya's Logic: 源流スラッシュ排除・指揮系統一本化
 * =====================================================================
 * 🚀 修正ポイント:
 * 1. 【源流洗浄】resolveCurrentMetadata の出口でスラッシュを完全除去。
 * 2. 【二重正規化】replaceInternalUrls の置換ロジックをより安全に。
 * 3. 【一貫性】全エンドポイントへ「純粋な識別子」のみを供給。
 * =====================================================================
 */

import { getSiteMetadata } from '../utils/siteConfig';
import { getDjangoBaseUrl } from './config';

// 🚀 各ドメイン専門ロジック
import { fetchPCProducts as fetchPCProductsLogic } from './django/pc';
import { getUnifiedProducts as getAdultProductsLogic } from './django/adult';
import { fetchPostList as fetchNewsLogic, fetchPostData as fetchNewsDetail } from './django/posts';

import { DjangoApiResponse } from './types';

/**
 * 🔄 【共通機能】内部URL・一括置換ユーティリティ
 * Djangoコンテナ内の内部ホスト名を公開URLへ変換。
 */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    const baseUrl = getDjangoBaseUrl(); 
    if (!baseUrl) return data;
    
    // ベースURL自体の末尾スラッシュをケア
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');

    if (typeof data === 'object') {
        try {
            let content = JSON.stringify(data);
            /**
             * 🔍 内部ドメイン置換
             */
            const internalPattern = /http:\/\/(django-v[23]|nginx-wp-v[23]|wordpress-.+v[23]|api-[a-z-]+-host|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
            
            // 公開URLへ置換
            content = content.replace(internalPattern, cleanBaseUrl);
            
            // 🚨 二重スラッシュ防止 (プロトコルの :// は除外して置換)
            content = content.replace(/([^:])\/\//g, '$1/'); 
            
            return JSON.parse(content);
        } catch (e) { 
            return data; 
        }
    }
    return data;
};

/**
 * 🛰️ 【安全なプロジェクト検知】
 * 🛡️ 修正: 取得したホスト名から「末尾スラッシュ」を物理的に除去。
 */
const resolveCurrentMetadata = async (manualHost?: string) => {
    let host = manualHost || "";

    try {
        const { headers } = await import('next/headers');
        const headerList = await headers();

        // Middlewareが判定した「身分証」を優先
        const preCalculatedHost = headerList.get('x-django-host');
        if (preCalculatedHost && !manualHost) {
            host = preCalculatedHost;
        } else {
            host = host || headerList.get('host') || "";
        }
    } catch (e) {
        host = host || process.env.NEXT_PUBLIC_SITE_DOMAIN || "";
    }

    // 🎯 ホスト名からスラッシュを徹底除去 (これが &site=xxx/ の真犯人)
    const cleanHost = host.replace(/\/+$/, '').trim();
    const meta = getSiteMetadata(cleanHost);

    // 🛡️ 内部保持している django_host も再洗浄
    if (meta.django_host) {
        meta.django_host = meta.django_host.replace(/\/+$/, '');
    }

    return meta;
};

/**
 * 🚀 【司令塔】統合コンテンツ・スイッチャー
 * content_type に応じて適切な Django エンドポイントへ振り分けます。
 */
export async function fetchDjangoBridgeContent(params: any = {}): Promise<DjangoApiResponse<any>> {
    const meta = await resolveCurrentMetadata(params?.host);
    const contentType = params?.content_type || 'post';

    // 確定した「純粋な」身分証
    const contextHost = meta.django_host;

    // 1. 記事コンテンツ（News / Blog）
    if (contentType === 'news' || contentType === 'post') {
        // 🚨 contextHost が "bicstation" 等のスラッシュ無し文字列であることを保証
        return await fetchNewsLogic(params?.limit || 12, params?.offset || 0, contextHost);
    }

    // 2. 商品コンテンツ
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
    // ID側のスラッシュも念のため除去
    const cleanId = id.toString().replace(/\/+$/, '');
    return await fetchNewsDetail(cleanId, meta.django_host);
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