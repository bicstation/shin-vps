/**
 * =====================================================================
 * 🌉 Django-Bridge 統合サービス層 (v7.2 - Multi-Domain Auto-Router)
 * 🛡️ Maya's Logic: ドメイン自動検知 & 物理フィルタ同期版
 * 💡 headers() を利用し、呼び出し元を問わず最適なプロジェクトを特定します。
 * =====================================================================
 */

import { headers } from 'next/headers'; // ✅ 追加: ドメイン検知用
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig'; // ✅ 追加: サイト設定解決用
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
 * 修正: api-xxx-host 形式を置換対象に追加し、ブラウザでの画像表示を保証
 */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    const baseUrl = getDjangoBaseUrl();
    if (!baseUrl) return data;
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');

    if (typeof data === 'object') {
        try {
            let content = JSON.stringify(data);
            // 🚀 重要: 内部ネットワーク用ホスト名を公開URLに一括置換
            const internalPattern = /http:\/\/(django-v[23]|nginx-wp-v[23]|wordpress-.+v[23]|api-[a-z-]+-host|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
            content = content.replace(internalPattern, cleanBaseUrl).replace(/([^:])\/\//g, '$1/'); 
            return JSON.parse(content);
        } catch (e) { return data; }
    }
    return data;
};

/**
 * 🛰️ 【自動プロジェクト検知】内部ユーティリティ
 */
const resolveCurrentProject = async (): Promise<string> => {
    try {
        const headerList = await headers();
        const host = headerList.get('host') || "";
        const siteData = getSiteMetadata(host);
        return siteData?.site_name || 'bicstation';
    } catch (e) {
        return 'bicstation';
    }
};

/**
 * 🚀 【司令塔】統合コンテンツ・スイッチャー
 * 修正: 判定ロジックを強化し、ドメインに応じたデータを自動取得
 */
export async function fetchDjangoBridgeContent(params: any = {}): Promise<DjangoApiResponse<any>> {
    // プロジェクトが指定されていなければ自動判定
    const siteGroup = params?.site_group || await resolveCurrentProject();
    const contentType = params?.content_type || 'post';

    // 1. ニュース/記事のリクエストであれば、ニュースロジックへ
    if (contentType === 'news' || contentType === 'post') {
        return await fetchNewsLogic(params?.limit || 12, params?.offset || 0, siteGroup);
    }

    // 2. 製品(product)リクエストの場合の振り分け
    if (siteGroup.includes('tiper') || siteGroup.includes('avflash') || siteGroup.includes('saving')) {
        return await getAdultProductsLogic({ ...params, site_group: siteGroup });
    }
    
    return await fetchPCProductsLogic({ ...params, site_group: siteGroup });
}

/**
 * 📰 ニュース・記事取得
 */
export const fetchNewsArticles = fetchNewsLogic;
export const fetchPostData = fetchNewsDetail;

/**
 * 📄 NewsListPage から直接呼ばれるメイン関数
 * 修正: project が未指定の場合、自動的に現在のドメインから判定します。
 */
export async function fetchPostList(postType = 'post', limit = 12, offset = 0, project?: string) {
    // プロジェクトの解決 (引数優先 > 自動判定)
    const targetProject = project || await resolveCurrentProject();
    
    // 確実に news.ts の v7.0 ロジックへパスを通す
    return await fetchNewsLogic(limit, offset, targetProject);
}

/**
 * 💎 エイリアス設定
 */
export { fetchPostList as getSiteMainPosts };
export const fetchPCProducts = fetchPCProductsLogic;
export const getAdultProducts = getAdultProductsLogic;
export const getUnifiedProducts = getAdultProductsLogic;