// ============================================================================
// FILE:
// /app/pc-finder/sections/search/SearchSection.tsx
// ============================================================================

'use client'

/* ============================================================================
Components
============================================================================ */

import SearchButton
    from '../../components/SearchButton'

/* ============================================================================
Styles
============================================================================ */

import styles
    from './SearchSection.module.css'

/* ============================================================================
Props
============================================================================ */

type Props = {

    disabled?: boolean

    loading?: boolean

    onSearch: () => void

}

/* ============================================================================
Journey

Discovery Trigger

This section marks the beginning of Semantic Discovery.

Responsibilities

- Encourage the user to begin Discovery
- Present the primary Discovery CTA
- Forward the Discovery action

This section does NOT

- Execute Runtime
- Generate Semantic Meaning
- Manage Recommendation Logic

============================================================================ */

export default function SearchSection({

    disabled = false,

    loading = false,

    onSearch,

}: Props) {

    return (

        <section className={styles.section}>

            <div className={styles.card}>

                {/* ==========================================================
                    Section Header
                ========================================================== */}

                <span className={styles.step}>

                    STEP 3

                </span>

                <h2 className={styles.title}>

                    あなたに合ったPCを探してみましょう

                </h2>

                <p className={styles.description}>

                    選択した条件をもとに、

                    Semantic Reality が
                    あなたに最適なPC探しを始めます。

                </p>

                {/* ==========================================================
                    Discovery Trigger
                ========================================================== */}

                <SearchButton

                    loading={loading}

                    disabled={disabled}

                    onClick={onSearch}

                />

            </div>

        </section>

    )

}