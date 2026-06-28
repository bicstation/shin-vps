// ============================================================================
// FILE:
// /app/pc-finder/sections/hero/HeroSection.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Components
============================================================================ */

import HeroAssistant
    from '../../components/HeroAssistant'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from './HeroSection.module.css'

/* ============================================================================
🔥 Hero Section
============================================================================ */

export default function HeroSection() {

    return (

        <section
            className={
                styles.hero
            }
        >

            {/* ==========================================================
            Left
            ========================================================== */}

            <div
                className={
                    styles.content
                }
            >

                <div
                    className={
                        styles.badge
                    }
                >

                    Semantic Discovery Experience

                </div>

                <h1
                    className={
                        styles.title
                    }
                >

                    あなたにぴったりのPCを
                    <br />
                    一緒に見つけましょう。

                </h1>

                <p
                    className={
                        styles.description
                    }
                >

                    やりたいことやご予算を選ぶだけで、
                    Semantic Reality があなたに合ったPCをご提案します。

                </p>

            </div>

            {/* ==========================================================
            Right
            ========================================================== */}

            <HeroAssistant />

        </section>

    )

}