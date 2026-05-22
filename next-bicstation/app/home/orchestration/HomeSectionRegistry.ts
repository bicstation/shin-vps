// /home/maya/shin-vps/next-bicstation/app/home/orchestration/HomeSectionRegistry.ts

/* ============================================================================
🔥 Home Section Registry
============================================================================ */

export const HomeSectionRegistry = {

hero: {
type: 'hero',
runtime: 'static',
priority: 1,
},

intent_navigation: {
type: 'intent_navigation',
runtime: 'static',
priority: 2,
},

hero_ranking: {
type: 'hero_ranking',
runtime: 'ranking',
priority: 3,
},

ranking_grid: {
type: 'ranking_grid',
runtime: 'ranking',
priority: 4,
},

recommended_paths: {
type: 'recommended_paths',
runtime: 'semantic',
priority: 5,
},

capability: {
type: 'capability',
runtime: 'semantic',
priority: 6,
},

guide: {
type: 'guide',
runtime: 'semantic',
priority: 7,
},

trust: {
type: 'trust',
runtime: 'semantic',
priority: 8,
},

finder_cta: {
type: 'finder_cta',
runtime: 'semantic',
priority: 9,
},

bottom_cta: {
type: 'bottom_cta',
runtime: 'static',
priority: 10,
},

sticky_cta: {
type: 'sticky_cta',
runtime: 'static',
priority: 11,
},

}

/* ============================================================================
🔥 Registry Utilities
============================================================================ */

export const HomeSectionList =
Object.values(
HomeSectionRegistry
)

/* ============================================================================
🔥 Resolve Home Section
============================================================================ */

export function resolveHomeSection(
type: string
) {

return Object.values(
HomeSectionRegistry
).find(
(section) =>
section.type === type
)

}

/* ============================================================================
🔥 Resolve Runtime Sections
============================================================================ */

export function resolveRuntimeSections(
runtime: string
) {

return Object.values(
HomeSectionRegistry
).filter(
(section) =>
section.runtime === runtime
)

}

/* ============================================================================
🔥 Resolve Ordered Sections
============================================================================ */

export function resolveOrderedSections() {

return [


...Object.values(
  HomeSectionRegistry
),


].sort(
(a, b) =>
a.priority - b.priority
)

}
