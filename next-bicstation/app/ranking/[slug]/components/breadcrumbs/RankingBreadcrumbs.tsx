// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/breadcrumbs/RankingBreadcrumbs.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Next
============================================================================ */

import Link from 'next/link'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../../styles/breadcrumbs/breadcrumbs.module.css'

/* ============================================================================
🔥 Types
============================================================================ */

type Breadcrumb = {

    title?: string

    name?: string

    label?: string

    url?: string

    href?: string

}

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    breadcrumbs?: Breadcrumb[]

}

/* ============================================================================
🔥 Ranking Breadcrumbs
============================================================================ */

export default function RankingBreadcrumbs({

    breadcrumbs = [],

}: Props) {

    if (

        breadcrumbs.length === 0

    ) {

        return null

    }

    return (

        <nav

            className={styles.breadcrumbs}

            aria-label="Breadcrumb"

        >

            <ol className={styles.list}>

                {

                    breadcrumbs.map(

                        (

                            item,

                            index,

                        ) => {

                            const title =

                                item.title

                                ??

                                item.name

                                ??

                                item.label

                                ??

                                ''

                            const href =

                                item.url

                                ??

                                item.href

                                ??

                                '#'

                            const isLast =

                                index ===

                                breadcrumbs.length - 1

                            return (

                                <li

                                    key={`${href}-${index}`}

                                    className={styles.item}

                                >

                                    {

                                        isLast

                                            ? (

                                                <span className={styles.current}>

                                                    {title}

                                                </span>

                                            )

                                            : (

                                                <>

                                                    <Link

                                                        href={href}

                                                        className={styles.link}

                                                    >

                                                        {title}

                                                    </Link>

                                                    <span className={styles.separator}>

                                                        /

                                                    </span>

                                                </>

                                            )

                                    }

                                </li>

                            )

                        }

                    )

                }

            </ol>

        </nav>

    )

}