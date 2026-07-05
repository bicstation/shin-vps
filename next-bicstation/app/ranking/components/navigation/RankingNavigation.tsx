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

import {     useMemo,} from 'react'

/* ============================================================================
🔥 Runtime Contracts
============================================================================ */

import type {    NavigationRuntimeItem,} from '@/shared/lib/api/django/pc/navigation/contracts'
import type {    ProjectedRankingCategory,} from '@/shared/lib/api/django/pc/ranking/projection'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles  from '../../styles/navigation/navigation.module.css'

/* ============================================================================
🔥 Semantic Icons
============================================================================ */

import {   resolveSemanticIcon, } from '@/shared/lib/semantic/semanticIcons'
/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    items?: NavigationRuntimeItem[]

    categories?: ProjectedRankingCategory[]

    activeGroup?: string

    onSelect?: (

        group: string

    ) => void

}

/* ============================================================================
🔥 Ranking Navigation
============================================================================ */

export default function RankingNavigation({

    items = [],

    categories = [],

    activeGroup = 'all',

    onSelect,

}: Props) {

    /* =========================================================================
    🔥 Navigation Groups
    ========================================================================= */

    const groups =

        useMemo(() => {

            if (

                categories.length > 0

            ) {

                return [

                    'all',

                    ...categories.map(

                        category =>

                            category.parentGroup

                    ),

                ]

            }

            const values =

                new Set<string>()

            items.forEach(

                item => {

                    if (

                        item.parent_group

                    ) {

                        values.add(

                            item.parent_group

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

            categories,

            items,

        ])

    /* =========================================================================
    🔥 Experience Label
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

            case 'maker':

                return 'メーカー'

            default:

                return group

        }

    }

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <section
            className={styles.navigation}
        >

            {/* ==========================================================
            Header
            ========================================================== */}

            <header
                className={styles.header}
            >

                <h2
                    className={styles.title}
                >

                    ランキングカテゴリ

                </h2>

                <p
                    className={styles.description}
                >

                    用途・CPU・GPU・メーカーなど、
                    気になるカテゴリからランキングをご覧いただけます。

                </p>

            </header>

            {/* ==========================================================
            Navigation
            ========================================================== */}

            <nav
                className={styles.items}
                aria-label="ランキングカテゴリ"
            >

                {

                    groups.map(

                        group => {

                            const icon =

                                resolveSemanticIcon(

                                    group

                                )

                            return (

                                <button

                                    key={group}

                                    type="button"

                                    aria-current={

                                        group === activeGroup

                                            ? 'page'

                                            : undefined

                                    }

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

                                    <span
                                        className={styles.icon}
                                    >

                                        {icon}

                                    </span>

                                    <span
                                        className={styles.label}
                                    >

                                        {

                                            getLabel(

                                                group

                                            )

                                        }

                                    </span>

                                </button>

                            )

                        }

                    )

                }

            </nav>

        </section>

    )

}