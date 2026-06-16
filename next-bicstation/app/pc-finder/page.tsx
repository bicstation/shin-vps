'use client'

import { useMemo, useState } from 'react'

import HeroSection from './sections/hero/HeroSection'
import IntentSection from './sections/intent/IntentSection'
import BudgetSection from './sections/budget/BudgetSection'

import FinderLoading from './components/FinderLoading'
import EmptyFinder from './components/EmptyFinder'

import FinderConversionFlow
from './orchestration/FinderConversionFlow'

import {
fetchFinderResult,
} from '@/shared/lib/api/django/pc'

import type {
FinderProduct,
} from './types/finder'


console.log(
  '🔥 PAGE TSX LOADED'
)

const PURPOSE_TO_SEMANTIC = {

gaming: 'usage-gaming',
creator: 'usage-creator',
business: 'usage-business',
ai: 'usage-ai',

} as const

export default function Page() {

const [


purpose,

setPurpose,


] = useState('gaming')

const [


budget,

setBudget,


] = useState(250000)

const [


loading,

setLoading,


] = useState(false)

const [


searched,

setSearched,


] = useState(false)

const [


results,

setResults,


] = useState<FinderProduct[]>([])

const semanticUsage =


PURPOSE_TO_SEMANTIC[
  purpose as keyof typeof PURPOSE_TO_SEMANTIC
]


const semanticDescription =


useMemo(() => {

  switch (purpose) {

    case 'gaming':
      return 'FPS・MMORPG・重量級ゲーム向け'

    case 'creator':
      return '動画編集・配信・制作向け'

    case 'business':
      return '業務・法人利用向け'

    case 'ai':
      return 'AI画像生成・LLM用途向け'

    default:
      return ''

  }

}, [purpose])


async function handleSearch() {

console.log(
  '🔥 FINDER UI STATE',
  {
    purpose,
    semanticUsage,
    budget,
  }
)


console.log(
  '🔥 HANDLE SEARCH FIRED'
)

try {

  setLoading(true)

  setSearched(true)

  const response =

    await fetchFinderResult({

      usage:
        semanticUsage,

      max_price:
        budget,

    })

  const products =

    Array.isArray(response)

      ? response

      : (
          response?.data?.products
          ?? response?.products
          ?? response?.results
          ?? []
        )

  console.log(
    '🔥 FINDER RESPONSE',
    products?.length,
    products?.[0]
  )

  setResults(products)

} catch (error) {

  console.error(
    '🔥 FINDER ERROR',
    error
  )

  setResults([])

} finally {

  setLoading(false)

}


}

return (


<>

  <HeroSection

    purpose={purpose as any}

    semanticUsage={
      semanticUsage
    }

    semanticDescription={
      semanticDescription
    }

  />

  <IntentSection

    value={
      purpose as any
    }

    onChange={
      setPurpose as any
    }

  />

  <BudgetSection

    value={
      budget
    }

    onChange={
      setBudget
    }

  />

  <button
    onClick={
      handleSearch
    }
  >

    診断開始

  </button>

  {loading && (

    <FinderLoading />

  )}

  {!loading &&
   searched &&
   !results.length && (

    <EmptyFinder

      semanticUsage={
        semanticUsage
      }

    />

  )}

  {!loading &&
   results.length > 0 && (

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

</>


)
}
