export interface FinderRuntimeContract {

    // =========================
    // STATUS
    // =========================
    success?: boolean

    // =========================
    // MEANING LAYER
    // =========================
    meaning?: {
        identity?: string
        mission?: string
        user_intent?: string
        meaning_statement?: string
        existence_reason?: string
    }

    // =========================
    // PRESENTATION LAYER
    // =========================
    presentation?: {
        title?: string
        subtitle?: string
        description?: string
    }

    // =========================
    // SEO LAYER
    // =========================
    seo?: {
        title?: string
        description?: string
        keywords?: string[]
        canonical?: string
        schema_jsonld?: any
    }

    // =========================
    // QUERY LAYER（重要：ここが拡張ポイント）
    // =========================
    data: {

        query: {
            selected_groups: string[]
            selected_attributes: string[]
            filters: string[]
            max_price?: number | null

            // 🔥 将来拡張領域（破壊しない設計）
            [key: string]: any
        }

        summary: {
            group_count: number
            attribute_count: number
            filter_count: number
            result_count: number
            has_result: boolean
        }

        products: FinderProductContract[]
    }

    // =========================
    // AUTHORITY
    // =========================
    semantic_schema_version?: number
    authority_version?: string
    semantic_authority?: string
    ready?: boolean

    // =========================
    // RAW BACKUP（絶対保持）
    // =========================
    raw?: any
}

/* ============================================================================
🔥 Finder Product Contract
============================================================================ */

export interface FinderProductContract {

    score: number

    product_id: number

    unique_id: string

    name: string

    maker: string

    price: number

    image_url: string

    semantic_attributes: string[]

    matched_groups: string[]

    reality_scores?: Record<string, number>

    product_type?: string

    primary_workflow?: string | null

    workflow_score?: number

    semantic_score?: number

    workflow_tags?: string[]

    workflows?: any[]

    semantic_labels?: string[]

    adaptive_runtime?: Record<string, any>

    semantic_version?: string

    semantic_authority?: string

    runtime_valid?: boolean

}

/* ============================================================================
🔥 Finder Request
============================================================================ */

export interface FinderRequest {

    groups?: string[]

    attributes?: string[]

    max_price?: number | null

    [key: string]: any

}