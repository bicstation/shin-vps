// /app/concierge/semantic/core/semanticAuthority.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticPayload,
  SemanticAttribute,
} from '@/app/concierge/contracts/semantic/SemanticPayload'

/* =========================================
🔥 Semantic Authority
========================================= */

export class SemanticAuthority {

  payload: SemanticPayload

  constructor(payload?: SemanticPayload) {
    this.payload = payload || {
      semantic_schema_version: 1,
      attributes: [],
      grouped_attributes: {},
    }
  }

  /* ======================================
  Get all attributes
  ====================================== */
  getAttributes(): SemanticAttribute[] {
    return this.payload.attributes || []
  }

  /* ======================================
  Get grouped attributes
  ====================================== */
  getGroupedAttributes(): Record<string, SemanticAttribute[]> {
    return this.payload.grouped_attributes || {}
  }

  /* ======================================
  Find attribute by slug
  ====================================== */
  findAttribute(slug: string): SemanticAttribute | undefined {
    return this.getAttributes().find(attr => attr.slug === slug)
  }

  /* ======================================
  Add or update attribute
  ====================================== */
  upsertAttribute(attr: SemanticAttribute) {
    const idx = this.payload.attributes?.findIndex(a => a.slug === attr.slug)
    if (idx !== undefined && idx >= 0 && this.payload.attributes) {
      this.payload.attributes[idx] = attr
    } else {
      this.payload.attributes?.push(attr)
    }
  }

  /* ======================================
  Add attribute to group
  ====================================== */
  addToGroup(group: string, attr: SemanticAttribute) {
    if (!this.payload.grouped_attributes) {
      this.payload.grouped_attributes = {}
    }
    if (!this.payload.grouped_attributes[group]) {
      this.payload.grouped_attributes[group] = []
    }
    this.payload.grouped_attributes[group].push(attr)
  }
}