/* eslint-disable @next/next/no-img-element */

import {
  fetchPCProductRanking,
} from '@/shared/lib/api/django/pc/stats'

import styles from './page.module.css'

import RankingHero
  from './components/RankingHero'

import RankingExplanation
  from './components/RankingExplanation'

import RankingGrid
  from './components/RankingGrid'

import RankingNavigation
  from './components/RankingNavigation'

import RankingEmpty
  from './components/RankingEmpty'

/* =========================================
🔥 ISR
========================================= */

export const revalidate = 60

/* =========================================
🔥 Types
========================================= */

type Props = {
  params: {
    type: string
  }
}

/* =========================================
🔥 Page
========================================= */

export default async function RankingPage({
  params,
}: Props) {

  // --------------------------------
  // Params
  // --------------------------------
  const {
    type,
  } = params

  // --------------------------------
  // Fetch
  // --------------------------------
  const products =
    await fetchPCProductRanking(
      type
    )

  // --------------------------------
  // Empty
  // --------------------------------
  if (
    !products?.length
  ) {
    return <RankingEmpty />
  }

  // --------------------------------
  // Split
  // --------------------------------
  const topProduct =
    products?.[0]
    || null

  const otherProducts =
    products.slice(1)

  return (
    <main
      className={
        styles.mainWrapper
      }
    >

      <RankingHero
        type={type}
        topProduct={
          topProduct
        }
      />

      <RankingExplanation
        products={products}
      />

      <RankingGrid
        products={
          otherProducts
        }
      />

      <RankingNavigation />

    </main>
  )
}