// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/contracts/semantic.ts
// ============================================================================

/**
 * SHIN CORE LINX
 * Semantic Observatory Contracts
 *
 * IMPORTANT:
 * This file defines:
 *
 * semantic observability contracts
 *
 * NOT:
 *
 * semantic authority
 *
 * Backend remains:
 *
 * - semantic authority
 * - workflow authority
 * - traversal authority
 * - meaning authority
 *
 * Frontend semantic contracts exist ONLY for:
 *
 * - observability
 * - cinematic rendering
 * - runtime-safe visualization
 * - inspector stabilization
 */

/* ============================================================================
🔥 Semantic Runtime
============================================================================ */

export type SemanticRuntime = {

  primary_workflow?: string | null

  workflow_tags?: string[]

  semantic_labels?: string[]

  semantic_score?: number | null

  semantic_confidence?: number | null

  semantic_role?: string | null

  semantic_group?: string | null

  grouped_attributes?: Record<
    string,
    any[]
  >

  render_hints?: Record<
    string,
    any
  >

}

/* ============================================================================
🔥 Adaptive Runtime
============================================================================ */

export type AdaptiveRuntime = {

  adaptive_title?: string | null

  adaptive_summary?: string | null

  adaptive_description?: string | null

  adaptive_tags?: string[]

  adaptive_navigation?: string[]

  adaptive_runtime_role?: string | null

}

/* ============================================================================
🔥 Semantic Label
============================================================================ */

export type SemanticLabel = {

  label?: string

  type?: string

  icon?: string

  color?: string

  score?: number | null

}

/* ============================================================================
🔥 Semantic Metadata
============================================================================ */

export type SemanticMetadata = {

  semantic_schema_version?: string | null

  semantic_runtime_version?: string | null

  semantic_origin?: string | null

  semantic_engine?: string | null

}

/* ============================================================================
🔥 Semantic Runtime Contract
============================================================================ */

export type SemanticRuntimeContract = {

  semantic_runtime?:

    SemanticRuntime

  adaptive_runtime?:

    AdaptiveRuntime

  semantic_labels?:

    SemanticLabel[]

  semantic_metadata?:

    SemanticMetadata

}

/* ============================================================================
🔥 Semantic Inspector Props
============================================================================ */

export type SemanticInspectorProps = {

  semantic_runtime?:

    SemanticRuntime

  adaptive_runtime?:

    AdaptiveRuntime

  semantic_labels?:

    SemanticLabel[]

  semantic_metadata?:

    SemanticMetadata

}

/* ============================================================================
🔥 Semantic Runtime Observatory
============================================================================ */

export type SemanticRuntimeObservatory = {

  has_semantic_runtime: boolean

  has_adaptive_runtime: boolean

  semantic_schema_version: string | null

}

/* ============================================================================
🔥 Semantic Render Hints
============================================================================ */

export type SemanticRenderHints = {

  cinematic_layout?: string | null

  semantic_theme?: string | null

  continuation_style?: string | null

  discovery_style?: string | null

  graph_style?: string | null

}

/* ============================================================================
🔥 Semantic Grouped Attributes
============================================================================ */

export type SemanticGroupedAttributes = Record<
  string,
  {

    id?: string

    name?: string

    value?: string | number | boolean | null

    semantic_weight?: number | null

    semantic_role?: string | null

  }[]
>

/* ============================================================================
🔥 Semantic Runtime Rules
============================================================================ */

/**
 * IMPORTANT:
 *
 * Frontend semantic contracts:
 *
 * ❌ must NOT generate semantics
 * ❌ must NOT infer workflows
 * ❌ must NOT mutate semantic meaning
 * ❌ must NOT regroup semantic entities
 *
 * Allowed:
 *
 * ✅ semantic observability
 * ✅ semantic rendering
 * ✅ runtime-safe visualization
 * ✅ cinematic semantic UI
 */

/* ============================================================================
🔥 Default Export
============================================================================ */

export default SemanticRuntimeContract