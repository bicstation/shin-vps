/**
 * =====================================================================
 * 🛠️ Django API 共通クライアント (Zenith v7.0 - Infrastructure Aligned)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. Docker Compose の api-xxx-host 命名規則に完全準拠
 * 2. NEXT_PUBLIC_API_URL を優先しつつ、未定義時の自動解決ロジックを搭載
 * 3. サーバー/クライアント間のホスト名解決のねじれを解消
 * =====================================================================
 */
import { getDjangoBaseUrl, IS_SERVER } from '../config';

/**
 * 💡 接続先URLを動的に解決 (Network Path Resolver)
 */
export const resolveApiUrl = (endpoint: string) => {
    // 1. エンドポイントの正規化
    const cleanEndpoint = endpoint
        .replace(/^api\//, '')
        .replace(/^\/+/, '')
        .replace(/\/+$/, '');

    let baseUrl: string;

    if (IS_SERVER) {
        /**
         * 🚀 Server Side (SSR / Docker Internal)
         * docker-compose で定義された内部 URL を解決します。
         */
        // 1. まずは環境変数 INTERNAL_API_URL を最優先
        if (process.env.INTERNAL_API_URL) {
            baseUrl = process.env.INTERNAL_API_URL;
        } else {
            // 2. PROJECT_NAME (e.g. next-bicstation) から内部サービスプレフィックスを抽出
            const rawProject = process.env.PROJECT_NAME || 'bicstation';
            const shortName = rawProject.replace('next-', ''); // "next-bicstation" -> "bicstation"
            
            // 3. ローカルPCのTraefikを通る内部ホスト名を動的に組み立て (8083ポート経由)
            // baseUrl = `http://api-${shortName}-host:8083`;
            baseUrl = `http://django-v3:8000`;
        }
    } else {
        /**
         * 🌐 Client Side (Browser)
         * ブラウザからはビルド時に注入された公開URL、または現在のドメインを使用
         */
        baseUrl = process.env.NEXT_PUBLIC_API_URL || getDjangoBaseUrl();
        
        // フォールバック: もし上記が空なら、現在のブラウザURLから自動生成
        if (!baseUrl && typeof window !== 'undefined') {
            baseUrl = `${window.location.protocol}//${window.location.host}`;
        }
    }

    // 2. "/api" の二重付与を防止するクリーニング
    // baseUrl が "http://.../api" で終わっている場合は "/api" を削ってから再結合
    const rootUrl = baseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

    // 3. 結合: [Base] + [/api/] + [Endpoint] + [/]
    // Django の APPEND_SLASH=True に対応するため末尾スラッシュは必須
    return `${rootUrl}/api/${cleanEndpoint}/`;
};

/**
 * 💡 Django リクエスト用ヘッダー生成
 */
export const getDjangoHeaders = () => {
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // クライアント側でHostヘッダーを偽装するとCORSに触れるため、
        // サーバーサイド(SSR)時のみ必要な場合に Host ヘッダーを調整するロジックを検討
    };
};

/**
 * 💡 フェッチレスポンス・セーフハンドラ
 * どんな形式のレスポンスも { results: [], count: 0 } に標準化します。
 */
export async function handleResponseWithDebug(res: Response, url: string) {
    if (!res.ok) {
        // サーバーコンソールにエラーを詳細出力
        console.error(`🚨 [Django API Error] ${res.status} ${res.statusText} | URL: ${url}`);
        return { results: [], count: 0, _error: res.status };
    }

    try {
        const data = await res.json();
        
        // ケース1: DRF 標準形式 (Pagination)
        if (data && typeof data === 'object' && 'results' in data) {
            return {
                results: Array.isArray(data.results) ? data.results : [],
                count: typeof data.count === 'number' ? data.count : 0
            };
        }
        
        // ケース2: 配列直返し
        if (Array.isArray(data)) {
            return { results: data, count: data.length };
        }
        
        // ケース3: 単体オブジェクト (Detail)
        if (data && typeof data === 'object') {
            const payload = data.data || data;
            return { 
                results: Array.isArray(payload) ? payload : [payload], 
                count: Array.isArray(payload) ? payload.length : 1 
            };
        }

        return { results: [], count: 0 };

    } catch (e) {
        console.error(`🚨 [JSON Parse Error] URL: ${url}`);
        return { results: [], count: 0, _error: 'PARSE_FAILED' };
    }
}