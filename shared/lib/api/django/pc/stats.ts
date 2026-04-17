// @ts-nocheck
/**
 * =====================================================================
 * 💻 PC製品統計・ランキングサービス (Zenith v12.2 - Hardened & Flat-Response Ready)
 * =====================================================================
 * 🛡️ 修正・強化ポイント:
 * 1. 【階層の完全吸収】Djangoが results で包んでいても、フラットでも自動検知。
 * 2. 【キャッシュ無効化】開発中の反映速度を上げるため revalidate: 0 を一時適用。
 * 3. 【正規化ロジック】maker_counts がどこにあってもサイドバー形式に変換。
 * 4. 【HP救済】name が無い場合は maker を大文字にして表示名を生成。
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
 */
export async function fetchPCProductRanking(
    type: 'score' | 'popularity' = 'score',
    host: string = ''
): Promise<PCProduct[]> {
    const meta = getSafeMeta(host);
    const siteTag = meta?.site_tag || 'bicstation';
    const siteGroup = meta?.site_group || 'general';
    
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
            next: { revalidate: 300 } 
        });
        
        const data = await handleResponseWithDebug(res, url);
        if (!data) return [];

        const cleanedData = replaceInternalUrls(data);
        
        let results = [];
        if (Array.isArray(cleanedData)) {
            results = cleanedData;
        } else if (cleanedData && typeof cleanedData === 'object') {
            results = cleanedData.results || cleanedData.data || (cleanedData.id ? [cleanedData] : []);
        }

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
 * 💡 PCサイドバー統計取得 (✨ここが最重要)
 */
export async function fetchPCSidebarStats(host: string = ''): Promise<any | null> {
    const meta = getSafeMeta(host);
    const siteTag = meta?.site_tag || 'bicstation';
    
    const url = resolveApiUrl(`general/pc-sidebar-stats/?site=${siteTag}&site_name=${siteTag}`, siteTag);
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(siteTag), 
            next: { revalidate: 0 } // 反映確認のため一時的にキャッシュ無効
        });
        
        const data = await handleResponseWithDebug(res, url);
        const cleanedData = replaceInternalUrls(data);

        if (!cleanedData) return null;

        // 🛡️ データの取り出しロジックの強化
        // 1. cleanedData直下に maker_counts があるか
        // 2. results[0] の中にあるか
        // 3. どちらもなければそのまま使う
        const stats = cleanedData.maker_counts 
            ? cleanedData 
            : (Array.isArray(cleanedData.results) ? (cleanedData.results[0] || {}) : cleanedData);

        // 🛡️ 統計データをサイドバーが壊れない形式に正規化して返す
        return {
            ...stats,
            total_count: stats.total_count || 0,
            // maker_counts を確実に正規化
            maker_counts: (Array.isArray(stats.maker_counts) ? stats.maker_counts : []).map((m: any) => {
                // 文字列のみのリスト（["hp", "dell"]）が来た場合の救済も含む
                const makerSlug = typeof m === 'string' ? m : (m.maker || "");
                return {
                    name: m.name || makerSlug.toUpperCase() || "Unknown",
                    maker: makerSlug,
                    count: typeof m.count === 'number' ? m.count : 0
                };
            })
        };
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