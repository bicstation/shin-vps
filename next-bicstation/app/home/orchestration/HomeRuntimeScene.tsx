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
} from './resolveHomeTopology'

import {
resolveRuntimeInjection,
} from './resolveRuntimeInjection'

import {
resolveRuntimeVisibility,
} from './resolveRuntimeVisibility'

/* ============================================================================
🔥 Observatory
============================================================================ */

import HomeRuntimeDebug
from '../observatory/HomeRuntimeDebug'

import HomeTopologyInspector
from '../observatory/HomeTopologyInspector'

import HomeContinuityInspector
from '../observatory/HomeContinuityInspector'

/* ============================================================================
🔥 Types
============================================================================ */

type Props = {
runtime?: any
observatory?: boolean
}

/* ============================================================================
🔥 Home Runtime Orchestrator
============================================================================ */

export default function HomeRuntimeOrchestrator({
runtime,
observatory = false,
}: Props) {

// ======================================================
// Safe Runtime
// ======================================================

const safeRuntime =
runtime || {}

// ======================================================
// Topology
// ======================================================

const topology =
resolveHomeTopology({
runtime: safeRuntime,
})

// ======================================================
// Injection
// ======================================================

const injections =
resolveRuntimeInjection({
runtime: safeRuntime,
topology,
})

// ======================================================
// Visibility
// ======================================================

const visibility =
resolveRuntimeVisibility({
runtime: safeRuntime,
topology,
injections,
})

// ======================================================
// Ranking
// ======================================================

const rankingProducts =


Array.isArray(
  topology?.rankingProducts
)

  ? topology.rankingProducts

  : []


const heroRanking =
topology?.heroRanking || null

// ======================================================
// Empty
// ======================================================

if (
!rankingProducts.length
) {


return <HomeEmpty />


}

// ======================================================
// Observatory Safe Payload
// ======================================================

const observatoryPayload = {


rankingProductsLength:
  rankingProducts.length,

hasHeroRanking:
  !!heroRanking,

topology:

  topology?.summary
  || {},

visibility:

  visibility?.summary
  || {},

injections:

  injections?.summary
  || {},


}

// ======================================================
// Render
// ======================================================

return (


<main>

  {/* ==================================================
  Observatory
  ================================================== */}

  {

    observatory && (

      <>

        <HomeRuntimeDebug

          runtime={{

            semantic_runtime:
              safeRuntime?.semantic_runtime,

            adaptive_runtime:
              safeRuntime?.adaptive_runtime,

            semantic_labels:
              safeRuntime?.semantic_labels,

          }}

          runtimeName="HOME_RUNTIME"

          payload={
            observatoryPayload
          }

        />

        <HomeContinuityInspector

          runtime={{

            semantic_runtime:
              safeRuntime?.semantic_runtime,

            adaptive_runtime:
              safeRuntime?.adaptive_runtime,

          }}

          ranking={{

            products:
              rankingProducts,
          }}

          topology={{

            sections:
              topology?.sections,
          }}

        />

        <HomeTopologyInspector

          topology={{

            sections:
              topology?.sections,
          }}

          runtime={{

            semantic_runtime:
              safeRuntime?.semantic_runtime,

          }}

          sections={
            visibility?.visibleSections
            || []
          }

        />

      </>

    )

  }

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
