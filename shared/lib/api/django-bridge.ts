// @ts-nocheck
/**
 * =====================================================================
 * 🌉 Django-Bridge 統合サービス層 (v8.0 - Tag-Synchronized)
 * 🛡️ Maya's Logic: site_tag による指揮系統の完全同期
 * =====================================================================
 */
// /home/maya/shin-vps/shared/lib/api/django-bridge.ts

import { getSiteMetadata } from '../utils/siteConfig';
import { getDjangoBaseUrl } from './config';

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
    
    const cleanBaseUrl = baseUrl.split('?')[0].replace(/\/+$/, '');

    if (typeof data === 'object') {
        try {
            let content = JSON.stringify(data);
            /**
             * 🔍 内部ドメイン置換パターンの網羅
             */
            const internalPattern = /http:\/\/(django-v[23]|django-api-host|nginx-wp-v[23]|wordpress-.+v[23]|api-[a-z-]+-host|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
            
            content = content.replace(internalPattern, cleanBaseUrl);
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
 * v22.0 の site_tag を取得するための基盤
 */
const resolveCurrentMetadata = async (manualHost?: string) => {
    let host = manualHost || "";

    try {
        const { headers } = await import('next/headers');
        const headerList = await headers();

        // Middleware 刻印を優先
        const preCalculatedHost = headerList.get('x-django-host') || headerList.get('x-project-id');
        
        if (preCalculatedHost && !manualHost) {
            host = preCalculatedHost;
        } else {
            host = host || headerList.get('host') || "";
        }
    } catch (e) {
        host = host || process.env.NEXT_PUBLIC_SITE_DOMAIN || "";
    }

    const cleanHost = host.split(':')[0].replace(/\/+$/, '').trim().toLowerCase();
    
    // v22.0 仕様のメタデータを取得
    return getSiteMetadata(cleanHost);
};

/**
 * 🚀 【司令塔】統合コンテンツ・スイッチャー
 */
export async function fetchDjangoBridgeContent(params: any = {}): Promise<DjangoApiResponse<any>> {
    const meta = await resolveCurrentMetadata(params?.host);
    const contentType = params?.content_type || 'post';

    /**
     * 🎯 【最重要修正】contextTag (tiper, saving 等) を指揮系統の主軸にする
     * Django 側の ?site= パラメータには、物理ホスト名ではなくこの tag を送る
     */
    const contextTag = meta.site_tag;

    // 1. 記事コンテンツ（News / Blog）
    if (contentType === 'news' || contentType === 'post') {
        return await fetchNewsLogic(params?.limit || 12, params?.offset || 0, contextTag);
    }

    // 2. 商品コンテンツ
    const logicParams = { 
        ...params, 
        site: contextTag,        // 明示的に純粋な tag を付与
        site_group: meta.site_group, 
        host: meta.django_host   // 物理的な通信先ホスト情報は保持
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
    // django_host ではなく site_tag を渡すことで導線を一致させる
    return await fetchNewsLogic(limit, offset, meta.site_tag);
}

/**
 * 📰 記事詳細取得のメインゲート
 */
export async function fetchPostData(id: string, projectHost?: string) {
    const meta = await resolveCurrentMetadata(projectHost);
    const cleanId = id.toString().replace(/\/+$/, '');
    return await fetchNewsDetail(cleanId, meta.site_tag);
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