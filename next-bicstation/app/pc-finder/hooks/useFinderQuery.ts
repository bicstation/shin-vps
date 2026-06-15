// /hooks/useFinderQuery.ts

'use client'

/* =========================================
🔥 React
========================================= */

import {
  useCallback,
  useMemo,
  useState,
} from 'react'

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

  resolveSemanticUsage,

  normalizeFinderResults,

  debugFinderSemantic,

} from '../semantic/finderSemantic'

import {

  sortFinderRecommendations,

  pickFeaturedRecommendation,

  calculateRecommendationConfidence,

} from '../semantic/finderRecommendation'

import {

  buildProductReasoning,

  buildRecommendationSummary,

} from '../semantic/finderReasoning'

/* =========================================
🔥 Types
========================================= */

import type {

  FinderPurpose,

  FinderProduct,

} from '../types/finder'

/* =========================================
🔥 Dummy
========================================= */

import {
  DUMMY_FINDER_RESULTS,
} from '../dummy/finderResults'

/* =========================================
🔥 Hook
========================================= */

export function
useFinderQuery() {

  // ======================================
  // State
  // ======================================

  const [purpose, setPurpose] =

    useState<FinderPurpose>(
      'gaming'
    )

  const [budget, setBudget] =

    useState(250000)

  const [loading, setLoading] =

    useState(false)

  const [error, setError] =

    useState<any>(null)

  const [results, setResults] =

    useState<
      FinderProduct[]
    >([])

  // ======================================
  // Semantic Usage
  // ======================================

  const semanticUsage =

    useMemo(
      () => (

        resolveSemanticUsage(
          purpose
        )

      ),
      [purpose]
    )

  // ======================================
  // Search
  // ======================================

  console.log(
    '🔥 SEARCH STARTED',
    {
      purpose,
      budget,
    }
  )

  const search =

    useCallback(
      async () => {

        try {

          // ===============================
          // Loading
          // ===============================

          setLoading(true)

          setError(null)

          // ===============================
          // Debug
          // ===============================

          console.log(
            '\n🔥 ====================================='
          )

          console.log(
            '🔥 FINDER QUERY'
          )

          console.log({

            purpose,

            budget,

            semanticUsage,

          })

          // ===============================
          // API
          // ===============================

          const response =

            await fetchFinderResult({

              purpose,

              max_price:
                budget,

            })

          // ===============================
          // Normalize
          // ===============================

          let normalized =

            normalizeFinderResults(
              response
            )

          // ===============================
          // Dummy Fallback
          // ===============================

          if (
            !normalized.length
          ) {

            console.warn(
              '🔥 Using Dummy Finder Results'
            )

            normalized =
              DUMMY_FINDER_RESULTS
          }

          // ===============================
          // Recommendation Sort
          // ===============================

          const sorted =

            sortFinderRecommendations({

              products:
                normalized,

              semanticUsage,

              maxPrice:
                budget,

            })

          // ===============================
          // AI Reasoning
          // ===============================

          const enriched =

            sorted.map(
              product => ({

                ...product,

                confidence:

                  calculateRecommendationConfidence(
                    product
                  ),

                recommendation_reasoning:

                  buildProductReasoning(
                    purpose,
                    product
                  ),

                recommendation_summary:

                  buildRecommendationSummary(
                    purpose,
                    product
                  ),

              })
            )

          // ===============================
          // Save
          // ===============================

          setResults(
            enriched
          )

          // ===============================
          // Semantic Debug
          // ===============================

          debugFinderSemantic({

            semanticUsage,

            resultCount:
              enriched.length,

            firstResult:

              enriched?.[0]
              ? {

                  unique_id:
                    enriched[0]
                      ?.unique_id,

                  name:
                    enriched[0]
                      ?.name,

                  recommendation_score:

                    enriched[0]
                      ?.recommendation_score,

                }

              : null,

          })

        } catch (err) {

          console.error(
            '🔥 Finder Query Error'
          )

          console.error(
            err
          )

          setError(err)

        } finally {

          setLoading(false)

          console.log(
            '🔥 =====================================\n'
          )
        }
      },

      [

        purpose,

        budget,

        semanticUsage,

      ]
    )

  // ======================================
  // Featured
  // ======================================

  const featuredProduct =

    useMemo(
      () => (

        pickFeaturedRecommendation(
          results
        )

      ),
      [results]
    )

  // ======================================
  // Return
  // ======================================

  return {

    /* ====================================
    State
    ==================================== */

    purpose,

    setPurpose,

    budget,

    setBudget,

    loading,

    error,

    results,

    featuredProduct,

    semanticUsage,

    /* ====================================
    Actions
    ==================================== */

    search,

  }
}