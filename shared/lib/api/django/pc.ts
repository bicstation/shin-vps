import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from './client';
import { getSiteMetadata } from '../../siteConfig';
import { PCProduct } from '../types';

export async function fetchPCProducts(params: any = {}): Promise<{ results: PCProduct[]; count: number; _debug?: any }> {
    const { site_group } = getSiteMetadata(); 
    const queryParams = new URLSearchParams({ site_group: site_group || 'common', ...params });
    const url = resolveApiUrl(`/api/pc-products/?${queryParams.toString()}`);

    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), next: { revalidate: 3600 } });
        const data = await handleResponseWithDebug(res, url);
        return { results: data.results || [], count: data.count || 0, _debug: data._debug };
    } catch (e: any) {
        return { results: [], count: 0, _debug: { error: e.message, url } };
    }
}

export async function fetchPCProductDetail(unique_id: string): Promise<PCProduct | null> {
    const url = resolveApiUrl(`/api/pc-products/${unique_id}`); 
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), cache: 'no-store' });
        const data = await handleResponseWithDebug(res, url);
        if (!data || data._error || data.isHtml || !data.unique_id) return null;
        return data as PCProduct;
    } catch (e: any) {
        return null;
    }
}

export async function fetchRelatedProducts(maker: string, exclude_id: string): Promise<PCProduct[]> {
    const queryParams = new URLSearchParams({ maker, exclude_unique_id: exclude_id, limit: '8' });
    const url = resolveApiUrl(`/api/pc-products/?${queryParams.toString()}`);
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), next: { revalidate: 3600 } });
        const data = await handleResponseWithDebug(res, url);
        return data.results || [];
    } catch (e) { return []; }
}

export async function fetchPCProductRanking(): Promise<PCProduct[]> {
    const url = resolveApiUrl(`/api/pc-products/?ordering=-spec_score&limit=100`);
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), next: { revalidate: 3600 } });
        const data = await handleResponseWithDebug(res, url);
        return data.results || [];
    } catch (e) { return []; }
}