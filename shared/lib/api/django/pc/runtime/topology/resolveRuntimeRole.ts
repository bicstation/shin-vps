/**
 * SHIN CORE LINX
 * Runtime Topology
 *
 * resolveRuntimeRole.ts
 *
 * Responsibilities:
 * - runtime role resolution
 * - exploration topology mapping
 * - traversal-safe runtime meaning
 *
 * IMPORTANT:
 * URL is NOT just routing.
 * URL becomes exploration topology.
 */

/**
 * Canonical runtime roles.
 */
export type RuntimeRole =
  | 'discovery'
  | 'workflow'
  | 'product'
  | 'continuation'
  | 'finder'
  | 'ranking'
  | 'graph'
  | 'unknown'

/**
 * Resolve runtime role from pathname.
 *
 * IMPORTANT:
 * This layer intentionally avoids:
 * - semantic inference
 * - graph mutation
 * - workflow guessing
 *
 * Backend remains semantic authority.
 */
export function resolveRuntimeRole(
  pathname: string,
): RuntimeRole {
  if (!pathname) {
    return 'unknown'
  }

  /**
   * Discovery world entrance.
   */
  if (
    pathname.startsWith('/discover')
  ) {
    return 'discovery'
  }

  /**
   * Semantic entity runtime.
   */
  if (
    pathname.startsWith('/product/')
  ) {
    return 'product'
  }

  /**
   * Continuation traversal runtime.
   */
  if (
    pathname.includes('/related')
  ) {
    return 'continuation'
  }

  /**
   * Intent routing runtime.
   */
  if (
    pathname.startsWith('/finder')
  ) {
    return 'finder'
  }

  /**
   * Ranking runtime.
   */
  if (
    pathname.includes('/ranking')
  ) {
    return 'ranking'
  }

  /**
   * Explicit graph traversal runtime.
   */
  if (
    pathname.includes('/graph')
  ) {
    return 'graph'
  }

  return 'unknown'
}