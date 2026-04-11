// /home/maya/shin-vps/shared/lib/api/django/pc/products.ts

import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';
import { getSiteMetadata } from '../../../utils/siteConfig';
import { PCProduct, MakerCount } from './types';

/**
 * 💡 サイト情報の取得
 * 🚀 修正: host を受け取るようにし、SSR時でも確実に正しいサイトグループを判定
 */
const getSafeSiteGroup = (host?: string): string => {
    try {
        const metadata = getSiteMetadata(host || "");
        return metadata?.site_group || ''; 
    } catch (e) { return ''; }
};

/** * 💡 PC製品一覧取得
 * 🚀 修正: host を引数に追加し、API解決の精度を向上
 */
export async function fetchPCProducts(
    maker: string = '', 
    offset: number = 0, 
    limit: number = 12, 
    attribute: string = '',
    host: string = '' // SSR時は headers() から取得した host を渡す
) {
    const site_group = getSafeSiteGroup(host);
    const queryParams = new URLSearchParams({ 
        offset: offset.toString(),
        limit: limit.toString()
    });
    
    if (site_group && site_group !== 'general') {
        queryParams.append('site_group', site_group);
    }
    
    if (maker) queryParams.append('maker', maker);
    if (attribute) queryParams.append('attribute', attribute);

    // resolveApiUrl に host を渡すことで 8000/8083 判定を盤石に
    const url = resolveApiUrl(`general/pc-products/?${queryParams.toString()}`, host);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(host), 
            cache: 'no-store' 
        });
        const data = await handleResponseWithDebug(res, url);
        return { 
            results: (data.results || []) as PCProduct[], 
            count: data.count || 0, 
            _debug: { ...data._debug, url } 
        };
    } catch (e: any) {
        return { results: [], count: 0, _debug: { error: e.message, url } };
    }
}

/** * 💡 PC製品詳細取得 
 */
export async function fetchPCProductDetail(unique_id: string, host: string = ''): Promise<PCProduct | null> {
    const url = resolveApiUrl(`general/pc-products/${unique_id}/`, host);
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(host), cache: 'no-store' });
        const data = await handleResponseWithDebug(res, url);
        // handleResponseWithDebug が配列または単体オブジェクトを吸収済み
        const product = data.results ? data.results[0] : data;
        return (product?.unique_id || product?.id) ? product as PCProduct : null;
    } catch (e) { return null; }
}

/** * 💡 メーカー一覧取得 
 */
export async function fetchMakers(host: string = ''): Promise<MakerCount[]> {
    const url = resolveApiUrl(`general/pc-makers/`, host);
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(host), next: { revalidate: 3600 } });
        const data = await handleResponseWithDebug(res, url);
        // handleResponseWithDebug の正規化を利用
        return Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []);
    } catch (e) { return []; }
}