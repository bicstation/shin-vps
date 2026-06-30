// ============================================================================
// FILE:
// /app/experience/components/product/ProductImage.tsx
// ============================================================================

'use client'

/* ============================================================================
Next
============================================================================ */

import Image from 'next/image'

/* ============================================================================
Props
============================================================================ */

type Props = {

    src?: string | null

    alt: string

    width?: number

    height?: number

    className?: string

    fallback?: string

}

/* ============================================================================
Experience Component

Product Image

Responsibilities

- Present the visual identity of a product
- Support recognition across the Discovery Journey
- Provide a consistent product image experience

Validated Experiences

✓ Discover
✓ Catalog
✓ Finder
✓ Ranking

This component does NOT

- Generate Runtime
- Generate Semantic Meaning
- Interpret Semantic Reality

============================================================================ */

export default function ProductImage({

    src,

    alt,

    width = 260,

    height = 260,

    className,

    fallback = '/images/no-image.png',

}: Props) {

    return (

        <Image

            src={

                src ||

                fallback

            }

            alt={alt}

            width={width}

            height={height}

            className={className}

            unoptimized

        />

    )

}