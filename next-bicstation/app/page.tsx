// /home/maya/shin-vps/next-bicstation/app/page.tsx

/* ============================================================================
🔥 Runtime
============================================================================ */

import {
fetchSidebar,
} from '@/shared/lib/api/django/pc/sidebar/sidebar'

import {
fetchSemanticRankingRuntime,
} from '@/shared/lib/api/django/pc/ranking/fetchSemanticRankingRuntime'

/* ============================================================================
🔥 Home Runtime
============================================================================ */

import HomeRuntimeOrchestrator
from './home/orchestration/HomeRuntimeOrchestrator'

/* ============================================================================
🔥 Home Page
============================================================================ */

export default async function Page() {

// ======================================================
// Runtime Fetch
// ======================================================

const [


sidebar,

ranking,


] = await Promise.all([


fetchSidebar(),

fetchSemanticRankingRuntime(),


])

// ======================================================
// Runtime
// ======================================================

const runtime = {


sidebar,

ranking,

heroRanking:

  Array.isArray(
    ranking?.products
  )

    ? ranking.products[0]

    : null,

semantic_runtime:
  true,

adaptive_runtime:
  true,


}

// ======================================================
// Render
// ======================================================

return (


<HomeRuntimeOrchestrator
  runtime={runtime}
/>


)

}
