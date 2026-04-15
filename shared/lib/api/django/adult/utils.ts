// /home/maya/shin-vps/shared/lib/api/django/adult/utils.ts
// @ts-nocheck
/**
 * =====================================================================
 * 🛠️ Adult API 共通ユーティリティ (Zenith v6.1 - Bulletproof)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【墜落防止】toUpperCase / toLowerCase 呼び出し前の非破壊的ガード。
 * 2. 【クエリ汚染防止】"null" や "undefined" という文字列がクエリに乗るのを阻止。
 * 3. 【型安全】params がどのような型で渡されても、必ず Record<string, string> を返却。
 * =====================================================================
 */

/** * 🔄 クエリパラメータ正規化
 */
export const normalizeParams = (params: any): Record<string, string> => {
  // 1. 文字列単体で渡された場合のガード
  if (typeof params === 'string' && params) {
    return { api_source: params.toUpperCase() };
  }
  
  const clean: Record<string, string> = {};
  
  // 2. null, undefined, 配列, オブジェクト以外を弾く
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    return clean;
  }

  Object.keys(params).forEach(key => {
    const val = params[key];
    
    // 🛡️ 無効な値 (undefined, null, 文字列の "undefined", "null", 空文字) を徹底除外
    // これをしないと APIに ?site=null と送られてエラーになる
    if (
      val !== undefined && 
      val !== null && 
      val !== 'undefined' && 
      val !== 'null' && 
      val !== ''
    ) {
      let targetKey = key;
      
      // 💡 キーのエイリアス変換
      if (key === 'service') targetKey = 'service_code';
      if (key === 'floor')   targetKey = 'floor_code';
      
      // 🛡️ 安全な文字列変換関数
      const safeVal = String(val).trim();

      if (targetKey === 'api_source') {
        clean[targetKey] = safeVal.toUpperCase();
      } else if (targetKey === 'site') {
        clean[targetKey] = safeVal.toLowerCase();
      } else {
        const lowercaseKeys = ['service_code', 'floor_code', 'related_to_id', 'ordering', 'site_group'];
        if (lowercaseKeys.includes(targetKey)) {
          clean[targetKey] = safeVal.toLowerCase();
        } else {
          clean[targetKey] = safeVal; 
        }
      }
    }
  });

  return clean;
};

/** * 🛡️ 安全なデータ抽出
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
  
  // 3. 代替データキー
  if (data.data && Array.isArray(data.data)) {
    return data.data;
  }
  
  // 4. エラーレスポンスやオブジェクト単体の場合（1件だけの詳細データなど）
  // もしオブジェクト単体が配列として期待されている場所なら、ラップして返す
  if (typeof data === 'object' && Object.keys(data).length > 0 && !data._error) {
    // resultsプロパティがない単体オブジェクトなら、配列に入れて救済するパターン
    return [data];
  }
  
  return [];
};