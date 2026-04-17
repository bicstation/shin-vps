// /shared/lib/api/django/pc/products.ts
// @ts-nocheck
/**
 * =====================================================================
 * 💻 PC製品取得サービス (Zenith v12.3 - Slash-Free & Hardened)
 * =====================================================================
 * 🛡️ 修正・強化ポイント:
 * 1. 【末尾スラッシュ排除】URL末尾の %2F (/) がクエリパラメータを壊す問題を修正。
 * 2. 【属性値の正規化】attribute 引数の末尾にスラッシュがある場合、除去してDB照合率を向上。
 * 3. 【ソート機能の独立】第6引数 sortArg による明示的なソート制御を維持。
 * 4. 【URL構築の安全化】resolveApiUrl と queryParams の結合順序を最適化。
 * =====================================================================
 */

import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';
import { replaceInternalUrls } from '../../django-bridge';
import { getSiteMetadata } from '../../../utils/siteConfig';
import { PCProduct, MakerCount } from './types';

/**
 * 💡 サイトメタデータの取得 (内部判定用)
 */
const getSafeMeta = (host?: string) => {
    try {
        const cleanHost = (host || "").toString().split(':')[0];
        const meta = getSiteMetadata(cleanHost);
        return meta || { site_tag: 'bicstation', site_group: 'general' };
    } catch (e) { 
        return { site_tag: 'bicstation', site_group: 'general' }; 
    }
};

/**
 * 💡 PC製品一覧取得
 */
export async function fetchPCProducts(
    paramsOrQ: any = '', 
    offsetArg: number = 0, 
    limitArg: number = 20, 
    makerArg: string = '',
    hostArg: string = '',
    sortArg: string = '',      
    attributeArg: string = ''  
) {
    // --- 📥 引数の正規化ロジック ---
    const isObj = typeof paramsOrQ === 'object' && paramsOrQ !== null;
    
    const q         = (isObj ? (paramsOrQ.q || paramsOrQ.search || '') : paramsOrQ || '').toString();
    const offset    = isObj ? (paramsOrQ.offset ?? 0) : offsetArg;
    const limit     = isObj ? (paramsOrQ.limit ?? 20) : limitArg;
    const maker     = (isObj ? (paramsOrQ.maker || '') : makerArg || '').toString();
    const host      = (isObj ? (paramsOrQ.host || '') : hostArg || '').toString();
    const sort      = (isObj ? (paramsOrQ.sort || paramsOrQ.ordering || '') : sortArg || '').toString();
    
    // ✅ 属性値の末尾スラッシュを事前に除去 (DBタグ名との不一致を防ぐ)
    let attribute = (isObj ? (paramsOrQ.attribute || '') : attributeArg || '').toString().replace(/\/+$/, '');

    const meta = getSafeMeta(host);
    const siteTag = isObj ? (paramsOrQ.site || meta?.site_tag || 'bicstation') : (meta?.site_tag || 'bicstation');

    // --- ⚙️ クエリパラメータ構築 ---
    const queryParams = new URLSearchParams({ 
        offset: offset.toString(),
        limit: limit.toString(),
        site: siteTag.toLowerCase(),
        site_name: siteTag.toLowerCase()
    });
    
    const siteGroup = meta?.site_group || 'general';
    queryParams.append('site_group', siteGroup);
    
    if (q) queryParams.append('search', q); 
    if (maker) queryParams.append('maker', maker); 

    /**
     * 🚀 ソート(ordering)の適用
     */
    let finalOrdering = '-created_at';
    
    if (sort) {
        finalOrdering = sort.replace(/\/+$/, ''); // ソート値からもスラッシュ除去
    } else if (attribute && (
        attribute.startsWith('-') || 
        attribute.includes('created_at') || 
        attribute.includes('price') || 
        attribute.includes('score')
    )) {
        finalOrdering = attribute;
    }
    
    queryParams.append('ordering', finalOrdering);

    /**
     * 🚀 属性(attribute)の適用
     */
    if (attribute && finalOrdering !== attribute) {
        queryParams.append('attribute', attribute);
    }

    // --- 🔗 URL組み立て (重要: 末尾にスラッシュを絶対に入れない) ---
    const basePath = `general/pc-products`;
    const baseApiUrl = resolveApiUrl(basePath, siteTag).replace(/\/+$/, ''); // APIパス自体の末尾スラッシュを除去
    const url = `${baseApiUrl}/?${queryParams.toString()}`; // クエリの後にスラッシュが来ないように結合

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(siteTag), 
            cache: 'no-store' 
        });
        
        const data = await handleResponseWithDebug(res, url);
        if (!data) return { results: [], count: 0 };

        const cleanedData = replaceInternalUrls(data);
        
        const rawResults = Array.isArray(cleanedData.results) ? cleanedData.results : (Array.isArray(cleanedData) ? cleanedData : []);
        
        const safeResults = rawResults.map((item: any) => ({
            ...item,
            id: (item.id || "").toString(),
            unique_id: (item.unique_id || "").toString(),
            name: item.name || "No Name"
        }));
        
        return { 
            results: safeResults as PCProduct[], 
            count: typeof cleanedData.count === 'number' ? cleanedData.count : safeResults.length, 
            _debug: { url, siteTag, q, ordering: finalOrdering } 
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
    if (!unique_id || unique_id === 'undefined') return null;

    const meta = getSafeMeta(host);
    const siteTag = meta?.site_tag || 'bicstation';
    
    // ✅ IDの末尾スラッシュを確実に除去
    const cleanId = unique_id.toString().replace(/\/+$/, '');
    const baseApiUrl = resolveApiUrl(`general/pc-products/${cleanId}`, siteTag).replace(/\/+$/, '');
    const url = `${baseApiUrl}/?site=${siteTag}&site_name=${siteTag}`;
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(siteTag), 
            cache: 'no-store' 
        });
        
        const data = await handleResponseWithDebug(res, url);
        if (!data) return null;

        const cleanedData = replaceInternalUrls(data);
        
        const product = (cleanedData && !Array.isArray(cleanedData.results)) 
            ? cleanedData 
            : (Array.isArray(cleanedData.results) && cleanedData.results.length > 0 ? cleanedData.results[0] : null);

        if (!product || (!product.unique_id && !product.id)) return null;

        return {
            ...product,
            id: product.id?.toString() || "",
            unique_id: product.unique_id?.toString() || ""
        } as PCProduct;
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
    
    const baseApiUrl = resolveApiUrl(`general/pc-makers`, siteTag).replace(/\/+$/, '');
    const url = `${baseApiUrl}/?site=${siteTag}&site_name=${siteTag}`;
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(siteTag), 
            next: { revalidate: 3600 } 
        });
        
        const data = await handleResponseWithDebug(res, url);
        if (!data) return [];

        const cleanedData = replaceInternalUrls(data);
        
        const results = Array.isArray(cleanedData.results) 
            ? cleanedData.results 
            : (Array.isArray(cleanedData) ? cleanedData : []);

        return results.map((m: any) => ({
            ...m,
            name: m.name || m.maker || "Unknown",
            count: typeof m.count === 'number' ? m.count : (m.product_count || 0)
        })) as MakerCount[];
        
    } catch (e) {
        console.error("🚨 [fetchMakers Error]", e);
        return [];
    }
}