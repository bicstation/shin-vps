// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/ranking/RankingList.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

    RankingProduct,

} from '../../types/contracts'

/* ============================================================================
🔥 Components
============================================================================ */

import RankingListItem
    from './RankingListItem'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../../styles/ranking/ranking-list.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    products?: RankingProduct[]

    startRank?: number

}

/* ============================================================================
🔥 Ranking List
============================================================================ */

export default function RankingList({

    products = [],

    startRank = 5,

}: Props) {

    /* =========================================================================
    🔥 Empty
    ========================================================================= */

    if (

        products.length === 0

    ) {

        return null

    }

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <section
            className={styles.section}
        >

            {/* ==========================================================
            Header
            ========================================================== */}

            <header
                className={styles.header}
            >

                <div
                    className={styles.eyebrow}
                >

                    COMPLETE RANKING

                </div>

                <h2
                    className={styles.title}
                >

                    ランキング一覧

                </h2>

                <p
                    className={styles.description}
                >

                    さらに多くの候補を比較し、
                    用途・性能・価格帯から最適な製品を探せます。

                </p>

            </header>

            {/* ==========================================================
            List
            ========================================================== */}

            <div
                className={styles.list}
            >

                {

                    products.map(

                        (

                            product,

                            index,

                        ) => (

                            <RankingListItem

                                key={

                                    product.unique_id

                                    ??

                                    index

                                }

                                product={

                                    product

                                }

                                rank={

                                    startRank + index

                                }

                            />

                        )

                    )

                }

            </div>

        </section>

    )

}