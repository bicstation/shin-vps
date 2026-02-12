import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from './client';
import { getSiteMetadata } from '../../siteConfig';
import { AdultProduct } from '../types';

/**
 * ==============================================================================
 * 🔞 TIPER API Middleware - Django Connector (Full-Sync Edition)
 * ==============================================================================
 * * このファイルは Django 側の views.py / urls.py と 1対1 で同期しています。
 * 修正日: 2026-02-12
 */

/**
 * 💡 1. 統合製品詳細取得 (最重要エンドポイント)
 * 最強ページ (page.tsx) から呼ばめるメインの取得ロジックです。
 * Django 側の RetrieveAPIView (FanzaProductDetailAPIView / AdultProductDetailAPIView) 
 * の lookup_field 設定に合わせてエンドポイントを自動選択します。
 */
export async function getAdultProductDetail(id: string | number, source?: string): Promise<AdultProduct | null> {
    const idStr = String(id);
    
    // 🚨 Django の urls.py 定義に厳密に合わせるためのルーティング
    // source 指定、または ID のプレフィックスによって、叩くべき門（View）を決定します。
    let endpoint = '';
    
    if (
        idStr.startsWith('DMM_') || 
        idStr.startsWith('FANZA_') || 
        source === 'DMM' || 
        source === 'FANZA'
    ) {
        // FANZA/DMM系: urls.py の path('fanza-products/<str:unique_id>/', ...) に対応
        // Django 側で clean_id (プレフィックス剥離) ロジックが動くため、そのまま投げます。
        endpoint = `/api/fanza-products/${idStr}/`;
    } else {
        // Adult/DUGA系: urls.py の path('adult-products/<str:product_id_unique>/', ...) に対応
        endpoint = `/api/adult-products/${idStr}/`;
    }

    const url = resolveApiUrl(endpoint);
    console.log(`📡 [BYPASS] Fetching product data from: ${url}`);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 60 },
            cache: 'no-store' // リアルタイムな商品更新を反映させるため no-store を推奨
        });
        
        // デバッグ情報を含めてレスポンスを解析
        const data = await handleResponseWithDebug(res, url);
        
        // Django 側の get_object() が Http404 を返した場合の処理
        if (!data || data._error || data.detail === "見つかりませんでした。" || data.detail === "Not found.") {
            console.warn(`⚠️ [BYPASS 404] Node not found in Django DB: ${idStr} at ${url}`);
            return null;
        }
        
        return data;
    } catch (e) { 
        console.error("❌ [BYPASS CRITICAL ERROR] Connection failed between Next.js and Django:", e);
        return null; 
    }
}

/**
 * 💡 2. 統合製品アーカイブ取得 (Unified)
 * Django 側の UnifiedAdultProductListView (/api/unified-adult-products/) を使用します。
 * フロントエンドの offset/limit 形式を Django の PageNumberPagination 形式に変換。
 */
export async function getUnifiedProducts(params: any = {}): Promise<{ results: AdultProduct[]; count: number; _debug?: any }> {
    const { site_group } = getSiteMetadata(); 
    const endpoint = '/api/unified-adult-products/';

    // offset と limit から Django 側の page 番号を算出
    const { limit, offset, ...rest } = params;
    const pageSize = limit || 24;
    const page = offset ? Math.floor(offset / pageSize) + 1 : (params.page || 1);

    const queryParams = new URLSearchParams({ 
        site_group: site_group || 'adult', 
        page: String(page),
        page_size: String(pageSize),
        ...rest 
    });

    const url = resolveApiUrl(`${endpoint}?${queryParams.toString()}`);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 60 }, 
            signal: AbortSignal.timeout(10000) 
        });
        const data = await handleResponseWithDebug(res, url);
        
        // Django の UnifiedView は _serialize_mixed_list によりシリアライザを自動判別して返します。
        return { 
            results: Array.isArray(data?.results) ? data.results : [], 
            count: data?.count || 0, 
            _debug: data?._debug || { url, page, pageSize }
        };
    } catch (e: any) { 
        console.error("❌ [BYPASS ERROR] getUnifiedProducts failed:", e);
        return { results: [], count: 0, _debug: { error: e.message, url } }; 
    }
}

/**
 * 💡 3. 個別製品一覧 (DUGA/AdultProduct専用)
 */
export async function getAdultProducts(params: any = {}): Promise<{ results: AdultProduct[]; count: number; _debug?: any }> {
    const { site_group } = getSiteMetadata(); 
    const queryParams = new URLSearchParams({ site_group: site_group || 'adult', ...params });
    const url = resolveApiUrl(`/api/adult-products/?${queryParams.toString()}`);
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 60 }, 
            signal: AbortSignal.timeout(10000) 
        });
        const data = await handleResponseWithDebug(res, url);
        return { 
            results: data.results || [], 
            count: data.count || 0, 
            _debug: data._debug 
        };
    } catch (e: any) { 
        return { results: [], count: 0, _debug: { error: e.message, url } }; 
    }
}

/**
 * 💡 4. 【新設】マーケット分析・仕訳データ取得 (Analysis)
 * Django 側の PlatformMarketAnalysisAPIView (/api/adult-products/analysis/) を使用。
 * プラットフォーム別の人気ジャンルや平均スコアを取得し、サイドメニューの描画を支えます。
 */
export async function getPlatformAnalysis(source: string, makerId?: string | number): Promise<any | null> {
    const queryParams = new URLSearchParams({ source: source.toUpperCase() });
    if (makerId) queryParams.append('maker_id', String(makerId));

    const url = resolveApiUrl(`/api/adult-products/analysis/?${queryParams.toString()}`);
    console.log(`📊 [ANALYSIS] Fetching market classification from: ${url}`);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 3600 } // 統計データは1時間キャッシュで十分
        });
        const data = await res.json();
        return data;
    } catch (e) {
        console.error("❌ [ANALYSIS ERROR] Failed to fetch market analysis:", e);
        return null;
    }
}

/**
 * 💡 5. メーカー一覧取得
 */
export async function fetchMakers(params: any = {}): Promise<any[]> {
    const url = resolveApiUrl(`/api/makers/?${new URLSearchParams(params).toString()}`);
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 3600 } 
        });
        const data = await res.json();
        return Array.isArray(data) ? data : (data.results || []);
    } catch (e) { 
        console.error("❌ [BYPASS ERROR] fetchMakers failed:", e);
        return []; 
    }
}

/**
 * 💡 6. ランキング取得 (AIスコア順)
 * Django の path('adult-products/ranking/', ...) に合わせて固定パスを優先。
 */
export async function fetchAdultProductRanking(params: any = {}): Promise<{ results: AdultProduct[]; count: number; _debug?: any }> {
    const url = resolveApiUrl(`/api/adult-products/ranking/`);
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 3600 }, 
            signal: AbortSignal.timeout(10000) 
        });
        const data = await handleResponseWithDebug(res, url);
        
        const results = Array.isArray(data) ? data : (data.results || []);
        return { 
            results: results, 
            count: data.count || results.length, 
            _debug: data._debug 
        };
    } catch (e: any) { 
        console.error("❌ [BYPASS ERROR] fetchAdultProductRanking failed:", e);
        return { results: [], count: 0, _debug: { error: e.message, url } }; 
    }
}

/**
 * ==============================================================================
 * 🔄 別名エクスポート (互換性維持)
 * ==============================================================================
 */
export const getUnifiedProductDetail = getAdultProductDetail;