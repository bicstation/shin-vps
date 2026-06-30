// ============================================================================
// FILE:
// /app/experience/components/product/ProductMaker.tsx
// ============================================================================

'use client'

/* ============================================================================
Props
============================================================================ */

type Props = {

    maker?: string | null

    className?: string

}

/* ============================================================================
Experience Component

Product Maker

Represents the manufacturer of a Runtime product.

Responsibilities

- Present the product manufacturer
- Support product recognition
- Maintain a consistent manufacturer experience

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

export default function ProductMaker({

    maker,

    className,

}: Props) {

    if (

        !maker

    ) {

        return null

    }

    return (

        <p
            className={className}
        >

            {maker}

        </p>

    )

}