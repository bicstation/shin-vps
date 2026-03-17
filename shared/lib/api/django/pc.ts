/**
 * =====================================================================
 * 🖥️ PC製品（General）統合サービス
 * 🛡️ Maya's Logic: 物理構造 v5.2 完全同期版 (Next.js 15+ 対応)
 * 修正内容: resolveApiUrl の仕様変更に伴い、引数から冗長なパスを排除。
 * 物理パス: shared/lib/api/django/pc.ts
 * =====================================================================
 */

import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from './client';
import { getSiteMetadata } from '../../utils/siteConfig';

/**
 * 💎 型定義 (Maya's Logic Spec Edition)
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
    url: string;           
    affiliate_url: string; 
    description: string;
    ai_content: string;    
    ai_summary?: string;
    stock_status: string;
    unified_genre: string;
    cpu_model?: string;
    gpu_model?: string;
    memory_gb?: number;
    storage_gb?: number;
    display_info?: string;
    spec_score?: number;   
    radar_chart?: RadarChartData[]; 
    score_cpu?: number;
    score_gpu?: number;
    score_cost?: number;
    score_portable?: number;
    score_ai?: number;
}

export interface MakerCount {
    maker: string;
    count: number;
}

/**
 * 🛠️ 内部ユーティリティ: サイトグループの安全な取得
 */
const getSafeSiteGroup = (): string => {
    try {
        const metadata = getSiteMetadata();
        return metadata?.site_group || 'general';
    } catch (e) {
        // SSR時の AsyncLocalStorage エラー等の際も 'general' を返して死なせない
        return 'general';
    }
};

/**
 * ==========================================
 * 🚀 API 関数群
 * ==========================================
 */

/**
 * 💡 PC製品一覧取得
 * [Correct Path]: /api/general/pc-products/
 */
export async function fetchPCProducts(
    maker: string = '', 
    offset: number = 0, 
    limit: number = 12, 
    attribute: string = ''
): Promise<{ results: PCProduct[]; count: number; _debug?: any }> {
    
    const site_group = getSafeSiteGroup();
    
    const queryParams = new URLSearchParams({ 
        site_group,
        offset: offset.toString(),
        limit: limit.toString()
    });
    
    if (maker) queryParams.append('maker', maker);
    if (attribute) queryParams.append('attribute', attribute);

    // ✅ resolveApiUrl が自動で /api/ と末尾の / を補完するため「パスのみ」を渡す
    const url = resolveApiUrl(`general/pc-products?${queryParams.toString()}`);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 600 } 
        });
        const data = await handleResponseWithDebug(res, url);
        
        return { 
            results: data.results || [], 
            count: data.count || 0, 
            _debug: data._debug 
        };
    } catch (e: any) {
        console.error(`🚨 [PC-List Error] Fetch failed: ${e.message}`);
        return { results: [], count: 0, _debug: { error: e.message, url } };
    }
}

/**
 * 💡 PC製品詳細取得
 * [Correct Path]: /api/general/pc-products/${unique_id}/
 */
export async function fetchPCProductDetail(unique_id: string): Promise<PCProduct | null> {
    // ✅ 末尾スラッシュは client.ts で自動付与されるため、変数を渡すだけで完結
    const url = resolveApiUrl(`general/pc-products/${unique_id}`); 
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            cache: 'no-store' 
        });

        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            console.error(`🚨 [PC-Detail Critical] HTML response (404/500). ID: ${unique_id}`);
            return null;
        }

        const data = await handleResponseWithDebug(res, url);
        
        // handleResponseWithDebug の正規化を考慮し、results[0] または data本体を確認
        const product = data.results ? data.results[0] : data;

        if (!product || (!product.unique_id && !product.id)) {
            return null;
        }
        
        return product as PCProduct;

    } catch (e: any) {
        console.error(`🚨 [PC-Detail Fatal]: ${e.message}`);
        return null;
    }
}

/**
 * 💡 メーカー一覧取得
 * [Correct Path]: /api/general/pc-makers/
 */
export async function fetchMakers(): Promise<MakerCount[]> {
    const url = resolveApiUrl(`general/pc-makers`);
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), next: { revalidate: 3600 } });
        const data = await handleResponseWithDebug(res, url);
        // results配列があればそれを返し、なければdataが配列であると期待
        return Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []);
    } catch (e) {
        return [];
    }
}

/**
 * 💡 AIスコアランキング / 注目度ランキング
 * [Correct Path]: /api/general/pc-products/ranking/
 */
export async function fetchPCProductRanking(type: 'score' | 'popularity' = 'score'): Promise<PCProduct[]> {
    const endpoint = type === 'score' ? 'ranking' : 'popularity-ranking';
    const url = resolveApiUrl(`general/pc-products/${endpoint}`);
    
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), next: { revalidate: 600 } });
        const data = await handleResponseWithDebug(res, url);
        return Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []);
    } catch (e: any) { 
        return []; 
    }
}

/**
 * 💡 PCスペック統計取得
 * [Correct Path]: /api/general/pc-sidebar-stats/
 */
export async function fetchPCSidebarStats(): Promise<any | null> {
    const url = resolveApiUrl(`general/pc-sidebar-stats`);
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 600 } 
        });
        const data = await handleResponseWithDebug(res, url);
        // 統計データは単一オブジェクトまたはresultsに含まれる
        return data.results ? data.results : data;
    } catch (e: any) {
        console.error(`🚨 [PC-Sidebar-Stats Error]: ${e.message}`);
        return null;
    }
}