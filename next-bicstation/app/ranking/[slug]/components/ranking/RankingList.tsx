// ============================================================================
// FILE:
// /app/ranking/[slug]/components/ranking/RankingList.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 React
============================================================================ */

import { useMemo, useState } from 'react'

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
🔥 Constants
============================================================================ */

const GROUP_SIZE = 10

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    products?: RankingProduct[]

    startRank?: number

    totalCount?: number

}

/* ============================================================================
🔥 Ranking List
============================================================================ */

export default function RankingList({

    products = [],

    startRank = 5,

    totalCount,

}: Props) {

    /* =========================================================================
    🔥 State
    ========================================================================= */

    const [

        visibleGroups,

        setVisibleGroups,

    ] = useState(1)

    /* =========================================================================
    🔥 Empty
    ========================================================================= */

    if (

        products.length === 0

    ) {

        return null

    }

    /* =========================================================================
    🔥 Runtime
    ========================================================================= */

    const displayCount =

        totalCount
        ??

        products.length + startRank - 1

    /* =========================================================================
    🔥 Groups
    ========================================================================= */

    const groups = useMemo(() => {

        const result: RankingProduct[][] = []

        for (

            let i = 0;

            i < products.length;

            i += GROUP_SIZE

        ) {

            result.push(

                products.slice(

                    i,

                    i + GROUP_SIZE,

                ),

            )

        }

        return result

    }, [products])

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

                    上位モデル以外も含めた候補を一覧で比較できます。

                    用途・性能・価格帯を比較しながら、

                    あなたに最適なPCを見つけてください。

                </p>

                <div
                    className={styles.summary}
                >

                    <div
                        className={styles.summaryItem}
                    >

                        <span>

                            表示件数

                        </span>

                        <strong>

                            {products.length}

                        </strong>

                    </div>

                    <div
                        className={styles.summaryItem}
                    >

                        <span>

                            総ランキング

                        </span>

                        <strong>

                            {displayCount}

                        </strong>

                    </div>

                </div>

            </header>

            {/* ==========================================================
            Groups
            ========================================================== */}

            {

                groups

                    .slice(

                        0,

                        visibleGroups,

                    )

                    .map(

                        (

                            group,

                            groupIndex,

                        ) => {

                            const fromRank =

                                startRank +

                                groupIndex *

                                GROUP_SIZE

                            const toRank =

                                fromRank +

                                group.length -

                                1

                            return (

                                <section

                                    key={groupIndex}

                                    className={styles.group}

                                >

                                    <div
                                        className={
                                            styles.groupHeader
                                        }
                                    >

                                        <h3>

                                            {fromRank}〜{toRank}位

                                        </h3>

                                    </div>

                                    <div
                                        className={
                                            styles.list
                                        }
                                    >

                                        {

                                            group.map(

                                                (

                                                    product,

                                                    index,

                                                ) => (

                                                    <RankingListItem

                                                        key={

                                                            product.unique_id

                                                            ??

                                                            `${groupIndex}-${index}`

                                                        }

                                                        product={

                                                            product

                                                        }

                                                        rank={

                                                            fromRank +

                                                            index

                                                        }

                                                    />

                                                )

                                            )

                                        }

                                    </div>

                                </section>

                            )

                        }

                    )

            }

            {/* ==========================================================
            More
            ========================================================== */}

            {

                visibleGroups <

                groups.length && (

                    <div
                        className={
                            styles.moreArea
                        }
                    >

                        <button

                            type="button"

                            className={
                                styles.moreButton
                            }

                            onClick={() =>

                                setVisibleGroups(

                                    previous =>

                                        previous + 1,

                                )

                            }

                        >

                            {startRank +

                                visibleGroups *

                                    GROUP_SIZE}

                            位〜を表示

                        </button>

                    </div>

                )

            }

        </section>

    )

}