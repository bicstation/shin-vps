/**
 * =====================================================================
 * 🏷️ マスターデータ取得層 (shared/lib/api/django/master.ts)
 * 🛡️ Maya's Logic: v5.7.5 二重パス排除・型安全・完全版
 * =====================================================================
 * 【責務】
 * 1. ジャンル、女優、メーカー等のマスターデータを一括管理
 * 2. 二重パス (/api/api/...) を防止する正規化ロジックを搭載
 * 3. 常に「配列」を返しつつ、総数 (totalCount) も保持
 * =====================================================================
 */

import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from './client';
import { MasterBase } from '../types';

/**
 * 💡 汎用エンティティフェッチャー
 * @param endpoint エンドポイント名 (例: 'genres') ※ /api/ は不要
 * @param params 検索・ソート用クエリパラメータ
 */
async function fetchEntities<T = MasterBase>(endpoint: string, params: any = {}): Promise<T[]> {
    // 1. デフォルトの並び順（投稿数が多い順）とパラメータを統合
    const queryParams = new URLSearchParams({ 
        ordering: '-product_count', 
        ...params 
    });
    
    // ✅ 修正: 渡されたパスから '/api/' や先頭スラッシュを徹底除去
    // これにより resolveApiUrl との重複を防ぎます
    const cleanPath = endpoint.replace(/^\/?api\//, '').replace(/^\//, '');
    const url = resolveApiUrl(`${cleanPath}?${queryParams.toString()}`);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 3600 } // 1時間のキャッシュ
        });

        // 2. client.ts のハンドラで安全にパース
        const data = await handleResponseWithDebug(res, url);

        /**
         * 🔍 Maya's Logic: 配列としての使いやすさとメタデータの共存
         */
        const list = Array.isArray(data.results) ? data.results : [];
        
        // 特殊プロパティを注入 (型安全のため any キャストを使用)
        const extendedList = [...list] as any;
        extendedList.totalCount = data.count || list.length;
        extendedList._debug = data._debug || { url };

        return extendedList as T[];

    } catch (e: any) {
        console.error(`🚨 [Entities Fetch Error] ${endpoint}:`, e.message);
        const empty: any[] = [];
        (empty as any).totalCount = 0;
        (empty as any)._debug = { error: e.message, url: 'resolve error' };
        return empty as T[];
    }
}

/**
 * =====================================================================
 * 🚀 公開 API 関数群
 * 💡 endpoint 指定から '/api/' を排除し、client.ts と同期させました
 * =====================================================================
 */

export const fetchGenres    = (params?: any) => fetchEntities('genres', params);
export const fetchActresses = (params?: any) => fetchEntities('actresses', params);
export const fetchMakers    = (params?: any) => fetchEntities('makers', params);
export const fetchSeries    = (params?: any) => fetchEntities('series', params);
export const fetchLabels    = (params?: any) => fetchEntities('labels', params);
export const fetchDirectors = (params?: any) => fetchEntities('directors', params);
export const fetchAuthors   = (params?: any) => fetchEntities('authors', params);

/**
 * 💡 補足:
 * JSの配列にプロパティを付ける手法は、map()等を使うと消失するため、
 * 確実に totalCount を維持したい場合は戻り値を { results, count } に変えるべきですが、
 * 既存のフロントエンドの互換性を優先し「拡張配列」形式を維持しています。
 */