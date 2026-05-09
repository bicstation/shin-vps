// Semantic Grouping for Attributes
// /home/maya/shin-dev/shin-vps/shared/lib/semantic/semanticGrouping.ts

/* =========================================
🔥 Types
========================================= */

export type SemanticGroupType =

  | 'device'
  | 'product_type'
  | 'usage'
  | 'maker'
  | 'gpu'
  | 'cpu'
  | 'memory'
  | 'storage'
  | 'pc_feature'
  | 'unknown'

export type ParsedSemantic = {
  slug: string
  group: SemanticGroupType
  value: string
}

/* =========================================
🔥 Parse Single Semantic
========================================= */

export function
parseSemanticSlug(
  slug: string
): ParsedSemantic {

  // ======================================
  // Guard
  // ======================================

  if (!slug) {

    return {
      slug: '',
      group: 'unknown',
      value: '',
    }
  }

  // ======================================
  // Split
  // ======================================

  const [
    rawGroup,
    ...rest
  ] = slug.split('-')

  const value =
    rest.join('-')

  // ======================================
  // Allowed Groups
  // ======================================

  const allowedGroups:
    SemanticGroupType[] = [
      'device',
      'product_type',
      'usage',
      'maker',
      'gpu',
      'cpu',
      'memory',
      'storage',
      'pc_feature',
    ]

  // ======================================
  // Group Check
  // ======================================

  const isAllowedGroup =

    allowedGroups.includes(
      rawGroup as SemanticGroupType
    )

  // ======================================
  // Group Resolve
  // ======================================

  let group:
    SemanticGroupType =
      'unknown'

  if (isAllowedGroup) {
    group = rawGroup as SemanticGroupType
  }

  // ======================================
  // Return
  // ======================================

  return {
    slug,
    group,
    value,
  }
}

/* =========================================
🔥 Group Multiple Semantics
========================================= */

export function
groupSemanticSlugs(
  slugs: string[]
): Record<
  SemanticGroupType,
  ParsedSemantic[]
> {

  // ======================================
  // Initial
  // ======================================

  const grouped: Record<
    SemanticGroupType,
    ParsedSemantic[]
  > = {
    device: [],
    product_type: [],
    usage: [],
    maker: [],
    gpu: [],
    cpu: [],
    memory: [],
    storage: [],
    pc_feature: [],
    unknown: [],
  }

  // ======================================
  // Empty
  // ======================================

  if (!slugs?.length) {
    return grouped
  }

  // ======================================
  // Parse
  // ======================================

  slugs.forEach(
    (slug) => {
      const parsed =
        parseSemanticSlug(
          slug
        )
      grouped[parsed.group].push(parsed)
    }
  )

  // ======================================
  // Return
  // ======================================

  return grouped
}