// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/utils/normalize-product.ts

// @ts-nocheck

/* =========================================
🔥 Normalize Product
========================================= */

export function normalizeProduct(
  raw: any
) {

  if (!raw) {

    return null

  }

  return {

    /* =====================================
    Identity
    ===================================== */

    unique_id:

      raw?.unique_id
      || raw?.id
      || '',

    /* =====================================
    Basic
    ===================================== */

    name:

      raw?.name
      || raw?.title
      || 'Unknown Product',

    maker:

      raw?.maker
      || raw?.brand
      || '',

    price:

      raw?.price
      || 0,

    image_url:

      raw?.image_url
      || raw?.thumbnail_url
      || '',

    url:

      raw?.url
      || raw?.affiliate_url
      || '',

    /* =====================================
    Specs
    ===================================== */

    cpu:

      raw?.cpu
      || '',

    gpu:

      raw?.gpu
      || '',

    memory:

      raw?.memory
      || '',

    storage:

      raw?.storage
      || '',

    /* =====================================
    Semantic
    ===================================== */

    semantic_score:

      raw?.semantic_score
      || 0,

    semantic_role:

      raw?.semantic_role
      || 'primary',

    semantic_labels:

      Array.isArray(
        raw?.semantic_labels
      )

        ? raw.semantic_labels

        : [],

    /* =====================================
    Recommendation
    ===================================== */

    recommendation_reason:

      raw?.recommendation_reason
      || '',

    confidence:

      raw?.confidence
      || 0,

    /* =====================================
    Raw Backup
    ===================================== */

    raw,
  }
}