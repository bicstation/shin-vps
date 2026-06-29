// ============================================================================
// FILE:
// /app/pc-finder/sections/hero/HeroSection.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
Components
============================================================================ */

import HeroAssistant
    from '../../components/HeroAssistant'

/* ============================================================================
Styles
============================================================================ */

import styles
    from './HeroSection.module.css'

/* ============================================================================
Journey

Discovery Beginning

The Hero introduces the Semantic Discovery Experience.

Its responsibility is to welcome the user,
build confidence,
and naturally encourage the first discovery decision.

This component does NOT:

- Generate Semantic Meaning
- Execute Runtime
- Interpret Recommendations

It only renders the beginning of the Discovery Journey.

============================================================================ */

export default function HeroSection() {

    return (

        <section
            className={
                styles.hero
            }
        >

            {/* ==========================================================
                Discovery Message
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

                    やりたいことを選ぶところから、
                    あなたに合ったPC探しが始まります。

                    <br />
                    <br />

                    Semantic Reality が、
                    あなたに最適な一台をご提案します。

                </p>

            </div>

            {/* ==========================================================
                Discovery Guide
            ========================================================== */}

            <HeroAssistant />

        </section>

    )

}