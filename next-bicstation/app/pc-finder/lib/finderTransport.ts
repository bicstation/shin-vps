// /lib/finderTransport.ts

/* =========================================
🔥 API
========================================= */

import {
  fetchFinderResult,
} from '@/shared/lib/api/django/pc'

/* =========================================
🔥 Semantic
========================================= */

import {

  normalizeFinderResults,

  resolveSemanticUsage,

  debugFinderSemantic,

} from '../semantic/finderSemantic'

/* =========================================
🔥 Recommendation
========================================= */

import {

  sortFinderRecommendations,

} from '../semantic/finderRecommendation'

/* =========================================
🔥 Helpers
========================================= */

import {

  normalizeFinderProducts,

  debugFinderHelpers,

} from './finderHelpers'

/* =========================================
🔥 Types
========================================= */

import type {

  FinderPurpose,

  FinderProduct,

  FinderApiResponse,

} from '../types/finder'

/* =========================================
🔥 Dummy
========================================= */

import {
  DUMMY_FINDER_RESULTS,
} from '../dummy/finderResults'

/* =========================================
🔥 Query
========================================= */

type FinderTransportQuery = {

  purpose: FinderPurpose

  budget?: number
}

/* =========================================
🔥 Transport Result
========================================= */

type FinderTransportResult = {

  results: FinderProduct[]

  semanticUsage: string

  total: number
}

/* =========================================
🔥 Finder Transport
========================================= */

export async function
fetchFinderTransport({

  purpose,

  budget,

}: FinderTransportQuery)

: Promise<
    FinderTransportResult
  > {

  // ======================================
  // Semantic Usage
  // ======================================

  const semanticUsage =

    resolveSemanticUsage(
      purpose
    )

  // ======================================
  // Debug
  // ======================================

  console.log(
    '\n🔥 ====================================='
  )

  console.log(
    '🔥 FINDER TRANSPORT'
  )

  console.log({

    purpose,

    budget,

    semanticUsage,

  })

  try {

    // ====================================
    // API Request
    // ====================================

    const response:

      FinderApiResponse

      = await fetchFinderResult({

        purpose,

        max_price:
          budget,

      })

    // ====================================
    // Normalize
    // ====================================

    let normalized =

      normalizeFinderResults(
        response
      )

    // ====================================
    // Dummy Fallback
    // ====================================

    if (
      !normalized.length
    ) {

      console.warn(
        '🔥 Finder Dummy Fallback'
      )

      normalized =
        DUMMY_FINDER_RESULTS
    }

    // ====================================
    // Product Normalize
    // ====================================

    const validProducts =

      normalizeFinderProducts(
        normalized
      )

    // ====================================
    // Recommendation Sort
    // ====================================

    const sorted =

      sortFinderRecommendations({

        products:
          validProducts,

        semanticUsage,

        maxPrice:
          budget,

      })

    // ====================================
    // Semantic Debug
    // ====================================

    debugFinderSemantic({

      semanticUsage,

      resultCount:
        sorted.length,

      firstResult:

        sorted?.[0]
        ? {

            unique_id:
              sorted[0]
                ?.unique_id,

            name:
              sorted[0]
                ?.name,

            recommendation_score:

              sorted[0]
                ?.recommendation_score,

          }

        : null,

    })

    // ====================================
    // Helper Debug
    // ====================================

    debugFinderHelpers({

      total:
        sorted.length,

      semanticUsage,

    })

    // ====================================
    // Return
    // ====================================

    return {

      results:
        sorted,

      semanticUsage,

      total:
        sorted.length,

    }

  } catch (error) {

    console.error(
      '🔥 Finder Transport Error'
    )

    console.error(
      error
    )

    // ====================================
    // Fallback
    // ====================================

    const fallback =

      sortFinderRecommendations({

        products:
          DUMMY_FINDER_RESULTS,

        semanticUsage,

        maxPrice:
          budget,

      })

    return {

      results:
        fallback,

      semanticUsage,

      total:
        fallback.length,

    }
  } finally {

    console.log(
      '🔥 =====================================\n'
    )
  }
}