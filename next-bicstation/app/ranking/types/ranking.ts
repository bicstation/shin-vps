// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/types/ranking.ts
// ============================================================================

/* ============================================================================
🔥 Semantic Attribute
============================================================================ */

export type SemanticAttribute = {

  slug?: string

  name?: string

  icon?: string

  color?: string

  count?: number

  semantic_role?: string

  semantic_weight?: number

}

/* ============================================================================
🔥 Semantic Group Meta
============================================================================ */

export type SemanticGroupMeta = {

  name?: string

  short_name?: string

  description?: string

  icon?: string

  color?: string

  semantic_role?: string

  semantic_weight?: number

}

/* ============================================================================
🔥 Semantic Group Runtime
============================================================================ */

export type SemanticGroupRuntime = {

  meta?: SemanticGroupMeta

  items?: SemanticAttribute[]

}

/* ============================================================================
🔥 Semantic Grouped Attributes Runtime
============================================================================ */

export type SemanticGroupedAttributesRuntime =

  Record<
    string,
    SemanticGroupRuntime
  >

/* ============================================================================
🔥 Ranking Runtime Props
============================================================================ */

export type RankingRuntimeProps = {

  groupedAttributes:
    SemanticGroupedAttributesRuntime

  groupKeys:
    string[]

  initialGroup:
    string | null

}

/* ============================================================================
🔥 Ranking Tabs Props
============================================================================ */

export type RankingTabsProps = {

  groupedAttributes:
    SemanticGroupedAttributesRuntime

  groupKeys:
    string[]

  activeGroup:
    string | null

  onChangeGroup:
    (
      groupKey: string
    ) => void

}

/* ============================================================================
🔥 Ranking Active Header Props
============================================================================ */

export type RankingActiveHeaderProps = {

  meta?: SemanticGroupMeta

  presentation?: {

    title?: string

    subtitle?: string

    hero?: string

  }

}

/* ============================================================================
🔥 Ranking Card Props
============================================================================ */

export type RankingCardProps = {

  attr?: SemanticAttribute

  summary?: string

}

/* ============================================================================
🔥 Ranking Card Grid Props
============================================================================ */

export type RankingCardGridProps = {

  items?:
    SemanticAttribute[]

}