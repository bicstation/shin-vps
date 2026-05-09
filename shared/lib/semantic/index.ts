// /home/maya/shin-dev/shin-vps/shared/lib/semantic/index.ts

/* =========================================
🔥 Types
========================================= */

export type {

  SemanticGroupType,

  SemanticSlug,

  ParsedSemantic,

  SemanticExplanation,

  SemanticHeroCopy,

  SemanticHeroPolicy,

  SemanticRenderConfig,

  SemanticRegistry,

  GroupedSemanticResult,

  RecommendationReason,

} from './semanticTypes'

/* =========================================
🔥 Explanation
========================================= */

export {

  resolveSemanticExplanation,

  resolveSemanticExplanations,

  resolveSemanticLabels,

} from './semanticExplanation'

/* =========================================
🔥 Labels
========================================= */

export {

  semanticLabelMap,

  resolveSemanticLabel,

} from './semanticLabelMap'

/* =========================================
🔥 Icons
========================================= */

export {

  semanticIcons,

  resolveSemanticIcon,

} from './semanticIcons'

/* =========================================
🔥 Grouping
========================================= */

export {

  parseSemanticSlug,

  groupSemanticSlugs,

} from './semanticGrouping'

/* =========================================
🔥 Hero Copy
========================================= */

export {

  semanticHeroCopy,

} from './semanticHeroCopy'

/* =========================================
🔥 Hero Policy
========================================= */

export {

  semanticHeroPolicy,

} from './semanticHeroPolicy'

/* =========================================
🔥 Render Registry
========================================= */

export {

  semanticRenderRegistry,

} from './semanticRenderRegistry'

/* =========================================
🔥 Payload Guard
========================================= */

export {

  semanticPayloadGuard,

  normalizeSemanticAttribute,

  normalizeSemanticAttributes,

  normalizeGroupedAttributes,

} from './semanticPayloadGuard'

/* =========================================
🔥 Semantic Normalizer
========================================= */

export {

  normalizeSemanticPayload,

} from './semanticNormalizer'

/* =========================================
🔥 Legacy Bridge
========================================= */

export {

  semanticLegacyBridge,

} from './semanticLegacyBridge'

/* =========================================
🔥 Schema
========================================= */

export {

  SEMANTIC_SCHEMA,

  SEMANTIC_SCHEMA_VERSION,

  isSupportedSemanticGroup,

  isSemanticRole,

  normalizeSemanticWeight,

  isValidSemanticAttribute,

  isSemanticPayload,

} from './semanticSchema'


/* =========================================
🔥 Presentation
========================================= */

export type {

  SemanticPresentation,

} from './semanticPresentation'

export {

  resolveSemanticPresentation,

  resolveSemanticPresentations,

} from './semanticPresentation'

