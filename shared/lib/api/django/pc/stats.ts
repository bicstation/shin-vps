// @ts-nocheck
/**
 * =====================================================================
 * 📊 PC 統計・関連データ取得サービス (Zenith v11.0 - Pipeline Synced)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【識別子同期】site_tag を client.ts へ正確に伝達し、サイト別ランキングを保証。
 * 2. 【画像解決】ランキングや関連製品にも replaceInternalUrls を適用。
 * 3. 【正規化】fetchPCProducts の最新引数仕様と完全に同期。
 * =====================================================================
 */

import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';
import { replaceInternalUrls } from '../posts'; // 💡 URL置換ロジックを再利用
import { fetchPCProducts } from './products';
import { getSiteMetadata } from '../../../utils/siteConfig';
import { PCProduct } from './types';

/** 内部判定用メタデータ取得 */
const getSiteTag = (host?: string): string => {
    try {
        const meta = getSiteMetadata(host || "");
        return meta?.site_tag || 'bicstation';
    } catch (e) { return 'bicstation'; }
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
    const siteTag = getSiteTag(host);
    const endpoint = type === 'score' ? 'ranking' : 'popularity-ranking';
    
    // siteパラメータを付与してランキングの母体をサイト別に固定
    const url = resolveApiUrl(`general/pc-products/${endpoint}/?site=${siteTag}`, siteTag);
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(siteTag), 
            next: { revalidate: 600 } // 10分キャッシュ
        });
        
        const data = await handleResponseWithDebug(res, url);
        // 🛡️ ランキング画像の内部ドメインURLを置換
        const cleanedData = replaceInternalUrls(data);
        
        return Array.isArray(cleanedData.results) ? cleanedData.results : [];
    } catch (e) {
        console.error(`🚨 [Ranking Fetch Error] type: ${type}`, e);
        return [];
    }
}

/**
 * 💡 PCサイドバー統計取得 (メーカー一覧、カテゴリ別件数など)
 * @param host - 実行環境のホスト名
 */
export async function fetchPCSidebarStats(host: string = ''): Promise<any | null> {
    const siteTag = getSiteTag(host);
    const url = resolveApiUrl(`general/pc-sidebar-stats/?site=${siteTag}`, siteTag);
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(siteTag), 
            next: { revalidate: 600 } 
        });
        
        const data = await handleResponseWithDebug(res, url);
        const cleanedData = replaceInternalUrls(data);

        /**
         * 💡 正規化ロジック:
         * 統計データは results 配列またはオブジェクト直下で返る可能性があるため柔軟に処理
         */
        if (cleanedData.results && Array.isArray(cleanedData.results)) {
            return cleanedData.results.length > 0 ? cleanedData.results[0] : null;
        }
        return cleanedData.results || cleanedData;
    } catch (e) {
        console.error(`🚨 [Sidebar Stats Fetch Error]`, e);
        return null;
    }
}

/**
 * 💡 関連製品取得 (メーカー一致製品から自分を除外)
 * @param maker - メーカー識別子 (DELL, HP等)
 * @param excludeId - 除外する現在の製品ID (unique_id)
 * @param host - 実行環境のホスト名
 */
export async function fetchRelatedProducts(
    maker: string, 
    excludeId: string,
    host: string = ''
): Promise<PCProduct[]> {
    try {
        /**
         * 🚀 fetchPCProducts の v11.0 仕様に同期
         * 第1引数(q): 空
         * 第2引数(offset): 0
         * 第3引数(limit): 10
         * 第4引数(maker): maker
         * 第5引数(host): host (内部で siteTag へ変換される)
         */
        const { results } = await fetchPCProducts('', 0, 10, maker, host); 
        
        if (!results || !Array.isArray(results)) return [];

        // 自分自身を除外して最大8件を返却
        // 画像は fetchPCProducts 側ですでに置換済み
        return results
            .filter((p: PCProduct) => p.unique_id !== excludeId)
            .slice(0, 8);
    } catch (e) {
        console.error(`🚨 [Related Products Fetch Error] maker: ${maker}`, e);
        return [];
    }
}

/** 🚀 エイリアス設定 (index.ts からの呼び出し用) */
export const fetchPCPopularityRanking = (host: string = '') => fetchPCProductRanking('popularity', host);