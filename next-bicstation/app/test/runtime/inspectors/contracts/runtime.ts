// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/contracts/runtime.ts
// ============================================================================

/**
 * SHIN CORE LINX
 * Runtime Observatory Contracts
 *
 * IMPORTANT:
 * This file defines:
 *
 * observability contracts
 *
 * NOT:
 *
 * semantic authority contracts
 *
 * Backend remains:
 *
 * - semantic authority
 * - traversal authority
 * - runtime meaning authority
 *
 * Frontend inspector contracts exist for:
 *
 * - runtime observability
 * - visualization stability
 * - inspector isolation
 * - runtime-safe rendering
 */

/* ============================================================================
🔥 Runtime Observatory State
============================================================================ */

export type RuntimeObservatoryState = {

  loading: boolean

  error: string | null

  mode: string

}

/* ============================================================================
🔥 Runtime Observatory Metadata
============================================================================ */

export type RuntimeObservatoryMetadata = {

  endpoint: string

  runtime_role: string

  topology_layer: string

  observatory: string

  fetched_at: string

  duration_ms: number

}

/* ============================================================================
🔥 Runtime Observatory Flags
============================================================================ */

export type RuntimeObservatoryFlags = {

  success: boolean

  has_semantic_runtime: boolean

  has_adaptive_runtime: boolean

  has_semantic_related: boolean

}

/* ============================================================================
🔥 Runtime Observatory Payload
============================================================================ */

export type RuntimeObservatoryPayload<T = any> = {

  payload: T

  payload_size: number

  payload_type: string

  payload_keys: string[]

  semantic_schema_version: string | null

}

/* ============================================================================
🔥 Runtime Observatory Runtime
============================================================================ */

export type RuntimeObservatoryRuntime<T = any> =

  RuntimeObservatoryState
  &

  RuntimeObservatoryMetadata
  &

  RuntimeObservatoryFlags
  &

  RuntimeObservatoryPayload<T>

/* ============================================================================
🔥 Inspector Base Props
============================================================================ */

export type RuntimeInspectorProps<T = any> = {

  runtime:

    RuntimeObservatoryRuntime<T>
    | null

}

/* ============================================================================
🔥 Runtime Inspector Section
============================================================================ */

export type RuntimeInspectorSection = {

  id: string

  title: string

  description?: string

  icon?: string

}

/* ============================================================================
🔥 Runtime Inspector Card
============================================================================ */

export type RuntimeInspectorCard = {

  title: string

  value: string | number | boolean | null

  description?: string

}

/* ============================================================================
🔥 Runtime Transport Contract
============================================================================ */

export type RuntimeTransportContract = {

  endpoint: string

  fetched_at: string

  duration_ms: number

  success: boolean

}

/* ============================================================================
🔥 Runtime Topology Contract
============================================================================ */

export type RuntimeTopologyContract = {

  runtime_role: string

  topology_layer: string

  observatory: string

}

/* ============================================================================
🔥 Runtime Semantic Contract
============================================================================ */

export type RuntimeSemanticContract = {

  semantic_schema_version: string | null

  has_semantic_runtime: boolean

  has_adaptive_runtime: boolean

}

/* ============================================================================
🔥 Runtime Traversal Contract
============================================================================ */

export type RuntimeTraversalContract = {

  has_semantic_related: boolean

}

/* ============================================================================
🔥 Runtime Payload Contract
============================================================================ */

export type RuntimePayloadContract = {

  payload_size: number

  payload_type: string

  payload_keys: string[]

}

/* ============================================================================
🔥 Runtime Observatory Rules
============================================================================ */

/**
 * IMPORTANT:
 *
 * Inspector contracts:
 *
 * ❌ must NOT infer semantics
 * ❌ must NOT mutate runtime meaning
 * ❌ must NOT rewrite traversal meaning
 * ❌ must NOT regroup semantic payloads
 *
 * Inspector contracts exist for:
 *
 * ✅ observability stability
 * ✅ rendering isolation
 * ✅ inspector safety
 * ✅ runtime-safe visualization
 */

/* ============================================================================
🔥 Default Export
============================================================================ */

export default RuntimeObservatoryRuntime