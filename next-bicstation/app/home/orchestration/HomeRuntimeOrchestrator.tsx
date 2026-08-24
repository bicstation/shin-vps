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