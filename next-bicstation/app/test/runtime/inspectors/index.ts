// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/index.ts
// ============================================================================

/**
 * SHIN CORE LINX
 * Runtime Observatory Inspector Registry
 *
 * IMPORTANT:
 * This file represents:
 *
 * observability topology authority
 *
 * NOT:
 *
 * semantic authority
 *
 * Responsibilities:
 * - inspector registry management
 * - observability topology
 * - inspector orchestration
 * - runtime-safe inspector composition
 *
 * IMPORTANT:
 * This file MUST NOT:
 *
 * ❌ mutate semantic meaning
 * ❌ generate traversal logic
 * ❌ infer workflow structure
 * ❌ rewrite runtime payloads
 */

/* ============================================================================
🔥 Imports
============================================================================ */

import TransportInspector
from './transport/TransportInspector'

import RuntimeTopologyInspector
from './topology/RuntimeTopologyInspector'

import SemanticRuntimeInspector
from './semantic/SemanticRuntimeInspector'

import TraversalEdgeInspector
from './traversal/TraversalEdgeInspector'

import ContinuationInspector
from './traversal/ContinuationInspector'

/* ============================================================================
🔥 Inspector Domain
============================================================================ */

export type InspectorDomain =

  | 'transport'
  | 'topology'
  | 'semantic'
  | 'traversal'
  | 'continuation'
  | 'runtime'

/* ============================================================================
🔥 Inspector Priority
============================================================================ */

export type InspectorPriority =

  | 10
  | 20
  | 30
  | 40
  | 50
  | 100

/* ============================================================================
🔥 Runtime Inspector Registry Item
============================================================================ */

export type RuntimeInspectorRegistryItem = {

  id: string

  title: string

  description: string

  domain: InspectorDomain

  priority: InspectorPriority

  enabled: boolean

  runtime_roles?: string[]

  component: any

}

/* ============================================================================
🔥 Runtime Inspector Registry
============================================================================ */

export const RUNTIME_INSPECTORS:

  RuntimeInspectorRegistryItem[] = [

    /* ======================================================================
    🔥 Transport Inspector
    ====================================================================== */

    {

      id:
        'transport-inspector',

      title:
        'Transport Inspector',

      description:
        'Runtime transport observability and telemetry',

      domain:
        'transport',

      priority:
        10,

      enabled:
        true,

      runtime_roles: [

        'product-runtime',
        'continuation-runtime',
        'ranking-runtime',
        'discovery-runtime',
        'finder-runtime',
      ],

      component:
        TransportInspector,
    },

    /* ======================================================================
    🔥 Runtime Topology Inspector
    ====================================================================== */

    {

      id:
        'runtime-topology-inspector',

      title:
        'Runtime Topology Inspector',

      description:
        'Exploration topology observability',

      domain:
        'topology',

      priority:
        20,

      enabled:
        true,

      runtime_roles: [

        'product-runtime',
        'continuation-runtime',
        'ranking-runtime',
        'discovery-runtime',
        'finder-runtime',
      ],

      component:
        RuntimeTopologyInspector,
    },

    /* ======================================================================
    🔥 Semantic Runtime Inspector
    ====================================================================== */

    {

      id:
        'semantic-runtime-inspector',

      title:
        'Semantic Runtime Inspector',

      description:
        'Semantic runtime observability and cinematic rendering',

      domain:
        'semantic',

      priority:
        30,

      enabled:
        true,

      runtime_roles: [

        'product-runtime',
        'continuation-runtime',
        'ranking-runtime',
        'discovery-runtime',
        'finder-runtime',
      ],

      component:
        SemanticRuntimeInspector,
    },

    /* ======================================================================
    🔥 Traversal Edge Inspector
    ====================================================================== */

    {

      id:
        'traversal-edge-inspector',

      title:
        'Traversal Edge Inspector',

      description:
        'Semantic traversal graph observability',

      domain:
        'traversal',

      priority:
        40,

      enabled:
        true,

      runtime_roles: [

        'continuation-runtime',
      ],

      component:
        TraversalEdgeInspector,
    },

    /* ======================================================================
    🔥 Continuation Inspector
    ====================================================================== */

    {

      id:
        'continuation-inspector',

      title:
        'Continuation Inspector',

      description:
        'Exploration continuity and semantic journey rendering',

      domain:
        'continuation',

      priority:
        50,

      enabled:
        true,

      runtime_roles: [

        'continuation-runtime',
      ],

      component:
        ContinuationInspector,
    },
  ]

/* ============================================================================
🔥 Resolve Runtime Inspectors
============================================================================ */

export function resolveRuntimeInspectors(

  runtimeRole?: string

): RuntimeInspectorRegistryItem[] {

  /* ==========================================================================
  🔥 Runtime Safety
  ========================================================================== */

  if (!runtimeRole) {

    return []
  }

  /* ==========================================================================
  🔥 Enabled Inspectors
  ========================================================================== */

  return RUNTIME_INSPECTORS

    .filter(

      (inspector) => {

        if (!inspector.enabled) {

          return false
        }

        if (
          !inspector.runtime_roles
          ?.length
        ) {

          return true
        }

        return inspector
          .runtime_roles
          .includes(
            runtimeRole
          )
      }
    )

    .sort(

      (a, b) =>

        a.priority
        - b.priority
    )
}

/* ============================================================================
🔥 Inspector Domains
============================================================================ */

export const INSPECTOR_DOMAINS = {

  transport:
    'Runtime transport observability',

  topology:
    'Exploration topology observability',

  semantic:
    'Semantic runtime observability',

  traversal:
    'Traversal graph observability',

  continuation:
    'Exploration continuity rendering',

  runtime:
    'Runtime observability',

}

/* ============================================================================
🔥 Observatory Rules
============================================================================ */

/**
 * IMPORTANT:
 *
 * Inspector registry:
 *
 * ❌ must NOT mutate runtime semantics
 * ❌ must NOT generate traversal meaning
 * ❌ must NOT rewrite workflow topology
 * ❌ must NOT bypass runtime pipeline
 *
 * Registry exists for:
 *
 * ✅ inspector orchestration
 * ✅ observability topology
 * ✅ runtime-safe rendering
 * ✅ inspector composition
 */

/* ============================================================================
🔥 Re-Exports
============================================================================ */

export {

  TransportInspector,

  RuntimeTopologyInspector,

  SemanticRuntimeInspector,

  TraversalEdgeInspector,

  ContinuationInspector,

}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default RUNTIME_INSPECTORS