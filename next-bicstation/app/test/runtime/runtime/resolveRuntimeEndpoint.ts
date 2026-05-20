// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/runtime/resolveRuntimeEndpoint.ts
// ============================================================================

/* ============================================================================
🔥 API Authority
============================================================================ */

/**
 * SHIN CORE LINX
 * Semantic Runtime Authority
 *
 * IMPORTANT:
 * Runtime Observatory MUST connect to:
 *
 * backend semantic authority
 *
 * NOT:
 *
 * frontend relative routes
 */

const API_BASE =

  process.env
    .NEXT_PUBLIC_API_URL
    || ''

/* ============================================================================
🔥 Runtime Mode
============================================================================ */

export type RuntimeMode =

  | 'detail'
  | 'related'
  | 'ranking'
  | 'sidebar'
  | 'discovery'
  | 'finder'

/* ============================================================================
🔥 Resolve Runtime Endpoint
============================================================================ */

export function resolveRuntimeEndpoint(

  mode: RuntimeMode,

  options?: {

    uniqueId?: string

    rankingType?: string

    finderQuery?: string

  }

): string {

  /* ==========================================================================
  🔥 Detail Runtime
  ========================================================================== */

  if (mode === 'detail') {

    const uniqueId =

      options?.uniqueId
      || '35909_1000025-md'

    return (

      `${API_BASE}/general/pc-products/${uniqueId}/`

    )
  }

  /* ==========================================================================
  🔥 Related Runtime
  ========================================================================== */

  if (mode === 'related') {

    const uniqueId =

      options?.uniqueId
      || '35909_1000025-md'

    return (

      `${API_BASE}/general/pc-products/${uniqueId}/related/`

    )
  }

  /* ==========================================================================
  🔥 Ranking Runtime
  ========================================================================== */

  if (mode === 'ranking') {

    const rankingType =

      options?.rankingType
      || 'score'

    return (

      `${API_BASE}/general/pc-products/ranking/${rankingType}/`

    )
  }

  /* ==========================================================================
  🔥 Sidebar Runtime
  ========================================================================== */

  if (mode === 'sidebar') {

    return (

      `${API_BASE}/general/pc-sidebar-stats/`

    )
  }

  /* ==========================================================================
  🔥 Discovery Runtime
  ========================================================================== */

  if (mode === 'discovery') {

    return (

      `${API_BASE}/general/discovery/`

    )
  }

  /* ==========================================================================
  🔥 Finder Runtime
  ========================================================================== */

  if (mode === 'finder') {

    const query =

      encodeURIComponent(

        options?.finderQuery
        || 'gaming'
      )

    return (

      `${API_BASE}/general/finder/?q=${query}`

    )
  }

  /* ==========================================================================
  🔥 Fallback
  ========================================================================== */

  return (

    `${API_BASE}/general/pc-products/ranking/score/`

  )
}

/* ============================================================================
🔥 Runtime Endpoint Metadata
============================================================================ */

export function resolveRuntimeMetadata(

  mode: RuntimeMode

) {

  switch (mode) {

    /* ========================================================================
    🔥 Detail
    ======================================================================== */

    case 'detail':

      return {

        runtime_role:
          'product-runtime',

        observatory:
          'semantic-detail-runtime',
      }

    /* ========================================================================
    🔥 Related
    ======================================================================== */

    case 'related':

      return {

        runtime_role:
          'continuation-runtime',

        observatory:
          'semantic-traversal-runtime',
      }

    /* ========================================================================
    🔥 Ranking
    ======================================================================== */

    case 'ranking':

      return {

        runtime_role:
          'ranking-runtime',

        observatory:
          'semantic-ranking-runtime',
      }

    /* ========================================================================
    🔥 Sidebar
    ======================================================================== */

    case 'sidebar':

      return {

        runtime_role:
          'sidebar-runtime',

        observatory:
          'semantic-sidebar-runtime',
      }

    /* ========================================================================
    🔥 Discovery
    ======================================================================== */

    case 'discovery':

      return {

        runtime_role:
          'discovery-runtime',

        observatory:
          'semantic-discovery-runtime',
      }

    /* ========================================================================
    🔥 Finder
    ======================================================================== */

    case 'finder':

      return {

        runtime_role:
          'finder-runtime',

        observatory:
          'semantic-finder-runtime',
      }

    /* ========================================================================
    🔥 Default
    ======================================================================== */

    default:

      return {

        runtime_role:
          'semantic-runtime',

        observatory:
          'runtime-observatory',
      }
  }
}

/* ============================================================================
🔥 Runtime Endpoint Debug
============================================================================ */

console.log(

  '🔥 RUNTIME API AUTHORITY',

  {

    NEXT_PUBLIC_API_URL:

      process.env
        .NEXT_PUBLIC_API_URL,

    API_BASE,
  }
)

/* ============================================================================
🔥 Default Export
============================================================================ */

export default resolveRuntimeEndpoint