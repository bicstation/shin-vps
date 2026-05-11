'use client'

/* =========================================
🔥 React
========================================= */

import {
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
🔥 ORCHESTRATION
========================================= */

import FinderLayout
  from './orchestration/FinderLayout'

import FinderSemanticFlow
  from './orchestration/FinderSemanticFlow'

import FinderConversionFlow
  from './orchestration/FinderConversionFlow'

/* =========================================
🔥 STATES
========================================= */

import EmptyFinder
  from './components/EmptyFinder'

import FinderLoading
  from './components/FinderLoading'

/* =========================================
🔥 Styles
========================================= */

import styles
  from './PCFinderPage.module.css'

/* =========================================
🔥 Semantic Mapping
========================================= */

const PURPOSE_TO_SEMANTIC = {

  gaming:
    'usage-gaming',

  creator:
    'usage-creator',

  business:
    'usage-business',

  ai:
    'usage-ai',
}

/* =========================================
🔥 Dummy Fallback
========================================= */

const DUMMY_RESULTS = [

  {
    unique_id:
      'dummy-gaming-001',

    name:
      'RTX 4070 搭載 Gaming PC',

    maker:
      'GALLERIA',

    price:
      249800,

    image_url:
      '/dummy/gaming.jpg',

    recommendation_reason:
      'gaming semantic に最適化された高バランス構成。',

    grouped_attributes: {

      usage: [
        {
          name:
            'ゲーミング',
          slug:
            'usage-gaming',
        },
      ],

      gpu: [
        {
          name:
            'RTX 4070',
          slug:
            'gpu-rtx-4070',
        },
      ],

    },

  },

]

/* =========================================
🔥 PAGE
========================================= */

export default function
PCFinderPage() {

  // ======================================
  // STATE
  // ======================================

  const [

    purpose,

    setPurpose,

  ] = useState(
    'gaming'
  )

  const [

    budget,

    setBudget,

  ] = useState(
    250000
  )

  const [

    loading,

    setLoading,

  ] = useState(
    false
  )

  const [

    searched,

    setSearched,

  ] = useState(
    false
  )

  const [

    results,

    setResults,

  ] = useState<any[]>([])

  // ======================================
  // SEMANTIC
  // ======================================

  const semanticUsage =

    PURPOSE_TO_SEMANTIC[
      purpose
    ]

    || 'usage-gaming'

  // ======================================
  // DESCRIPTION
  // ======================================

  const semanticDescription =

    useMemo(() => {

      switch (
        purpose
      ) {

        case 'gaming':
          return 'FPS・MMORPG・重量級ゲーム向け'

        case 'creator':
          return '動画編集・配信・制作向け'

        case 'business':
          return '業務・法人利用向け'

        case 'ai':
          return 'AI画像生成・LLM用途向け'

        default:
          return 'semantic recommendation'

      }

    }, [
      purpose,
    ])

  // ======================================
  // SEARCH
  // ======================================

  async function
  handleSearch() {

    try {

      // --------------------------------
      // Loading
      // --------------------------------

      setLoading(true)

      setSearched(true)

      // --------------------------------
      // Fetch
      // --------------------------------

      const response =

        await fetchFinderResult({

          usage:
            semanticUsage,

          max_price:
            budget,

        })

      // --------------------------------
      // Normalize
      // --------------------------------

      const normalized =

        Array.isArray(
          response
        )

          ? response

          : Array.isArray(
              response?.products
            )

          ? response.products

          : Array.isArray(
              response?.results
            )

          ? response.results

          : []

      // --------------------------------
      // Apply
      // --------------------------------

      setResults(
        normalized
      )

      // --------------------------------
      // Debug
      // --------------------------------

      console.log(
        '\n🔥 ====================================='
      )

      console.log(
        '🔥 PC FINDER'
      )

      console.log({

        purpose,

        semanticUsage,

        budget,

        resultCount:
          normalized?.length
          || 0,

        firstResult:

          normalized?.[0]
          ? {

              unique_id:
                normalized[0]
                  ?.unique_id,

              name:
                normalized[0]
                  ?.name,

              maker:
                normalized[0]
                  ?.maker,

            }

          : null,

      })

      console.log(
        '🔥 =====================================\n'
      )

    } catch (error) {

      console.error(
        '🔥 Finder Fetch Error'
      )

      console.error(
        error
      )

      // --------------------------------
      // Dummy Fallback
      // --------------------------------

      setResults(
        DUMMY_RESULTS
      )

    } finally {

      setLoading(false)

    }
  }

  // ======================================
  // RESULT STATE
  // ======================================

  const hasResults =

    results.length > 0

  // ======================================
  // RENDER
  // ======================================

  return (

    <main
      className={
        styles.page
      }
    >

      <FinderLayout>

        {/* ==================================
        SEMANTIC FLOW
        semantic cognition layer
        ================================== */}

        <FinderSemanticFlow

          purpose={
            purpose
          }

          budget={
            budget
          }

          semanticUsage={
            semanticUsage
          }

          semanticDescription={
            semanticDescription
          }

          onPurposeChange={
            setPurpose
          }

          onBudgetChange={
            setBudget
          }

          onSearch={
            handleSearch
          }

          loading={
            loading
          }

        />

        {/* ==================================
        EMPTY
        ================================== */}

        {!loading
          &&
          searched
          &&
          !hasResults && (

          <EmptyFinder />

        )}

        {/* ==================================
        LOADING
        ================================== */}

        {loading && (

          <FinderLoading />

        )}

        {/* ==================================
        CONVERSION FLOW
        commerce recommendation layer
        ================================== */}

        {!loading
          &&
          hasResults && (

          <FinderConversionFlow

            purpose={
              purpose
            }

            semanticUsage={
              semanticUsage
            }

            results={
              results
            }

          />

        )}

      </FinderLayout>

    </main>
  )
}