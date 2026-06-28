// ============================================================================
// FILE:
// /app/pc-finder/page.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Sections
============================================================================ */

import HeroSection
    from './sections/hero/HeroSection'

import IntentSection
    from './sections/intent/IntentSection'

import BudgetSection
    from './sections/budget/BudgetSection'

import RecommendationSection
    from './sections/recommendation/RecommendationSection'

import ResultsSection
    from './sections/results/ResultsSection'

import RankingSection
    from './sections/ranking/RankingSection'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from './styles/pcFinder.module.css'

/* ============================================================================
🔥 Finder Experience
============================================================================ */

export default function PCFinderPage() {

    return (

        <main
            className={
                styles.finder
            }
        >

            {/* ==========================================================
            Hero
            ========================================================== */}

            <HeroSection />

            {/* ==========================================================
            Intent
            ========================================================== */}

            <IntentSection />

            {/* ==========================================================
            Budget
            ========================================================== */}

            <BudgetSection />

            {/* ==========================================================
            Recommendation
            ========================================================== */}

            <RecommendationSection />

            {/* ==========================================================
            Results
            ========================================================== */}

            <ResultsSection />

            {/* ==========================================================
            Continue Ranking
            ========================================================== */}

            <RankingSection />

        </main>

    )

}