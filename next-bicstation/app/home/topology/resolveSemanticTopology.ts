// /home/maya/shin-vps/next-bicstation/app/home/topology/resolveSemanticTopology.ts

/* ============================================================================
🔥 Types
============================================================================ */

type ResolveSemanticTopologyProps = {

runtime?: any

semantic?: any

groupedAttributes?: any

semanticGraph?: any

workflowTags?: any[]
}

/* ============================================================================
🔥 Resolve Semantic Topology
============================================================================ */

export function
resolveSemanticTopology({

runtime,

semantic,

groupedAttributes,

semanticGraph,

workflowTags = [],

}: ResolveSemanticTopologyProps) {

// ======================================================
// Runtime Flags
// ======================================================

const hasSemanticRuntime =


!!runtime?.semantic_runtime


const hasAdaptiveRuntime =


!!runtime?.adaptive_runtime


const hasSemanticGraph =


!!semanticGraph


const hasGroupedAttributes =


!!groupedAttributes


const hasWorkflowTags =


Array.isArray(
  workflowTags
)

  ? workflowTags.length > 0

  : false


// ======================================================
// Semantic Labels
// ======================================================

const semanticLabels =


Array.isArray(
  runtime?.semantic_labels
)

  ? runtime.semantic_labels

  : []


// ======================================================
// Sections
// ======================================================

const sections = [


// ====================================================
// Semantic Hero
// ====================================================

{

  type:
    'semantic_hero',

  visible:
    hasSemanticRuntime,

  priority:
    1,
},

// ====================================================
// Semantic Labels
// ====================================================

{

  type:
    'semantic_labels',

  visible:
    semanticLabels.length > 0,

  priority:
    2,
},

// ====================================================
// Grouped Attributes
// ====================================================

{

  type:
    'grouped_attributes',

  visible:
    hasGroupedAttributes,

  priority:
    3,
},

// ====================================================
// Semantic Graph
// ====================================================

{

  type:
    'semantic_graph',

  visible:
    hasSemanticGraph,

  priority:
    4,
},

// ====================================================
// Workflow Tags
// ====================================================

{

  type:
    'workflow_tags',

  visible:
    hasWorkflowTags,

  priority:
    5,
},

// ====================================================
// Adaptive Runtime
// ====================================================

{

  type:
    'adaptive_runtime',

  visible:
    hasAdaptiveRuntime,

  priority:
    6,
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
// Semantic Connections
// ======================================================

const semanticConnections =


semanticLabels.map(

  (
    label,
    index
  ) => ({

    id:
      `semantic_connection_${index}`,

    source:
      label,

    target:
      semanticGraph?.[
        label
      ]
      || null,

    relation:
      'semantic_association',
  })

)


// ======================================================
// Semantic Summary
// ======================================================

const summary = {


hasSemanticRuntime,

hasAdaptiveRuntime,

hasSemanticGraph,

hasGroupedAttributes,

hasWorkflowTags,

semanticLabelsCount:
  semanticLabels.length,

visibleSections:
  orderedSections.length,

semanticConnections:
  semanticConnections.length,


}

// ======================================================
// Return
// ======================================================

return {


sections:
  orderedSections,

semanticLabels,

semanticConnections,

groupedAttributes,

semanticGraph,

workflowTags,

summary,

runtime: {

  semantic:
    hasSemanticRuntime,

  adaptive:
    hasAdaptiveRuntime,
},

semantic:
  semantic || {},


}

}
