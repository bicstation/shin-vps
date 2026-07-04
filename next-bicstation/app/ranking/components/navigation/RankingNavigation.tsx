// ============================================================================
// FILE:
// /app/ranking/components/navigation/RankingNavigation.tsx
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
🔥 Types
============================================================================ */

// import type {

//     RankingItem,

// } from '../../types/ranking'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../../styles/navigation/navigation.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    items:

    RankingItem[]

    activeGroup?:

    string

    onSelect?: (

        group: string

    ) => void

}

/* ============================================================================
🔥 Ranking Navigation
============================================================================ */

export default function RankingNavigation({

    items,

    activeGroup = 'all',

    onSelect,

}: Props) {

    console.table(

        items.map(item => ({

            slug: item.slug,

            type: item.type,

            parent_group: item.parent_group,

        }))

    )

    /* =========================================================================
    🔥 Runtime Groups
    ========================================================================= */

    const groups =

        useMemo(() => {

            const values =

                new Set<string>()

            items.forEach(

                item => {

                    if (

                        item.type

                    ) {

                        values.add(

                            item.type

                        )

                    }

                }

            )

            return [

                'all',

                ...Array.from(

                    values

                ),

            ]

        }, [

            items,

        ])

    /* =========================================================================
    🔥 Label
    ========================================================================= */

    function getLabel(

        group: string

    ) {

        switch (

        group

        ) {

            case 'all':

                return 'すべて'

            case 'usage':

                return '用途別'

            case 'device':

                return 'デバイス別'

            case 'cpu':

                return 'CPU'

            case 'gpu':

                return 'GPU'

            case 'memory':

                return 'メモリ'

            case 'storage':

                return 'ストレージ'

            case 'monitor':

                return 'モニター'

            default:

                return group

        }

    }

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <section
            className={
                styles.navigation
            }
        >

            {

                groups.map(

                    group => (

                        <button

                            key={
                                group
                            }

                            type="button"

                            className={

                                group === activeGroup

                                    ? styles.navigationItemActive

                                    : styles.navigationItem

                            }

                            onClick={() =>

                                onSelect?.(

                                    group

                                )

                            }

                        >

                            {

                                getLabel(

                                    group

                                )

                            }

                        </button>

                    )

                )

            }

        </section>

    )

}