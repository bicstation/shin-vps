// @ts-nocheck
/**
 * =====================================================================
 * 📦 PC 製品一覧・詳細取得サービス (Zenith v11.0 - Search Optimized)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【識別子同期】site_tag を client.ts へ正確に伝達。
 * 2. 【画像解決】replaceInternalUrls を適用し、製品画像のリンク切れを防止。
 * 3. 【正規化】Django REST Framework の SearchFilter (search=) に完全準拠。
 * =====================================================================
 */

import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';
import { replaceInternalUrls } from '../posts'; // 💡 URL置換ロジックを再利用
import { getSiteMetadata } from '../../../utils/siteConfig';
import { PCProduct, MakerCount } from './types';

/**
 * 💡 サイトメタデータの取得 (内部判定用)
 */
const getSafeMeta = (host?: string) => {
    try {
        return getSiteMetadata(host || "");
    } catch (e) { return null; }
};

/**
 * 💡 PC製品一覧取得
 * @param q 検索キーワード
 * @param offset 開始位置
 * @param limit 件数
 * @param maker メーカー (DELL, HP等)
 * @param host ホスト名 (識別用)
 * @param attribute 特殊属性フィルタ
 */
export async function fetchPCProducts(
    q: string = '', 
    offset: number = 0, 
    limit: number = 12, 
    maker: string = '',
    host: string = '',
    attribute: string = ''
) {
    const meta = getSafeMeta(host);
    const siteTag = meta?.site_tag || 'bicstation';

    const queryParams = new URLSearchParams({ 
        offset: offset.toString(),
        limit: limit.toString(),
        site: siteTag // Django 側でサイト別在庫・価格を出し分けるためのキー
    });
    
    // 🚀 site_group による絞り込み (一般PC/中古PC等の棲み分け)
    if (meta?.site_group && meta.site_group !== 'general') {
        queryParams.append('site_group', meta.site_group);
    }
    
    // 🚀 検索・フィルタパラメータ
    if (q) queryParams.append('search', q); 
    if (maker) queryParams.append('maker', maker); 
    if (attribute) queryParams.append('attribute', attribute); 

    // 🔗 API URL の解決
    const url = resolveApiUrl(`general/pc-products/?${queryParams.toString()}`, siteTag);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(siteTag), 
            cache: 'no-store' 
        });
        
        const data = await handleResponseWithDebug(res, url);
        
        // 🛡️ 製品画像のURLが内部ドメイン (django-api-host等) の場合があるため置換
        const cleanedData = replaceInternalUrls(data);
        
        return { 
            results: (Array.isArray(cleanedData.results) ? cleanedData.results : []) as PCProduct[], 
            count: typeof cleanedData.count === 'number' ? cleanedData.count : 0, 
            _debug: { url } 
        };
    } catch (e: any) {
        console.error("🚨 [fetchPCProducts Error]", e);
        return { results: [], count: 0, _debug: { error: e.message, url } };
    }
}

/**
 * 💡 PC製品詳細取得 
 */
export async function fetchPCProductDetail(unique_id: string, host: string = ''): Promise<PCProduct | null> {
    const meta = getSafeMeta(host);
    const siteTag = meta?.site_tag || 'bicstation';
    
    const url = resolveApiUrl(`general/pc-products/${unique_id}/?site=${siteTag}`, siteTag);
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(siteTag), 
            cache: 'no-store' 
        });
        
        const data = await handleResponseWithDebug(res, url);
        const cleanedData = replaceInternalUrls(data);
        
        // 単体レスポンスまたは results[0] から抽出
        const product = (cleanedData && !Array.isArray(cleanedData.results)) 
            ? cleanedData 
            : (Array.isArray(cleanedData.results) && cleanedData.results.length > 0 ? cleanedData.results[0] : null);

        if (!product || (!product.unique_id && !product.id)) return null;

        return product as PCProduct;
    } catch (e) {
        console.error(`🚨 [fetchPCProductDetail Error] ID: ${unique_id}`, e);
        return null;
    }
}

/**
 * 💡 メーカー一覧取得 (サイドバー等のブランドリスト用)
 */
export async function fetchMakers(host: string = ''): Promise<MakerCount[]> {
    const meta = getSafeMeta(host);
    const siteTag = meta?.site_tag || 'bicstation';
    
    const url = resolveApiUrl(`general/pc-makers/?site=${siteTag}`, siteTag);
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(siteTag), 
            next: { revalidate: 3600 } 
        });
        
        const data = await handleResponseWithDebug(res, url);
        const cleanedData = replaceInternalUrls(data);
        
        return Array.isArray(cleanedData.results) 
            ? cleanedData.results 
            : (Array.isArray(cleanedData) ? cleanedData : []);
    } catch (e) {
        console.error("🚨 [fetchMakers Error]", e);
        return [];
    }
}