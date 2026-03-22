import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';
import { normalizeParams, safeExtract } from './utils';
import { AdultProduct } from '../../types';

/** 📦 統合製品リスト取得 (属性緩和版) */
export async function getUnifiedProducts(params: any = {}) {
  const cleanParams = normalizeParams(params);
  const queryString = new URLSearchParams(cleanParams).toString();
  
  // ✅ 修正: 末尾スラッシュを固定して404回避
  const targetUrl = resolveApiUrl(`adult/unified-products/?${queryString}`);

  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(),
      cache: 'no-store', // 🔄 復旧優先：キャッシュをバイパスして最新DBを直視
    });

    const data = await handleResponseWithDebug(res, targetUrl);
    
    return { 
      results: safeExtract(data), 
      count: data?.count || 0
    };
  } catch (error) { 
    console.error("[Adult-Products] FETCH_FAILED:", error);
    return { results: [], count: 0 }; 
  }
}

/** 🎯 製品詳細取得 */
export async function getAdultProductDetail(id: string | number): Promise<AdultProduct | null> {
  if (!id || id === 'main') return null;
  
  const targetUrl = resolveApiUrl(`adult/products/${id}/`);
  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(), 
      cache: 'no-store' 
    });
    
    const data = await handleResponseWithDebug(res, targetUrl);
    const product = data.results ? data.results[0] : data;
    
    if (!product || product.detail === "Not found." || data?._error) return null;
    return product as AdultProduct;
  } catch (error) {
    console.error(`[Adult-Detail] FETCH_FAILED [${id}]:`, error);
    return null; 
  }
}