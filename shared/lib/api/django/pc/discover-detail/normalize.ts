// ============================================================================
// Discover Detail Runtime Normalizer
// ============================================================================

import type {

  DiscoverDetailRuntime,

} from './contracts'

/* ============================================================================
🔥 Normalize Discover Detail Runtime
============================================================================ */

export function normalizeDiscoverDetailRuntime(

  runtime?: Partial<DiscoverDetailRuntime>

): DiscoverDetailRuntime {

  return {

    /* =========================
       Runtime Status
    ========================= */

    found:
      runtime?.found ?? false,

    success:
      runtime?.success ?? runtime?.found ?? false,

    /* =========================
       Meaning
    ========================= */

    meaning:
      runtime?.meaning ?? {},

    presentation:
      runtime?.presentation ?? {},

    seo:
      runtime?.seo ?? {},

    /* =========================
       Data
    ========================= */

    data: {

      group_slug:
        runtime?.data?.group_slug ?? '',

      group_name:
        runtime?.data?.group_name ?? '',

      type:
        runtime?.data?.type ?? '',

      parent_group:
        runtime?.data?.parent_group ?? '',

      icon:
        runtime?.data?.icon ?? '',

      color:
        runtime?.data?.color ?? '',

      sort_order:
        runtime?.data?.sort_order ?? '',

      attribute:
        runtime?.data?.attribute,

      product_count:
        runtime?.data?.product_count ?? 0,

      aliases:
        runtime?.data?.aliases ?? [],

      related_groups:
        runtime?.data?.related_groups ?? [],

      sample_products:
        runtime?.data?.sample_products ?? [],
    },

    /* =========================
       Runtime Authority
    ========================= */

    semantic_schema_version:
      runtime?.semantic_schema_version,

    authority_version:
      runtime?.authority_version,

    semantic_authority:
      runtime?.semantic_authority,

    ready:
      runtime?.ready ?? false,

    /* =========================
       Raw Backup
    ========================= */

    raw:
      runtime,
  }
}

/* ============================================================================
🔥 Alias
============================================================================ */

export const normalizeDiscoverDetail =
  normalizeDiscoverDetailRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeDiscoverDetailRuntime