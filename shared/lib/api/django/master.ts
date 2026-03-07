/**
 * =====================================================================
 * 🏷️ エンティティ/タクソノミー取得層 (shared/lib/api/django/entities.ts)
 * =====================================================================
 * 【責務】
 * 1. ジャンル、女優、メーカー等のマスターデータを一括管理
 * 2. 重複するフェッチロジックを fetchEntities に集約
 * 3. 常に「配列」を返しつつ、メタデータ（件数やデバッグ情報）も保持
 * =====================================================================
 */
// shared/lib/api/django/master.ts

import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from './client';

/**
 * 💡 汎用エンティティフェッチャー
 * @param path エンドポイントパス (例: '/api/genres/')
 * @param params 検索・ソート用クエリパラメータ
 */
async function fetchEntities(path: string, params: any = {}): Promise<any[]> {
    // 1. デフォルトの並び順（投稿数が多い順）とパラメータを統合
    const queryParams = new URLSearchParams({ 
        ordering: '-product_count', 
        ...params 
    });
    
    const url = resolveApiUrl(`${path}?${queryParams.toString()}`);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 3600 } // 1時間のキャッシュ (マスターデータ用)
        });

        // 2. client.ts のハンドラで安全にパース
        // handleResponseWithDebug は { results: [], count: 0 } を返します
        const data = await handleResponseWithDebug(res, url);

        /**
         * 🔍 Maya's Logic: 配列としての使いやすさとメタデータの共存
         * 基本は results 配列を返しますが、プロパティとして count と _debug を付与します。
         */
        const list = Array.isArray(data.results) ? data.results : [];
        
        // 特殊プロパティを注入 (JSの配列はオブジェクトなのでプロパティを持てます)
        const extendedList = [...list] as any;
        extendedList.totalCount = data.count || list.length;
        extendedList._debug = data._debug || { url };

        return extendedList;

    } catch (e: any) {
        console.error(`🚨 [Entities Fetch Error] ${path}:`, e.message);
        const empty: any[] = [];
        (empty as any).totalCount = 0;
        (empty as any)._debug = { error: e.message, url };
        return empty;
    }
}

/**
 * =====================================================================
 * 🚀 公開 API 関数群
 * =====================================================================
 */

// 各カテゴリごとのショートカット
export const fetchGenres    = (params?: any) => fetchEntities('/api/genres/', params);
export const fetchActresses = (params?: any) => fetchEntities('/api/actresses/', params);
export const fetchMakers    = (params?: any) => fetchEntities('/api/makers/', params);
export const fetchSeries    = (params?: any) => fetchEntities('/api/series/', params);
export const fetchLabels    = (params?: any) => fetchEntities('/api/labels/', params);
export const fetchDirectors = (params?: any) => fetchEntities('/api/directors/', params);
export const fetchAuthors   = (params?: any) => fetchEntities('/api/authors/', params);