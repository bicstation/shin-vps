/**
 * =====================================================================
 * 📊 PC 統計・関連データ取得サービス (Zenith v9.6)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【データ抽出の統一】handleResponseWithDebug の戻り値から results を確実に抽出。
 * 2. 【ホスト伝播】すべての関数で host 引数をリレーし、VPS/Local 判定を維持。
 * 3. 【型安全】予期せぬレスポンスでも空配列を返し、サイドバー等のクラッシュを防止。
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
        
        // 🚀 handleResponseWithDebug を使用
        const data = await handleResponseWithDebug(res, url);
        
        // data.results は handleResponseWithDebug 側で必ず配列であることが保証されています
        return data.results;
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

        // 統計データは単一オブジェクトの場合が多いため、results があればそれを、なければ全体を返す
        // handleResponseWithDebug の仕様に合わせ、正規化されたデータを取得
        return data.results && data.results.length > 0 ? data.results[0] : (data.results || null);
    } catch (e) {
        console.error(`🚨 [Sidebar Stats Fetch Error]`, e);
        return null;
    }
}

/**
 * 💡 関連製品取得 (メーカー一致製品から自分を除外)
 * @param maker - メーカー識別子
 * @param excludeId - 除外する現在の製品ID
 * @param host - 実行環境のホスト名
 */
export async function fetchRelatedProducts(
    maker: string, 
    excludeId: string,
    host: string = ''
): Promise<any[]> {
    try {
        // 🚀 fetchPCProducts に host をリレーすることで、内部での URL 解決を正常化
        const { results } = await fetchPCProducts(maker, 0, 9, '', host); 
        
        if (!results || !Array.isArray(results)) return [];

        // 自分自身を除外して最大8件返す
        return results
            .filter((p: any) => p.unique_id !== excludeId)
            .slice(0, 8);
    } catch (e) {
        console.error(`🚨 [Related Products Fetch Error] maker: ${maker}`, e);
        return [];
    }
}