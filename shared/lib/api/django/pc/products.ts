/**
 * =====================================================================
 * 📦 PC 製品一覧・詳細取得サービス (Zenith v10.0 - Search Optimized)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【引数順序の最適化】catalog/product ページでの呼び出し順序に完全準拠。
 * 2. 【キーワード検索対応】第1引数を q (Query) とし、自由入力検索を有効化。
 * 3. 【デバッグ情報の強化】URL生成プロセスを可視化し、トラブルシューティングを容易に。
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

/**
 * 💡 PC製品一覧取得
 * @param q 自由入力キーワード (モデル名、CPU名など)
 * @param offset 取得開始位置
 * @param limit 取得件数
 * @param maker メーカー絞り込み (DELL, HP, Apple 等)
 * @param host リクエストホスト名
 * @param attribute 特殊属性フィルタ
 */
export async function fetchPCProducts(
    q: string = '', 
    offset: number = 0, 
    limit: number = 12, 
    maker: string = '',
    host: string = '',
    attribute: string = ''
) {
    const site_group = getSafeSiteGroup(host);
    const queryParams = new URLSearchParams({ 
        offset: offset.toString(),
        limit: limit.toString()
    });
    
    // 🚀 A. site_group による絞り込み（general以外の場合のみ）
    if (site_group && site_group !== 'general') {
        queryParams.append('site_group', site_group);
    }
    
    // 🚀 B. 検索・フィルタパラメータの付与
    if (q) queryParams.append('q', q);          // キーワード検索
    if (maker) queryParams.append('maker', maker); // メーカー指定
    if (attribute) queryParams.append('attribute', attribute); // 属性指定

    // 🔗 API URL の解決 (127.0.0.1:8083 または django-v3:8000)
    const url = resolveApiUrl(`general/pc-products/?${queryParams.toString()}`, host);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(host), 
            cache: 'no-store' 
        });
        
        // 🚀 共通ハンドラによるレスポンス正規化
        const data = await handleResponseWithDebug(res, url);
        
        return { 
            results: (Array.isArray(data.results) ? data.results : []) as PCProduct[], 
            count: typeof data.count === 'number' ? data.count : 0, 
            _debug: { ...data._debug, url } 
        };
    } catch (e: any) {
        console.error("🚨 [fetchPCProducts Error]", e);
        // url が未定義の場合のフォールバック
        const errorUrl = typeof url !== 'undefined' ? url : 'unknown_api_path';
        return { 
            results: [], 
            count: 0, 
            _debug: { error: e.message, url: errorUrl } 
        };
    }
}

/**
 * 💡 PC製品詳細取得 
 */
export async function fetchPCProductDetail(unique_id: string, host: string = ''): Promise<PCProduct | null> {
    const url = resolveApiUrl(`general/pc-products/${unique_id}/`, host);
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(host), 
            cache: 'no-store' 
        });
        
        const data = await handleResponseWithDebug(res, url);
        
        // results: [obj] の形から 0 番目を抽出
        const product = (Array.isArray(data.results) && data.results.length > 0) 
            ? data.results[0] 
            : null;

        return (product?.unique_id || product?.id) ? (product as PCProduct) : null;
    } catch (e) {
        console.error(`🚨 [fetchPCProductDetail Error] ID: ${unique_id}`, e);
        return null;
    }
}

/**
 * 💡 メーカー一覧取得 (ブランドリスト)
 */
export async function fetchMakers(host: string = ''): Promise<MakerCount[]> {
    const url = resolveApiUrl(`general/pc-makers/`, host);
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(host), 
            next: { revalidate: 3600 } 
        });
        
        const data = await handleResponseWithDebug(res, url);
        
        // results 配列を優先的に返却
        return Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []);
    } catch (e) {
        console.error("🚨 [fetchMakers Error]", e);
        return [];
    }
}