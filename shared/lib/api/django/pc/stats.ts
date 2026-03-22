import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';
import { PCProduct } from './types';

/** 💡 AIスコアランキング */
export async function fetchPCProductRanking(type: 'score' | 'popularity' = 'score'): Promise<PCProduct[]> {
    const endpoint = type === 'score' ? 'ranking' : 'popularity-ranking';
    const url = resolveApiUrl(`general/pc-products/${endpoint}/`);
    
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), next: { revalidate: 600 } });
        const data = await handleResponseWithDebug(res, url);
        return Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []);
    } catch (e) { return []; }
}

/** 💡 PCスペック統計取得 */
export async function fetchPCSidebarStats(): Promise<any | null> {
    const url = resolveApiUrl(`general/pc-sidebar-stats/`);
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), next: { revalidate: 600 } });
        const data = await handleResponseWithDebug(res, url);
        return data.results ? data.results : data;
    } catch (e) { return null; }
}