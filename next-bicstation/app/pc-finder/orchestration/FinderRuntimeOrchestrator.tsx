// ============================================================================
// FILE:
// /app/pc-finder/orchestration/FinderRuntimeOrchestrator.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 React
============================================================================ */

import {

    useState,

} from 'react'

/* ============================================================================
🔥 Runtime
============================================================================ */

import {

    executeFinder,

} from '../lib/finderActions'

/* ============================================================================
🔥 Projection
============================================================================ */

import type {

    ProjectedFinderRuntime,

} from '@/shared/lib/api/django/pc/finder'

/* ============================================================================
🔥 Data
============================================================================ */

import {

    intents,

} from '../data/intents'

import {

    budgets,

} from '../data/budgets'

/* ============================================================================
🔥 Sections
============================================================================ */

import HeroSection
    from '../sections/hero/HeroSection'

import IntentSection
    from '../sections/intent/IntentSection'

import BudgetSection
    from '../sections/budget/BudgetSection'

import DiscoverySummarySection
    from '../sections/summary/DiscoverySummarySection'

import SearchSection
    from '../sections/search/SearchSection'

import RecommendationSection
    from '../sections/recommendation/RecommendationSection'

import ResultsSection
    from '../sections/results/ResultsSection'

import RankingSection
    from '../sections/ranking/RankingSection'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../styles/pcFinder.module.css'

/* ============================================================================
🔥 Experience Orchestrator
============================================================================ */

export default function FinderRuntimeOrchestrator() {

    /* ========================================================================
    Journey State
    ======================================================================== */

    const [

        selectedIntent,

        setSelectedIntent,

    ] = useState('')

    const [

        selectedBudget,

        setSelectedBudget,

    ] = useState<number | null>(null)

    const [

        finder,

        setFinder,

    ] = useState<ProjectedFinderRuntime | null>(null)

    const [

        loading,

        setLoading,

    ] = useState(false)

    /* ========================================================================
🔥 Discovery Action
======================================================================== */

    const handleSearch = async () => {

        setLoading(true)

        try {

            const result = await executeFinder({

                groups:

                    selectedIntent
                        ? [selectedIntent]
                        : [],

                max_price:

                    selectedBudget,

            })

            setFinder(

                result,

            )

        }

        catch (error) {

            console.error(

                'Finder Runtime Error',

                error,

            )

            setFinder(

                null,

            )

        }

        finally {

            setLoading(

                false,

            )

        }

    }

    /* ========================================================================
    🔥 Experience Projection
    ======================================================================== */

    const recommendationReasons =

        finder

            ? Array.from(

                new Set(

                    finder.products.flatMap(

                        product =>

                            product.tags ?? []

                    )

                )

            ).slice(

                0,

                4,

            )

            : []

    /* ========================================================================
    🔥 Journey
    ======================================================================== */

    return (

        <main

            className={

                styles.page

            }

        >

            {/* ====================================================================
                Hero
            ==================================================================== */}

            <HeroSection />

            {/* ====================================================================
                STEP 1
                Intent Selection
            ==================================================================== */}

            <IntentSection

                intents={

                    intents

                }

                selected={

                    selectedIntent

                }

                onSelect={

                    setSelectedIntent

                }

            />

            {/* ====================================================================
                STEP 2
                Budget Selection
            ==================================================================== */}

            <BudgetSection

                budgets={

                    budgets

                }

                selected={

                    selectedBudget

                }

                onSelect={

                    setSelectedBudget

                }

            />

            {/* ====================================================================
                STEP 3
                Discovery Summary
            ==================================================================== */}

            <DiscoverySummarySection

                intent={

                    selectedIntent

                }

                budget={

                    selectedBudget

                }

            />

            {/* ====================================================================
                STEP 4
                Begin Discovery
            ==================================================================== */}

            <SearchSection

                loading={

                    loading

                }

                disabled={

                    !selectedIntent

                }

                onSearch={

                    handleSearch

                }

            />

            {/* ====================================================================
                Discovery Result
            ==================================================================== */}

            {

                finder && (

                    <RecommendationSection

                        title={

                            finder.header.title

                        }

                        description={

                            finder.header.description

                        }

                        reasons={

                            recommendationReasons

                        }

                    />

                )

            }

            {/* ====================================================================
                Discovery Evidence
            ==================================================================== */}

            {

                finder && (

                    <ResultsSection

                        products={

                            finder.products

                        }

                    />

                )

            }

            {/* ====================================================================
                Continue Discovery
            ==================================================================== */}

            {

                finder && (

                    <RankingSection />

                )

            }

        </main>

    )

}
