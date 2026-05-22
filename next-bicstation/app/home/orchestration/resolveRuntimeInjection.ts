// /home/maya/shin-vps/next-bicstation/app/home/orchestration/resolveRuntimeInjection.ts

/* ============================================================================
🔥 Types
============================================================================ */

type ResolveRuntimeInjectionProps = {
runtime?: any
topology?: any
}

/* ============================================================================
🔥 Resolve Runtime Injection
============================================================================ */

export function resolveRuntimeInjection({
runtime,
topology,
}: ResolveRuntimeInjectionProps) {

// ======================================================
// Runtime
// ======================================================

const ranking =
runtime?.ranking || {}

const sidebar =
runtime?.sidebar || {}

// ======================================================
// Ranking
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
// Sections
// ======================================================

const sections =


Array.isArray(
  topology?.sections
)

  ? topology.sections

  : []


// ======================================================
// Safe Runtime Payload
// ======================================================

const safeRuntimePayload = {


semantic_runtime:
  runtime?.semantic_runtime,

adaptive_runtime:
  runtime?.adaptive_runtime,

semantic_labels:
  runtime?.semantic_labels,

runtime_profile:
  runtime?.runtime_profile,


}

// ======================================================
// Safe Sidebar Payload
// ======================================================

const safeSidebarPayload = {


cpu:

  Array.isArray(
    sidebar?.cpu
  )

    ? sidebar.cpu.length

    : 0,

gpu:

  Array.isArray(
    sidebar?.gpu
  )

    ? sidebar.gpu.length

    : 0,

usage:

  Array.isArray(
    sidebar?.usage
  )

    ? sidebar.usage.length

    : 0,


}

// ======================================================
// Injection Map
// ======================================================

const injectionMap = {


hero: {

  enabled:
    true,

  payload:
    safeRuntimePayload,
},

intent_navigation: {

  enabled:
    true,

  payload:
    safeRuntimePayload,
},

hero_ranking: {

  enabled:
    !!heroRanking,

  payload:
    heroRanking,
},

ranking_grid: {

  enabled:
    rankingProducts.length > 0,

  payload:
    rankingProducts,
},

recommended_paths: {

  enabled:
    true,

  payload:
    safeRuntimePayload,
},

capability: {

  enabled:
    true,

  payload:
    safeRuntimePayload,
},

guide: {

  enabled:
    true,

  payload:
    safeRuntimePayload,
},

trust: {

  enabled:
    true,

  payload:
    safeRuntimePayload,
},

finder_cta: {

  enabled:
    true,

  payload:
    safeRuntimePayload,
},

bottom_cta: {

  enabled:
    true,

  payload:
    safeRuntimePayload,
},

sticky_cta: {

  enabled:
    true,

  payload:
    safeRuntimePayload,
},

sidebar: {

  enabled:
    !!sidebar,

  payload:
    safeSidebarPayload,
},


}

// ======================================================
// Active Injections
// ======================================================

const activeInjections =


Object.entries(
  injectionMap
).filter(

  ([, value]) =>

    value.enabled

)


// ======================================================
// Summary
// ======================================================

const summary = {


totalSections:
  sections.length,

totalInjections:
  activeInjections.length,

rankingInjected:
  rankingProducts.length > 0,

heroInjected:
  !!heroRanking,

sidebarInjected:
  !!sidebar,

semanticRuntimeInjected:
  !!runtime?.semantic_runtime,

adaptiveRuntimeInjected:
  !!runtime?.adaptive_runtime,


}

// ======================================================
// Return
// ======================================================

return {


injectionMap,

activeInjections,

summary,


}

}
