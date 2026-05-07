'use client'

import { useState } from 'react'

import FinderHero
  from './components/FinderHero'

import IntentSelector
  from './components/IntentSelector'

import BudgetSelector
  from './components/BudgetSelector'

import FinderResults
  from './components/FinderResults'

import EmptyFinder
  from './components/EmptyFinder'

import FinderLoading
  from './components/FinderLoading'

import styles
  from './styles/pcFinder.module.css'

import {
  fetchFinderResult,
} from '@/shared/lib/api/django/pc/stats'

export default function PCFinderPage() {

  const [purpose, setPurpose] =
    useState('gaming')

  const [budget, setBudget] =
    useState(250000)

  const [loading, setLoading] =
    useState(false)

  const [results, setResults] =
    useState<any[]>([])

  async function handleSearch() {

    try {

      setLoading(true)

      const data =
        await fetchFinderResult({
          purpose,
          max_price: budget,
        })

      const normalized =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : []

      setResults(normalized)

    } catch (e) {

      console.error(e)

    } finally {

      setLoading(false)
    }
  }

  return (
    <main className={styles.page}>

      <div className={styles.container}>

        <FinderHero />

        <div className={styles.layout}>

          {/* LEFT */}
          <aside className={styles.sidebar}>

            <IntentSelector
              value={purpose}
              onChange={setPurpose}
            />

            <BudgetSelector
              value={budget}
              onChange={setBudget}
            />

            <button
              onClick={handleSearch}
              className={styles.searchButton}
            >
              👉 semantic診断を開始
            </button>

          </aside>

          {/* RIGHT */}
          <section className={styles.resultsArea}>

            {loading && (
              <FinderLoading />
            )}

            {!loading && results.length <= 0 && (
              <EmptyFinder />
            )}

            {!loading && results.length > 0 && (
              <FinderResults
                results={results}
              />
            )}

          </section>

        </div>

      </div>

    </main>
  )
}