// /home/maya/shin-vps/shared/lib/api/django/adult/products.ts
// @ts-nocheck
/**
 * =====================================================================
 * 🔞 アダルト製品取得サービス (Zenith v12.1 - Hardened Sync)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【プロパティ・ガード】results 内の各 product に対して toString() ガードを適用。
 * 2. 【ID安全抽出】IDが数値や文字列が混在しても落ちないように正規化。
 * 3. 【置換ロジック統合】replaceInternalUrls を適用し、画像やリンクを公開ドメインへ。
 * =====================================================================
 */

import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';
import { replaceInternalUrls } from '../../django-bridge'; // 💡 django-bridge 側の最新置換ロジックを使用
import { normalizeParams, safeExtract } from './utils';
import { AdultProduct } from '../../types';

/**
 * 📦 統合製品リスト取得 (Unified API 経由)
 */
export async function getUnifiedProducts(params: any = {}, host: string = '') {
  // 1. パラメータの正規化
  const cleanParams = normalizeParams(params || {});
  const siteTag = cleanParams.site || 'avflash';

  const queryString = new URLSearchParams(cleanParams).toString();
  const targetUrl = resolveApiUrl(`adult/unified-products/?${queryString}`, siteTag);

  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(siteTag),
      cache: 'no-store',
    });

    const data = await handleResponseWithDebug(res, targetUrl);
    
    // 🛡️ [ガード] データが取れなかった場合
    if (!data) return { results: [], count: 0 };

    // 2. 画像URL・内部ドメインの洗浄
    const cleanedData = replaceInternalUrls(data);
    
    // 3. データの抽出と「中身」の毒抜き
    const rawResults = safeExtract(cleanedData);
    
    const hardenedResults = (Array.isArray(rawResults) ? rawResults : []).map((item: any) => {
      // 🛡️ [重要] プロパティごとの null ガード
      // ここで toString().toLowerCase() 等が後続（コンポーネント側）で呼ばれても死なないようにする

      return {
        ...item,

        // Frontend公開ID
        id: (
          item.product_id_unique ||
          item.id ||
          item.product_id ||
          ""
        ).toString(),

        // Backend契約保持
        product_id_unique: (
          item.product_id_unique ||
          ""
        ).toString(),

        brand: (item.brand || "FANZA").toString(),
        site_tag: (item.site_tag || siteTag).toString(),
        title: item.title || "No Title",

        image:
          item.image_url ||
          item.main_image ||
          "/images/common/no-image.jpg"
      };
      // return {
      //   ...item,
      //   id: (item.id || item.product_id || "").toString(),
      //   brand: (item.brand || "FANZA").toString(), // 大文字小文字化はコンポーネントに任せるか、ここでする
      //   site_tag: (item.site_tag || siteTag).toString(),
      //   title: item.title || "No Title",
      //   // 画像URLが空の場合のフォールバック
      //   image: item.image_url || item.main_image || "/images/common/no-image.jpg"
      // };
    });
    
    return { 
      results: hardenedResults as AdultProduct[], 
      count: cleanedData?.count || hardenedResults.length
    };
  } catch (error) { 
    console.error(`🚨 [Adult-Products] FETCH_FAILED: ${targetUrl}`, error);
    return { results: [], count: 0 }; 
  }
}

/**
 * 🎯 製品詳細取得
 */
export async function getAdultProductDetail(
  productIdUnique: string,
  siteTag: string = 'avflash'
): Promise<AdultProduct | null> {
  // 🛡️ id が undefined や 'main' (ルーティングミス) の場合は即終了

  if (
    !productIdUnique ||
    productIdUnique === 'main' ||
    productIdUnique === 'undefined'
  ) {
    return null;
  }
  
  // const targetUrl = resolveApiUrl(`adult/products/${id}/?site=${siteTag}`, siteTag);
  const targetUrl =
  resolveApiUrl(
    `adult/products/${productIdUnique}/?site=${siteTag}`,
    siteTag
  );
  
  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(siteTag), 
      cache: 'no-store' 
    });
    
    const data = await handleResponseWithDebug(res, targetUrl);
    if (!data) return null;

    const cleanedData = replaceInternalUrls(data);

    // 詳細データは results[0] か、オブジェクト単体か、柔軟に判定
    let product = (cleanedData.results && Array.isArray(cleanedData.results)) 
      ? cleanedData.results[0] 
      : (cleanedData.id || cleanedData.product_id ? cleanedData : null);
    
    // 🛡️ エラーレスポンスのガード
    if (!product || product.detail === "Not found." || cleanedData?._error) {
      return null;
    }

    return {
      ...product,

      id: (
        product.product_id_unique ||
        productIdUnique
      ).toString(),

      product_id_unique: (
        product.product_id_unique ||
        productIdUnique
      ).toString(),

      brand: (product.brand || "FANZA").toString(),

      title: product.title || "No Title"
    };

  } catch (error) {
    console.error(`🚨 [Adult-Detail] FETCH_FAILED [${productIdUnique}]:`, error);
    return null; 
  }
}

/** 🚀 エイリアス設定 */
export const fetchAdultProducts = getUnifiedProducts;
export const fetchAdultProductDetail = getAdultProductDetail;

/**
 * =====================================================================
 * 🎯 Adapter Layer (SHIN CORE LINX 2026)
 * =====================================================================
 */

export interface ProductCardVM {
  id: string;
  title: string;
  image: string;
  maker?: string;
  releaseDate?: string;
}

export interface ProductDetailVM {
  title: string;
  description?: string;

  actresses: string[];
  genres: string[];

  series?: string;
  maker?: string;
  label?: string;
}

/**
 * 📦 Product Card ViewModel
 */
export function toAdultProductCard(
  product: AdultProduct
): ProductCardVM {
  return {
    id:
      product.product_id_unique ||
      String(product.id || ''),

    title:
      product.title,

    image:
      product.image_url_list?.[0] ||
      product.image_url ||
      product.main_image ||
      '/images/common/no-image.jpg',

    maker:
      product.maker?.name,

    releaseDate:
      product.release_date ?? undefined,
  };
}

/**
 * 🎯 Product Detail ViewModel
 */
export function toAdultProductDetail(
  product: AdultProduct
): ProductDetailVM {
  return {
    title: product.title,

    description:
      product.ai_summary ||
      product.ai_content ||
      product.title ||
      '',

    actresses:
      product.actresses?.map(
        actress => actress.name
      ) ?? [],

    genres:
      product.genres?.map(
        genre => genre.name
      ) ?? [],

    series:
      product.series?.name,

    maker:
      product.maker?.name,

    label:
      product.label?.name,
  };
}