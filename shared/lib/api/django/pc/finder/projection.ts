// ============================================================================
// Finder Projection V2
// ============================================================================

import type {
    FinderRuntimeContract,
    FinderProductContract
} from './contracts'

/* ============================================================================
🔥 Projection Entry
============================================================================ */

export interface FinderProjectedRuntime {

    header: {
        title: string
        subtitle: string
        description: string
    }

    stats: {
        result_count: number
        group_count: number
        has_result: boolean
    }

    filters: {
        groups: string[]
        max_price: number | null
    }

    products: ProjectedProduct[]
}

/* ============================================================================
🔥 Projected Product (UI専用)
============================================================================ */

export interface ProjectedProduct {

    id: number
    name: string
    maker: string
    price: number
    image: string

    badges: string[]
    tags: string[]

    score: number

    highlight?: {
        primary?: string
        secondary?: string
    }

    ui_state: {
        emphasis: 'high' | 'medium' | 'low'
        variant: 'ai' | 'gaming' | 'business' | 'creator' | 'general'
    }
}

/* ============================================================================
🔥 Main Projection
============================================================================ */

export function projectFinderRuntime(
    runtime: FinderRuntimeContract
): FinderProjectedRuntime {

    const products = runtime.data?.products ?? []

    return {

        /* =========================
        HEADER
        ========================= */
        header: {
            title: runtime.presentation?.title ?? 'Finder',
            subtitle: runtime.presentation?.subtitle ?? '',
            description: runtime.presentation?.description ?? '',
        },

        /* =========================
        STATS
        ========================= */
        stats: {
            result_count: runtime.data?.summary?.result_count ?? 0,
            group_count: runtime.data?.summary?.group_count ?? 0,
            has_result: runtime.data?.summary?.has_result ?? false,
        },

        /* =========================
        FILTER STATE
        ========================= */
        filters: {
            groups: runtime.data?.query?.selected_groups ?? [],
            max_price: runtime.data?.query?.max_price ?? null,
        },

        /* =========================
        PRODUCTS
        ========================= */
        products: products.map(projectProduct)
    }
}

/* ============================================================================
🔥 Product Projection
============================================================================ */

function projectProduct(
    p: FinderProductContract
): ProjectedProduct {

    /* --------------------------------
    UI Variant判定（軽い分類のみOK）
    -------------------------------- */
    const variant =
        p.semantic_attributes?.includes('usage-ai')
            ? 'ai'
            : p.semantic_attributes?.includes('usage-gaming')
                ? 'gaming'
                : p.semantic_attributes?.includes('usage-business')
                    ? 'business'
                    : p.semantic_attributes?.includes('usage-creator')
                        ? 'creator'
                        : 'general'


    /* --------------------------------
    Emphasis（表示強度）
    -------------------------------- */
    const semanticScore = p.semantic_score ?? 0

    const emphasis =
        semanticScore >= 90
            ? 'high'
            : semanticScore >= 70
                ? 'medium'
                : 'low'

    /* --------------------------------
    Badges（UI装飾のみ）
    -------------------------------- */
    const badges: string[] = []

    if (p.semantic_attributes?.includes('gpu-rtx-5080')) {
        badges.push('High-End GPU')
    }

    if (p.semantic_attributes?.includes('cpu-ai')) {
        badges.push('AI Ready')
    }

    if (p.semantic_attributes?.includes('ssd-2tb-plus')) {
        badges.push('Large Storage')
    }

    /* --------------------------------
    Tags（軽量メタ）
    -------------------------------- */
    const tags = [
        ...(p.workflow_tags ?? []),
        ...(p.semantic_labels ?? []).slice(0, 2)
    ]

    return {
        id: p.product_id,
        name: p.name,
        maker: p.maker,
        price: p.price,
        image: p.image_url,

        badges,
        tags,

        score: p.semantic_score ?? 0,

        highlight: {
            primary: p.semantic_labels?.[0],
            secondary: p.semantic_labels?.[1],
        },

        ui_state: {
            emphasis,
            variant,
        }
    }
}