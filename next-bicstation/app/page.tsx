/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import {
  fetchPCProductRanking,
} from '@/shared/lib/api/django/pc/stats'

import styles
  from './page.module.css'

import HomeHero
  from './components/HomeHero'

import HomeIntentNav
  from './components/HomeIntentNav'

import HomeCompareGrid
  from './components/HomeCompareGrid'

import HomeBottomCTA
  from './components/HomeBottomCTA'

import HomeEmpty
  from './components/HomeEmpty'

export const dynamic =
  'force-dynamic'

/* =========================================
🔥 Page
========================================= */

export default async function HomePage() {

  // --------------------------------
  // Fetch
  // --------------------------------
  const products =
    await fetchPCProductRanking(
      'score'
    )

  // --------------------------------
  // Empty
  // --------------------------------
  if (
    !products?.length
  ) {
    return <HomeEmpty />
  }

  // --------------------------------
  // Split
  // --------------------------------
  const topProduct =
    products[0]

  const compareProducts =
    products.slice(1, 4)

  return (
    <main
      className={
        styles.page
      }
    >

      <HomeHero
        product={topProduct}
      />

      <HomeIntentNav />

      <HomeCompareGrid
        products={
          compareProducts
        }
      />

      <HomeBottomCTA />

    </main>
  )
}