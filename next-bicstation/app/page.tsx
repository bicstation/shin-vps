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
import {
  fetchNavigationRuntime,
} from '@/shared/lib/api/django/pc/navigation'
import {
  fetchTopRuntime,
} from '@/shared/lib/api/django/pc/top'

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

  navigation,

  top,

] = await Promise.all([

  fetchSidebar(),

  fetchSemanticRankingRuntime(),

  fetchNavigationRuntime(),

  fetchTopRuntime(),

])


// ======================================================
// Runtime
// ======================================================


const runtime = {

sidebar,

ranking,

navigation,

heroRanking,

top:


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

console.log(
  '🔥 NAVIGATION',
  runtime?.navigation
)


// ======================================================
// Render
// ======================================================

return (


<HomeRuntimeOrchestrator
  runtime={runtime}
/>


)

}
