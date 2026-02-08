import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from './client';

async function fetchEntities(path: string, params: any = {}): Promise<any> {
    const queryParams = new URLSearchParams({ ordering: '-product_count', ...params });
    const url = resolveApiUrl(`${path}?${queryParams.toString()}`);
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), next: { revalidate: 3600 } });
        const data = await handleResponseWithDebug(res, url);
        const list = data.results || (Array.isArray(data) ? data : []);
        (list as any)._debug = data._debug;
        return list;
    } catch (e: any) {
        const empty: any[] = [];
        (empty as any)._debug = { error: e.message, url };
        return empty;
    }
}

export const fetchGenres = (params?: any) => fetchEntities('/api/genres/', params);
export const fetchActresses = (params?: any) => fetchEntities('/api/actresses/', params);
export const fetchMakers = (params?: any) => fetchEntities('/api/makers/', params);
export const fetchSeries = (params?: any) => fetchEntities('/api/series/', params);
export const fetchLabels = (params?: any) => fetchEntities('/api/labels/', params);