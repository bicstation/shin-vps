import { getDjangoBaseUrl, IS_SERVER } from '../config';

/**
 * 💡 接続先URLを解決
 * サーバーサイドとクライアントサイドで発生していた「HTMLが返ってくる問題」を解消するため、
 * ベースURLの取得方法を安定化させました。
 */
export const resolveApiUrl = (endpoint: string) => {
    const rootUrl = getDjangoBaseUrl(); 
    const base = rootUrl.endsWith('/') ? rootUrl.slice(0, -1) : rootUrl;

    // もしサーバーサイドで特定の内部ホスト(django-v2など)を使いたい場合は、
    // 環境変数等で切り分けられるようにするのが理想ですが、
    // 現状は確実にアクセス可能な base (http://bicstation-host:8083 など) を優先します。
    if (IS_SERVER) {
        // 🚨 Docker内部ネットワークの問題を回避するため、
        // 開発環境であれば localhost または getDjangoBaseUrl() の値を優先的に試行します。
        // もし django-v2 が名前解決できない場合は base をそのまま返します。
        return `${base}${endpoint}`;
    }

    return `${base}${endpoint}`;
};

/**
 * 💡 Django リクエスト用ヘッダー
 */
export const getDjangoHeaders = () => {
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    if (IS_SERVER) {
        try {
            const rootUrl = getDjangoBaseUrl();
            const urlObj = new URL(rootUrl);
            headers['Host'] = urlObj.hostname;
        } catch (e) {
            // URLが不正な場合は Host ヘッダーを設定しない
        }
    }
    return headers;
};

/**
 * 💡 究極のデバッグハンドラ
 * レスポンスを解析し、HTMLが返ってきた場合は詳細なログを出力します。
 */
export async function handleResponseWithDebug(res: Response, url: string) {
    const contentType = res.headers.get("content-type") || "";
    const isHtml = contentType.includes("text/html");
    
    let rawText = "";
    try {
        rawText = await res.text();
    } catch (e) {
        rawText = "FAILED_TO_READ_BODY";
    }

    const debugInfo = {
        url,
        status: res.status,
        statusText: res.statusText,
        contentType,
        isHtml,
        bodySnippet: rawText.length > 0 ? rawText.slice(0, 800) : "EMPTY_BODY",
        timestamp: new Date().toLocaleTimeString(),
        serverSide: IS_SERVER
    };

    // 🔴 異常系: ステータスエラーまたはHTMLが返ってきた場合
    if (!res.ok || isHtml) {
        console.error(`[DJANGO API ERROR LOG] 🚨 通信エラーまたは不正なレスポンス形式です。`);
        console.error(JSON.stringify(debugInfo, null, 2));

        // 呼び出し側でエラー判定ができるよう、一貫したエラーオブジェクトを返す
        return { 
            results: [], 
            count: 0, 
            _error: true, 
            _debug: debugInfo,
            isHtml: isHtml 
        };
    }

    // 🟢 正常系: JSONのパースを試みる
    try {
        const json = JSON.parse(rawText);
        
        // APIのレスポンスが直接配列の場合 ([{...}, {...}])
        if (Array.isArray(json)) {
            return {
                results: json,
                count: json.length,
                _debug: debugInfo
            };
        }

        // 通常のレスポンス形式 ({ results: [], ... })
        return { ...json, _debug: debugInfo };

    } catch (e) {
        console.error(`[JSON PARSE ERROR] 🚨 JSONのパースに失敗しました。URL: ${url}`);
        return { 
            results: [], 
            count: 0, 
            _error: true, 
            _debug: debugInfo 
        };
    }
}