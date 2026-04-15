// /home/maya/shin-vps/shared/lib/api/django/pc/stats.ts
// @ts-nocheck
/**
 * =====================================================================
 * 💻 PC製品統計・ランキングサービス (Zenith v12.1 - Hardened)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【安全なメタデータ】getSafeMeta を強化し、ホスト解決失敗でも墜落を防止。
 * 2. 【正規化の徹底】ランキング結果が配列でない場合の救済ロジックを追加。
 * 3. 【ID比較の安定化】RelatedProducts 内での ID 比較を toString() で安全に。
 * =====================================================================
 */

import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';
import { replaceInternalUrls } from '../../django-bridge';
import { fetchPCProducts } from './products';
import { getSiteMetadata } from '../../../utils/siteConfig';
import { PCProduct } from './types';

/** 内部判定用メタデータ取得 (安全版) */
const getSafeMeta = (host?: string) => {
    try {
        const cleanHost = (host || "").toString().split(':')[0];
        return getSiteMetadata(cleanHost) || { site_tag: 'bicstation', site_group: 'general' };
    } catch (e) { 
        return { site_tag: 'bicstation', site_group: 'general' }; 
    }
};

/**
 * 💡 PC製品ランキング取得
 * @param type - 'score' (AI性能順) または 'popularity' (人気順)
 */
export async function fetchPCProductRanking(
    type: 'score' | 'popularity' = 'score',
    host: string = ''
): Promise<PCProduct[]> {
    const meta = getSafeMeta(host);
    const siteTag = meta?.site_tag || 'bicstation';
    const siteGroup = meta?.site_group || 'general';
    
    // 安全なエンドポイント決定
    const safeType = (type || 'score').toString();
    const endpoint = safeType === 'score' ? 'ranking' : 'popularity-ranking';
    
    const query = new URLSearchParams({
        site: siteTag,
        site_name: siteTag,
        site_group: siteGroup
    });
    
    const url = resolveApiUrl(`general/pc-products/${endpoint}/?${query.toString()}`, siteTag);
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(siteTag), 
            next: { revalidate: 600 } 
        });
        
        const data = await handleResponseWithDebug(res, url);
        if (!data) return [];

        const cleanedData = replaceInternalUrls(data);
        
        // 🛡️ 堅牢な結果抽出ロジック
        let results = [];
        if (Array.isArray(cleanedData)) {
            results = cleanedData;
        } else if (cleanedData && typeof cleanedData === 'object') {
            results = cleanedData.results || cleanedData.data || (cleanedData.id ? [cleanedData] : []);
        }

        // 🛡️ マッピングによる各アイテムの毒抜き
        return (Array.isArray(results) ? results : []).map((item: any) => ({
            ...item,
            id: (item.id || "").toString(),
            unique_id: (item.unique_id || "").toString(),
            name: item.name || "No Name"
        })) as PCProduct[];

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
        let stats = null;
        if (Array.isArray(cleanedData.results)) {
            stats = cleanedData.results[0] || null;
        } else {
            stats = cleanedData.results || cleanedData || null;
        }

        // 🛡️ 統計データ内の undefined 参照を防止するための簡易ガード
        if (stats && typeof stats === 'object') {
            return {
                ...stats,
                total_count: stats.total_count || 0,
                maker_counts: Array.isArray(stats.maker_counts) ? stats.maker_counts : []
            };
        }
        return stats;
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
        const safeMaker = (maker || "").toString();
        const safeExcludeId = (excludeId || "").toString();

        const response = await fetchPCProducts('', 0, 10, safeMaker, host); 
        
        const results = response?.results || (Array.isArray(response) ? response : []);
        
        if (!Array.isArray(results)) return [];

        return results
            .filter((p: any) => {
                if (!p) return false;
                // 🛡️ ID比較を toString() で安全に行う (TypeError: toLowerCase of undefined を完全ガード)
                const pid = (p.unique_id || p.id || "").toString();
                return pid !== "" && pid !== safeExcludeId;
            })
            .slice(0, 8);
    } catch (e) {
        console.error(`🚨 [Related Products Fetch Error] maker: ${maker}`, e);
        return [];
    }
}

/** 🚀 エイリアス設定 */
export const fetchPCPopularityRanking = (host: string = '') => fetchPCProductRanking('popularity', host);