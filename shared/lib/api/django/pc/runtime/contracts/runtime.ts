/**
 * SHIN CORE LINX
 * Semantic Runtime Contracts
 *
 * Canonical runtime transport contracts.
 *
 * IMPORTANT:
 * Frontend does NOT generate semantic meaning.
 * Backend remains the semantic authority.
 */

/**
 * Canonical runtime fetch result.
 *
 * Used across:
 * - transport
 * - traversal
 * - orchestration
 * - render
 */
export interface RuntimeResponse<T> {
  success: boolean
  data: T | null

  /**
   * Optional runtime error.
   */
  error?: string

  /**
   * Optional HTTP status.
   */
  status?: number
}

/**
 * Canonical shallow semantic entity.
 *
 * IMPORTANT:
 * This is intentionally lightweight.
 *
 * Recursive semantic expansion is prohibited.
 */
export interface SemanticEntity {
  id: number

  unique_id?: string

  name?: string

  image_url?: string

  semantic_labels?: string[]
}

/**
 * Traversal-safe continuation edge.
 */
export interface ContinuationEdge {
  edge_type: string

  workflow_relation?: string

  similarity_score?: number

  matched_attributes?: string[]

  continuity_hint?: string
}

/**
 * Lightweight traversal node.
 *
 * IMPORTANT:
 * No recursive semantic graph nesting.
 */
export interface TraversalNode {
  entity: SemanticEntity

  edge?: ContinuationEdge
}