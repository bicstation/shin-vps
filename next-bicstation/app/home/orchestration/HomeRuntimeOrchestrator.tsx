// /home/maya/shin-vps/next-bicstation/app/home/orchestration/HomeRuntimeOrchestrator.tsx

import HomeHero from '../hero/HomeHero'
import HomeTrustSection from '../trust/HomeTrustSection'
import HomeBottomCTA from '../cta/HomeBottomCTA'
import HomeStickyCTA from '../cta/HomeStickyCTA'
import HomeEmpty from '../common/HomeEmpty'
import HomeRealityMap from '../reality/HomeRealityMap'
import HomeRealityExamples from '../reality/HomeRealityExamples'
import HomeRuntimeDebug from '../observatory/HomeRuntimeDebug'
import HomeTopologyInspector from '../observatory/HomeTopologyInspector'
import HomeContinuityInspector from '../observatory/HomeContinuityInspector'
import HomeFinderGateway from '../finder/HomeFinderGateway'
import HomeRankingGateway from '../ranking/HomeRankingGateway'
import HomeGuideGateway from '../guide/HomeGuideGateway'
import HomeFeaturedProducts from '../products/HomeFeaturedProducts'

type Props = {
  runtime?: any
  observatory?: boolean
}

export default function HomeRuntimeOrchestrator({
  runtime,
  observatory = false,
}: Props) {
  console.log('🔥 HOME ORCHESTRATOR RUNTIME', runtime)

  const top = runtime?.top || {}
  const navigation = runtime?.navigation || {}

  const featuredProducts =
    top?.featuredProducts ?? []

  const featuredGroups =
    top?.featuredGroups ?? []

  const stats =
    top?.stats ?? {}

  const meaning =
    top?.meaning ?? {}

  console.log('🔥 TOP HOME PROJECTION', {
    featuredProducts: featuredProducts.length,
    featuredGroups: featuredGroups.length,
    productCount: stats?.productCount,
    groupCount: stats?.groupCount,
    attributeCount: stats?.attributeCount,
    ready: top?.ready,
    authorityVersion: top?.authorityVersion,
    semanticAuthority: top?.semanticAuthority,
  })

  const sections = [
    { type: 'hero', visible: true },
    { type: 'intent', visible: true },
    { type: 'ranking', visible: featuredProducts.length > 0 },
    { type: 'recommendation', visible: true },
    { type: 'capability', visible: true },
    { type: 'guide', visible: true },
    { type: 'trust', visible: true },
    { type: 'finder_cta', visible: true },
    { type: 'bottom_cta', visible: true },
  ]

  const visibleSections =
    sections.filter(
      section => section.visible
    )

  if (!top?.ready) {
    return <HomeEmpty />
  }

  return (
    <main>

      {observatory && (
        <>
          <HomeRuntimeDebug
            runtime={runtime}
          />

          <HomeContinuityInspector
            runtime={runtime}
          />

          <HomeTopologyInspector
            runtime={runtime}

          />
        </>
      )}

      <HomeHero
        meaning={meaning}
        stats={stats}
        featuredGroups={featuredGroups}
      />

      <HomeRealityMap
        groups={featuredGroups}
      />

      <HomeRealityExamples
        navigation={navigation}
      />

      <HomeFinderGateway />

      <HomeRankingGateway
        totalProducts={
          stats?.productCount ?? 0
        }
      />

      <HomeFeaturedProducts
        products={featuredProducts}
      />

      <HomeGuideGateway />

      <HomeTrustSection />

      <HomeBottomCTA />

      <HomeStickyCTA />

    </main>
  )
}