/**
 * =====================================================================
 * 📊 PC 統計・関連データ取得サービス (Zenith v10.0 - Pipeline Synced)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【引数リレーの整合性】fetchPCProducts の新仕様 (q, offset, limit, maker) に準拠。
 * 2. 【データ抽出の堅牢化】handleResponseWithDebug の戻り値を安全に処理。
 * 3. 【VPS/Local 完全対応】すべてのエンドポイントで host 引数を伝播させ、接続先解決を保証。
 * =====================================================================
 */
import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';
import { fetchPCProducts } from './products';
import { PCProduct } from './types';

/**
 * 💡 AIスコアランキング取得
 * @param type - 'score' (AI性能順) または 'popularity' (人気順)
 * @param host - 実行環境のホスト名
 */
export async function fetchPCProductRanking(
    type: 'score' | 'popularity' = 'score',
    host: string = ''
): Promise<PCProduct[]> {
    const endpoint = type === 'score' ? 'ranking' : 'popularity-ranking';
    const url = resolveApiUrl(`general/pc-products/${endpoint}/`, host);
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(host), 
            next: { revalidate: 600 } 
        });
        
        // handleResponseWithDebug は { results: [], count: 0 } を返す
        const data = await handleResponseWithDebug(res, url);
        
        return Array.isArray(data.results) ? data.results : [];
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
    const url = resolveApiUrl(`general/pc-sidebar-stats/`, host);
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(host), 
            next: { revalidate: 600 } 
        });
        
        const data = await handleResponseWithDebug(res, url);

        /**
         * 💡 正規化ロジック:
         * 統計データが results: [ {stats_data} ] という配列で来る場合は 0 番目を抽出。
         * オブジェクト直下で来る場合はそのまま data.results を返す。
         */
        if (data.results && Array.isArray(data.results)) {
            return data.results.length > 1 ? data.results : data.results[0];
        }
        return data.results || null;
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
         * 🚀 重要修正: fetchPCProducts の引数順序を v10.0 仕様に同期
         * 第1引数(q): 空
         * 第2引数(offset): 0
         * 第3引数(limit): 10 (除外分を考慮して少し多めに取得)
         * 第4引数(maker): maker識別子
         * 第5引数(host): hostリレー
         */
        const { results } = await fetchPCProducts('', 0, 10, maker, host); 
        
        if (!results || !Array.isArray(results)) return [];

        // 自分自身を除外して最大8件を返却
        return results
            .filter((p: PCProduct) => p.unique_id !== excludeId)
            .slice(0, 8);
    } catch (e) {
        console.error(`🚨 [Related Products Fetch Error] maker: ${maker}`, e);
        return [];
    }
}