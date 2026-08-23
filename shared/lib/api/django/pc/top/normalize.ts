// ============================================================================
// FILE:
// /home/maya/shin-vps/shared/lib/api/django/pc/top/normalize.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Semantic Top Runtime Normalization Layer
 * ============================================================================
 *
 * PURPOSE
 *
 * Backend Top Runtime
 *      ↓
 * Stable Top Runtime Contract
 *
 * Responsibilities
 *
 * ✓ Null Safety
 * ✓ Array Safety
 * ✓ Contract Safety
 * ✓ Preserve Backend Reality
 *
 * SHALL NOT
 *
 * ✗ Generate Meaning
 * ✗ Generate SEO
 * ✗ Generate Presentation
 * ✗ Generate Statistics
 * ✗ Modify Semantic Groups
 * ✗ Modify Featured Products
 * ✗ Re-rank Runtime
 * ✗ Filter Runtime
 * ✗ Project Runtime
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  TopRuntimeContract,
  TopMeaning,
  TopPresentation,
  TopSEO,
  TopData,
  TopStats,
  TopFeaturedGroup,
  TopFeaturedProduct,

} from './contracts'

/* ============================================================================
🔥 Normalize Top Runtime
============================================================================ */

export function normalizeTopRuntime(

  payload?: Partial<TopRuntimeContract>,

): TopRuntimeContract {

  const source =

    payload
    ?? {}

  /* ------------------------------------------------------------------------
  Backend Data
  ------------------------------------------------------------------------ */

  const data =

    source?.data
    ?? {}

  /* ------------------------------------------------------------------------
  Normalize
  ------------------------------------------------------------------------ */

  const runtime: TopRuntimeContract = {

    /* --------------------------------------------------------------------
    Meaning
    -------------------------------------------------------------------- */

    meaning:

      normalizeMeaning(
        source?.meaning
      ),

    /* --------------------------------------------------------------------
    Presentation
    -------------------------------------------------------------------- */

    presentation:

      normalizePresentation(
        source?.presentation
      ),

    /* --------------------------------------------------------------------
    SEO
    -------------------------------------------------------------------- */

    seo:

      normalizeSEO(
        source?.seo
      ),

    /* --------------------------------------------------------------------
    Data
    -------------------------------------------------------------------- */

    data:

      normalizeData(
        data
      ),

    /* --------------------------------------------------------------------
    Backend Authority
    -------------------------------------------------------------------- */

    semantic_schema_version:

      source?.semantic_schema_version,

    authority_version:

      source?.authority_version,

    semantic_authority:

      source?.semantic_authority,

    ready:

      source?.ready === true,

    /* --------------------------------------------------------------------
    Raw Backend Payload
    -------------------------------------------------------------------- */

    raw:

      payload,

  }

  /* ------------------------------------------------------------------------
  Observability
  ------------------------------------------------------------------------ */

  console.log(

    '🔥 TOP NORMALIZE',

    {

      identity:
        runtime.meaning.identity,

      product_count:
        runtime.data.stats.product_count,

      group_count:
        runtime.data.stats.group_count,

      attribute_count:
        runtime.data.stats.attribute_count,

      featured_groups:
        runtime.data.featured_groups.length,

      featured_products:
        runtime.data.featured_products.length,

      authority_version:
        runtime.authority_version,

      semantic_authority:
        runtime.semantic_authority,

      ready:
        runtime.ready,

    }

  )

  return runtime

}

/* ============================================================================
🔥 Normalize Meaning
============================================================================ */

function normalizeMeaning(

  meaning?: Partial<TopMeaning>,

): TopMeaning {

  return {

    identity:

      meaning?.identity
      ?? '',

    mission:

      meaning?.mission
      ?? '',

    user_intent:

      meaning?.user_intent
      ?? '',

    meaning_statement:

      meaning?.meaning_statement
      ?? '',

    existence_reason:

      meaning?.existence_reason
      ?? '',

  }

}

/* ============================================================================
🔥 Normalize Presentation
============================================================================ */

function normalizePresentation(

  presentation?: Partial<TopPresentation>,

): TopPresentation {

  return {

    title:

      presentation?.title,

    subtitle:

      presentation?.subtitle,

    description:

      presentation?.description,

  }

}

/* ============================================================================
🔥 Normalize SEO
============================================================================ */

function normalizeSEO(

  seo?: Partial<TopSEO>,

): TopSEO {

  return {

    title:
      seo?.title,

    description:
      seo?.description,

    keywords:

      Array.isArray(
        seo?.keywords
      )

        ? seo.keywords

        : [],

    canonical:
      seo?.canonical,

    schema_jsonld:
      seo?.schema_jsonld,

    open_graph:
      seo?.open_graph,

    twitter:
      seo?.twitter,

  }

}

/* ============================================================================
🔥 Normalize Data
============================================================================ */

function normalizeData(

  data?: Partial<TopData>,

): TopData {

  return {

    /* --------------------------------------------------------------------
    Stats
    -------------------------------------------------------------------- */

    stats:

      normalizeStats(
        data?.stats
      ),

    /* --------------------------------------------------------------------
    Featured Groups
    -------------------------------------------------------------------- */

    featured_groups:

      Array.isArray(
        data?.featured_groups
      )

        ? data.featured_groups.map(
          normalizeFeaturedGroup
        )

        : [],

    /* --------------------------------------------------------------------
    Featured Products
    -------------------------------------------------------------------- */

    featured_products:

      Array.isArray(
        data?.featured_products
      )

        ? data.featured_products.map(
          normalizeFeaturedProduct
        )

        : [],

  }

}

/* ============================================================================
🔥 Normalize Stats
============================================================================ */

function normalizeStats(

  stats?: Partial<TopStats>,

): TopStats {

  return {

    product_count:

      typeof stats?.product_count === 'number'

        ? stats.product_count

        : 0,

    group_count:

      typeof stats?.group_count === 'number'

        ? stats.group_count

        : 0,

    attribute_count:

      typeof stats?.attribute_count === 'number'

        ? stats.attribute_count

        : 0,

  }

}

/* ============================================================================
🔥 Normalize Featured Group
============================================================================ */

function normalizeFeaturedGroup(

  group: TopFeaturedGroup,

): TopFeaturedGroup {

  return {

    ...group,

    group_slug:
      group?.group_slug
      ?? '',

    group_name:
      group?.group_name
      ?? '',

    presentation_name:
      group?.presentation_name,

    presentation_description:
      group?.presentation_description,

    parent_group:
      group?.parent_group,

    type:
      group?.type,

    icon:
      group?.icon,

    color:
      group?.color,

    sort_order:
      group?.sort_order,

    discovery_priority:
      group?.discovery_priority,

    is_active:
      group?.is_active,

    product_count:
      typeof group?.product_count === 'number'

        ? group.product_count

        : undefined,

  }

}

/* ============================================================================
🔥 Normalize Featured Product
============================================================================ */

function normalizeFeaturedProduct(

  product: TopFeaturedProduct,

): TopFeaturedProduct {

  return {

    ...product,

    product_id:
      product?.product_id,

    unique_id:
      product?.unique_id
      ?? '',

    name:
      product?.name
      ?? '',

    maker:
      product?.maker,

    price:
      typeof product?.price === 'number'

        ? product.price

        : undefined,

    image_url:
      product?.image_url,

    cpu_model:
      product?.cpu_model,

    gpu_model:
      product?.gpu_model,

    memory_gb:
      product?.memory_gb,

    storage_gb:
      product?.storage_gb,

    display_info:
      product?.display_info,

    is_ai_pc:
      product?.is_ai_pc,

    semantic_attributes:

      Array.isArray(
        product?.semantic_attributes
      )

        ? product.semantic_attributes

        : [],

    matched_groups:

      Array.isArray(
        product?.matched_groups
      )

        ? product.matched_groups

        : [],

    reality_scores:
      product?.reality_scores,

    product_type:
      product?.product_type,

    primary_workflow:
      product?.primary_workflow,

    workflow_score:
      product?.workflow_score,

    semantic_score:
      product?.semantic_score,

    workflow_tags:

      Array.isArray(
        product?.workflow_tags
      )

        ? product.workflow_tags

        : [],

    workflows:

      Array.isArray(
        product?.workflows
      )

        ? product.workflows

        : [],

    semantic_labels:

      Array.isArray(
        product?.semantic_labels
      )

        ? product.semantic_labels

        : [],

    adaptive_runtime:
      product?.adaptive_runtime,

    semantic_version:
      product?.semantic_version,

    semantic_authority:
      product?.semantic_authority,

    runtime_valid:
      product?.runtime_valid,

  }

}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeTopRuntime