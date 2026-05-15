// /app/concierge/utils/semantic.ts

/* =========================================
🔥 SEMANTIC UTILITIES
========================================= */

import type { SemanticAttribute, SemanticRole } from '@/app/concierge/types/semantic/attribute'

/* =========================================
🔥 Semantic Role Priority
========================================= */

export const SEMANTIC_ROLE_PRIORITY: Record<SemanticRole, number> = {
  highlight: 100,
  primary: 80,
  secondary: 60,
  supportive: 40,
}

/* =========================================
🔥 Sort by Semantic Role
========================================= */

export function sortBySemanticRole<T extends { semantic_role?: SemanticRole }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const prioA = SEMANTIC_ROLE_PRIORITY[a.semantic_role || 'supportive']
    const prioB = SEMANTIC_ROLE_PRIORITY[b.semantic_role || 'supportive']
    return prioB - prioA
  })
}

/* =========================================
🔥 Sort by Semantic Weight
========================================= */

export function sortBySemanticWeight<T extends { semantic_weight?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.semantic_weight || 0) - (a.semantic_weight || 0))
}

/* =========================================
🔥 Normalize Semantic Items
========================================= */

export function normalizeSemanticItems<T extends { name?: string; slug?: string }>(items: T[]): T[] {
  return items.filter(item => !!item?.name && !!item?.slug)
}

/* =========================================
🔥 Prepare Semantic Navigation
========================================= */

export function prepareSemanticNavigation<T extends { name?: string; slug?: string; semantic_role?: SemanticRole; semantic_weight?: number; order?: number }>(items: T[]): T[] {
  return [...normalizeSemanticItems(items)].sort((a, b) => {
    // 1. explicit order
    const orderA = a.order || 0
    const orderB = b.order || 0
    if (orderA !== orderB) return orderB - orderA
    // 2. semantic role
    const roleA = SEMANTIC_ROLE_PRIORITY[a.semantic_role || 'supportive']
    const roleB = SEMANTIC_ROLE_PRIORITY[b.semantic_role || 'supportive']
    if (roleA !== roleB) return roleB - roleA
    // 3. semantic weight
    return (b.semantic_weight || 0) - (a.semantic_weight || 0)
  })
}