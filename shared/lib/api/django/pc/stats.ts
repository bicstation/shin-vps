// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/stats.ts
import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';
import { fetchPCProducts } from './products';
import { PCProduct } from './types';

/**
 * 💡 AIスコアランキング
 * 🚀 修正: host 引数を追加し、API解決を盤石化
 */
export async function fetchPCProductRanking(
    type: 'score' | 'popularity' = 'score',
    host: string = ''
): Promise<PCProduct[]> {
    const endpoint = type === 'score' ? 'ranking' : 'popularity-ranking';
    const url = resolveApiUrl(`general/pc-products/${endpoint}/`, host);
    
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(host), next: { revalidate: 600 } });
        const data = await handleResponseWithDebug(res, url);
        return Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []);
    } catch (e) { return []; }
}

/**
 * 💡 PCスペック統計取得
 */
export async function fetchPCSidebarStats(host: string = ''): Promise<any | null> {
    const url = resolveApiUrl(`general/pc-sidebar-stats/`, host);
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(host), next: { revalidate: 600 } });
        const data = await handleResponseWithDebug(res, url);
        return data.results ? data.results : data;
    } catch (e) { return null; }
}

/**
 * 💡 関連製品取得 (メーカー一致製品から自分を除外)
 * 🚀 修正: fetchPCProducts に host を渡すように変更
 */
export async function fetchRelatedProducts(
    maker: string, 
    excludeId: string,
    host: string = ''
): Promise<any[]> {
    try {
        // 🚀 重要: 修正した fetchPCProducts に host をリレーする
        const { results } = await fetchPCProducts(maker, 0, 9, '', host); 
        
        // 自分自身を除外して最大8件返す
        return results
            .filter((p: any) => p.unique_id !== excludeId)
            .slice(0, 8);
    } catch (e) {
        return [];
    }
}