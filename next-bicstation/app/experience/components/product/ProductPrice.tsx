// ============================================================================
// FILE:
// /app/experience/components/product/ProductPrice.tsx
// ============================================================================

'use client'

/* ============================================================================
Props
============================================================================ */

type Props = {

    price?: number | null

    className?: string

    currency?: string

}

/* ============================================================================
Experience Component

Product Price

Represents the displayed price of a Runtime product.

Responsibilities

- Present the product price
- Support purchase comparison
- Maintain a consistent price experience

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

export default function ProductPrice({

    price,

    className,

    currency = '¥',

}: Props) {

    if (

        typeof price !== 'number'

    ) {

        return null

    }

    return (

        <p
            className={className}
        >

            {currency}

            {price.toLocaleString()}

        </p>

    )

}