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
🔥 Contracts
============================================================================ */

import type {

    FinderRuntimeContract,

} from '@/shared/lib/api/django/pc/finder/contracts'

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

Responsibilities

✓ Manage Discovery Journey
✓ Execute Finder Runtime
✓ Render Experience

This module SHALL NOT

✗ Generate Semantic Meaning
✗ Modify Runtime
✗ Generate Recommendation Logic

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

    ] = useState<{

        raw: any

        runtime: FinderRuntimeContract

        view: any

    } | null>(null)

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

                    finder.runtime.data.products.flatMap(

                        product =>

                            product.semantic_labels ?? []

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

                            finder.view.header.title

                        }

                        description={

                            finder.view.header.description

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

                            finder.runtime.data.products

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
