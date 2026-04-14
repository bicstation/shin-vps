// /home/maya/shin-vps/shared/lib/api/django/pc/products.ts
// @ts-nocheck

import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';
import { replaceInternalUrls } from '../../django-bridge';
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
 * 🛡️ 修正: site_name パラメータの追加とソートキーの分離
 */
export async function fetchPCProducts(
    paramsOrQ: any = '', 
    offsetArg: number = 0, 
    limitArg: number = 12, 
    makerArg: string = '',
    hostArg: string = '',
    attributeArg: string = ''
) {
    // --- 📥 引数の正規化ロジック ---
    const isObj = typeof paramsOrQ === 'object' && paramsOrQ !== null;
    
    const q         = isObj ? (paramsOrQ.q || paramsOrQ.search || '') : paramsOrQ;
    const offset    = isObj ? (paramsOrQ.offset ?? 0) : offsetArg;
    const limit     = isObj ? (paramsOrQ.limit ?? 12) : limitArg;
    const maker     = isObj ? (paramsOrQ.maker || '') : makerArg;
    const host      = isObj ? (paramsOrQ.host || '') : hostArg;
    const attribute = isObj ? (paramsOrQ.attribute || '') : attributeArg;

    const meta = getSafeMeta(host);
    const siteTag = isObj ? (paramsOrQ.site || meta?.site_tag || 'bicstation') : (meta?.site_tag || 'bicstation');

    // --- ⚙️ クエリパラメータ構築 ---
    // 💡 site と site_name の両方を送ることで、Django側の新旧ロジック両方に対応
    const queryParams = new URLSearchParams({ 
        offset: offset.toString(),
        limit: limit.toString(),
        site: siteTag,
        site_name: siteTag // 🔥 以前のロジック用に追加
    });
    
    // 🚀 site_group による絞り込み
    const siteGroup = meta?.site_group || 'general';
    queryParams.append('site_group', siteGroup);
    
    // 🚀 検索・フィルタパラメータ
    if (q && typeof q === 'string') queryParams.append('search', q); 
    if (maker) queryParams.append('maker', maker); 

    // 🚀 ソート条件の分離
    // attribute 引数に '-created_at' 等のソート記号が含まれている場合、ordering として扱う
    if (attribute) {
        if (attribute.startsWith('-') || attribute.includes('created_at') || attribute.includes('price')) {
            queryParams.append('ordering', attribute); // Django標準のソートキー
        } else {
            queryParams.append('attribute', attribute); // 本来の属性フィルタ
        }
    } else {
        // デフォルトソート
        queryParams.append('ordering', '-created_at');
    }

    // 🔗 API URL の解決
    const url = resolveApiUrl(`general/pc-products/?${queryParams.toString()}`, siteTag);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(siteTag), 
            cache: 'no-store' 
        });
        
        const data = await handleResponseWithDebug(res, url);
        
        // 🛡️ 内部ドメイン置換を適用
        const cleanedData = replaceInternalUrls(data);
        
        return { 
            results: (Array.isArray(cleanedData.results) ? cleanedData.results : []) as PCProduct[], 
            count: typeof cleanedData.count === 'number' ? cleanedData.count : 0, 
            _debug: { url, siteTag, site_name: siteTag, q } 
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
    
    const cleanId = unique_id.toString().replace(/\/+$/, '');
    // 詳細でも site_name を付与
    const url = resolveApiUrl(`general/pc-products/${cleanId}/?site=${siteTag}&site_name=${siteTag}`, siteTag);
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(siteTag), 
            cache: 'no-store' 
        });
        
        const data = await handleResponseWithDebug(res, url);
        const cleanedData = replaceInternalUrls(data);
        
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
 * 💡 メーカー一覧取得 
 */
export async function fetchMakers(host: string = ''): Promise<MakerCount[]> {
    const meta = getSafeMeta(host);
    const siteTag = meta?.site_tag || 'bicstation';
    
    // メーカー一覧でも site_name を付与
    const url = resolveApiUrl(`general/pc-makers/?site=${siteTag}&site_name=${siteTag}`, siteTag);
    
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