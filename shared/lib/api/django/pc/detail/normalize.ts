// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/detail/normalize.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Normalize Detail
========================================= */

export function
normalizeDetail(

  payload?: any
) {

  // ======================================
  // Empty
  // ======================================

  if (!payload) {

    return null
  }

  // ======================================
  // Normalize
  // ======================================

  return {

    // ====================================
    // Base
    // ====================================

    id:
      payload?.id,

    unique_id:
      payload?.unique_id || '',

    name:
      payload?.name || '',

    maker:
      payload?.maker || '',

    description:
      payload?.description || '',

    // ====================================
    // URL
    // ====================================

    url:
      payload?.url || '',

    affiliate_url:
      payload?.affiliate_url || '',

    image_url:
      payload?.image_url || '',

    // ====================================
    // Price
    // ====================================

    price:
      payload?.price || 0,

    // ====================================
    // Spec
    // ====================================

    cpu_model:
      payload?.cpu_model || '',

    gpu_model:
      payload?.gpu_model || '',

    memory_gb:
      payload?.memory_gb || 0,

    storage_gb:
      payload?.storage_gb || 0,

    // ====================================
    // Score
    // ====================================

    spec_score:
      payload?.spec_score || 0,

    score_cpu:
      payload?.score_cpu || 0,

    score_gpu:
      payload?.score_gpu || 0,

    score_ai:
      payload?.score_ai || 0,

    score_cost:
      payload?.score_cost || 0,

    score_portable:
      payload?.score_portable || 0,

    // ====================================
    // Semantic
    // ====================================

    attributes:

      Array.isArray(
        payload?.attributes
      )

        ? payload.attributes

        : [],

    grouped_attributes:
      payload?.grouped_attributes
      || {},

    semantic_schema_version:

      payload?.semantic_schema_version
      || 1,

    // ====================================
    // AI
    // ====================================

    ai_summary:
      payload?.ai_summary || '',

    ai_content:
      payload?.ai_content || '',

    // ====================================
    // Radar
    // ====================================

    radar_chart:

      Array.isArray(
        payload?.radar_chart
      )

        ? payload.radar_chart

        : [],
  }
}