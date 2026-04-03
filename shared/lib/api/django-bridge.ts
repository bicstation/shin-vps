/**
 * =====================================================================
 * 🌉 Django-Bridge 統合サービス層 (v7.3 - Build Safe & Auto-Router)
 * 🛡️ Maya's Logic: ビルドエラー回避 & ドメイン自動検知
 * 💡 実行時にのみ headers() を参照し、ビルド時の依存関係エラーを物理的に遮断します。
 * =====================================================================
 */

import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import { getWpConfig, getDjangoBaseUrl } from './config';
import { 
    resolveApiUrl as commonResolveApiUrl, 
    getDjangoHeaders, 
    handleResponseWithDebug 
} from './django/client';

// 🚀 各専門ロジック
import { fetchPCProducts as fetchPCProductsLogic } from './django/pc';
import { getUnifiedProducts as getAdultProductsLogic } from './django/adult';
import { fetchNewsArticles as fetchNewsLogic, fetchPostData as fetchNewsDetail } from './django/news';

import { DjangoApiResponse } from './types';

/**
 * 🔄 【共通機能】ドメイン・一括置換ユーティリティ
 */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    const baseUrl = getDjangoBaseUrl();
    if (!baseUrl) return data;
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');

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
 * 💡 重要: ビルドエラーを避けるため、headers() は動的インポートまたは
 * try-catch 内で慎重に実行し、失敗時はデフォルト値を返します。
 */
const resolveCurrentProject = async (): Promise<string> => {
    try {
        // ビルド時にここが評価されるのを防ぐため、実行時にのみ next/headers を取得
        const { headers } = await import('next/headers');
        const headerList = await headers();
        const host = headerList.get('host') || "";
        const siteData = getSiteMetadata(host);
        return siteData?.site_name || 'bicstation';
    } catch (e) {
        // ビルド時や headers が使えないコンテキストではデフォルトを返す
        return process.env.NEXT_PUBLIC_DEFAULT_PROJECT || 'bicstation';
    }
};

/**
 * 🚀 【司令塔】統合コンテンツ・スイッチャー
 */
export async function fetchDjangoBridgeContent(params: any = {}): Promise<DjangoApiResponse<any>> {
    // 明示的な指定がなければ自動判定
    const siteGroup = params?.site_group || await resolveCurrentProject();
    const contentType = params?.content_type || 'post';

    if (contentType === 'news' || contentType === 'post') {
        return await fetchNewsLogic(params?.limit || 12, params?.offset || 0, siteGroup);
    }

    if (siteGroup.includes('tiper') || siteGroup.includes('avflash') || siteGroup.includes('saving')) {
        return await getAdultProductsLogic({ ...params, site_group: siteGroup });
    }
    
    return await fetchPCProductsLogic({ ...params, site_group: siteGroup });
}

/**
 * 📄 記事リスト取得のメインゲート
 * 修正: 引数 project を最優先し、未指定時のみ動的解決を行います。
 */
export async function fetchPostList(postType = 'post', limit = 12, offset = 0, project?: string) {
    const targetProject = project || await resolveCurrentProject();
    return await fetchNewsLogic(limit, offset, targetProject);
}

/**
 * 📰 記事詳細取得のメインゲート
 */
export async function fetchPostData(type: string, id: string, project?: string) {
    const targetProject = project || await resolveCurrentProject();
    return await fetchNewsDetail(id, targetProject);
}

/**
 * 💎 エイリアス & 互換性維持
 */
export const fetchNewsArticles = fetchNewsLogic;
export { fetchPostList as getSiteMainPosts };
export const fetchPCProducts = fetchPCProductsLogic;
export const getAdultProducts = getAdultProductsLogic;
export const getUnifiedProducts = getAdultProductsLogic;