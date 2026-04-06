/**
 * 📝 記事取得サービス (shared/lib/api/django/posts.ts)
 * 🛡️ Zenith v10.2 - [UNIVERSAL_DOCKER_FINAL]
 * 🚀 修正内容: 
 * 1. body_main と body_satellite (summary) の分離配信に完全対応。
 * 2. プロジェクト識別ロジックを強化し、内部DNS (django-api-host) に対応。
 * 3. 検閲の判定を site 識別子ベースで盤石化。
 * 4. 内部URL置換の置換対象に django-api-host を追加。
 */
import { resolveApiUrl as commonResolveApiUrl, handleResponseWithDebug, getDjangoHeaders } from './client';
import { getDjangoBaseUrl } from '../config';
import { UnifiedPost } from '../types';

/** 🔄 内部URL置換 (画像やリンクのURLを公開用に修正) */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    const baseUrl = getDjangoBaseUrl();
    if (!baseUrl) return data;
    
    // ベースURLからAPIパスを除去した純粋なオリジン
    const cleanBaseUrl = baseUrl.split('?')[0].replace(/\/api$/, '').replace(/\/$/, '');
    
    if (typeof data === 'object') {
        try {
            let content = JSON.stringify(data);
            // 修正：内部ホスト名のパターンを網羅
            const internalPattern = /http:\/\/(django-v[23]|django-api-host|nginx-wp-v[23]|wordpress-.+v[23]|api-[a-z-]+-host|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
            
            content = content.replace(internalPattern, cleanBaseUrl);
            // 二重スラッシュを正規化
            content = content.replace(/([^:])\/\//g, '$1/'); 
            return JSON.parse(content);
        } catch (e) { return data; }
    }
    return data;
};

/** 🛠️ 記事リソース専用 Fetch (身分証ヘッダーを付与) */
async function fetchPostRaw(url: string, options: any = {}, manualHost?: string) {
    const djangoHeaders = getDjangoHeaders(manualHost);
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
export async function fetchPostList(limit = 12, offset = 0, project?: string, options: any = {}): Promise<{ results: UnifiedPost[], count: number }> {
    
    // 🎯 [識別子の正規化] projectから純粋なタグ (saving, tiper等) を抽出
    const rawInput = (project || 'avflash').toLowerCase();
    let finalSiteTag = 'bicstation';

    if (rawInput.includes('saving')) finalSiteTag = 'saving';
    else if (rawInput.includes('tiper')) finalSiteTag = 'tiper';
    else if (rawInput.includes('avflash')) finalSiteTag = 'avflash';
    else if (rawInput.includes('bicstation') || rawInput.includes('station')) finalSiteTag = 'bicstation';
    else finalSiteTag = rawInput.split('.')[0].replace('api-', '').replace('-host', '');

    // 🔞 アダルトセクター判定 (検閲を無効化する対象)
    const isAdultSector = ['avflash', 'tiper'].includes(finalSiteTag);
    
    const queryParams = new URLSearchParams({
        // クリーンサイトは3倍取得してフィルタリング後の件数を確保
        limit: (['bicstation', 'saving'].includes(finalSiteTag) ? limit * 3 : limit).toString(),
        offset: offset.toString(),
        ordering: '-created_at',
        site: finalSiteTag, // Django ViewSet の get_queryset に直撃させる
    });

    const url = commonResolveApiUrl(`posts/?${queryParams.toString()}`, finalSiteTag); 
    const { data } = await fetchPostRaw(url, { ...options, next: { revalidate: 0 } }, finalSiteTag);

    let rawResults = data?.results || [];
    
    // 🛡️ [検閲ロジック]
    rawResults = rawResults.filter((item: any) => {
        if (isAdultSector) return true;
        const BAN_WORDS = ['セフレ', '中出し', 'アヘアヘ', '不倫', '熟女', 'エロ', 'AV'];
        const title = item.title || "";
        return item.show_on_main && !item.is_adult && !BAN_WORDS.some(word => title.includes(word));
    });

    // 統一形式へ整形
    const results: UnifiedPost[] = rawResults.slice(0, limit).map((item: any) => {
        let mainImg = '/images/common/no-image.jpg';
        if (item.images_json && item.images_json.length > 0) {
            mainImg = item.images_json[0].url || item.main_image_url || mainImg;
        }

        return {
            ...item,
            id: item.id?.toString() || "", 
            slug: item.slug || item.id?.toString() || "",
            image: mainImg,
            content: item.body_main || item.body_text || "", // メイン本文（詳細用）
            summary: item.body_satellite || "",             // ✅ AI要約（サテライト一覧用）
            site: item.site || finalSiteTag,
        };
    });
    return { results, count: data?.count || 0 };
}

/** 📝 特定の記事詳細データを取得 */
export async function fetchPostData(id: string, project?: string): Promise<UnifiedPost | null> {
    if (!id) return null;
    const cleanId = id.toString().replace(/\//g, '');
    
    // 識別子の正規化
    const rawInput = (project || 'avflash').toLowerCase();
    let cleanProject = 'bicstation';
    if (rawInput.includes('saving')) cleanProject = 'saving';
    else if (rawInput.includes('tiper')) cleanProject = 'tiper';
    else if (rawInput.includes('avflash')) cleanProject = 'avflash';
    else cleanProject = rawInput.split('.')[0].replace('api-', '').replace('-host', '');

    const isAdultSector = ['avflash', 'tiper'].includes(cleanProject);
        
    const url = commonResolveApiUrl(`posts/${cleanId}/?site=${cleanProject}`, cleanProject);
    const { data, status } = await fetchPostRaw(url, { next: { revalidate: 0 } }, cleanProject);

    let finalItem = data;
    if (data && data.results && Array.isArray(data.results) && data.results.length > 0) {
        finalItem = data.results[0];
    }

    if (status === 200 && finalItem && finalItem.id !== undefined) {
        if (!isAdultSector && !finalItem.show_on_main) {
            console.warn(`⚠️ [API] Post ${cleanId} restricted.`);
            return null;
        }

        let primaryImage = '/images/common/no-image.jpg';
        if (finalItem.images_json && Array.isArray(finalItem.images_json) && finalItem.images_json.length > 0) {
            primaryImage = finalItem.images_json[0].url || primaryImage;
        }

        return {
            ...finalItem,
            id: finalItem.id.toString(),
            title: finalItem.title || "NO_TITLE",
            content: finalItem.body_main || finalItem.body_text || "",
            summary: finalItem.body_satellite || "", // ✅ 詳細ページでも要約を利用可能に
            image: primaryImage,
            is_adult: !!finalItem.is_adult,
            site: finalItem.site || cleanProject,
            metadata: finalItem.extra_metadata || {},
            images: finalItem.images_json || []
        };
    }

    return null;
}

export const fetchNewsArticles = fetchPostList;