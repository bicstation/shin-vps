// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/page.tsx
// ============================================================================

import {
  fetchSemanticGroupedAttributes,
} from '@/shared/lib/api/django/pc/semantic/fetchSemanticGroupedAttributes'

import {
  RankingRuntime,
} from './components'

/* ============================================================================
🔥 Dynamic Runtime
============================================================================ */

export const dynamic =
  'force-dynamic'

/* ============================================================================
🔥 Page
============================================================================ */

export default async function RankingPage() {

  /* ==========================================================================
  🔥 Fetch Runtime
  ========================================================================== */

  const data =
    await fetchSemanticGroupedAttributes()

  /* ==========================================================================
  🔥 Semantic Runtime
  ========================================================================== */

  const groupedAttributes =
    data.grouped_attributes || {}

  const groupKeys =
    Object.keys(groupedAttributes)

  const initialGroup =
    groupKeys[0] || null

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <RankingRuntime
      groupedAttributes={groupedAttributes}
      groupKeys={groupKeys}
      initialGroup={initialGroup}
    />

  )
}