// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/runtime/runtimeModes.ts
// ============================================================================

/**
 * SHIN CORE LINX
 * Runtime Observatory
 *
 * IMPORTANT:
 * Runtime modes do NOT own concrete endpoints.
 *
 * Endpoint authority lives in:
 *
 * runtime/topology/resolveRuntimeEndpoint.ts
 *
 * Runtime modes only describe:
 * - runtime meaning
 * - observatory semantics
 * - exploration role
 */

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
🔥 Runtime Role
============================================================================ */

export type RuntimeRole =
  | 'product-runtime'
  | 'continuation-runtime'
  | 'ranking-runtime'
  | 'sidebar-runtime'
  | 'discovery-runtime'
  | 'finder-runtime'

/* ============================================================================
🔥 Runtime Observatory
============================================================================ */

export type RuntimeObservatory =
  | 'semantic-detail-observatory'
  | 'semantic-continuation-observatory'
  | 'semantic-ranking-observatory'
  | 'semantic-sidebar-observatory'
  | 'semantic-discovery-observatory'
  | 'semantic-finder-observatory'

/* ============================================================================
🔥 Runtime Mode Definition
============================================================================ */

export type RuntimeModeDefinition = {
  id: RuntimeMode

  title: string

  short_title: string

  description: string

  runtime_role: RuntimeRole

  observatory: RuntimeObservatory

  icon: string

  color: string

  /**
   * IMPORTANT:
   *
   * Endpoint topology is resolved separately.
   *
   * This field exists only for:
   * - observatory hints
   * - developer visibility
   * - runtime documentation
   */
  endpoint_hint: string
}

/* ============================================================================
🔥 Runtime Modes
============================================================================ */

export const runtimeModes:
RuntimeModeDefinition[] = [

  /* ==========================================================================
  🔥 Detail Runtime
  ========================================================================== */

  {
    id:
      'detail',

    title:
      'Product Runtime',

    short_title:
      'Detail',

    description:
      `
      semantic product runtime authority
      ・ adaptive runtime
      ・ semantic entity payload
      ・ runtime rendering
      `,

    runtime_role:
      'product-runtime',

    observatory:
      'semantic-detail-observatory',

    icon:
      '🧠',

    color:
      '#7dd3fc',

    endpoint_hint:
      '/general/pc-products/<unique_id>/',
  },

  /* ==========================================================================
  🔥 Related Runtime
  ========================================================================== */

  {
    id:
      'related',

    title:
      'Continuation Runtime',

    short_title:
      'Related',

    description:
      `
      semantic continuation runtime
      ・ traversal edges
      ・ continuation orchestration
      ・ exploration runtime
      `,

    runtime_role:
      'continuation-runtime',

    observatory:
      'semantic-continuation-observatory',

    icon:
      '🧬',

    color:
      '#c084fc',

    endpoint_hint:
      '/general/pc-products/<unique_id>/related/',
  },

  /* ==========================================================================
  🔥 Ranking Runtime
  ========================================================================== */

  {
    id:
      'ranking',

    title:
      'Ranking Runtime',

    short_title:
      'Ranking',

    description:
      `
      semantic ranking orchestration
      ・ ranking runtime
      ・ recommendation authority
      ・ semantic scoring
      `,

    runtime_role:
      'ranking-runtime',

    observatory:
      'semantic-ranking-observatory',

    icon:
      '🏆',

    color:
      '#f59e0b',

    endpoint_hint:
      '/general/pc-products/ranking/<type>/',
  },

  /* ==========================================================================
  🔥 Sidebar Runtime
  ========================================================================== */

  {
    id:
      'sidebar',

    title:
      'Sidebar Runtime',

    short_title:
      'Sidebar',

    description:
      `
      semantic sidebar transport
      ・ runtime metadata
      ・ exploration shortcuts
      ・ runtime navigation
      `,

    runtime_role:
      'sidebar-runtime',

    observatory:
      'semantic-sidebar-observatory',

    icon:
      '📦',

    color:
      '#22c55e',

    endpoint_hint:
      '/general/pc-sidebar-stats/',
  },

  /* ==========================================================================
  🔥 Discovery Runtime
  ========================================================================== */

  {
    id:
      'discovery',

    title:
      'Discovery Runtime',

    short_title:
      'Discovery',

    description:
      `
      semantic discovery orchestration
      ・ runtime exploration
      ・ discovery traversal
      ・ topology expansion
      `,

    runtime_role:
      'discovery-runtime',

    observatory:
      'semantic-discovery-observatory',

    icon:
      '🌌',

    color:
      '#38bdf8',

    endpoint_hint:
      '/discover/',
  },

  /* ==========================================================================
  🔥 Finder Runtime
  ========================================================================== */

  {
    id:
      'finder',

    title:
      'Finder Runtime',

    short_title:
      'Finder',

    description:
      `
      semantic finder runtime
      ・ semantic query orchestration
      ・ adaptive discovery
      ・ workflow exploration
      `,

    runtime_role:
      'finder-runtime',

    observatory:
      'semantic-finder-observatory',

    icon:
      '🔍',

    color:
      '#fb7185',

    endpoint_hint:
      '/general/finder/',
  },
]

/* ============================================================================
🔥 Runtime Mode Map
============================================================================ */

export const runtimeModeMap =

  Object.fromEntries(

    runtimeModes.map(
      (mode) => [
        mode.id,
        mode,
      ]
    )
  ) as Record<RuntimeMode, RuntimeModeDefinition>

/* ============================================================================
🔥 Resolve Runtime Mode
============================================================================ */

export function resolveRuntimeMode(
  mode?: string
): RuntimeModeDefinition {

  return (

    runtimeModeMap[
      mode as RuntimeMode
    ]

    ||

    runtimeModeMap.detail
  )
}

/* ============================================================================
🔥 Runtime Mode IDs
============================================================================ */

export const runtimeModeIds =
  runtimeModes.map(
    (mode) => mode.id
  )

/* ============================================================================
🔥 Runtime Pipeline Authority
============================================================================ */

/**
 * IMPORTANT:
 *
 * Runtime pipeline rules:
 *
 * page.tsx
 *   ↓
 * runtime mode only
 *
 * resolveRuntimeEndpoint()
 *   ↓
 * endpoint authority
 *
 * fetchRuntime()
 *   ↓
 * transport authority
 *
 * normalizeRuntimePayload()
 *   ↓
 * preservation / stabilization
 *
 * inspectors
 *   ↓
 * runtime observability
 */

/* ============================================================================
🔥 Default Export
============================================================================ */

export default runtimeModes

