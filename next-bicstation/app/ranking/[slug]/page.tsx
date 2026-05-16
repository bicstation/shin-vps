// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/page.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 API
========================================= */

import {
  fetchSemanticRankingRuntime,
} from '@/shared/lib/api/django/pc'

/* =========================================
🔥 Orchestration
========================================= */

import SemanticAttributeRankingPage
  from './orchestration/SemanticAttributeRankingPage'

/* =========================================
🔥 Types
========================================= */

type Props = {

  params: {

    slug: string
  }
}

/* =========================================
🔥 Page
========================================= */

export default async function
RankingAttributePage({

  params,

}: Props) {

  /* ======================================
  🔥 Slug
  ====================================== */

  const slug =

    params?.slug
    || 'score'

  /* ======================================
  🔥 Runtime
  ====================================== */

  let runtime = null

  let error = null

  try {

    runtime =

      await fetchSemanticRankingRuntime(
        slug
      )

  } catch (err: any) {

    error =
      err?.message
      || 'Unknown Error'
  }

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <SemanticAttributeRankingPage

      slug={slug}

      runtime={runtime}

      error={error}

    />

  )
}