import { getDjangoBaseUrl, IS_SERVER } from '../config';

/**
 * 💡 接続先URLを解決
 */
export const resolveApiUrl = (endpoint: string) => {
    if (IS_SERVER) {
        return `http://django-v2:8000${endpoint}`;
    }
    const rootUrl = getDjangoBaseUrl(); 
    const base = rootUrl.endsWith('/') ? rootUrl.slice(0, -1) : rootUrl;
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
            const hostName = new URL(rootUrl).hostname;
            headers['Host'] = hostName;
        } catch (e) {
            // ignore
        }
    }
    return headers;
};

/**
 * 💡 究極のデバッグハンドラ
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
        bodySnippet: rawText.slice(0, 800),
        timestamp: new Date().toLocaleTimeString(),
        serverSide: IS_SERVER
    };

    if (!res.ok || isHtml) {
        console.error(`[DJANGO API ERROR LOG] 🚨`, JSON.stringify(debugInfo, null, 2));
        return { 
            results: [], 
            count: 0, 
            _error: true, 
            _debug: debugInfo,
            isHtml: isHtml
        };
    }

    try {
        const json = JSON.parse(rawText);
        return { ...json, _debug: debugInfo };
    } catch (e) {
        console.error(`[JSON PARSE ERROR] 🚨 URL: ${url}`);
        return { results: [], count: 0, _error: true, _debug: debugInfo };
    }
}