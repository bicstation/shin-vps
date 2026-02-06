/**
 * =====================================================================
 * 💻 Django API サービス層 (shared/lib/api/django.ts)
 * PC製品・アダルト製品の統合データアクセス
 * =====================================================================
 */
import { getDjangoBaseUrl, IS_SERVER } from './config';
import { getSiteMetadata } from '../siteConfig';
import { PCProduct, AdultProduct } from './types';

/**
 * 💡 接続先URLを解決するユーティリティ
 * サーバーサイド実行時はDocker内部ネットワーク(django-v2)を直接参照。
 * クライアントサイド（ブラウザ）実行時は設定された外部ドメインを使用。
 */
const resolveApiUrl = (endpoint: string) => {
    // endpoint は必ず /api/... のようにスラッシュから始まることを想定
    const rootUrl = getDjangoBaseUrl(); 
    
    if (IS_SERVER) {
        /**
         * 🚀 サーバーサイド(Server Components)実行時
         * Traefik(8083)を通さず、Dockerネットワーク内の django-v2:8000 を直接叩く。
         * これにより、名前解決の失敗や不要なプロキシエラーを回避します。
         */
        return `http://django-v2:8000${endpoint}`;
    }
    
    /**
     * 🌐 クライアントサイド(ブラウザ)実行時
     * ユーザーのブラウザから見える外部URL（例: http://api-tiper-host:8083）を使用。
     */
    // rootUrl の末尾にスラッシュがある場合を考慮して連結
    const base = rootUrl.endsWith('/') ? rootUrl.slice(0, -1) : rootUrl;
    return `${base}${endpoint}`;
};

/**
 * 💡 Django リクエスト用ヘッダーの生成
 */
const getDjangoHeaders = () => {
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    /**
     * サーバーサイド実行時は、Djangoの ALLOWED_HOSTS を通過させるために
     * 元のドメイン名を Host ヘッダーにセットする。
     */
    if (IS_SERVER) {
        try {
            const rootUrl = getDjangoBaseUrl();
            const hostName = new URL(rootUrl).hostname;
            headers['Host'] = hostName;
        } catch (e) {
            // 解析失敗時は何もしない（デフォルトの挙動に任せる）
        }
    }

    return headers;
};

// =====================================================================
// 💻 PC製品セクション
// =====================================================================

/**
 * 💻 一般商品一覧取得
 */
export async function fetchPCProducts(params: any = {}): Promise<{ results: PCProduct[]; count: number }> {
    const { site_group } = getSiteMetadata(); 
    const queryParams = new URLSearchParams({ 
        site_group: site_group || 'common', 
        ...params 
    });
    
    const url = resolveApiUrl(`/api/pc-products/?${queryParams.toString()}`);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(),
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(8000)
        });

        const contentType = res.headers.get("content-type");

        // ✅ エラーチェック: HTMLが返ってきた場合を検知
        if (!res.ok || (contentType && contentType.includes("text/html"))) {
            const errorBody = await res.text();
            console.error(`[F12 DEBUG] fetchPCProducts API Error at ${url}: Status ${res.status}`);
            console.error(`[F12 DEBUG] HTML Snippet: ${errorBody.slice(0, 200)}...`);
            return { results: [], count: 0 };
        }
        
        const data = await res.json();
        return { 
            results: data.results || [], 
            count: data.count || 0
        };
    } catch (e: any) {
        console.error(`[F12 DEBUG] [Django fetchPCProducts FAILED]: ${e.message}`);
        return { results: [], count: 0 };
    }
}

/**
 * 💻 PC商品詳細取得 (unique_idベース)
 */
export async function fetchPCProductDetail(unique_id: string): Promise<PCProduct | null> {
    const url = resolveApiUrl(`/api/pc-products/${unique_id}/`);
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(),
            cache: 'no-store'
        });
        
        const contentType = res.headers.get("content-type");
        
        if (!res.ok || (contentType && contentType.includes("text/html"))) {
            console.error(`[F12 DEBUG] fetchPCProductDetail API Error: Status ${res.status} id: ${unique_id}`);
            return null;
        }

        return await res.json();
    } catch (e: any) { 
        console.error(`[F12 DEBUG] [Django fetchPCProductDetail FAILED]: ${e.message} id: ${unique_id}`);
        return null; 
    }
}

// =====================================================================
// 🔞 アダルト製品セクション
// =====================================================================

/**
 * 🔞 アダルト商品一覧取得
 */
export async function getAdultProducts(params: any = {}): Promise<{ results: AdultProduct[]; count: number }> {
    const { site_group } = getSiteMetadata(); 
    const queryParams = new URLSearchParams({ 
        site_group: site_group || 'adult', 
        ...params 
    });
    
    // ⚠️ Django側が /api/adult-products/ (スラッシュあり) を期待しているため厳守
    const url = resolveApiUrl(`/api/adult-products/?${queryParams.toString()}`);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(),
            next: { revalidate: 60 },
            signal: AbortSignal.timeout(8000)
        });

        /**
         * 💡 重要: Unexpected token '<' エラー対策
         * res.json() を呼ぶ前に content-type をチェックし、HTMLが返ってきた場合は早期リターン
         */
        const contentType = res.headers.get("content-type");
        if (!res.ok || (contentType && contentType.includes("text/html"))) {
            const text = await res.text();
            console.error(`[F12 DEBUG] [Django Adult API Error]: Expected JSON but got ${contentType}. Status: ${res.status}. URL: ${url}`);
            console.error(`[F12 DEBUG] HTML Snippet: ${text.slice(0, 300)}...`);
            return { results: [], count: 0 };
        }

        const data = await res.json();
        return { 
            results: data.results || [], 
            count: data.count || 0 
        };
    } catch (e: any) {
        console.error(`[F12 DEBUG] [Django getAdultProducts FAILED]: ${e.message}`);
        return { results: [], count: 0 };
    }
}

/**
 * 🔞 アダルト商品詳細取得 (ID または unique_id)
 */
export async function getAdultProductDetail(id: string | number): Promise<AdultProduct | null> {
    const url = resolveApiUrl(`/api/adult-products/${id}/`);
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(),
            next: { revalidate: 60 }
        });
        
        const contentType = res.headers.get("content-type");

        // ✅ エラー時の詳細をコンソールに出力
        if (!res.ok || (contentType && contentType.includes("text/html"))) {
            if (res.status !== 404) {
                const htmlText = await res.text();
                console.error(`[F12 DEBUG] API ERROR: Django returned HTML instead of JSON.`);
                console.error(`[F12 DEBUG] URL: ${url}`);
                console.error(`[F12 DEBUG] Content Snippet: ${htmlText.slice(0, 500)}`);
            } else {
                console.error(`[F12 DEBUG] Adult Detail Not Found (404) at ${url}`);
            }
            return null; // エラー時は空を返してクラッシュを防ぐ
        }

        // ✅ JSONチェック
        if (contentType && !contentType.includes("application/json")) {
            console.error(`[F12 DEBUG] Type Mismatch: Expected JSON but got ${contentType} at ${url}`);
            return null;
        }
        
        return await res.json();
    } catch (e: any) { 
        console.error(`[F12 DEBUG] [Django getAdultProductDetail FAILED]: ${e.message} id: ${id} url: ${url}`);
        return null; 
    }
}