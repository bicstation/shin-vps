// @ts-nocheck
/**
 * =====================================================================
 * 🛠️ Adult API 共通ユーティリティ (Zenith v6.0 - Global Pipeline)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【型ガードの強化】文字列が渡された際の api_source 変換をより堅牢に。
 * 2. 【正規化マップの拡充】site パラメータの保護と、共通キーの自動変換を最適化。
 * 3. 【抽出ロジックの完成】Django の paginated response とオブジェクト直列化の両方に対応。
 * =====================================================================
 */

/** * 🔄 クエリパラメータ正規化
 * フロントエンドからの曖昧な入力を、Django API が解釈可能な形式に変換します。
 * (例: service → service_code への変換、大文字小文字の統一など)
 */
export const normalizeParams = (params: any): Record<string, string> => {
  // 1. 文字列単体で渡された場合は api_source (DMM/FANZA等) として扱う
  if (typeof params === 'string') {
    return { api_source: params.toUpperCase() };
  }
  
  const clean: Record<string, string> = {};
  if (!params || typeof params !== 'object' || Array.isArray(params)) return clean;

  Object.keys(params).forEach(key => {
    const val = params[key];
    
    // 無効な値 (undefined, null, 文字列の "undefined") を除外
    if (val !== undefined && val !== null && val !== 'undefined' && val !== '') {
      let targetKey = key;
      
      /**
       * 💡 キーのエイリアス変換
       * フロントエンドでの呼びやすさと API の厳密なキー名を橋渡しします。
       */
      if (key === 'service') targetKey = 'service_code';
      if (key === 'floor')   targetKey = 'floor_code';
      
      if (targetKey === 'api_source') {
        // 供給元 (DMM, FANZA, MGS, DUO) は常に大文字
        clean[targetKey] = String(val).toUpperCase();
      } else if (targetKey === 'site') {
        // 識別子 (avflash, tiper) は常に小文字
        clean[targetKey] = String(val).toLowerCase();
      } else {
        // 特定のキーは小文字に強制、それ以外は文字列化して保持
        const lowercaseKeys = ['service_code', 'floor_code', 'related_to_id', 'ordering'];
        if (lowercaseKeys.includes(targetKey)) {
          clean[targetKey] = String(val).toLowerCase();
        } else {
          clean[targetKey] = String(val); 
        }
      }
    }
  });

  return clean;
};

/** * 🛡️ 安全なデータ抽出
 * レスポンスが「ページネーション形式(results)」か「単純な配列」かを問わず、
 * 常にクリーンな配列を返却します。
 */
export const safeExtract = (data: any): any[] => {
  if (!data) return [];
  
  // 1. Django REST Framework 標準の pagination 形式
  if (data.results && Array.isArray(data.results)) {
    return data.results;
  }
  
  // 2. 配列直列化形式
  if (Array.isArray(data)) {
    return data;
  }
  
  // 3. 代替データキー (data プロパティ)
  if (data.data && Array.isArray(data.data)) {
    return data.data;
  }
  
  // 4. エラーレスポンスやオブジェクト単体の場合
  return [];
};

/**
 * 💡 開発者へのメモ:
 * このユーティリティは、products.ts, taxonomy.ts, navigation.ts のすべてで使用されます。
 * パラメータの仕様変更を行う際は、ここを起点に調整してください。
 */