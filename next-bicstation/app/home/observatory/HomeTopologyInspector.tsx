// /home/maya/shin-vps/next-bicstation/app/home/orchestration/HomeRuntimeOrchestrator.tsx

/* ============================================================================
🔥 Components
============================================================================ */

import HomeHero
from '../hero/HomeHero'

import HomeCapabilitySection
from '../capability/HomeCapabilitySection'

import HomeGuideSection
from '../guide/HomeGuideSection'

import HomeTrustSection
from '../trust/HomeTrustSection'

import HomeFinderCTA
from '../recommendation/HomeFinderCTA'

import HomeIntentNav
from '../recommendation/HomeIntentNav'

import HomeRecommendedPaths
from '../recommendation/HomeRecommendedPaths'

import HomeBottomCTA
from '../cta/HomeBottomCTA'

import HomeStickyCTA
from '../cta/HomeStickyCTA'

import HomeEmpty
from '../common/HomeEmpty'

/* ============================================================================
🔥 Cards
============================================================================ */

import ProductCard
from '@/shared/components/organisms/cards/ProductCard'

import HeroRankingCard
from '@/shared/components/organisms/cards/HeroRankingCard'

/* ============================================================================
🔥 Runtime
============================================================================ */

import {
resolveHomeTopology,
} from '../orchestration/resolveHomeTopology'

import {
resolveRuntimeInjection,
} from '../orchestration/resolveRuntimeInjection'

import {
resolveRuntimeVisibility,
} from '../orchestration/resolveRuntimeVisibility'

/* ============================================================================
🔥 Types
============================================================================ */

type Props = {
runtime?: any
}

/* ============================================================================
🔥 Home Runtime Orchestrator
============================================================================ */

export default function HomeRuntimeOrchestrator({
runtime,
}: Props) {

// ======================================================
// Safe Runtime
// ======================================================

const safeRuntime =
runtime || {}

// ======================================================
// Resolve Topology
// ======================================================

const topology =
resolveHomeTopology({
runtime: safeRuntime,
})

// ======================================================
// Resolve Injection
// ======================================================

resolveRuntimeInjection({
runtime: safeRuntime,
topology,
})

// ======================================================
// Resolve Visibility
// ======================================================

resolveRuntimeVisibility({
runtime: safeRuntime,
topology,
})

// ======================================================
// Ranking Products
// ======================================================

const rankingProducts =


Array.isArray(
  topology?.rankingProducts
)

  ? topology.rankingProducts

  : []


// ======================================================
// Hero Ranking
// ======================================================

const heroRanking =
topology?.heroRanking
|| null

// ======================================================
// Empty State
// ======================================================

if (
rankingProducts.length <= 0
) {


return <HomeEmpty />


}

// ======================================================
// Render
// ======================================================

return (


<main>

  {/* ==================================================
  Hero
  ================================================== */}

  <HomeHero />

  {/* ==================================================
  Intent Navigation
  ================================================== */}

  <HomeIntentNav />

  {/* ==================================================
  Hero Ranking
  ================================================== */}

  {

    heroRanking && (

      <section

        style={{

          padding:
            '40px 24px',
        }}

      >

        <HeroRankingCard
          product={heroRanking}
        />

      </section>

    )

  }

  {/* ==================================================
  Ranking Grid
  ================================================== */}

  {

    rankingProducts.length > 0 && (

      <section

        style={{

          display:
            'grid',

          gridTemplateColumns:
            'repeat(auto-fit,minmax(320px,1fr))',

          gap:
            '24px',

          padding:
            '24px 24px 64px',
        }}

      >

        {

          rankingProducts.map(

            (
              product: any,
              index: number
            ) => (

              <ProductCard

                key={
                  product?.unique_id
                  || index
                }

                product={product}

              />

            )

          )

        }

      </section>

    )

  }

  {/* ==================================================
  Recommendation
  ================================================== */}

  <HomeRecommendedPaths />

  {/* ==================================================
  Capability
  ================================================== */}

  <HomeCapabilitySection />

  {/* ==================================================
  Guide
  ================================================== */}

  <HomeGuideSection />

  {/* ==================================================
  Trust
  ================================================== */}

  <HomeTrustSection />

  {/* ==================================================
  Finder CTA
  ================================================== */}

  <HomeFinderCTA />

  {/* ==================================================
  Bottom CTA
  ================================================== */}

  <HomeBottomCTA />

  {/* ==================================================
  Sticky CTA
  ================================================== */}

  <HomeStickyCTA />

</main>


)

}
