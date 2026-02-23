import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from './client';
import { getSiteMetadata } from '../../siteConfig';

/**
 * ==========================================
 * 💎 型定義
 * ==========================================
 */
export interface RadarChartData {
    subject: string;
    value: number;
    fullMark: number;
}

export interface PCProduct {
    id: number;
    unique_id: string;
    site_prefix: string;
    maker: string;
    maker_name?: string;
    name: string;
    price: number;
    image_url: string;
    url: string;           // 直リンクURL
    affiliate_url: string; // 正式アフィリエイトURL
    description: string;
    ai_content: string;    // AI生成コンテンツ
    ai_summary?: string;
    stock_status: string;
    unified_genre: string;
    // スペック情報
    cpu_model?: string;
    gpu_model?: string;
    memory_gb?: number;
    storage_gb?: number;
    display_info?: string;
    spec_score?: number;   // AI解析総合スコア
    radar_chart?: RadarChartData[]; // 5軸チャート用データ
}

export interface MakerCount {
    maker: string;
    count: number;
}

/**
 * ==========================================
 * 🖥️ API 関数群
 * ==========================================
 */

/**
 * 💡 PC製品一覧取得
 * ページネーションと属性フィルタに対応
 */
export async function fetchPCProducts(
    maker: string = '', 
    offset: number = 0, 
    limit: number = 12, 
    attribute: string = ''
): Promise<{ results: PCProduct[]; count: number; _debug?: any }> {
    const { site_group } = getSiteMetadata(); 
    const queryParams = new URLSearchParams({ 
        site_group: site_group || 'common',
        offset: offset.toString(),
        limit: limit.toString()
    });
    
    if (maker) queryParams.append('maker', maker);
    if (attribute) queryParams.append('attribute', attribute);

    const url = resolveApiUrl(`/api/general/pc-products/?${queryParams.toString()}`);

    console.log(`[DEBUG: LIST] Fetching products from: ${url}`);

    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), next: { revalidate: 3600 } });
        const data = await handleResponseWithDebug(res, url);
        return { 
            results: data.results || [], 
            count: data.count || 0, 
            _debug: data._debug 
        };
    } catch (e: any) {
        console.error(`[FETCH ERROR] fetchPCProducts failed: ${e.message}`);
        return { results: [], count: 0, _debug: { error: e.message, url } };
    }
}

/**
 * 💡 PC製品詳細取得 (最強のデバッグログ搭載)
 */
export async function fetchPCProductDetail(unique_id: string): Promise<PCProduct | null> {
    const url = resolveApiUrl(`/api/general/pc-products/${unique_id}/`); 
    
    console.log(`\n--- 🔍 API CALL: DETAIL START ---`);
    console.log(`[URL]: ${url}`);
    console.log(`[ID ]: ${unique_id}`);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            cache: 'no-store' 
        });

        console.log(`[STATUS]: ${res.status} ${res.statusText}`);
        const contentType = res.headers.get('content-type');
        console.log(`[CONTENT-TYPE]: ${contentType}`);

        const data = await handleResponseWithDebug(res, url);
        
        if (!data) {
            console.error(`[CRITICAL] Data is null or undefined for ID: ${unique_id}`);
            return null;
        }

        // HTMLが返ってきた（Djangoのエラー画面）場合の判定
        if (data.isHtml || (typeof data === 'string' && data.includes('<!DOCTYPE html>'))) {
            console.error(`[🚨 ALERT] Received HTML instead of JSON! Django error page detected.`);
            return null;
        }

        if (!data.unique_id && !data.id) {
            console.error(`[API ERROR] Missing ID in response. Keys found: ${Object.keys(data).join(', ')}`);
            return null;
        }

        console.log(`[✅ SUCCESS] Data retrieved for: ${data.unique_id || data.id}`);
        console.log(`--- 🔍 API CALL: DETAIL END ---\n`);
        
        return data as PCProduct;

    } catch (e: any) {
        console.error(`[🚨 FATAL FETCH ERROR] fetchPCProductDetail failed!`);
        console.error(`[MESSAGE]: ${e.message}`);
        console.error(`--- 🔍 API CALL: DETAIL END ---\n`);
        return null;
    }
}

/**
 * 💡 メーカー一覧取得 (カウント付き)
 * 修正: APIが直接配列を返す場合と results 配列を返す場合の両方に対応
 */
export async function fetchMakers(): Promise<MakerCount[]> {
    const url = resolveApiUrl(`/api/general/pc-makers/`);

    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), cache: 'no-store' });
        const data = await handleResponseWithDebug(res, url);
        
        // デバッグログ: APIから実際に返ってきたデータの型を確認
        console.log(`[DEBUG: fetchMakers] Received data type: ${Array.isArray(data) ? 'Array' : typeof data}`);

        // 1. 直配列の場合 [{}, {}]
        if (Array.isArray(data)) {
            return data;
        }
        // 2. オブジェクトの中に results がある場合 { results: [] }
        if (data && Array.isArray(data.results)) {
            return data.results;
        }
        
        return [];
    } catch (e) {
        console.error(`[Makers API ERROR]:`, e);
        return [];
    }
}

/**
 * 💡 AIスコアランキング取得
 */
export async function fetchPCProductRanking(): Promise<PCProduct[]> {
    const url = resolveApiUrl(`/api/general/pc-products/ranking/`);
    
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), next: { revalidate: 3600 } });
        const data = await handleResponseWithDebug(res, url);
        if (Array.isArray(data)) return data;
        return data.results || [];
    } catch (e: any) { 
        console.error(`[RANKING ERROR]: ${e.message}`);
        return []; 
    }
}

/**
 * 💡 注目度ランキング取得 (PV順)
 */
export async function fetchPCPopularityRanking(): Promise<PCProduct[]> {
    const url = resolveApiUrl(`/api/general/pc-products/popularity-ranking/`);

    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), cache: 'no-store' });
        const data = await handleResponseWithDebug(res, url);
        return Array.isArray(data) ? data : (data.results || []);
    } catch (e) {
        console.error(`[Popularity Ranking API ERROR]:`, e);
        return [];
    }
}

/**
 * 💡 関連製品取得
 */
export async function fetchRelatedProducts(maker: string, exclude_id: string): Promise<PCProduct[]> {
    const queryParams = new URLSearchParams({ 
        maker, 
        exclude_unique_id: exclude_id, 
        limit: '8' 
    });
    const url = resolveApiUrl(`/api/general/pc-products/?${queryParams.toString()}`);
    
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), next: { revalidate: 3600 } });
        const data = await handleResponseWithDebug(res, url);
        return data.results || [];
    } catch (e: any) { 
        console.error(`[Related Products ERROR]:`, e.message);
        return []; 
    }
}