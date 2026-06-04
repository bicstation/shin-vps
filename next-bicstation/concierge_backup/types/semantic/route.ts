// /app/concierge/types/semantic/route.ts

/* =========================================
🔥 SEMANTIC ROUTE TYPES
========================================= */

export type SemanticRouteSegment = {
  key: string
  value: string
}

export type SemanticRoute = {
  path: string
  segments: SemanticRouteSegment[]
}