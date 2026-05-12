// /app/concierge/semantic/core/semanticResolver.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticAttribute,
  SemanticPayload,
} from '../../contracts/semantic/SemanticPayload'

/* =========================================
🔥 Semantic Resolver
========================================= */

export class SemanticResolver {

  payload: SemanticPayload

  constructor(payload?: SemanticPayload) {
    this.payload = payload || {
      semantic_schema_version: 1,
      attributes: [],
      grouped_attributes: {},
    }
  }

  /* ======================================
  Get attribute by slug
  ====================================== */
  getAttribute(slug: string): SemanticAttribute | undefined {
    return this.payload.attributes?.find(attr => attr.slug === slug)
  }

  /* ======================================
  Get attributes by group
  ====================================== */
  getGroup(group: string): SemanticAttribute[] {
    return this.payload.grouped_attributes?.[group] || []
  }

  /* ======================================
  Filter attributes by type
  ====================================== */
  filterByType(type: string): SemanticAttribute[] {
    return this.payload.attributes?.filter(attr => attr.attr_type === type) || []
  }

  /* ======================================
  Map attribute names
  ====================================== */
  getAttributeNames(): string[] {
    return this.payload.attributes?.map(attr => attr.name) || []
  }
}