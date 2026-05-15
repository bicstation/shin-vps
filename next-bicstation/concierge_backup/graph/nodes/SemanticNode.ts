// /app/concierge/graph/nodes/SemanticNode.ts

/* =========================================
🔥 Semantic Node Type
========================================= */

export type SemanticNodeType =

  | 'usage'
  | 'gpu'
  | 'budget'
  | 'memory'
  | 'storage'
  | 'ai'
  | 'workload'
  | 'semantic'
  | 'intent'

/* =========================================
🔥 Semantic Node
========================================= */

export type SemanticNode = {

  id: string

  type:
    SemanticNodeType

  label: string

  value?: any

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

export const createSemanticNode = ({
  id,
  type,
  label,
  value,
  weight,
  metadata,
}: {
  id?: string

  type:
    SemanticNodeType

  label: string

  value?: any

  weight?: number

  metadata?: Record<
    string,
    any
  >
}): SemanticNode => {

  return {

    id:
      id
      || crypto.randomUUID(),

    type,

    label,

    value,

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

export const normalizeSemanticNode = (
  node?: Partial<
    SemanticNode
  >
): SemanticNode => {

  return {

    id:
      node?.id
      || crypto.randomUUID(),

    type:
      node?.type
      || 'semantic',

    label:
      node?.label
      || 'unknown_semantic',

    value:
      node?.value,

    weight:
      node?.weight
      || 1,

    metadata:
      node?.metadata
      || {},

    created_at:
      node?.created_at
      || new Date()
        .toISOString(),

  }
}

export const isIntentNode = (
  node?: SemanticNode
) => {

  return (
    node?.type
    === 'intent'
  )
}

export const isUsageNode = (
  node?: SemanticNode
) => {

  return (
    node?.type
    === 'usage'
  )
}

export const isGPUNode = (
  node?: SemanticNode
) => {

  return (
    node?.type
    === 'gpu'
  )
}

export default SemanticNode