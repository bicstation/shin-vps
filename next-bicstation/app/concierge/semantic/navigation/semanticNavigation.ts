// /app/concierge/semantic/navigation/semanticNavigation.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticAttribute,
  SemanticGroup,
  SemanticPayload,
} from '@/app/concierge/contracts/semantic/SemanticPayload'

/* =========================================
🔥 Semantic Navigation
========================================= */

export class SemanticNavigation {

  groups: SemanticGroup[]

  constructor(payload?: SemanticPayload) {
    this.groups = []

    if (payload?.grouped_attributes) {
      for (const [groupKey, attrs] of Object.entries(
        payload.grouped_attributes
      )) {
        this.groups.push({
          key: groupKey,
          label: groupKey.toUpperCase(),
          title: groupKey,
          items: attrs,
        })
      }
    }
  }

  /* ======================================
  Get all attributes
  ====================================== */
  getAllAttributes(): SemanticAttribute[] {
    return this.groups.flatMap(g => g.items)
  }

  /* ======================================
  Find group by key
  ====================================== */
  findGroup(key: string): SemanticGroup | undefined {
    return this.groups.find(g => g.key === key)
  }

  /* ======================================
  Find attribute by slug
  ====================================== */
  findAttribute(slug: string): SemanticAttribute | undefined {
    return this.getAllAttributes().find(a => a.slug === slug)
  }
}