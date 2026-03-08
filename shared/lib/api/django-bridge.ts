/**
 * =====================================================================
 * 🌉 Django-Bridge サービス層 (Maya's Logic v5.0 - Unified)
 * =====================================================================
 * 物理パス: /shared/lib/api/django-bridge.ts
 * * 【責務】
 * 1. 各サイト（BicStation, Tiper等）のデータ取得を統合管理
 * 2. 内部コンテナ通信と外部公開URLの変換（replaceInternalUrls）
 * 3. WordPress依存を排し、将来のマークダウン(MD)記事実装へのブリッジとなる
 * =====================================================================
 */

import { getWpConfig, IS_SERVER, getDjangoBaseUrl } from './config';
// 型定義
import { PCProduct, MakerCount } from './index'; 

/**
 * 🔄 【変換】ドメイン・一括置換ユーティリティ
 * APIから返却される内部ドメイン（django-v3等）を公開ドメインに置換します。
 */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    
    const isObject = typeof data === 'object';
    let content = isObject ? JSON.stringify(data) : data;

    // configからベースとなるホストを取得
    const cleanBaseUrl = getDjangoBaseUrl().replace(/\/api$/, '').replace(/\/$/, '');

    // 内部・開発ドメインのパターン
    const internalPattern = /http:\/\/(django-v3|nginx-wp-v[23]|wordpress-.+v[23]|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
    
    content = content.replace(internalPattern, cleanBaseUrl);
    // 重複スラッシュ (//) をプロトコル以外で修正
    content = content.replace(/([^:])\/\//g, '$1/'); 

    return isObject ? JSON.parse(content) : content;
};

/**
 * 💡 【解決】内部URL解決ロジック
 * 二重 "/api" を徹底的に防ぎ、SSR/Client環境に合わせた最適なURLを生成します。
 */
const resolveApiUrl = (endpoint: string) => {
    // endpointから "/api/" の重複を除去
    const cleanEndpoint = endpoint.replace(/^\/?api\//, '').replace(/^\//, '');
    
    // ベースURLの選定
    const base = getDjangoBaseUrl().replace(/\/$/, '');
    
    // Django(DRF)の仕様に合わせ、末尾にスラッシュを付与（クエリパラメータがない場合）
    const suffix = (cleanEndpoint.includes('?') || cleanEndpoint.endsWith('/')) ? '' : '/';

    return `${base}/api/${cleanEndpoint}${suffix}`;
};

/**
 * 🛠️ 【通信】共通 Fetch ラッパー
 * タイムアウト制御とエラーハンドリングを統合。
 */
async function fetchFromBridge(url: string, options: any = {}) {
    const { host } = getWpConfig();
    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                'Host': host,
                'Accept': 'application/json',
                ...(options.headers || {}),
            },
            // ネットワーク遅延によるハングを防ぐ
            signal: AbortSignal.timeout(options.timeout || 8000)
        });

        if (!res.ok) {
            console.warn(`⚠️ [Bridge Status Error]: ${res.status} | URL: ${url}`);
            return { data: null, total: 0, status: res.status };
        }
        
        const data = await res.json();
        // WP互換ヘッダーまたは標準ヘッダーから件数を抽出
        const total = parseInt(res.headers.get('X-WP-Total') || res.headers.get('X-Total-Count') || '0', 10);
        
        return { data: replaceInternalUrls(data), total, status: res.status };
    } catch (e: any) {
        console.error(`🚨 [Bridge Fatal Error]: ${url} | ${e.message}`);
        return { data: null, total: 0, error: e.message };
    }
}

// --- 📝 統合コンテンツ取得 (page.tsx 呼び出し用) ---

/**
 * サイトグループに基づき、適切なコンテンツ取得関数へルーティングします。
 */
export async function fetchDjangoBridgeContent(params: any = {}) {
    const siteGroup = params.site_group || '';
    
    if (siteGroup === 'bicstation') {
        return await fetchPCProducts(params);
    } else if (siteGroup === 'tiper' || siteGroup === 'avflash') {
        return await getAdultProducts(params);
    }
    
    // 記事データ（将来のマークダウン用）
    return await fetchPostList('post', params.limit, params.offset);
}

// --- 📝 記事コンテンツ機能 (Markdown 移行準備) ---

/**
 * 【重要】現在は空配列を返します。
 * 準備ができ次第、ここを local file system (fs) の読み込みに差し替えることでMD化が完了します。
 */
export async function fetchPostList(postType: string = 'post', limit = 12, offset = 0) {
    // 以前の WP への fetch ロジックは Django 404 回避のため封印
    return { results: [], count: 0 };
}

export async function fetchPostData(postType: string = 'post', identifier: string) {
    // 個別記事もMD化まで null を返却
    return null;
}

// --- 🔞 アダルトコンテンツ機能 (AVFLASH, TIPER) ---

export async function getAdultProducts(params: any = {}) {
    const safeParams = params || {};
    const query = new URLSearchParams({
        limit: (safeParams.limit || 20).toString(),
        offset: (safeParams.offset || 0).toString(),
        ordering: safeParams.ordering || '-id',
        ...(safeParams.site_group && { site_group: safeParams.site_group })
    });
    
    const url = resolveApiUrl(`adult-products/?${query.toString()}`);
    const { data, total } = await fetchFromBridge(url, { next: { revalidate: 60 } });
    return { results: data?.results || [], count: data?.count || total };
}

// --- 💻 PC製品・ランキング機能 (BicStation) ---

/**
 * PC製品データを取得。
 * resolveApiUrl により "/api/general/pc-products/" へ正しく接続されます。
 */
export async function fetchPCProducts(params: any = {}) {
    const safeParams = params || {};
    const query = new URLSearchParams({
        limit: (safeParams.limit || 10).toString(),
        offset: (safeParams.offset || 0).toString(),
        ...(safeParams.maker && { maker: safeParams.maker }),
        ...(safeParams.site_group && { site_group: safeParams.site_group }),
        ...(safeParams.attribute && { attribute: safeParams.attribute })
    });
    
    const url = resolveApiUrl(`general/pc-products/?${query.toString()}`);
    const { data } = await fetchFromBridge(url);
    
    return { 
        results: data?.results || [], 
        count: data?.count || 0 
    };
}

/**
 * 互換性のためのエイリアス
 */
export { fetchPostList as getSiteMainPosts };
export { getAdultProducts as getUnifiedProducts };