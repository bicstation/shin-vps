// /app/concierge/graph/edges/RecommendationEdge.ts

/* =========================================
🔥 Types
========================================= */

export type RecommendationEdgeRelation =

  | 'recommends'
  | 'matches'
  | 'related_to'
  | 'optimized_for'
  | 'depends_on'

/* =========================================
🔥 Recommendation Edge
========================================= */

export type RecommendationEdge = {

  id: string

  from: string

  to: string

  relation:
    RecommendationEdgeRelation

  weight?: number

  metadata?: Record<
    string,
    any
  >

  created_at: string
}

/* =========================================
🔥 Factory
========================================= */

export const createRecommendationEdge = ({
  from,
  to,
  relation,
  weight,
  metadata,
}: {
  from: string
  to: string

  relation:
    RecommendationEdgeRelation

  weight?: number

  metadata?: Record<
    string,
    any
  >
}): RecommendationEdge => {

  return {

    id:
      crypto.randomUUID(),

    from,

    to,

    relation,

    weight:
      weight || 1,

    metadata:
      metadata || {},

    created_at:
      new Date()
        .toISOString(),

  }
}

/* =========================================
🔥 Helpers
========================================= */

export const isRecommendationRelation = (
  edge?: RecommendationEdge
) => {

  return (
    edge?.relation
    === 'recommends'
  )
}

export const isOptimizedRelation = (
  edge?: RecommendationEdge
) => {

  return (
    edge?.relation
    === 'optimized_for'
  )
}

export const normalizeRecommendationEdge = (
  edge?: Partial<
    RecommendationEdge
  >
): RecommendationEdge => {

  return {

    id:
      edge?.id
      || crypto.randomUUID(),

    from:
      edge?.from
      || '',

    to:
      edge?.to
      || '',

    relation:
      edge?.relation
      || 'related_to',

    weight:
      edge?.weight
      || 1,

    metadata:
      edge?.metadata
      || {},

    created_at:
      edge?.created_at
      || new Date()
        .toISOString(),

  }
}

export default RecommendationEdge