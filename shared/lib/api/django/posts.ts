// @ts-nocheck
/**
 * =====================================================================
 * 📝 記事取得サービス (Zenith v10.3 - Logic Layer Sync)
 * 🛡️ Maya's Logic: [UNIVERSAL_DOCKER_FINAL] 導線完全同期版
 * =====================================================================
 */

import { resolveApiUrl as commonResolveApiUrl, handleResponseWithDebug, getDjangoHeaders } from './client';
import { getDjangoBaseUrl } from '../config';
import { UnifiedPost } from '../types';

/** 🔄 内部URL置換 (画像やリンクのURLを公開用に修正) */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    const baseUrl = getDjangoBaseUrl();
    if (!baseUrl) return data;
    
    // 💡 config.ts から取得したベースURLをクリーンなオリジンへ変換
    const cleanBaseUrl = baseUrl.split('?')[0].replace(/\/api$/, '').replace(/\/$/, '');
    
    if (typeof data === 'object') {
        try {
            let content = JSON.stringify(data);
            /**
             * 🔍 内部ホスト名のパターンを網羅
             * django-api-host や各コンテナ名、localhostを公開URLに置換
             */
            const internalPattern = /http:\/\/(django-v[23]|django-api-host|nginx-wp-v[23]|wordpress-.+v[23]|api-[a-z-]+-host|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
            
            content = content.replace(internalPattern, cleanBaseUrl);
            // 🚨 二重スラッシュ防止ロジック
            content = content.replace(/([^:])\/\//g, '$1/'); 
            
            return JSON.parse(content);
        } catch (e) { return data; }
    }
    return data;
};

/** 🛠️ 記事リソース専用 Fetch (身分証ヘッダーを付与) */
async function fetchPostRaw(url: string, options: any = {}, siteTag?: string) {
    // 💡 client.ts 経由で正しい身分証（x-django-host）を取得
    const djangoHeaders = getDjangoHeaders(siteTag);
    const res = await fetch(url, {
        ...options,
        headers: { ...djangoHeaders, ...(options.headers || {}) },
        signal: AbortSignal.timeout(10000)
    });
    const data = await handleResponseWithDebug(res, url);
    // 取得したデータの内部URLをすべて置換して返却
    return { data: replaceInternalUrls(data), status: res.status };
}

/** 📰 記事リストを取得 */
export async function fetchPostList(limit = 12, offset = 0, siteTag?: string, options: any = {}): Promise<{ results: UnifiedPost[], count: number }> {
    
    /**
     * 🎯 [識別子の同期] 
     * 上位レイヤー（djangoBridge）から渡された siteTag を信頼する
     */
    const finalSiteTag = siteTag || 'bicstation';

    // 🔞 アダルトセクター判定 (検閲を無効化する対象)
    const isAdultSector = ['avflash', 'tiper', 'bic-erog'].includes(finalSiteTag);
    const isGeneralSite = ['bicstation', 'saving'].includes(finalSiteTag);
    
    const queryParams = new URLSearchParams({
        // 🛡️ クリーンサイトは3倍取得してフィルタリング後の件数を確保
        limit: (isGeneralSite ? limit * 3 : limit).toString(),
        offset: offset.toString(),
        ordering: '-created_at',
        site: finalSiteTag, // Django ViewSet の get_queryset に直撃
    });

    const url = commonResolveApiUrl(`posts/?${queryParams.toString()}`, finalSiteTag); 
    const { data } = await fetchPostRaw(url, { ...options, next: { revalidate: 300 } }, finalSiteTag);

    let rawResults = data?.results || [];
    
    // 🛡️ [検閲ロジック] 一般サイト用
    if (!isAdultSector) {
        rawResults = rawResults.filter((item: any) => {
            const BAN_WORDS = ['セフレ', '中出し', 'アヘアヘ', '不倫', '熟女', 'エロ', 'AV'];
            const title = item.title || "";
            // メイン表示フラグがON かつ アダルトフラグOFF かつ 禁止ワードなし
            return item.show_on_main && !item.is_adult && !BAN_WORDS.some(word => title.includes(word));
        });
    }

    // 統一形式へ整形
    const results: UnifiedPost[] = rawResults.slice(0, limit).map((item: any) => {
        let mainImg = '/images/common/no-image.jpg';
        if (item.images_json && Array.isArray(item.images_json) && item.images_json.length > 0) {
            mainImg = item.images_json[0].url || item.main_image_url || mainImg;
        } else if (item.main_image_url) {
            mainImg = item.main_image_url;
        }

        return {
            ...item,
            id: item.id?.toString() || "", 
            slug: item.slug || item.id?.toString() || "",
            image: mainImg,
            content: item.body_main || item.body_text || "", // メイン本文
            summary: item.body_satellite || "",             // ✅ AI要約（サテライト）
            site: item.site || finalSiteTag,
        };
    });

    return { results, count: data?.count || 0 };
}

/** 📝 特定の記事詳細データを取得 */
export async function fetchPostData(id: string, siteTag?: string): Promise<UnifiedPost | null> {
    if (!id) return null;
    const cleanId = id.toString().replace(/\/+$/, '');
    const finalSiteTag = siteTag || 'bicstation';

    const isAdultSector = ['avflash', 'tiper', 'bic-erog'].includes(finalSiteTag);
        
    const url = commonResolveApiUrl(`posts/${cleanId}/?site=${finalSiteTag}`, finalSiteTag);
    const { data, status } = await fetchPostRaw(url, { next: { revalidate: 60 } }, finalSiteTag);

    // Django側が results 配列で返すケースと単体で返すケースの両方に対応
    let finalItem = data;
    if (data && data.results && Array.isArray(data.results) && data.results.length > 0) {
        finalItem = data.results[0];
    }

    if (status === 200 && finalItem && finalItem.id !== undefined) {
        // 🛡️ 詳細ページでの検閲ガード
        if (!isAdultSector && !finalItem.show_on_main && finalItem.is_adult) {
            console.warn(`⚠️ [API] Post ${cleanId} restricted on general site.`);
            return null;
        }

        let primaryImage = '/images/common/no-image.jpg';
        if (finalItem.images_json && Array.isArray(finalItem.images_json) && finalItem.images_json.length > 0) {
            primaryImage = finalItem.images_json[0].url || primaryImage;
        } else if (finalItem.main_image_url) {
            primaryImage = finalItem.main_image_url;
        }

        return {
            ...finalItem,
            id: finalItem.id.toString(),
            title: finalItem.title || "NO_TITLE",
            content: finalItem.body_main || finalItem.body_text || "",
            summary: finalItem.body_satellite || "", // ✅ AI要約を詳細でも利用可能
            image: primaryImage,
            is_adult: !!finalItem.is_adult,
            site: finalItem.site || finalSiteTag,
            metadata: finalItem.extra_metadata || {},
            images: finalItem.images_json || []
        };
    }

    return null;
}

/** 🚀 エイリアス設定 */
export { fetchPostList as fetchNewsArticles };