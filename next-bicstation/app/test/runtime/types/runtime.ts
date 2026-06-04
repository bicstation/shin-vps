// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/types/runtime.ts
// ============================================================================

/* ============================================================================
🔥 Runtime Mode
============================================================================ */

export type RuntimeMode =

| 'detail'
| 'related'
| 'ranking'
| 'sidebar'
| 'discovery'
| 'finder'

/* ============================================================================
🔥 Runtime Status
============================================================================ */

export type RuntimeStatus =

| 'idle'
| 'loading'
| 'success'
| 'warning'
| 'error'

/* ============================================================================
🔥 Runtime Transport
============================================================================ */

export type RuntimeTransport = {

success: boolean

endpoint: string

runtime_role: string

transport_layer: string

payload_size: number

latency: number

timestamp: string

payload: any

error?: string
}

/* ============================================================================
🔥 Runtime Inspector State
============================================================================ */

export type RuntimeInspectorState = {

mode: RuntimeMode

status: RuntimeStatus

runtime_role?: string

observatory?: string

endpoint?: string

transport?: RuntimeTransport

normalized_payload?: NormalizedRuntimePayload
}

/* ============================================================================
🔥 Semantic Runtime Payload
============================================================================ */

export type SemanticRuntimePayload = {

semantic_runtime?: any

adaptive_runtime?: any

semantic_related?: any[]

semantic_labels?: any[]

grouped_attributes?: any

workflow_tags?: string[]

semantic_graph?: SemanticGraph

semantic_schema_version?: number
}

/* ============================================================================
🔥 Normalized Runtime Payload
============================================================================ */

export type NormalizedRuntimePayload = {

success: boolean

runtime_role: string

semantic_schema_version: number

payload_size: number

has_semantic_runtime: boolean

has_adaptive_runtime: boolean

has_semantic_related: boolean

has_semantic_labels: boolean

has_grouped_attributes: boolean

has_semantic_graph: boolean

semantic_runtime?: any

adaptive_runtime?: any

semantic_related?: any[]

semantic_labels?: any[]

grouped_attributes?: any

workflow_tags?: string[]

semantic_graph?: SemanticGraph

raw_payload?: any
}

/* ============================================================================
🔥 Semantic Graph
============================================================================ */

export type SemanticGraph = {

nodes?: SemanticGraphNode[]

edges?: SemanticGraphEdge[]
}

/* ============================================================================
🔥 Semantic Graph Node
============================================================================ */

export type SemanticGraphNode = {

id?: string

label?: string

role?: string

semantic_score?: number
}

/* ============================================================================
🔥 Semantic Graph Edge
============================================================================ */

export type SemanticGraphEdge = {

source?: string

target?: string

edge_type?: string

workflow_relation?: string

similarity_score?: number

continuity_hint?: string

matched_attributes?: string[]
}

/* ============================================================================
🔥 Runtime Topology
============================================================================ */

export type RuntimeTopology = {

nodes?: RuntimeTopologyNode[]

connections?: RuntimeTopologyConnection[]
}

/* ============================================================================
🔥 Runtime Topology Node
============================================================================ */

export type RuntimeTopologyNode = {

id?: string

label?: string

runtime_type?: string

status?: string
}

/* ============================================================================
🔥 Runtime Topology Connection
============================================================================ */

export type RuntimeTopologyConnection = {

source?: string

target?: string

relation?: string

continuity?: string
}

/* ============================================================================
🔥 Runtime Orchestration Step
============================================================================ */

export type RuntimeOrchestrationStep = {

id?: string

title?: string

description?: string

status?: RuntimeStatus

duration?: number
}

/* ============================================================================
🔥 Traversal Edge
============================================================================ */

export type TraversalEdge = {

source?: string

target?: string

edge_type?: string

workflow_relation?: string

similarity_score?: number

continuity_hint?: string

matched_attributes?: string[]
}

/* ============================================================================
🔥 Continuation Node
============================================================================ */

export type ContinuationNode = {

unique_id?: string

name?: string

edge_type?: string

workflow_relation?: string

continuity_hint?: string

similarity_score?: number

matched_attributes?: string[]
}

/* ============================================================================
🔥 Runtime Request
============================================================================ */

export type RuntimeRequest = {

endpoint?: string

method?: string

status?: number

transport_role?: string

latency?: number

payload_size?: number

success?: boolean

timestamp?: string
}

/* ============================================================================
🔥 Runtime Observatory Metadata
============================================================================ */

export type RuntimeObservatoryMetadata = {

runtime_role?: string

observatory?: string

semantic_schema_version?: number

transport_layer?: string

topology_role?: string

traversal_role?: string
}
