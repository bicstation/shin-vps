// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/runtime/fetchRuntime.ts
// ============================================================================

/**
 * SHIN CORE LINX
 * Runtime Observatory
 *
 * Canonical Semantic Runtime Adapter
 *
 * IMPORTANT:
 *
 * Runtime Observatory MUST observe:
 *
 * canonical semantic pipelines
 *
 * NOT:
 *
 * custom transport implementations
 *
 * Responsibilities:
 *
 * - semantic runtime observability
 * - canonical pipeline orchestration
 * - runtime transport observation
 * - semantic preservation visibility
 *
 * IMPORTANT:
 *
 * This layer MUST NOT:
 *
 * ❌ directly call fetch()
 * ❌ hardcode API transport
 * ❌ bypass semantic transport authority
 * ❌ mutate semantic meaning
 */

/* ============================================================================
🔥 Runtime Modes
============================================================================ */

import type {

  RuntimeMode,

} from './runtimeModes'

/* ============================================================================
🔥 Canonical Runtime Pipelines
============================================================================ */

import {

  fetchPCDetailRuntime,

} from '@/shared/lib/api/django/pc/detail/runtime'

import {

  fetchSemanticRankingRuntime,

} from '@/shared/lib/api/django/pc/ranking/fetchSemanticRankingRuntime'

/* ============================================================================
🔥 Fetch Runtime Options
============================================================================ */

export type FetchRuntimeOptions = {

  uniqueId?: string

  rankingType?: string

  finderQuery?: string

}

/* ============================================================================
🔥 Runtime Response
============================================================================ */

export type RuntimeFetchResponse = {

  success: boolean

  endpoint?: string

  runtime_role?: string

  topology_layer?: string

  observatory?: string

  fetched_at?: string

  duration_ms?: number

  payload?: any

  error?: string

}

/* ============================================================================
🔥 Fetch Runtime
============================================================================ */

export async function fetchRuntime(

  mode: RuntimeMode,

  options?: FetchRuntimeOptions

): Promise<RuntimeFetchResponse> {

  // ======================================
  // Runtime Start
  // ======================================

  const startedAt = Date.now()

  console.log(

    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(

    '🔥 RUNTIME OBSERVATORY FETCH START'
  )

  console.log(

    {

      mode,

      options,
    }
  )

  console.log(

    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  /* ==========================================================================
  🔥 Detail Runtime
  ========================================================================== */

  if (mode === 'detail') {

    try {

      // ====================================
      // Unique ID
      // ====================================

      const uniqueId =

        options?.uniqueId
        || '35909_1000025-md'

      // ====================================
      // Runtime Fetch
      // ====================================

      console.log(

        '🔥 DETAIL RUNTIME PIPELINE',

        {

          pipeline:
            'fetchPCDetailRuntime',

          uniqueId,
        }
      )

      const detail =

        await fetchPCDetailRuntime(
          uniqueId
        )

      // ====================================
      // Runtime Failure
      // ====================================

      if (!detail) {

        console.error(

          '🔥 DETAIL RUNTIME EMPTY PAYLOAD'
        )

        return {

          success: false,

          runtime_role:
            'product-runtime',

          topology_layer:
            'entity',

          observatory:
            'semantic-detail-runtime',

          error:
            'Empty semantic runtime payload',
        }
      }

      // ====================================
      // Debug
      // ====================================

      console.log(

        '🔥 DETAIL RAW PAYLOAD',

        {

          keys:

            Object.keys(
              detail || {}
            ),

          has_semantic_runtime:

            !!detail?.semantic_runtime,

          has_adaptive_runtime:

            !!detail?.adaptive_runtime,

          semantic_labels:

            detail?.semantic_labels,

          grouped_attributes:

            detail?.grouped_attributes,

          workflow_tags:

            detail
              ?.semantic_runtime
              ?.workflow_tags,

          payload:
            detail,
        }
      )

      // ====================================
      // Runtime Success
      // ====================================

      return {

        success: true,

        endpoint:

          `/api/general/pc-products/${uniqueId}/`,

        runtime_role:
          'product-runtime',

        topology_layer:
          'entity',

        observatory:
          'semantic-detail-runtime',

        fetched_at:
          new Date().toISOString(),

        duration_ms:
          Date.now() - startedAt,

        /**
         * IMPORTANT:
         *
         * normalizeRuntimePayload.ts
         * expects:
         *
         * runtime.payload
         *
         * Semantic payload MUST remain
         * preserved here.
         */
        payload: {

          // ==================================
          // Semantic Authority
          // ==================================

          semantic_schema_version:

            detail
              ?.semantic_schema_version,

          semantic_runtime:

            detail
              ?.semantic_runtime,

          adaptive_runtime:

            detail
              ?.adaptive_runtime,

          semantic_related:

            detail
              ?.semantic_related,

          semantic_labels:

            detail
              ?.semantic_labels,

          grouped_attributes:

            detail
              ?.grouped_attributes,

          workflow_tags:

            detail
              ?.semantic_runtime
              ?.workflow_tags,

          // ==================================
          // Full Payload Preservation
          // ==================================

          ...detail,
        },
      }

    } catch (error: any) {

      console.error(

        '🔥 DETAIL RUNTIME FAILURE',

        error
      )

      return {

        success: false,

        runtime_role:
          'product-runtime',

        topology_layer:
          'entity',

        observatory:
          'semantic-detail-runtime',

        error:

          error?.message
          || 'Unknown runtime failure',
      }
    }
  }

  /* ==========================================================================
  🔥 Related Runtime
  ========================================================================== */

  if (mode === 'related') {

    return {

      success: false,

      runtime_role:
        'continuation-runtime',

      topology_layer:
        'continuation',

      observatory:
        'semantic-traversal-runtime',

      error:
        'Related runtime not implemented',
    }
  }

  /* ==========================================================================
  🔥 Ranking Runtime
  ========================================================================== */

  if (mode === 'ranking') {

    try {

      // ====================================
      // Ranking Type
      // ====================================

      const rankingType =

        options?.rankingType
        || 'score'

      // ====================================
      // Runtime Pipeline
      // ====================================

      console.log(

        '🔥 RANKING RUNTIME PIPELINE',

        {

          pipeline:
            'fetchSemanticRankingRuntime',

          rankingType,
        }
      )

      // ====================================
      // Fetch Runtime
      // ====================================

      const ranking =

        await fetchSemanticRankingRuntime(
          rankingType
        )

      // ====================================
      // Empty Guard
      // ====================================

      if (!ranking) {

        console.error(

          '🔥 RANKING RUNTIME EMPTY PAYLOAD'
        )

        return {

          success: false,

          runtime_role:
            'ranking-runtime',

          topology_layer:
            'ranking',

          observatory:
            'semantic-ranking-runtime',

          error:
            'Empty ranking runtime payload',
        }
      }

      // ====================================
      // Runtime Debug
      // ====================================

      console.log(

        '🔥 RANKING RAW PAYLOAD',

        {

          rankingType,

          keys:

            Object.keys(
              ranking || {}
            ),

          has_semantic_runtime:

            !!ranking?.semantic_runtime,

          semantic_labels:

            ranking?.semantic_labels,

          payload:
            ranking,
        }
      )

      // ====================================
      // Runtime Success
      // ====================================

      return {

        success: true,

        endpoint:

          `/api/general/pc-products/ranking/${rankingType}/`,

        runtime_role:
          'ranking-runtime',

        topology_layer:
          'ranking',

        observatory:
          'semantic-ranking-runtime',

        fetched_at:
          new Date().toISOString(),

        duration_ms:
          Date.now() - startedAt,

        payload: {

          semantic_runtime:

            ranking?.semantic_runtime,

          semantic_labels:

            ranking?.semantic_labels,

          render_hints:

            ranking?.render_hints,

          ranking:

            ranking?.ranking,

          seo:

            ranking?.seo,

          faq:

            ranking?.faq,

          breadcrumbs:

            ranking?.breadcrumbs,

          schemas:

            ranking?.schemas,

          ui:

            ranking?.ui,

          ...ranking,
        },
      }

    } catch (error: any) {

      console.error(

        '🔥 RANKING RUNTIME FAILURE',

        error
      )

      return {

        success: false,

        runtime_role:
          'ranking-runtime',

        topology_layer:
          'ranking',

        observatory:
          'semantic-ranking-runtime',

        error:

          error?.message
          || 'Unknown ranking runtime failure',
      }
    }
  }


  /* ==========================================================================
  🔥 Sidebar Runtime
  ========================================================================== */

  if (mode === 'sidebar') {

    return {

      success: false,

      runtime_role:
        'sidebar-runtime',

      topology_layer:
        'navigation',

      observatory:
        'semantic-sidebar-runtime',

      error:
        'Sidebar runtime not implemented',
    }
  }

  /* ==========================================================================
  🔥 Discovery Runtime
  ========================================================================== */

  if (mode === 'discovery') {

    return {

      success: false,

      runtime_role:
        'discovery-runtime',

      topology_layer:
        'discovery',

      observatory:
        'semantic-discovery-runtime',

      error:
        'Discovery runtime not implemented',
    }
  }

  /* ==========================================================================
  🔥 Finder Runtime
  ========================================================================== */

  if (mode === 'finder') {

    return {

      success: false,

      runtime_role:
        'finder-runtime',

      topology_layer:
        'intent-routing',

      observatory:
        'semantic-finder-runtime',

      error:
        'Finder runtime not implemented',
    }
  }

  /* ==========================================================================
  🔥 Unknown Runtime
  ========================================================================== */

  console.error(

    '🔥 UNKNOWN RUNTIME MODE',

    {

      mode,
    }
  )

  return {

    success: false,

    runtime_role:
      'unknown-runtime',

    topology_layer:
      'unknown',

    observatory:
      'runtime-observatory',

    error:
      'Unknown runtime mode',
  }
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchRuntime