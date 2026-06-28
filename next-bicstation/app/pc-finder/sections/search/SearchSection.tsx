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
Search Section
============================================================================ */

export default function SearchSection({

    disabled = false,

    loading = false,

    onSearch,

}: Props) {

    return (

        <section className={styles.section}>

            <div className={styles.card}>

                <span className={styles.step}>

                    STEP 3

                </span>

                <h2 className={styles.title}>

                    あなたに合ったPCを探してみましょう

                </h2>

                <p className={styles.description}>

                    選択した条件をもとに、
                    最適なPCを見つけます。

                </p>

                <SearchButton

                    loading={loading}

                    disabled={disabled}

                    onClick={onSearch}

                />

            </div>

        </section>

    )

}