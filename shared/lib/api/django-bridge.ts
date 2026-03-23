/**
 * =====================================================================
 * 🌉 Django-Bridge 統合サービス層 (v7.1 - 交通整理・最適化版)
 * =====================================================================
 * 修正ポイント: 
 * 1. サイト名(bicstation)による「PC製品」への強制分岐を廃止。
 * 2. contentType (post/news) を最優先し、記事取得を確実に行う。
 * 3. 取りこぼしを防ぐため、デフォルトのフォールバックを記事取得に設定。
 * =====================================================================
 */

import { getWpConfig, getDjangoBaseUrl } from './config';
import { 
    getDjangoHeaders, 
    handleResponseWithDebug 
} from './django/client';

// 🚀 専門部隊（各ドメインのロジック）
import { fetchPCProducts as fetchPCProductsLogic } from './django/pc';
import { getUnifiedProducts as getAdultProductsLogic } from './django/adult';
import { fetchNewsArticles as fetchNewsLogic, fetchPostData as fetchNewsDetail } from './django/news';

import { DjangoApiResponse } from './types';

/**
 * 🔄 【共通】URL置換ユーティリティ (既存機能維持)
 */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    const baseUrl = getDjangoBaseUrl();
    if (!baseUrl) return data;
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');

    if (typeof data === 'object') {
        try {
            let content = JSON.stringify(data);
            const internalPattern = /http:\/\/(django-v[23]|nginx-wp-v[23]|wordpress-.+v[23]|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
            content = content.replace(internalPattern, cleanBaseUrl).replace(/([^:])\/\//g, '$1/'); 
            return JSON.parse(content);
        } catch (e) { return data; }
    }
    return data;
};

/**
 * 🚀 【司令塔】統合コンテンツ・スイッチャー (最適化版)
 * サイト名での「決め打ち」をやめ、目的（ContentType）で仕分けます。
 */
export async function fetchDjangoBridgeContent(params: any = {}): Promise<DjangoApiResponse<any>> {
    const siteGroup = params?.site_group || process.env.PROJECT_NAME || 'pc';
    const contentType = params?.content_type || 'post'; // 👈 ニュースか製品かの鍵

    // --- 🚦 交通整理開始 ---

    // 1️⃣ 【最優先】ニュース記事 (news / post) のリクエストなら、迷わずニュース窓口へ
    if (contentType === 'news' || contentType === 'post') {
        return await fetchNewsLogic(params?.limit || 12, params?.offset || 0, siteGroup);
    }

    // 2️⃣ PC製品 (product) かつ bicstation/pc サイトの場合
    if (contentType === 'product' && (siteGroup.includes('bicstation') || siteGroup === 'pc')) {
        return await fetchPCProductsLogic(params);
    }

    // 3️⃣ アダルト系ドメインの場合
    if (siteGroup.includes('tiper') || siteGroup.includes('avflash') || siteGroup.includes('saving')) {
        return await getAdultProductsLogic(params);
    }

    // 4️⃣ 【フォールバック】どれにも該当しない場合は、安全策として記事一覧を返す
    return await fetchNewsLogic(params?.limit || 12, params?.offset || 0, siteGroup);
}

/**
 * 📰 ニュース・記事取得の専門窓口
 */
export const fetchNewsArticles = fetchNewsLogic;
export const fetchPostData = fetchNewsDetail;

// NewsListPage から呼ばれるメイン関数
export async function fetchPostList(postType = 'post', limit = 12, offset = 0, project?: string) {
    // 司令塔を通さず、直接ニュースロジックを叩いて「取りこぼし」をゼロに
    return await fetchNewsLogic(limit, offset, project);
}

/**
 * 🖥️ PC / 🔞 アダルト エイリアス
 */
export const fetchPCProducts = fetchPCProductsLogic;
export const getAdultProducts = getAdultProductsLogic;
export const getUnifiedProducts = getAdultProductsLogic;

/**
 * 💎 互換用エイリアス
 */
export { fetchPostList as getSiteMainPosts };