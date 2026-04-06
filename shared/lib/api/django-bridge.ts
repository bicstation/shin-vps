/**
 * =====================================================================
 * 🌉 Django-Bridge 統合サービス層 (v7.9 - Multi-Environment Final)
 * 🛡️ Maya's Logic: 源流スラッシュ排除・指揮系統一本化
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
    
    // config.ts から解決済みのベースURLを取得（?site=xxx が付いている可能性あり）
    const baseUrl = getDjangoBaseUrl(); 
    if (!baseUrl) return data;
    
    // 置換に使用するのは「純粋なURL部分」のみ
    const cleanBaseUrl = baseUrl.split('?')[0].replace(/\/+$/, '');

    if (typeof data === 'object') {
        try {
            let content = JSON.stringify(data);
            /**
             * 🔍 内部ドメイン置換パターンの網羅
             */
            const internalPattern = /http:\/\/(django-v[23]|django-api-host|nginx-wp-v[23]|wordpress-.+v[23]|api-[a-z-]+-host|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
            
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
 * 🚀 さらに: Middlewareが刻印した 'x-project-id' も優先順位に加える。
 */
const resolveCurrentMetadata = async (manualHost?: string) => {
    let host = manualHost || "";

    try {
        const { headers } = await import('next/headers');
        const headerList = await headers();

        // 1. Middlewareが判定した「身分証」を最優先
        const preCalculatedHost = headerList.get('x-django-host') || headerList.get('x-project-id');
        
        if (preCalculatedHost && !manualHost) {
            host = preCalculatedHost;
        } else {
            // 2. ブラウザからの直接リクエストやフォールバック
            host = host || headerList.get('host') || "";
        }
    } catch (e) {
        // サーバーコンポーネント外（クライアントサイド等）での実行用
        host = host || process.env.NEXT_PUBLIC_SITE_DOMAIN || "";
    }

    // 🎯 ホスト名からスラッシュと不要なポート番号、空白を徹底除去
    const cleanHost = host.split(':')[0].replace(/\/+$/, '').trim().toLowerCase();
    
    // サイトメタデータを取得
    const meta = getSiteMetadata(cleanHost);

    // 🛡️ 内部保持している django_host も再洗浄
    if (meta.django_host) {
        meta.django_host = meta.django_host.replace(/\/+$/, '');
    }

    return meta;
};

/**
 * 🚀 【司令塔】統合コンテンツ・スイッチャー
 */
export async function fetchDjangoBridgeContent(params: any = {}): Promise<DjangoApiResponse<any>> {
    const meta = await resolveCurrentMetadata(params?.host);
    const contentType = params?.content_type || 'post';

    // 確定した「純粋な」身分証 (saving, tiper 等)
    const contextHost = meta.django_host;

    // 🚨 各 Logic 呼び出し時、contextHost を site パラメータとして確実に渡す
    // 1. 記事コンテンツ（News / Blog）
    if (contentType === 'news' || contentType === 'post') {
        return await fetchNewsLogic(params?.limit || 12, params?.offset || 0, contextHost);
    }

    // 2. 商品コンテンツ
    const logicParams = { 
        ...params, 
        site: contextHost, // 明示的に site を付与
        site_group: meta.site_tag, 
        host: contextHost 
    };

    if (meta.site_group === 'adult') {
        return await getAdultProductsLogic(logicParams);
    }
    
    return await fetchPCProductsLogic(logicParams);
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