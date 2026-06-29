// ============================================================================
// FILE:
// /app/pc-finder/page.tsx
// ============================================================================

'use client'

import { useState } from 'react'

import { executeFinder } from './lib/finderActions'

/* ============================================================================
Components
============================================================================ */

import DiscoverySummary from './components/DiscoverySummary'

/* ============================================================================
Sections
============================================================================ */

import HeroSection from './sections/hero/HeroSection'
import IntentSection from './sections/intent/IntentSection'
import BudgetSection from './sections/budget/BudgetSection'
import SearchSection from './sections/search/SearchSection'
import RecommendationSection from './sections/recommendation/RecommendationSection'
import ResultsSection from './sections/results/ResultsSection'
import RankingSection from './sections/ranking/RankingSection'

/* ============================================================================
Styles
============================================================================ */

import styles from './styles/pcFinder.module.css'

/* ============================================================================
Temporary Data
============================================================================ */

const intents = [

    {
        id: 'usage-ai',
        title: 'AI',
        description: '画像生成・ChatGPT',
        icon: '🧠',
    },

    {
        id: 'usage-gaming',
        title: 'ゲーム',
        description: 'Steam・FPS',
        icon: '🎮',
    },

    {
        id: 'usage-creator',
        title: 'クリエイター',
        description: '動画編集・Photoshop',
        icon: '🎨',
    },

    {
        id: 'usage-business',
        title: 'ビジネス',
        description: 'Office・開発',
        icon: '💼',
    },

]

const budgets = [

    {
        label: '10万円以下',
        value: 100000,
    },

    {
        label: '15万円以下',
        value: 150000,
    },

    {
        label: '20万円以下',
        value: 200000,
    },

    {
        label: '30万円以下',
        value: 300000,
    },

    {
        label: '40万円以下',
        value: 400000,
    },

    {
        label: '予算指定なし',
        value: null,
    },

]

/* ============================================================================
Experience Orchestrator

The page does not generate Semantic Meaning.

Its responsibility is to orchestrate the user's Discovery Journey.

Journey

Hero

↓

Intent Selection

↓

Discovery Summary

↓

Begin Discovery

↓

(Optional Budget Refinement)

↓

Recommendation Reason

↓

Results

↓

Continue Discovery

↓

Ranking

============================================================================ */

export default function PCFinderPage() {

    /* ============================================================================
    Journey State
    ============================================================================ */

    const [selectedIntent, setSelectedIntent] = useState('')

    const [selectedBudget, setSelectedBudget] =
        useState<number | null>(null)

    const [runtime, setRuntime] = useState<any>(null)

    const [loading, setLoading] = useState(false)

    /* ============================================================================
    Journey Action
    ============================================================================ */

    const handleSearch = async () => {

        setLoading(true)

        try {

            const result = await executeFinder({

                groups: selectedIntent
                    ? [selectedIntent]
                    : [],

                max_price: selectedBudget,

            })

            setRuntime(result)

        }

        finally {

            setLoading(false)

        }

    }

    return (

        <main className={styles.finder}>

            {/* ====================================================================
                Journey
                Beginning
            ==================================================================== */}

            <HeroSection />

            <IntentSection

                intents={intents}

                selected={selectedIntent}

                onSelect={setSelectedIntent}

            />

            {/* ====================================================================
                Journey
                Context
            ==================================================================== */}

            <DiscoverySummary

                intent={selectedIntent}

                budget={selectedBudget}

            />

            {/* ====================================================================
                Journey
                Discovery
            ==================================================================== */}

            <SearchSection

                loading={loading}

                disabled={!selectedIntent}

                onSearch={handleSearch}

            />

            <BudgetSection

                budgets={budgets}

                selected={selectedBudget}

                onSelect={setSelectedBudget}

            />

            {/* ====================================================================
                Journey
                Confidence
            ==================================================================== */}

            {runtime && (

                <RecommendationSection

                    title={runtime.view?.header?.title ?? 'おすすめ'}

                    description={runtime.view?.header?.description ?? ''}

                    reasons={runtime.view?.header?.reasons ?? []}

                />

            )}

            {runtime && (

                <ResultsSection

                    products={
                        runtime.runtime?.data?.products ?? []
                    }

                />

            )}

            {/* ====================================================================
                Journey
                Continue Discovery
            ==================================================================== */}

            {runtime && (

                <RankingSection />

            )}

        </main>

    )

}