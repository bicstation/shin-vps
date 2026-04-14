// /home/maya/shin-vps/shared/lib/api/django/pc/stats.ts
// @ts-nocheck

import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';
import { replaceInternalUrls } from '../../django-bridge';
import { fetchPCProducts } from './products';
import { getSiteMetadata } from '../../../utils/siteConfig';
import { PCProduct } from './types';

/** 内部判定用メタデータ取得 */
const getSafeMeta = (host?: string) => {
    try {
        return getSiteMetadata(host || "");
    } catch (e) { return null; }
};

/**
 * 💡 PC製品ランキング取得
 * @param type - 'score' (AI性能順) または 'popularity' (人気順)
 * @param host - 実行環境のホスト名
 */
export async function fetchPCProductRanking(
    type: 'score' | 'popularity' = 'score',
    host: string = ''
): Promise<PCProduct[]> {
    const meta = getSafeMeta(host);
    const siteTag = meta?.site_tag || 'bicstation';
    const siteGroup = meta?.site_group || 'general';
    
    // 💡 type によってエンドポイントを切り替え
    const endpoint = type === 'score' ? 'ranking' : 'popularity-ranking';
    
    const query = new URLSearchParams({
        site: siteTag,
        site_name: siteTag, // 🔥 以前のロジック用に追加
        site_group: siteGroup
    });
    
    const url = resolveApiUrl(`general/pc-products/${endpoint}/?${query.toString()}`, siteTag);
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(siteTag), 
            next: { revalidate: 600 } 
        });
        
        const data = await handleResponseWithDebug(res, url);
        const cleanedData = replaceInternalUrls(data);
        
        /**
         * 🛡️ 堅牢な結果抽出ロジック
         */
        let results = [];
        if (Array.isArray(cleanedData)) {
            results = cleanedData;
        } else if (cleanedData && typeof cleanedData === 'object') {
            // results だけでなく data キーもチェック
            results = cleanedData.results || cleanedData.data || (Array.isArray(cleanedData) ? cleanedData : []);
        }

        // オブジェクトが返ってきたが結果が配列でない場合の最終ガード
        return (Array.isArray(results) ? results : []) as PCProduct[];
    } catch (e) {
        console.error(`🚨 [Ranking Fetch Error] type: ${type} | URL: ${url}`, e);
        return [];
    }
}

/**
 * 💡 PCサイドバー統計取得
 */
export async function fetchPCSidebarStats(host: string = ''): Promise<any | null> {
    const meta = getSafeMeta(host);
    const siteTag = meta?.site_tag || 'bicstation';
    
    // 🔥 site_name を追加してフィルタリングを確実に通す
    const url = resolveApiUrl(`general/pc-sidebar-stats/?site=${siteTag}&site_name=${siteTag}`, siteTag);
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(siteTag), 
            next: { revalidate: 600 } 
        });
        
        const data = await handleResponseWithDebug(res, url);
        const cleanedData = replaceInternalUrls(data);

        if (!cleanedData) return null;

        // resultsが配列で返ってきた場合、最初の1件が統計本体
        if (Array.isArray(cleanedData.results)) {
            return cleanedData.results[0] || null;
        }
        return cleanedData.results || cleanedData || null;
    } catch (e) {
        console.error(`🚨 [Sidebar Stats Fetch Error]`, e);
        return null;
    }
}

/**
 * 💡 関連製品取得
 */
export async function fetchRelatedProducts(
    maker: string, 
    excludeId: string,
    host: string = ''
): Promise<PCProduct[]> {
    try {
        // 💡 fetchPCProducts 自体が内部で site_name を付与するように修正されている前提
        const response = await fetchPCProducts('', 0, 10, maker, host); 
        
        // fetchPCProducts の戻り値構造 { results, count } を考慮
        const results = response?.results || (Array.isArray(response) ? response : []);
        
        if (!Array.isArray(results)) return [];

        return results
            .filter((p: PCProduct) => {
                const pid = (p.unique_id || p.id)?.toString();
                const eid = excludeId?.toString();
                return pid !== eid;
            })
            .slice(0, 8);
    } catch (e) {
        console.error(`🚨 [Related Products Fetch Error] maker: ${maker}`, e);
        return [];
    }
}

/** 🚀 エイリアス設定 */
export const fetchPCPopularityRanking = (host: string = '') => fetchPCProductRanking('popularity', host);