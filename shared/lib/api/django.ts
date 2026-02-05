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
 * 💡 Django リクエスト用ヘッダーの生成
 */
const getDjangoHeaders = () => {
    const headers: Record<string, string> = {
        'Accept': 'application/json',
    };

    /**
     * 💡 サーバーサイド (Server Components) 実行時の Host ヘッダー修正
     * localhost 固定ではなく、.env で設定された API URL からホスト名を抽出して設定します。
     * これにより Traefik がリクエストを正しく Django コンテナへ振り分けられます。
     */
    if (IS_SERVER) {
        try {
            const rootUrl = getDjangoBaseUrl(); // 例: http://api-tiper-host:8083
            const hostName = new URL(rootUrl).hostname; // 'api-tiper-host' を抽出
            headers['Host'] = hostName;
        } catch (e) {
            // URL解析に失敗した場合は、Traefikのデフォルト挙動に任せるため Host を設定しない
            console.warn("[Django API] Failed to parse hostname for Server Side Request.");
        }
    }

    return headers;
};

/**
 * 💻 [Django API] 一般商品一覧取得
 */
export async function fetchPCProducts(params: any = {}): Promise<{ results: PCProduct[]; count: number }> {
    const rootUrl = getDjangoBaseUrl();
    const { site_group } = getSiteMetadata(); 
    
    const queryParams = new URLSearchParams({ 
        site_group: site_group || 'common', 
        ...params 
    });
    
    const url = `${rootUrl}/api/pc-products/?${queryParams.toString()}`;

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
    const rootUrl = getDjangoBaseUrl();
    const { site_group } = getSiteMetadata(); 
    
    const queryParams = new URLSearchParams({ 
        site_group: site_group || 'adult', 
        ...params 
    });
    
    const url = `${rootUrl}/api/adult-products/?${queryParams.toString()}`;

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
    const rootUrl = getDjangoBaseUrl();
    const url = `${rootUrl}/api/pc-products/${unique_id}/`;
    
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