// ============================================================================
// FILE:
// /app/ranking/components/navigation/RankingNavigation.tsx
// Copyright (c) 2026 Shin Corporation.
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
🔥 Runtime Contracts
============================================================================ */

import type {
    ProjectedRankingCategory,
} from '@/shared/lib/api/django/pc/ranking/projection'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../../styles/navigation/navigation.module.css'

/* ============================================================================
🔥 Semantic Icons
============================================================================ */

import {
    resolveSemanticIcon,
} from '@/shared/lib/semantic/semanticIcons'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    categories?: ProjectedRankingCategory[]

    activeGroup?: string

    onSelect?: (
        group: string
    ) => void

}

/* ============================================================================
🔥 UI Order
============================================================================ */

const RANKING_GROUP_ORDER = [

    'usage',

    'cpu',

    'gpu',

    'storage',

    'device',

    'memory',

    'maker',

    'monitor',

]

/* ============================================================================
🔥 Ranking Navigation
============================================================================ */

export default function RankingNavigation({

    categories = [],

    activeGroup = 'all',

    onSelect,

}: Props) {

    /* =========================================================================
    🔥 Ranking Groups
    ========================================================================= */

    const groups =

        useMemo(() => {

            const available =
                new Set(

                    categories

                        .map(

                            category =>
                                category.parentGroup

                        )

                        .filter(Boolean)

                )

            return [

                'all',

                ...RANKING_GROUP_ORDER.filter(

                    group =>
                        available.has(group)

                ),

            ]

        }, [categories])

    /* =========================================================================
    🔥 Experience Label
    ========================================================================= */

    function getLabel(
        group: string
    ) {

        switch (group) {

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

            <nav
                className={styles.items}
                aria-label="ランキングカテゴリ"
            >

                {groups.map(

                    group => {

                        const icon =
                            resolveSemanticIcon(group)

                        const isActive =
                            group === activeGroup

                        return (

                            <button
                                key={group}
                                type="button"
                                aria-current={
                                    isActive
                                        ? 'page'
                                        : undefined
                                }
                                className={
                                    isActive
                                        ? styles.navigationItemActive
                                        : styles.navigationItem
                                }
                                onClick={() =>
                                    onSelect?.(group)
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
                                    {getLabel(group)}
                                </span>

                            </button>

                        )

                    }

                )}

            </nav>

        </section>

    )

}