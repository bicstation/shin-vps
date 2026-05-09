/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import styles
  from './page.module.css'

/* =========================================
🔥 API
========================================= */

import {
  fetchPCProductRanking,
} from '@/shared/lib/api/django/pc/stats'

/* =========================================
🔥 ORCHESTRATION
========================================= */

import RankingLayout
  from './orchestration/RankingLayout'

import RankingSemanticFlow
  from './orchestration/RankingSemanticFlow'

import RankingConversionFlow
  from './orchestration/RankingConversionFlow'

/* =========================================
🔥 EMPTY
========================================= */

import RankingEmpty
  from './components/RankingEmpty'

/* =========================================
🔥 TYPES
========================================= */

type Props = {

  params: {
    type: string
  }
}

/* =========================================
🔥 ISR
========================================= */

export const revalidate = 60

/* =========================================
🔥 PAGE
========================================= */

export default async function
RankingPage({
  params,
}: Props) {

  // ======================================
  // PARAMS
  // ======================================

  const type =
    params?.type
    || 'score'

  // ======================================
  // FETCH
  // ======================================

  const products =
    await fetchPCProductRanking(
      type
    )

  // ======================================
  // EMPTY
  // ======================================

  if (
    !products?.length
  ) {
    return <RankingEmpty />
  }

  // ======================================
  // PAGE
  // ======================================

  return (

    <RankingLayout>

      {/* ==================================
      SEMANTIC FLOW
      semantic cognition layer
      ================================== */}

      <RankingSemanticFlow
        type={type}
        products={products}
      />

      {/* ==================================
      CONVERSION FLOW
      commerce conversion layer
      ================================== */}

      <RankingConversionFlow
        type={type}
        products={products}
      />

    </RankingLayout>

  )
}