// /home/maya/shin-vps/next-bicstation/app/home/orchestration/HomeRuntimeOrchestrator.tsx

/* ============================================================================
🔥 Components
============================================================================ */

import HomeHero from '../hero/HomeHero'
import HomeCapabilitySection from '../capability/HomeCapabilitySection'
import HomeGuideSection from '../guide/HomeGuideSection'
import HomeTrustSection from '../trust/HomeTrustSection'
import HomeFinderCTA from '../recommendation/HomeFinderCTA'
import HomeIntentNav from '../recommendation/HomeIntentNav'
import HomeRecommendedPaths from '../recommendation/HomeRecommendedPaths'
import HomeBottomCTA from '../cta/HomeBottomCTA'
import HomeStickyCTA from '../cta/HomeStickyCTA'
import HomeEmpty from '../common/HomeEmpty'
import HomeRealityMap from '../reality/HomeRealityMap'
import HomeRealityExamples from '../reality/HomeRealityExamples'

/* ============================================================================
🔥 Observatory
============================================================================ */

import HomeRuntimeDebug from '../observatory/HomeRuntimeDebug'
import HomeTopologyInspector from '../observatory/HomeTopologyInspector'
import HomeContinuityInspector from '../observatory/HomeContinuityInspector'
import HomeDiscoverGateway from '../discover/HomeDiscoverGateway'
import HomeFinderGateway from '../finder/HomeFinderGateway'
import HomeRankingGateway from '../ranking/HomeRankingGateway'
import HomeGuideGateway from '../guide/HomeGuideGateway'
import HomeFeaturedProducts from '../products/HomeFeaturedProducts'

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

  console.log(
    '🔥 HOME ORCHESTRATOR RUNTIME',
    runtime
  )

  /* ==========================================================================
  🔥 Runtime
  ========================================================================== */

  const ranking =
    runtime?.ranking || {}

  const sidebar =
    runtime?.sidebar || {}

  const topology =
    runtime?.topology || {}

  const top =
    runtime?.top || {}

  /* ==========================================================================
  🔥 Latest Top Adapter Contract
  ========================================================================== */

  const featuredProducts =
    top?.featuredProducts ?? []

  const featuredGroups =
    top?.featuredGroups ?? []

  const stats =
    top?.stats ?? {}

  const meaning =
    top?.meaning ?? {}

  console.log(
    '🔥 TOP HOME PROJECTION',
    {
      featuredProducts:
        featuredProducts.length,

      featuredGroups:
        featuredGroups.length,

      productCount:
        stats?.productCount,

      groupCount:
        stats?.groupCount,

      attributeCount:
        stats?.attributeCount,

      ready:
        top?.ready,

      authorityVersion:
        top?.authorityVersion,

      semanticAuthority:
        top?.semanticAuthority,
    }
  )

  /* ==========================================================================
  🔥 Sections
  ========================================================================== */

  const sections = [
    {
      type: 'hero',
      visible: true,
    },
    {
      type: 'intent',
      visible: true,
    },
    {
      type: 'ranking',
      visible: featuredProducts.length > 0,
    },
    {
      type: 'recommendation',
      visible: true,
    },
    {
      type: 'capability',
      visible: true,
    },
    {
      type: 'guide',
      visible: true,
    },
    {
      type: 'trust',
      visible: true,
    },
    {
      type: 'finder_cta',
      visible: true,
    },
    {
      type: 'bottom_cta',
      visible: true,
    },
  ]

  const visibleSections =
    sections.filter(
      section =>
        section.visible
    )

  /* ==========================================================================
  🔥 Empty
  ========================================================================== */

  if (
    !featuredProducts.length &&
    !sidebar
  ) {
    return <HomeEmpty />
  }

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (
    <main>

      {/* ==================================================
      Observatory
      ================================================== */}

      {observatory && (
        <>
          <HomeRuntimeDebug
            runtime={runtime}
            runtimeName="HOME_RUNTIME"
            payload={runtime}
          />

          <HomeContinuityInspector
            runtime={runtime}
            sidebar={sidebar}
            ranking={ranking}
            topology={topology}
          />

          <HomeTopologyInspector
            topology={topology}
            runtime={runtime}
            sections={visibleSections}
          />
        </>
      )}

      {/* ==================================================
      HERO
      ================================================== */}

      <HomeHero
        meaning={meaning}
        stats={stats}
        featuredGroups={featuredGroups}
      />

      <HomeRealityMap
        groups={featuredGroups}
      />

      <HomeRealityExamples
        navigation={runtime.navigation}
      />

      {/* <HomeDiscoverGateway
        navigation={runtime.navigation}
      /> */}

      <HomeFinderGateway />

      <HomeRankingGateway
        totalProducts={
          stats?.productCount ?? 0
        }
        featuredProducts={
          featuredProducts
        }
      />

      <HomeFeaturedProducts
        products={featuredProducts}
      />

      <HomeGuideGateway />

      {/* ==================================================
      RECOMMENDATION
      ================================================== */}

      {/* <HomeRecommendedPaths /> */}

      {/* ==================================================
      CAPABILITY
      ================================================== */}

      {/* <HomeCapabilitySection /> */}

      {/* ==================================================
      GUIDE
      ================================================== */}

      {/* <HomeGuideSection /> */}

      {/* ==================================================
      TRUST
      ================================================== */}

      <HomeTrustSection />

      {/* ==================================================
      FINDER CTA
      ================================================== */}

      {/* <HomeFinderCTA /> */}

      {/* ==================================================
      BOTTOM CTA
      ================================================== */}

      <HomeBottomCTA />

      {/* ==================================================
      STICKY CTA
      ================================================== */}

      <HomeStickyCTA />

    </main>
  )
}