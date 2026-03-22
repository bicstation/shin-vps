import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';
import { getSiteMetadata } from '../../../utils/siteConfig';
import { PCProduct, MakerCount } from './types';

const getSafeSiteGroup = (): string => {
    try {
        const metadata = getSiteMetadata();
        return metadata?.site_group || ''; 
    } catch (e) { return ''; }
};

/** 💡 PC製品一覧取得 */
export async function fetchPCProducts(
    maker: string = '', 
    offset: number = 0, 
    limit: number = 12, 
    attribute: string = ''
) {
    const site_group = getSafeSiteGroup();
    const queryParams = new URLSearchParams({ 
        offset: offset.toString(),
        limit: limit.toString()
    });
    
    if (site_group && site_group !== 'general') {
        queryParams.append('site_group', site_group);
    }
    
    if (maker) queryParams.append('maker', maker);
    if (attribute) queryParams.append('attribute', attribute);

    const url = resolveApiUrl(`general/pc-products/?${queryParams.toString()}`);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            cache: 'no-store' 
        });
        const data = await handleResponseWithDebug(res, url);
        return { 
            results: (data.results || []) as PCProduct[], 
            count: data.count || 0, 
            _debug: data._debug 
        };
    } catch (e: any) {
        return { results: [], count: 0, _debug: { error: e.message, url } };
    }
}

/** 💡 PC製品詳細取得 */
export async function fetchPCProductDetail(unique_id: string): Promise<PCProduct | null> {
    const url = resolveApiUrl(`general/pc-products/${unique_id}/`);
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), cache: 'no-store' });
        const data = await handleResponseWithDebug(res, url);
        const product = data.results ? data.results[0] : data;
        return (product?.unique_id || product?.id) ? product as PCProduct : null;
    } catch (e) { return null; }
}

/** 💡 メーカー一覧取得 */
export async function fetchMakers(): Promise<MakerCount[]> {
    const url = resolveApiUrl(`general/pc-makers/`);
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), next: { revalidate: 3600 } });
        const data = await handleResponseWithDebug(res, url);
        return Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []);
    } catch (e) { return []; }
}