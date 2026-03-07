/**
 * =====================================================================
 * 🖥️ PC製品（General）統合サービス
 * 🛡️ Maya's Logic: 物理構造 v3.2 完全同期版
 * 物理パス: shared/lib/api/django/pc.ts
 * =====================================================================
 * 【責務】
 * 1. PC製品（BicStation等）のカタログデータ・詳細情報の取得
 * 2. AI解析スコア・レーダーチャートデータの型定義と同期
 * 3. サイトグループ（site_group）に基づいたフィルタリング
 * =====================================================================
 */

import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from './client';
// ✅ 修正ポイント: 物理構造 [STRUCTURE] shared/lib/utils/siteConfig.ts に合わせる
import { siteConfig } from '../../utils/siteConfig';

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
    url: string;           // 直リンクURL
    affiliate_url: string; // 正式アフィリエイトURL
    description: string;
    ai_content: string;    // AI生成コンテンツ（詳細レビュー等）
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
    // 各スコアの個別プロパティ (ランキング等で使用)
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
 * ==========================================
 * 🚀 API 関数群
 * ==========================================
 */

/**
 * 💡 PC製品一覧取得
 * サイトグループを自動付与し、適切な範囲の製品のみを抽出します。
 */
export async function fetchPCProducts(
    maker: string = '', 
    offset: number = 0, 
    limit: number = 12, 
    attribute: string = ''
): Promise<{ results: PCProduct[]; count: number; _debug?: any }> {
    // ✅ siteConfig から site_group を取得 (BicStation なら 'pc' 等)
    const site_group = siteConfig.site_group || 'common'; 
    const queryParams = new URLSearchParams({ 
        site_group,
        offset: offset.toString(),
        limit: limit.toString()
    });
    
    if (maker) queryParams.append('maker', maker);
    if (attribute) queryParams.append('attribute', attribute);

    const url = resolveApiUrl(`/api/general/pc-products/?${queryParams.toString()}`);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 600 } // 10分間のキャッシュ
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
 * 強固なエラー検知機能を備え、Django側の不備（HTML返却）を即座に判定します。
 */
export async function fetchPCProductDetail(unique_id: string): Promise<PCProduct | null> {
    const url = resolveApiUrl(`/api/general/pc-products/${unique_id}/`); 
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            cache: 'no-store' // 個別詳細は常に最新情報を優先
        });

        // 🛡️ Guard: HTML（エラーページ）が返ってきた場合の即時遮断ロジック
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            console.error(`🚨 [PC-Detail Critical] HTML response detected (Django Error). ID: ${unique_id}`);
            return null;
        }

        const data = await handleResponseWithDebug(res, url);
        
        // 🛡️ Guard: ID欠如チェック
        if (!data || (!data.unique_id && !data.id)) {
            console.error(`🚨 [PC-Detail Error] Data missing unique_id for: ${unique_id}`);
            return null;
        }
        
        return data as PCProduct;

    } catch (e: any) {
        console.error(`🚨 [PC-Detail Fatal] Fetch failed: ${e.message}`);
        return null;
    }
}

/**
 * 💡 メーカー一覧取得 (カウント付き)
 */
export async function fetchMakers(): Promise<MakerCount[]> {
    const url = resolveApiUrl(`/api/general/pc-makers/`);
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), next: { revalidate: 3600 } });
        const data = await handleResponseWithDebug(res, url);
        
        // 直配列形式と results オブジェクト形式の両方をサポート
        return Array.isArray(data) ? data : (data.results || []);
    } catch (e) {
        console.error(`🚨 [Makers Error]:`, e);
        return [];
    }
}

/**
 * 💡 AIスコアランキング / 注目度ランキング
 */
export async function fetchPCProductRanking(type: 'score' | 'popularity' = 'score'): Promise<PCProduct[]> {
    const endpoint = type === 'score' ? 'ranking' : 'popularity-ranking';
    const url = resolveApiUrl(`/api/general/pc-products/${endpoint}/`);
    
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), next: { revalidate: 600 } });
        const data = await handleResponseWithDebug(res, url);
        return Array.isArray(data) ? data : (data.results || []);
    } catch (e: any) { 
        console.error(`🚨 [Ranking Error ${type}]: ${e.message}`);
        return []; 
    }
}

/**
 * 💡 PCスペック統計取得 (サイドバー用)
 */
export async function fetchPCSidebarStats(): Promise<any | null> {
    const url = resolveApiUrl(`/api/general/pc-sidebar-stats/`);
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 600 } 
        });
        return await handleResponseWithDebug(res, url);
    } catch (e: any) {
        console.error(`🚨 [Stats Error]: ${e.message}`);
        return null;
    }
}