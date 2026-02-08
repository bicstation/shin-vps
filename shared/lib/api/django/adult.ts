import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from './client';
import { getSiteMetadata } from '../../siteConfig';
import { AdultProduct } from '../types';

export async function getAdultProducts(params: any = {}): Promise<{ results: AdultProduct[]; count: number; _debug?: any }> {
    const { site_group } = getSiteMetadata(); 
    const queryParams = new URLSearchParams({ site_group: site_group || 'adult', ...params });
    const url = resolveApiUrl(`/api/adult-products/?${queryParams.toString()}`);
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), next: { revalidate: 60 }, signal: AbortSignal.timeout(10000) });
        const data = await handleResponseWithDebug(res, url);
        return { results: data.results || [], count: data.count || 0, _debug: data._debug };
    } catch (e: any) { return { results: [], count: 0, _debug: { error: e.message, url } }; }
}

export async function getAdultProductDetail(id: string | number): Promise<AdultProduct | null> {
    const url = resolveApiUrl(`/api/adult-products/${id}/`);
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), next: { revalidate: 60 } });
        const data = await handleResponseWithDebug(res, url);
        return data._error ? null : data;
    } catch (e) { return null; }
}

export async function fetchAdultProductRanking(params: any = {}): Promise<{ results: AdultProduct[]; count: number; _debug?: any }> {
    const { site_group } = getSiteMetadata(); 
    const queryParams = new URLSearchParams({ site_group: site_group || 'adult', ordering: '-spec_score', ...params });
    const url = resolveApiUrl(`/api/adult-products/ranking/?${queryParams.toString()}`);
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), next: { revalidate: 3600 }, signal: AbortSignal.timeout(10000) });
        const data = await handleResponseWithDebug(res, url);
        return { results: data.results || [], count: data.count || 0, _debug: data._debug };
    } catch (e: any) { return { results: [], count: 0, _debug: { error: e.message, url } }; }
}