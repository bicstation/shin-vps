/**
 * =====================================================================
 * 📦 PC 製品一覧・詳細取得サービス (Zenith v9.8)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【データ構造の厳格化】handleResponseWithDebug の戻り値から常に .results を安全に抽出。
 * 2. 【詳細取得の安定化】単体レスポンスが [obj] か obj かに関わらず確実に抽出。
 * 3. 【デバッグ情報の継承】_debug 情報を上位にリレーし、トラブルシューティングを容易に。
 * =====================================================================
 */
import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';
import { getSiteMetadata } from '../../../utils/siteConfig';
import { PCProduct, MakerCount } from './types';

/**
 * 💡 サイトグループ情報の取得 (内部判定用)
 */
const getSafeSiteGroup = (host?: string): string => {
    try {
        const metadata = getSiteMetadata(host || "");
        return metadata?.site_group || ''; 
    } catch (e) { return ''; }
};

/** * 💡 PC製品一覧取得
 */
export async function fetchPCProducts(
    maker: string = '', 
    offset: number = 0, 
    limit: number = 12, 
    attribute: string = '',
    host: string = ''
) {
    const site_group = getSafeSiteGroup(host);
    const queryParams = new URLSearchParams({ 
        offset: offset.toString(),
        limit: limit.toString()
    });
    
    // site_group による絞り込み（general以外の場合のみ）
    if (site_group && site_group !== 'general') {
        queryParams.append('site_group', site_group);
    }
    
    if (maker) queryParams.append('maker', maker);
    if (attribute) queryParams.append('attribute', attribute);

    const url = resolveApiUrl(`general/pc-products/?${queryParams.toString()}`, host);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(host), 
            cache: 'no-store' 
        });
        
        // 🚀 共通ハンドラを通す
        const data = await handleResponseWithDebug(res, url);
        
        // 🚨 重要: data 自体が { results: [...], count: 123 } の形になっている
        return { 
            results: (Array.isArray(data.results) ? data.results : []) as PCProduct[], 
            count: typeof data.count === 'number' ? data.count : 0, 
            _debug: { ...data._debug, url } 
        };
    } catch (e: any) {
        console.error("🚨 [fetchPCProducts Error]", e);
        return { results: [], count: 0, _debug: { error: e.message, url } };
    }
}

/** * 💡 PC製品詳細取得 
 */
export async function fetchPCProductDetail(unique_id: string, host: string = ''): Promise<PCProduct | null> {
    const url = resolveApiUrl(`general/pc-products/${unique_id}/`, host);
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(host), 
            cache: 'no-store' 
        });
        
        const data = await handleResponseWithDebug(res, url);
        
        // handleResponseWithDebug は単体オブジェクトも results: [obj] として正規化する
        const product = (Array.isArray(data.results) && data.results.length > 0) 
            ? data.results[0] 
            : null;

        return (product?.unique_id || product?.id) ? (product as PCProduct) : null;
    } catch (e) {
        console.error(`🚨 [fetchPCProductDetail Error] ID: ${unique_id}`, e);
        return null;
    }
}

/** * 💡 メーカー一覧取得 (ブランドリスト)
 */
export async function fetchMakers(host: string = ''): Promise<MakerCount[]> {
    const url = resolveApiUrl(`general/pc-makers/`, host);
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(host), 
            next: { revalidate: 3600 } 
        });
        
        const data = await handleResponseWithDebug(res, url);
        
        // results があればそれを返し、なければ data 自体が配列かチェック
        return Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []);
    } catch (e) {
        console.error("🚨 [fetchMakers Error]", e);
        return [];
    }
}