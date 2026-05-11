// FinderConversionFlow.tsx
'use client'

/* =========================================
🔥 Sections
========================================= */

import ResultsSection
  from '../sections/results/ResultsSection'

import RecommendationSection
  from '../sections/recommendation/RecommendationSection'

import CTASection
  from '../sections/cta/CTASection'

/* =========================================
🔥 Props
========================================= */

type Props = {

  purpose: string

  semanticUsage: string

  results: any[]
}

/* =========================================
🔥 Finder Conversion Flow
========================================= */

export default function
FinderConversionFlow({

  purpose,

  semanticUsage,

  results,

}: Props) {

  // ======================================
  // Empty
  // ======================================

  if (
    !Array.isArray(
      results
    )
    ||
    !results.length
  ) {

    return null

  }

  // ======================================
  // Top Picks
  // ======================================

  const topResults =

    results.slice(
      0,
      8
    )

  // ======================================
  // Featured
  // ======================================

  const featuredProduct =

    topResults?.[0]
    || null

  // ======================================
  // Debug
  // ======================================

  console.log(
    '\n🔥 ====================================='
  )

  console.log(
    '🔥 FINDER CONVERSION FLOW'
  )

  console.log({

    purpose,

    semanticUsage,

    resultCount:
      topResults.length,

    featuredProduct:

      featuredProduct
      ? {

          unique_id:
            featuredProduct
              ?.unique_id,

          name:
            featuredProduct
              ?.name,

          maker:
            featuredProduct
              ?.maker,

        }

      : null,

  })

  console.log(
    '🔥 =====================================\n'
  )

  // ======================================
  // Render
  // ======================================

  return (

    <>

      {/* ==================================
      RESULTS
      product recommendation layer
      ================================== */}

      <ResultsSection

        results={
          topResults
        }

        semanticUsage={
          semanticUsage
        }

      />

      {/* ==================================
      RECOMMENDATION
      reasoning layer
      ================================== */}

      <RecommendationSection

        purpose={
          purpose
        }

        semanticUsage={
          semanticUsage
        }

        featuredProduct={
          featuredProduct
        }

      />

      {/* ==================================
      CTA
      conversion layer
      ================================== */}

      <CTASection

        purpose={
          purpose
        }

        semanticUsage={
          semanticUsage
        }

      />

    </>

  )
}