import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from './client';
import { getSiteMetadata } from '../../siteConfig';
import { PCProduct } from '../types';

/**
 * 💡 PC製品一覧取得
 */
export async function fetchPCProducts(params: any = {}): Promise<{ results: PCProduct[]; count: number; _debug?: any }> {
    const { site_group } = getSiteMetadata(); 
    const queryParams = new URLSearchParams({ site_group: site_group || 'common', ...params });
    const url = resolveApiUrl(`/api/pc-products/?${queryParams.toString()}`);

    console.log(`[DEBUG: LIST] Fetching products from: ${url}`);

    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), next: { revalidate: 3600 } });
        const data = await handleResponseWithDebug(res, url);
        return { results: data.results || [], count: data.count || 0, _debug: data._debug };
    } catch (e: any) {
        console.error(`[FETCH ERROR] fetchPCProducts failed: ${e.message}`);
        return { results: [], count: 0, _debug: { error: e.message, url } };
    }
}

/**
 * 💡 PC製品詳細取得 (unique_id)
 * 🚨 ここに最強のデバッグログを配置
 */
export async function fetchPCProductDetail(unique_id: string): Promise<PCProduct | null> {
    const url = resolveApiUrl(`/api/pc-products/${unique_id}/`); 
    
    console.log(`\n--- 🔍 API CALL: DETAIL START ---`);
    console.log(`[URL]: ${url}`);
    console.log(`[ID ]: ${unique_id}`);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            cache: 'no-store' 
        });

        console.log(`[STATUS]: ${res.status} ${res.statusText}`);

        // JSONとしてパースする前に、レスポンスの型をチェック
        const contentType = res.headers.get('content-type');
        console.log(`[CONTENT-TYPE]: ${contentType}`);

        // handleResponseWithDebug を呼ぶ前に自前でログ出し
        const data = await handleResponseWithDebug(res, url);
        
        if (!data) {
            console.error(`[CRITICAL] Data is null or undefined for ID: ${unique_id}`);
            return null;
        }

        if (data.isHtml || (typeof data === 'string' && data.includes('<!DOCTYPE html>'))) {
            console.error(`[🚨 ALERT] Received HTML instead of JSON! Django error page detected.`);
            console.error(`[HTML SNIPPET]: ${JSON.stringify(data).substring(0, 300)}...`);
            return null;
        }

        if (!data.unique_id) {
            console.error(`[API ERROR] missing unique_id in response. Keys found: ${Object.keys(data).join(', ')}`);
            return null;
        }

        console.log(`[✅ SUCCESS] Data retrieved for: ${data.unique_id}`);
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
 * 💡 関連製品取得
 */
export async function fetchRelatedProducts(maker: string, exclude_id: string): Promise<PCProduct[]> {
    const queryParams = new URLSearchParams({ 
        maker, 
        exclude_unique_id: exclude_id, 
        limit: '8' 
    });
    const url = resolveApiUrl(`/api/pc-products/?${queryParams.toString()}`);
    
    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), next: { revalidate: 3600 } });
        const data = await handleResponseWithDebug(res, url);
        return data.results || [];
    } catch (e: any) { 
        console.error(`[FETCH ERROR] fetchRelatedProducts failed: ${e.message}`);
        return []; 
    }
}

/**
 * 💡 PC製品ランキング取得
 */
export async function fetchPCProductRanking(): Promise<PCProduct[]> {
    const url = resolveApiUrl(`/api/pc-products/ranking/`);
    
    console.log(`[DEBUG: RANKING] Fetching ranking from: ${url}`);

    try {
        const res = await fetch(url, { headers: getDjangoHeaders(), next: { revalidate: 3600 } });
        const data = await handleResponseWithDebug(res, url);
        
        if (Array.isArray(data)) return data;
        return data.results || [];
    } catch (e: any) { 
        console.error(`[FETCH ERROR] fetchPCProductRanking failed: ${e.message}`);
        return []; 
    }
}