// /home/maya/shin-vps/shared/lib/api/django/pc/stats.ts
// @ts-nocheck
/**
 * =====================================================================
 * 💻 PC製品統計・ランキングサービス (Zenith v12.1 - Hardened)
 * =====================================================================
 * 🛡️ 修正・強化ポイント:
 * 1. 【安全なメタデータ】ホスト解析の失敗を考慮し、デフォルト値を保証。
 * 2. 【階層正規化】results 配列の 0番目抽出ロジックを強化。
 * 3. 【メーカー名の整合性】maker_counts 内のオブジェクトが name/maker/count を持つよう正規化。
 * 4. 【ID安全比較】toString() による型不一致エラーの完全防止。
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
        
        // 🛡️ 堅牢な結果抽出ロジック (配列形式、results内包形式の両方に対応)
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
 * 💡 PCサイドバー統計取得
 * サイドバーのメーカー一覧、属性一覧の主要ソース
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

        // 🛡️ APIが results 配列で返す場合、最初の1件が統計の本体
        let stats = null;
        if (Array.isArray(cleanedData.results)) {
            stats = cleanedData.results[0] || null;
        } else if (cleanedData.results && typeof cleanedData.results === 'object') {
            stats = cleanedData.results;
        } else {
            stats = cleanedData;
        }

        // 🛡️ 統計データ内の undefined 参照を防止し、配列構造を正規化
        if (stats && typeof stats === 'object') {
            return {
                ...stats,
                total_count: stats.total_count || 0,
                // maker_counts をサイドバーが確実に回せるように補完
                maker_counts: (Array.isArray(stats.maker_counts) ? stats.maker_counts : []).map((m: any) => ({
                    ...m,
                    name: m.name || m.maker || m.maker_name || "Unknown",
                    count: typeof m.count === 'number' ? m.count : (m.product_count || 0)
                }))
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

        // 共通の取得関数を利用
        const response = await fetchPCProducts('', 0, 10, safeMaker, host); 
        const results = response?.results || (Array.isArray(response) ? response : []);
        
        if (!Array.isArray(results)) return [];

        return results
            .filter((p: any) => {
                if (!p) return false;
                // 🛡️ ID比較を toString() で安全に行う
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