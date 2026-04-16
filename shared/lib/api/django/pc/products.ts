// /shared/lib/api/django/pc/products.ts
// @ts-nocheck
/**
 * =====================================================================
 * 💻 PC製品取得サービス (Zenith v12.1 - Hardened)
 * =====================================================================
 * 🛡️ 修正・強化ポイント:
 * 1. 【安全な引数解析】オブジェクト・文字列・nullが混在しても墜落させない正規化。
 * 2. 【ID正規化】unique_id / id の toString() ガードを徹底。
 * 3. 【サイトメタの堅牢化】ホスト名解決に失敗しても bicstation を維持。
 * 4. 【レスポンス正規化】results が配列でない、またはページネーションなしの場合を救済。
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
    limitArg: number = 12, 
    makerArg: string = '',
    hostArg: string = '',
    attributeArg: string = ''
) {
    // --- 📥 引数の正規化ロジック (徹底ガード版) ---
    const isObj = typeof paramsOrQ === 'object' && paramsOrQ !== null;
    
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
        site: siteTag.toLowerCase(),
        site_name: siteTag.toLowerCase()
    });
    
    const siteGroup = meta?.site_group || 'general';
    queryParams.append('site_group', siteGroup);
    
    if (q) queryParams.append('search', q); 
    if (maker) queryParams.append('maker', maker); 

    // 🚀 ソート・属性条件の分離
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
        
        // 🛡️ Results 内の各アイテムを安全化 (undefined参照を防ぐ)
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
        
        // 階層の正規化 (results 配列の中身か、オブジェクト単体か)
        const product = (cleanedData && !Array.isArray(cleanedData.results)) 
            ? cleanedData 
            : (Array.isArray(cleanedData.results) && cleanedData.results.length > 0 ? cleanedData.results[0] : null);

        if (!product || (!product.unique_id && !product.id)) return null;

        // 🛡️ IDを文字列化して返却
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
 * サイドバーの「BRANDS」セクションの生命線
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
        
        // 🛡️ APIが results を持つページネーション形式か、直接配列形式かを判定して正規化
        const results = Array.isArray(cleanedData.results) 
            ? cleanedData.results 
            : (Array.isArray(cleanedData) ? cleanedData : []);

        // 各要素が maker または name キーを持つことを保証
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