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

import HomeRealityMap
  from '../reality/HomeRealityMap'

import HomeRealityExamples
  from '../reality/HomeRealityExamples'  

/* ============================================================================
🔥 Cards
============================================================================ */

import ProductCard
from '@/shared/components/organisms/cards/ProductCard'

import HeroRankingCard
from '@/shared/components/organisms/cards/HeroRankingCard'

/* ============================================================================
🔥 Observatory
============================================================================ */

import HomeRuntimeDebug
from '../observatory/HomeRuntimeDebug'

import HomeTopologyInspector
from '../observatory/HomeTopologyInspector'

import HomeContinuityInspector
from '../observatory/HomeContinuityInspector'

import HomeDiscoverGateway
  from '../discover/HomeDiscoverGateway'

import HomeFinderGateway
  from '../finder/HomeFinderGateway'

import HomeRankingGateway
  from '../ranking/HomeRankingGateway'

import HomeGuideGateway
  from '../guide/HomeGuideGateway'

import HomeFeaturedProducts
  from '../products/HomeFeaturedProducts'



  /* ============================================================================
🔥 Types
============================================================================ */

type Props = {

runtime?: any

observatory?: boolean

totalProducts?: number

featuredProducts?: any[]


}

/* ============================================================================
🔥 Home Runtime Orchestrator
============================================================================ */

export default function
HomeRuntimeOrchestrator({

runtime,

observatory = false,

}: Props) {


console.log(
  '🔥 HOME ORCHESTRATOR RUNTIME',
  runtime
)

console.log(
  'TOP FEATURED PRODUCTS',
  runtime?.top?.featured_products
)

// ======================================================
// Runtime
// ======================================================

const ranking =


runtime?.ranking
|| {}


const sidebar =


runtime?.sidebar
|| {}


const topology =


runtime?.topology
|| {}


// ======================================================
// Products
// ======================================================

const rankingProducts =


Array.isArray(
  ranking?.products
)

  ? ranking.products

  : []


const heroRanking =


rankingProducts?.[0]
|| null


// ======================================================
// Sections
// ======================================================

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
  visible:
    rankingProducts.length > 0,
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

// ======================================================
// Visible Sections
// ======================================================

const visibleSections =


sections.filter(
  (section) =>
    section.visible
)


// ======================================================
// Empty
// ======================================================

if (
!rankingProducts.length
&&
!sidebar
) {


return <HomeEmpty />


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

    )

  }

  {/* ==================================================
  HERO
  ================================================== */}

  <HomeHero
    meaning={runtime?.top?.meaning}
    stats={runtime?.top?.stats}
    featuredGroups={
      runtime?.top?.featured_groups
    }
  />

  <HomeRealityMap
    groups={
      runtime?.top?.featured_groups
    }
  />

  <HomeRealityExamples
    navigation={
      runtime.navigation
    }
  />

{/* <HomeDiscoverGateway
  navigation={runtime.navigation}
/> */}

<HomeFinderGateway/>

{/* <HomeRankingGateway
  totalProducts={
    runtime?.top?.stats?.product_count ?? 0
  }
/> */}
<HomeRankingGateway
  totalProducts={
    runtime?.top?.stats?.product_count ?? 0
  }

  featuredProducts={
    runtime?.top?.featured_products ?? []
  }
/>

<HomeFeaturedProducts
  products={rankingProducts}
/>


<HomeGuideGateway/>

  {/* ==================================================
  INTENT NAV
  ================================================== */}

  {/* <HomeIntentNav
  intents={
    runtime?.navigation?.navigation
  }
/> */}

  {/* ==================================================
  HERO RANKING
  ================================================== */}

  {/* {

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

  } */}

  {/* ==================================================
  RANKING GRID
  ================================================== */}

  

  {

    rankingProducts.length > 0 && (


      <section
        className={
          styles.productGrid
        }
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
                  ?? index
                }

                product={
                  product
                }

              />

            )

          )

        }

      </section>


    )

  }

  {/* ==================================================
  RECOMMENDATION
  ================================================== */}

  <HomeRecommendedPaths />

  {/* ==================================================
  CAPABILITY
  ================================================== */}

  <HomeCapabilitySection />

  {/* ==================================================
  GUIDE
  ================================================== */}

  <HomeGuideSection />

  {/* ==================================================
  TRUST
  ================================================== */}

  <HomeTrustSection />

  {/* ==================================================
  FINDER CTA
  ================================================== */}

  <HomeFinderCTA />

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
