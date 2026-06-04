// /home/maya/shin-vps/next-bicstation/app/components/home/hooks/useHomeRanking.ts

'use client'

import { useMemo }
  from 'react'

type Product = {
  id?: number
  name?: string
  slug?: string
  price?: number
  score?: number
  image_url?: string
  [key: string]: any
}

type Params = {
  products?: Product[]
}

export function useHomeRanking({
  products = [],
}: Params) {

  /* ========================================================
  🔥 TOP PICK
  ======================================================== */

  const topPick = useMemo(() => {

    if (!products.length) {
      return null
    }

    return products[0]

  }, [products])

  /* ========================================================
  🔥 FEATURED PRODUCTS
  ======================================================== */

  const featuredProducts = useMemo(() => {

    if (!products.length) {
      return []
    }

    return products.slice(0, 6)

  }, [products])

  /* ========================================================
  🔥 HIGH SCORE PRODUCTS
  ======================================================== */

  const highScoreProducts = useMemo(() => {

    if (!products.length) {
      return []
    }

    return [...products]
      .sort(
        (
          a,
          b,
        ) => (
          (b.score || 0)
          - (a.score || 0)
        ),
      )
      .slice(0, 5)

  }, [products])

  return {
    topPick,
    featuredProducts,
    highScoreProducts,
  }
}