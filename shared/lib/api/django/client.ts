import { getDjangoBaseUrl, IS_SERVER } from '../config';

/**
 * 💡 接続先URLを解決
 * サーバーサイド(Docker内)とクライアントサイド(ブラウザ)で
 * 適切なDjangoのベースURLを返します。
 */
export const resolveApiUrl = (endpoint: string) => {
    // サーバーサイドなら内部ネットワーク名、クライアントならブラウザから見えるURL
    const rootUrl = getDjangoBaseUrl(); 
    const base = rootUrl.endsWith('/') ? rootUrl.slice(0, -1) : rootUrl;

    // 💡 もし内部通信(django-v2)が動かない場合は、ここを直接 
    // "http://localhost:8000" 等に書き換えると疎通が確認できます。
    if (IS_SERVER) {
        return `http://django-v2:8000${endpoint}`;
    }

    return `${base}${endpoint}`;
};

/**
 * 💡 Django リクエスト用ヘッダー
 */
export const getDjangoHeaders = () => {
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };
};

/**
 * 💡 シンプルなレスポンスハンドラ
 * 余計なラップをせず、JSONパースに徹します。
 */
export async function handleResponseWithDebug(res: Response, url: string) {
    if (!res.ok) {
        console.error(`[API ERROR] ${res.status} ${res.statusText} - URL: ${url}`);
        // 404や500の時にHTMLが返ってきても落ちないようにテキストとして一度受ける
        return { results: [], count: 0 };
    }

    try {
        const data = await res.json();
        
        // Django APIが直接リストを返す場合と、{results: []} を返す場合の両方に対応
        if (Array.isArray(data)) {
            return { results: data, count: data.length };
        }
        
        return data;
    } catch (e) {
        console.error(`[PARSE ERROR] Failed to parse JSON from ${url}`);
        return { results: [], count: 0 };
    }
}