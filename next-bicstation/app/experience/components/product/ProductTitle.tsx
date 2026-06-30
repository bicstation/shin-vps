// ============================================================================
// FILE:
// /app/experience/components/product/ProductTitle.tsx
// ============================================================================

'use client'

/* ============================================================================
Props
============================================================================ */

type Props = {

    title?: string | null

    className?: string

}

/* ============================================================================
Experience Component

Product Title

Represents the primary identity of a Runtime product.

Responsibilities

- Present the product title
- Support product recognition
- Maintain a consistent title experience across Discovery

Validated Experiences

□ Discover
□ Catalog
□ Finder
□ Ranking

This component does NOT

- Generate Runtime
- Generate Semantic Meaning
- Interpret Semantic Reality

============================================================================ */

export default function ProductTitle({

    title,

    className,

}: Props) {

    return (

        <h3
            className={className}
        >

            {

                title ||

                'Unknown Product'

            }

        </h3>

    )

}