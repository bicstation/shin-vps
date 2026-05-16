// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/page.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 API
========================================= */

import {
  fetchSemanticGroupedAttributes,
} from '@/shared/lib/api/django/pc'

/* =========================================
🔥 Orchestration
========================================= */

import SemanticOntologyExplorer
  from './orchestration/SemanticOntologyExplorer'

/* =========================================
🔥 Page
========================================= */

export default async function
RankingIndexPage() {

  /* ======================================
  🔥 Runtime
  ====================================== */

  let runtime = {}

  let error = null

  try {

    runtime =

      await fetchSemanticGroupedAttributes()

  } catch (err: any) {

    error =
      err?.message
      || 'Unknown Error'
  }

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <SemanticOntologyExplorer

      runtime={runtime}

      error={error}

    />

  )
}