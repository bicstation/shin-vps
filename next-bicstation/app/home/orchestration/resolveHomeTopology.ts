// /home/maya/shin-vps/next-bicstation/app/home/orchestration/resolveHomeTopology.ts

/* ============================================================================
🔥 Types
============================================================================ */

type ResolveHomeTopologyProps = {

runtime?: any
}

/* ============================================================================
🔥 Resolve Home Topology
============================================================================ */

export function
resolveHomeTopology({

runtime,

}: ResolveHomeTopologyProps) {

// ======================================================
// Runtime
// ======================================================

const ranking =


runtime?.ranking
|| {}


const sidebar =


runtime?.sidebar
|| {}


// ======================================================
// Products
// ======================================================

const rankingProducts =


Array.isArray(
  ranking?.products
)

  ? ranking.products

  : []


const heroRanking =


rankingProducts?.[0]
|| null


// ======================================================
// Runtime Flags
// ======================================================

const hasRanking =


rankingProducts.length > 0


const hasSidebar =


!!sidebar


const hasSemanticRuntime =


!!runtime?.semantic_runtime


const hasAdaptiveRuntime =


!!runtime?.adaptive_runtime


// ======================================================
// Sections
// ======================================================

const sections = [


// ====================================================
// Hero
// ====================================================

{

  type:
    'hero',

  visible:
    true,

  priority:
    1,
},

// ====================================================
// Intent Navigation
// ====================================================

{

  type:
    'intent_navigation',

  visible:
    true,

  priority:
    2,
},

// ====================================================
// Hero Ranking
// ====================================================

{

  type:
    'hero_ranking',

  visible:
    hasRanking
    &&
    !!heroRanking,

  priority:
    3,
},

// ====================================================
// Ranking Grid
// ====================================================

{

  type:
    'ranking_grid',

  visible:
    hasRanking,

  priority:
    4,
},

// ====================================================
// Recommendation
// ====================================================

{

  type:
    'recommended_paths',

  visible:
    true,

  priority:
    5,
},

// ====================================================
// Capability
// ====================================================

{

  type:
    'capability',

  visible:
    true,

  priority:
    6,
},

// ====================================================
// Guide
// ====================================================

{

  type:
    'guide',

  visible:
    true,

  priority:
    7,
},

// ====================================================
// Trust
// ====================================================

{

  type:
    'trust',

  visible:
    true,

  priority:
    8,
},

// ====================================================
// Finder CTA
// ====================================================

{

  type:
    'finder_cta',

  visible:
    true,

  priority:
    9,
},

// ====================================================
// Bottom CTA
// ====================================================

{

  type:
    'bottom_cta',

  visible:
    true,

  priority:
    10,
},

// ====================================================
// Sticky CTA
// ====================================================

{

  type:
    'sticky_cta',

  visible:
    true,

  priority:
    11,
},


]

// ======================================================
// Visible Sections
// ======================================================

const visibleSections =


sections.filter(
  (section) =>
    section.visible
)


// ======================================================
// Ordered Sections
// ======================================================

const orderedSections =


[...visibleSections].sort(

  (
    a,
    b
  ) =>

    a.priority
    -
    b.priority

)


// ======================================================
// Topology
// ======================================================

return {


// ====================================================
// Runtime Flags
// ====================================================

hasRanking,

hasSidebar,

hasSemanticRuntime,

hasAdaptiveRuntime,

// ====================================================
// Ranking
// ====================================================

rankingProducts,

heroRanking,

// ====================================================
// Sections
// ====================================================

sections:
  orderedSections,

sectionCount:
  orderedSections.length,

// ====================================================
// Runtime Meta
// ====================================================

runtime: {

  semantic:
    hasSemanticRuntime,

  adaptive:
    hasAdaptiveRuntime,
},

// ====================================================
// Debug
// ====================================================

debug: {

  rankingProductsLength:
    rankingProducts.length,

  hasHeroRanking:
    !!heroRanking,

  topologyResolved:
    true,
},


}

}
