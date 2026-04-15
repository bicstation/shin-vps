// /home/maya/shin-vps/shared/lib/api/django/pc/products.ts
// @ts-nocheck
/**
 * =====================================================================
 * 💻 PC製品取得サービス (Zenith v12.1 - Hardened)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【安全な引数解析】attribute や q が null/undefined の場合の墜落を防止。
 * 2. 【ID正規化】unique_id の toString() ガードを徹底。
 * 3. 【デバッグ情報の堅牢化】_debug 内のプロパティも安全な型で抽出。
 * =====================================================================
 */

import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';
import { replaceInternalUrls } from '../../django-bridge';
import { getSiteMetadata } from '../../../utils/siteConfig';
import { PCProduct, MakerCount } from './types';

/**
 * 💡 サイトメタデータの取得 (内部判定用)
 * ホスト名が空でもデフォルト値を返すように安全化
 */
const getSafeMeta = (host?: string) => {
    try {
        const cleanHost = (host || "").toString().split(':')[0];
        return getSiteMetadata(cleanHost) || { site_tag: 'bicstation', site_group: 'general' };
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
    limitArg: number = 12, 
    makerArg: string = '',
    hostArg: string = '',
    attributeArg: string = ''
) {
    // --- 📥 引数の正規化ロジック (徹底ガード版) ---
    const isObj = typeof paramsOrQ === 'object' && paramsOrQ !== null;
    
    // 文字列変換を挟むことで .trim() や .startsWith() の墜落を防ぐ
    const q         = (isObj ? (paramsOrQ.q || paramsOrQ.search || '') : paramsOrQ || '').toString();
    const offset    = isObj ? (paramsOrQ.offset ?? 0) : offsetArg;
    const limit     = isObj ? (paramsOrQ.limit ?? 12) : limitArg;
    const maker     = (isObj ? (paramsOrQ.maker || '') : makerArg || '').toString();
    const host      = (isObj ? (paramsOrQ.host || '') : hostArg || '').toString();
    const attribute = (isObj ? (paramsOrQ.attribute || '') : attributeArg || '').toString();

    const meta = getSafeMeta(host);
    const siteTag = isObj ? (paramsOrQ.site || meta?.site_tag || 'bicstation') : (meta?.site_tag || 'bicstation');

    // --- ⚙️ クエリパラメータ構築 ---
    const queryParams = new URLSearchParams({ 
        offset: offset.toString(),
        limit: limit.toString(),
        site: siteTag.toLowerCase(), // 🛡️ toString() 済みなので安全
        site_name: siteTag.toLowerCase()
    });
    
    const siteGroup = meta?.site_group || 'general';
    queryParams.append('site_group', siteGroup);
    
    if (q) queryParams.append('search', q); 
    if (maker) queryParams.append('maker', maker); 

    // 🚀 ソート条件の分離 (attribute の存在チェックを厳密化)
    if (attribute) {
        if (attribute.startsWith('-') || attribute.includes('created_at') || attribute.includes('price')) {
            queryParams.append('ordering', attribute);
        } else {
            queryParams.append('attribute', attribute);
        }
    } else {
        queryParams.append('ordering', '-created_at');
    }

    const url = resolveApiUrl(`general/pc-products/?${queryParams.toString()}`, siteTag);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(siteTag), 
            cache: 'no-store' 
        });
        
        const data = await handleResponseWithDebug(res, url);
        if (!data) return { results: [], count: 0 };

        const cleanedData = replaceInternalUrls(data);
        
        // 🛡️ Results 内の各アイテムを安全化 (コンポーネント側での爆発を防ぐ)
        const safeResults = (Array.isArray(cleanedData.results) ? cleanedData.results : []).map((item: any) => ({
            ...item,
            id: (item.id || "").toString(),
            unique_id: (item.unique_id || "").toString(),
            name: item.name || "No Name"
        }));
        
        return { 
            results: safeResults as PCProduct[], 
            count: typeof cleanedData.count === 'number' ? cleanedData.count : safeResults.length, 
            _debug: { url, siteTag, q } 
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
    
    const cleanId = unique_id.toString().replace(/\/+$/, '');
    const url = resolveApiUrl(`general/pc-products/${cleanId}/?site=${siteTag}&site_name=${siteTag}`, siteTag);
    
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

        // 🛡️ 返却前に型を安全化
        return {
            ...product,
            id: product.id?.toString(),
            unique_id: product.unique_id?.toString()
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
    
    const url = resolveApiUrl(`general/pc-makers/?site=${siteTag}&site_name=${siteTag}`, siteTag);
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(siteTag), 
            next: { revalidate: 3600 } 
        });
        
        const data = await handleResponseWithDebug(res, url);
        if (!data) return [];

        const cleanedData = replaceInternalUrls(data);
        
        return Array.isArray(cleanedData.results) 
            ? cleanedData.results 
            : (Array.isArray(cleanedData) ? cleanedData : []);
    } catch (e) {
        console.error("🚨 [fetchMakers Error]", e);
        return [];
    }
}