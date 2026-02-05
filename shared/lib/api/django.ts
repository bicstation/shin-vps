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
 * サーバーサイド実行時はDocker内部ネットワーク(django-v2)を、
 * クライアントサイド実行時は設定された外部URLを使用します。
 */
const resolveApiUrl = (endpoint: string) => {
    const rootUrl = getDjangoBaseUrl(); // 例: http://api-tiper-host:8083
    
    if (IS_SERVER) {
        // 💡 サーバーサイド(Server Components)からのリクエストは
        // 外部用ドメインではなく Dockerコンテナ名:内部ポート を直接叩く
        return `http://django-v2:8000${endpoint}`;
    }
    
    return `${rootUrl}${endpoint}`;
};

/**
 * 💡 Django リクエスト用ヘッダーの生成
 */
const getDjangoHeaders = () => {
    const headers: Record<string, string> = {
        'Accept': 'application/json',
    };

    /**
     * TraefikやDjangoのALLOWED_HOSTS対策としてHostヘッダーを調整
     */
    if (IS_SERVER) {
        try {
            const rootUrl = getDjangoBaseUrl();
            const hostName = new URL(rootUrl).hostname;
            // サーバー内部通信であっても、Django側が「正しいドメインからのリクエスト」と
            // 認識できるように元のホスト名をセットします。
            headers['Host'] = hostName;
        } catch (e) {
            console.warn("[Django API] Failed to parse hostname.");
        }
    }

    return headers;
};

/**
 * 💻 [Django API] 一般商品一覧取得
 */
export async function fetchPCProducts(params: any = {}): Promise<{ results: PCProduct[]; count: number }> {
    const { site_group } = getSiteMetadata(); 
    const queryParams = new URLSearchParams({ 
        site_group: site_group || 'common', 
        ...params 
    });
    
    // 💡 resolveApiUrl を使用
    const url = resolveApiUrl(`/api/pc-products/?${queryParams.toString()}`);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(),
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) {
            console.error(`[Django API Error]: Status ${res.status} at ${url}`);
            return { results: [], count: 0 };
        }
        
        const data = await res.json();
        return { 
            results: data.results || [], 
            count: data.count || 0
        };
    } catch (e: any) {
        console.error(`[Django fetchPCProducts FAILED]: ${e.message} at ${url}`);
        return { results: [], count: 0 };
    }
}

/**
 * 🔞 [Django API] アダルト商品一覧取得
 */
export async function getAdultProducts(params: any = {}): Promise<{ results: AdultProduct[]; count: number }> {
    const { site_group } = getSiteMetadata(); 
    const queryParams = new URLSearchParams({ 
        site_group: site_group || 'adult', 
        ...params 
    });
    
    // 💡 resolveApiUrl を使用
    const url = resolveApiUrl(`/api/adult-products/?${queryParams.toString()}`);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(),
            next: { revalidate: 60 },
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) {
            console.error(`[Django Adult API Error]: Status ${res.status} at ${url}`);
            return { results: [], count: 0 };
        }

        const data = await res.json();
        return { 
            results: data.results || [], 
            count: data.count || 0 
        };
    } catch (e: any) {
        console.error(`[Django getAdultProducts FAILED]: ${e.message} at ${url}`);
        return { results: [], count: 0 };
    }
}

/**
 * 💻 [Django API] 商品詳細取得
 */
export async function fetchProductDetail(unique_id: string): Promise<PCProduct | null> {
    // 💡 resolveApiUrl を使用
    const url = resolveApiUrl(`/api/pc-products/${unique_id}//`);
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(),
            cache: 'no-store'
        });
        
        if (!res.ok) return null;
        return await res.json();
    } catch (e: any) { 
        console.error(`[Django fetchProductDetail FAILED]: ${e.message} id: ${unique_id}`);
        return null; 
    }
}