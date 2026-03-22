/**
 * 🛠️ Adult API 共通ユーティリティ
 * 🛡️ Maya's Zenith v5.3 (Refactored)
 */

/** 🔄 クエリパラメータ正規化 (?0=D&1=U バグ防止 & 属性変換) */
export const normalizeParams = (params: any) => {
  if (typeof params === 'string') {
    return { api_source: params.toUpperCase() };
  }
  
  const clean: Record<string, string> = {};
  if (!params || typeof params !== 'object') return clean;

  Object.keys(params).forEach(key => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== 'undefined') {
      let targetKey = key;
      if (key === 'service') targetKey = 'service_code';
      if (key === 'floor') targetKey = 'floor_code';
      
      if (targetKey === 'api_source') {
        clean[targetKey] = String(val).toUpperCase();
      } else {
        const lowercaseKeys = ['service_code', 'floor_code', 'related_to_id'];
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

/** 🛡️ 安全なデータ抽出：あらゆるレスポンス形式を配列へ変換 */
export const safeExtract = (data: any): any[] => {
  if (!data) return [];
  if (data.results && Array.isArray(data.results)) return data.results;
  if (Array.isArray(data)) return data;
  if (data.data && Array.isArray(data.data)) return data.data;
  return [];
};