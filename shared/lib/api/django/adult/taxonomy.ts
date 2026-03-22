/**
 * =====================================================================
 * 🏷️ アダルト・タクソノミー取得層 (Taxonomy & Master Data)
 * 🛡️ Maya's Zenith v5.8: 旧 master.ts 完全統合・拡張配列仕様
 * =====================================================================
 */
import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';
import { normalizeParams, safeExtract } from './utils';

/**
 * 💡 統合エンティティフェッチャー
 * 旧 master.ts の「拡張配列」ロジックを継承し、型安全と互換性を両立します。
 */
export async function fetchAdultTaxonomyIndex(type: string, floorCodeOrParams?: string | any) {
    try {
        // 1. パラメータの正規化
        const rawParams = typeof floorCodeOrParams === 'object' 
            ? floorCodeOrParams 
            : { floor_code: floorCodeOrParams };
            
        // 🚀 Maya's Logic: デフォルトの並び順（投稿数順）を適用しつつ正規化
        const cleanParams = normalizeParams({ 
            ordering: '-product_count',
            type, 
            ...rawParams 
        });
        const query = new URLSearchParams(cleanParams).toString();
        
        // 2. パス解決（二重スラッシュ/二重APIパスを client.ts 側と同期して防止）
        const url = resolveApiUrl(`adult/taxonomy/?${query}`);
        
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            cache: 'no-store' // 🔄 復旧優先：常に最新のマスターを取得
        });
        
        const data = await handleResponseWithDebug(res, url);
        
        /**
         * 🔍 拡張配列ロジック (Legacy Compatibility)
         * フロントエンドが「戻り値を配列として扱い、かつ .totalCount を参照する」
         * という挙動に対応するため、配列オブジェクトにプロパティを注入します。
         */
        const list = safeExtract(data);
        const extendedList = [...list] as any;
        
        extendedList.totalCount = data?.count || list.length;
        extendedList._debug = data?._debug || { url };

        return extendedList;
    } catch (error: any) {
        console.error(`🚨 [Taxonomy Fetch Error] ${type}:`, error.message);
        const empty: any[] = [];
        (empty as any).totalCount = 0;
        (empty as any)._debug = { error: error.message };
        return empty;
    }
}

/**
 * ==========================================
 * 🚀 公開 API 関数群 (全エンティティ網羅)
 * ==========================================
 */

export const fetchGenres    = (p?: any) => fetchAdultTaxonomyIndex('genres', p);
export const fetchMakers    = (p?: any) => fetchAdultTaxonomyIndex('makers', p);
export const fetchActresses = (p?: any) => fetchAdultTaxonomyIndex('actresses', p);
export const fetchSeries    = (p?: any) => fetchAdultTaxonomyIndex('series', p);
export const fetchLabels    = (p?: any) => fetchAdultTaxonomyIndex('labels', p);
export const fetchDirectors = (p?: any) => fetchAdultTaxonomyIndex('directors', p);
export const fetchAuthors   = (p?: any) => fetchAdultTaxonomyIndex('authors', p);

/**
 * 💡 開発者へのメモ:
 * この戻り値は Array ですが、totalCount プロパティを持っています。
 * 例: const genres = await fetchGenres();
 * console.log(genres.length);     // 表示件数
 * console.log(genres.totalCount); // DB上の総件数
 */