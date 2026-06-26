// ============================================================================
// FILE:
// /app/ranking/components/RankingTabs.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 React
============================================================================ */

import {

    useMemo,

} from 'react'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../styles/ranking.module.css'

/* ============================================================================
🔥 Types
============================================================================ */

import type {

    RankingItem,

} from '../types/ranking'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    items:

        RankingItem[]

    activeType?:

        string

    onSelect?: (

        type: string

    ) => void

}

/* ============================================================================
🔥 Ranking Tabs
============================================================================ */

export default function RankingTabs({

    items,

    activeType = 'all',

    onSelect,

}: Props) {

    /* =========================================================================
    🔥 Runtime Groups
    ========================================================================= */

    const groups =

        useMemo(() => {

            const types =

                new Set<string>()

            items.forEach(

                item =>

                    types.add(

                        item.type

                    )

            )

            return [

                'all',

                ...Array.from(

                    types

                ),

            ]

        }, [

            items,

        ])

    /* =========================================================================
    🔥 Label
    ========================================================================= */

    function getLabel(

        type: string

    ) {

        switch (

            type

        ) {

            case 'all':

                return 'すべて'

            case 'usage':

                return '用途別'

            case 'performance':

                return '性能別'

            case 'price':

                return '価格帯'

            case 'maker':

                return 'メーカー'

            case 'new':

                return '新着'

            default:

                return type

        }

    }

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <section
            className={
                styles.rankingTabs
            }
        >

            {

                groups.map(

                    type => (

                        <button

                            key={

                                type

                            }

                            type="button"

                            className={

                                type === activeType

                                    ? styles.rankingTabActive

                                    : styles.rankingTab

                            }

                            onClick={() =>

                                onSelect?.(

                                    type

                                )

                            }

                        >

                            {

                                getLabel(

                                    type

                                )

                            }

                        </button>

                    )

                )

            }

        </section>

    )

}