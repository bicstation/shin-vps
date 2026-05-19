// shared/lib/api/django/pc/detail/contracts.ts

/* =========================================
🔥 Semantic Attribute
========================================= */

export type SemanticAttribute = {

name?: string

slug?: string

icon?: string

color?: string

label?: string
}

/* =========================================
🔥 Semantic Runtime
========================================= */

export type SemanticRuntime = {

workflows?: string[]

workflow_tags?: string[]

semantic_graph?: any[]

semantic_score?: number

semantic_role?: string
}

/* =========================================
🔥 Adaptive Runtime
========================================= */

export type AdaptiveRuntime = {

product_type?: string

render_hints?: Record<string, any>
}

/* =========================================
🔥 PC Product
========================================= */

export type PCProduct = {

/* =====================================
Identity
===================================== */

id?: number

unique_id: string

/* =====================================
Basic
===================================== */

name?: string

maker?: string

brand?: string

product_type?: string

price?: number

image_url?: string

url?: string

/* =====================================
Specs
===================================== */

cpu?: string

gpu?: string

memory?: string

storage?: string

cpu_model?: string

gpu_model?: string

memory_gb?: number

storage_gb?: number

/* =====================================
Semantic
===================================== */

semantic_score?: number

semantic_role?: string

recommendation_reason?: string

confidence?: number

semantic_labels?: string[]

grouped_attributes?: {


usage?: SemanticAttribute[]

gpu?: SemanticAttribute[]

maker?: SemanticAttribute[]


}

/* =====================================
Runtime
===================================== */

semantic_runtime?: SemanticRuntime

adaptive_runtime?: AdaptiveRuntime

semantic_related?: any[]

render_hints?: Record<string, any>

/* =====================================
AI
===================================== */

ai_summary?: string

ai_content?: string
}

/* =========================================
🔥 Detail Response
========================================= */

export type PCDetailResponse = PCProduct
