// ============================================================================
// FILE:
// /app/ranking/components/sections/RankingCard.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Next
============================================================================ */

import Link
    from 'next/link'

/* ============================================================================
🔥 Semantic Icon
============================================================================ */

import SemanticIcon
    from '@/shared/lib/ui/semantic/SemanticIcon'

/* ============================================================================
🔥 Types
============================================================================ */

import type {

    NavigationRuntimeItem,

} from '@/shared/lib/api/django/pc/navigation/contracts'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../../styles/sections/card-section.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    item: NavigationRuntimeItem

}

/* ============================================================================
🔥 Ranking Card
============================================================================ */

export default function RankingCard({

    item,

}: Props) {

    /* =========================================================================
    🔥 Presentation
    ========================================================================= */

    const href =

        `/ranking/${item.slug}`

    const backgroundImage =

        `/images/ranking/${item.slug}.webp`

    const title =

        item.name

    const description =

        item.description
        ||

        'おすすめランキングをご覧いただけます。'

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <Link

            href={href}

            className={styles.card}

        >

            {/* ==========================================================
            Background
            ========================================================== */}

            <div

                className={styles.background}

                style={{

                    backgroundImage:

                        `url(${backgroundImage})`,

                }}

            />

            {/* ==========================================================
            Overlay
            ========================================================== */}

            <div
                className={styles.overlay}
            />

            {/* ==========================================================
            Content
            ========================================================== */}

            <div
                className={styles.content}
            >

                {/* ======================================================
                Icon
                ====================================================== */}

                <div
                    className={styles.icon}
                >

                    <SemanticIcon

                        icon={

                            item.icon

                        }

                        color={

                            item.color

                        }

                        size={30}

                    />

                </div>

                {/* ======================================================
                Body
                ====================================================== */}

                <div
                    className={styles.body}
                >

                    <h3
                        className={styles.title}
                    >

                        {title}

                    </h3>

                    <p
                        className={styles.description}
                    >

                        {description}

                    </p>

                </div>

                {/* ======================================================
                Meta
                ====================================================== */}

                <div
                    className={styles.meta}
                >

                    {

                        item.product_count !== undefined && (

                            <span
                                className={styles.count}
                            >

                                {item.product_count.toLocaleString()}

                                件の商品

                            </span>

                        )

                    }

                    {

                        item.attribute_count !== undefined && (

                            <span
                                className={styles.count}
                            >

                                {item.attribute_count}

                                カテゴリ

                            </span>

                        )

                    }

                </div>

                {/* ======================================================
                Footer
                ====================================================== */}

                <div
                    className={styles.footer}
                >

                    <span
                        className={styles.link}
                    >

                        ランキングを見る

                        →

                    </span>

                </div>

            </div>

        </Link>

    )

}