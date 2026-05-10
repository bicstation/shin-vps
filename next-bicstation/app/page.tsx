// /home/maya/shin-dev/shin-vps/next-bicstation/app/page.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Home Components
========================================= */

import HomeHero
  from './components/home/hero/HomeHero'

import HomeCapabilitySection
  from './components/home/capability/HomeCapabilitySection'

import HomeGuideSection
  from './components/home/guide/HomeGuideSection'

import HomeTrustSection
  from './components/home/trust/HomeTrustSection'

import HomeFinderCTA
  from './components/home/recommendation/HomeFinderCTA'

import HomeBottomCTA
  from './components/home/cta/HomeBottomCTA'

import HomeStickyCTA
  from './components/home/cta/HomeStickyCTA'

/* =========================================
🔥 Shared Cards
========================================= */

import HeroRankingCard
  from '@/shared/components/organisms/cards/HeroRankingCard'

import ProductCard
  from '@/shared/components/organisms/cards/ProductCard'

/* =========================================
🔥 Styles
========================================= */

import styles
  from './page.module.css'

/* =========================================
🔥 Dynamic
========================================= */

export const dynamic =
  'force-dynamic'

/* =========================================
🔥 Home Page
========================================= */

export default async function
HomePage() {

  // ======================================
  // Ranking API
  // ======================================

  const endpoint =

    `${process.env.INTERNAL_API_URL}/general/pc-products/ranking/score/`

  let rankingJson = null

  try {

    const response =

      await fetch(
        endpoint,
        {
          cache:
            'no-store',
        }
      )

    rankingJson =
      await response.json()

  } catch (error) {

    console.error(error)
  }

  // ======================================
  // Ranking Products
  // ======================================

  const rankingProducts =

    Array.isArray(
      rankingJson?.products
    )

      ? rankingJson.products

      : []

  // ======================================
  // Split
  // ======================================

  const heroRanking =

    rankingProducts[0]

  const subRankings =

    rankingProducts.slice(
      1,
      3
    )

  // ======================================
  // Render
  // ======================================

  return (

    <main
      className={
        styles.page
      }
    >

      {/* ================================= */}
      {/* Hero */}
      {/* ================================= */}

      <HomeHero />

      {/* ================================= */}
      {/* Capability */}
      {/* ================================= */}

      <HomeCapabilitySection />

      {/* ================================= */}
      {/* Popular Ranking */}
      {/* ================================= */}

      <section
        className={
          styles.rankingSection
        }
      >

        {/* ============================= */}
        {/* Header */}
        {/* ============================= */}

        <div
          className={
            styles.sectionHeader
          }
        >

          <div
            className={
              styles.sectionLabel
            }
          >

            POPULAR RANKING

          </div>

          <h2
            className={
              styles.sectionTitle
            }
          >

            人気ゲーミングPC

          </h2>

          <p
            className={
              styles.sectionDescription
            }
          >

            FPSゲーム・AI画像生成・
            動画編集など、
            高性能用途で人気の
            ゲーミングPCを表示しています。

          </p>

        </div>

        {/* ============================= */}
        {/* Hero Ranking */}
        {/* ============================= */}

        {heroRanking && (

          <div
            className={
              styles.heroWrap
            }
          >

            <HeroRankingCard
              product={
                heroRanking
              }
            />

          </div>

        )}

        {/* ============================= */}
        {/* Product Cards */}
        {/* ============================= */}

        <div
          className={
            styles.productGrid
          }
        >

          {subRankings.map(
            (
              product,
              index
            ) => (

              <ProductCard

                key={
                  product?.unique_id
                  || index
                }

                product={
                  product
                }

              />

            )
          )}

        </div>

      </section>

      {/* ================================= */}
      {/* Guide */}
      {/* ================================= */}

      <HomeGuideSection />

      {/* ================================= */}
      {/* Trust */}
      {/* ================================= */}

      <HomeTrustSection />

      {/* ================================= */}
      {/* Finder CTA */}
      {/* ================================= */}

      <HomeFinderCTA />

      {/* ================================= */}
      {/* Bottom CTA */}
      {/* ================================= */}

      <HomeBottomCTA />

      {/* ================================= */}
      {/* Sticky CTA */}
      {/* ================================= */}

      <HomeStickyCTA />

    </main>

  )
}