// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/detail/normalize.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Contracts
========================================= */

import type {

PCProduct,

} from './contracts'

/* =========================================
🔥 Normalize Detail
========================================= */

export function
normalizeDetail(

payload?: any

): PCProduct | null {

// ======================================
// Empty Guard
// ======================================

if (!payload) {


return null


}

// ======================================
// Minimal Semantic Normalize
// ======================================

return {


// ====================================
// Flat Runtime Payload
// ====================================

...payload,

// ====================================
// Identity Safety
// ====================================

id:
  payload?.id,

unique_id:
  payload?.unique_id || '',

// ====================================
// Basic Safety
// ====================================

name:
  payload?.name || '',

product_type:
  payload?.product_type || '',

maker:
  payload?.maker || '',

brand:
  payload?.brand || '',

// ====================================
// URL Safety
// ====================================

url:
  payload?.url || '',

image_url:
  payload?.image_url || '',

// ====================================
// Runtime Safety
// ====================================

semantic_runtime:

  payload?.semantic_runtime
  || {},

adaptive_runtime:

  payload?.adaptive_runtime
  || {},

semantic_related:

  Array.isArray(
    payload?.semantic_related
  )

    ? payload.semantic_related

    : [],

semantic_labels:

  Array.isArray(
    payload?.semantic_labels
  )

    ? payload.semantic_labels

    : [],

render_hints:

  payload?.render_hints
  || {},

// ====================================
// AI Safety
// ====================================

ai_summary:
  payload?.ai_summary || '',

ai_content:
  payload?.ai_content || '',

// ====================================
// Schema
// ====================================

semantic_schema_version:

  payload?.semantic_schema_version
  || 1,

// ====================================
// Raw Backup
// ====================================

raw:
  payload,


}
}
