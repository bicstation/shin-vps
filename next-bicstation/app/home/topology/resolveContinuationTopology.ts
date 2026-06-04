// /home/maya/shin-vps/next-bicstation/app/home/topology/resolveContinuationTopology.ts

/* ============================================================================
🔥 Types
============================================================================ */

type ResolveContinuationTopologyProps = {

runtime?: any

continuation?: any

related?: any[]

workflow?: any
}

/* ============================================================================
🔥 Resolve Continuation Topology
============================================================================ */

export function
resolveContinuationTopology({

runtime,

continuation,

related = [],

workflow,

}: ResolveContinuationTopologyProps) {

// ======================================================
// Related Products
// ======================================================

const relatedProducts =


Array.isArray(
  related
)

  ? related

  : []


// ======================================================
// Runtime Flags
// ======================================================

const hasContinuation =


!!continuation


const hasRelatedProducts =


relatedProducts.length > 0


const hasWorkflow =


!!workflow


const hasSemanticRuntime =


!!runtime?.semantic_runtime


// ======================================================
// Continuation Sections
// ======================================================

const sections = [


// ====================================================
// Continuation Hero
// ====================================================

{

  type:
    'continuation_hero',

  visible:
    hasContinuation,

  priority:
    1,
},

// ====================================================
// Related Products
// ====================================================

{

  type:
    'related_products',

  visible:
    hasRelatedProducts,

  priority:
    2,
},

// ====================================================
// Workflow Suggestions
// ====================================================

{

  type:
    'workflow_suggestions',

  visible:
    hasWorkflow,

  priority:
    3,
},

// ====================================================
// Semantic Continuation
// ====================================================

{

  type:
    'semantic_continuation',

  visible:
    hasSemanticRuntime,

  priority:
    4,
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
// Traversal Edges
// ======================================================

const traversalEdges =


relatedProducts.map(

  (
    product,
    index
  ) => ({

    source:
      runtime?.product?.unique_id
      || 'current',

    target:
      product?.unique_id
      || `related_${index}`,

    edge_type:
      'semantic_related',

    workflow_relation:

      product?.workflow_relation
      || null,

    similarity_score:

      product?.similarity_score
      || null,

    matched_attributes:

      product?.matched_attributes
      || [],

    continuity_hint:

      product?.continuity_hint
      || null,
  })

)


// ======================================================
// Continuation Summary
// ======================================================

const summary = {


hasContinuation,

hasRelatedProducts,

hasWorkflow,

hasSemanticRuntime,

relatedProductsCount:
  relatedProducts.length,

traversalEdgesCount:
  traversalEdges.length,

visibleSections:
  orderedSections.length,


}

// ======================================================
// Return
// ======================================================

return {


sections:
  orderedSections,

traversalEdges,

summary,

runtime: {

  semantic:
    hasSemanticRuntime,

  continuation:
    hasContinuation,

  workflow:
    hasWorkflow,
},


}

}
