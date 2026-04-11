// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/stats.ts
import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';
import { fetchPCProducts } from './products'; // 追加
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

/** 💡 関連製品取得 (メーカー一致製品から自分を除外) */
export async function fetchRelatedProducts(maker: string, excludeId: string): Promise<any[]> {
    try {
        // 基本の一覧取得ロジックを再利用
        const { results } = await fetchPCProducts(maker, 0, 9); 
        // 自分自身を除外して最大8件返す
        return results
            .filter((p: any) => p.unique_id !== excludeId)
            .slice(0, 8);
    } catch (e) {
        return [];
    }
}