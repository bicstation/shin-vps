// ============================================================================
// FILE:
// /app/pc-finder/page.tsx
// ============================================================================

'use client'

import { useState } from 'react'

import { executeFinder } from './lib/finderActions'

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
Temporary Intent Data
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

const recommendation = runtime?.view?.header


/* ============================================================================
Page
============================================================================ */

export default function PCFinderPage() {

    const [selectedIntent, setSelectedIntent] = useState('')

    const [selectedBudget, setSelectedBudget] =
        useState<number | null>(null)

    const [runtime, setRuntime] = useState<any>(null)

    const [loading, setLoading] = useState(false)

    const handleSearch = async () => {

        setLoading(true)

        try {

            const result = await executeFinder({

                groups: selectedIntent
                    ? [selectedIntent]
                    : [],

                max_price: selectedBudget,

            })

            console.log("Finder Runtime")

            console.log(result)

            console.log(JSON.stringify(result,null,2))

            setRuntime(result)

        }

        finally {

            setLoading(false)

        }

    }

    return (

        <main className={styles.finder}>

            <HeroSection />

            <IntentSection
                intents={intents}
                selected={selectedIntent}
                onSelect={(id) => {

                    console.log("Intent Click", id)

                    setSelectedIntent(id)

                }}
            />

            {/* <IntentSection

                intents={intents}

                selected={selectedIntent}

                onSelect={setSelectedIntent}

            /> */}

            <BudgetSection

                budgets={budgets}

                selected={selectedBudget}

                onSelect={setSelectedBudget}

            />

            <div
                style={{
                    padding: '16px',
                    margin: '24px 0',
                    border: '1px solid #3b82f6',
                    borderRadius: '12px',
                    background: '#0f172a',
                    color: '#fff',
                }}
            >

                <div>

                    Intent :
                    {selectedIntent || '未選択'}

                </div>

                <div>

                    Budget :
                    {selectedBudget?.toLocaleString() ?? '未選択'}

                </div>

            </div>

            <SearchSection

                loading={loading}
                disabled={
                    !selectedIntent
                }

                onSearch={handleSearch}

            />


            <RecommendationSection

                title={
                    runtime?.view?.header?.title
                    ??
                    recommendation.title
                }

                description={
                    runtime?.view?.header?.description
                    ??
                    recommendation.description
                }

                reasons={

                    runtime?.view?.products?.length
                        ?
                        [
                            `${runtime.view.products.length}件見つかりました`
                        ]
                        :
                        recommendation.reasons
                }


            />

            <ResultsSection

                products={
                   runtime?.runtime?.data?.products
                    ??
                    []
                }

            />

            <RankingSection />

        </main>

    )

}