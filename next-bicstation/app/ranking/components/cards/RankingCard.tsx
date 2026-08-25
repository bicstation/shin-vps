// ============================================================================
// FILE:
// /app/ranking/components/sections/RankingCard.tsx
// Copyright (c) 2026 Shin Corporation.
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
    RankingCategoryGroup,
} from '@/shared/lib/api/django/pc/ranking/contracts'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../../styles/sections/card-section.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    item: RankingCategoryGroup

}

/* ============================================================================
🔥 Ranking Card
============================================================================ */

export default function RankingCard({

    item,

}: Props) {

    const href =
        `/ranking/${item.group_slug}`

    const backgroundImage =
        `/images/ranking/${item.group_slug}.webp`

    const title =
        item.presentation_name ||
        item.group_name

    const description =
        item.presentation_description ||
        'おすすめランキングをご覧いただけます。'

    return (

        <Link
            href={href}
            className={styles.card}
        >

            <div
                className={styles.background}
                style={{
                    backgroundImage:
                        `url(${backgroundImage})`,
                }}
            />

            <div
                className={styles.overlay}
            />

            <div
                className={styles.content}
            >

                <div
                    className={styles.icon}
                >

                    <SemanticIcon
                        icon={item.icon}
                        color={item.color}
                        size={30}
                    />

                </div>

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

                <div
                    className={styles.meta}
                >

                    {item.product_count !== undefined && (

                        <span
                            className={styles.count}
                        >
                            {item.product_count.toLocaleString()}
                            件の商品
                        </span>

                    )}

                </div>

                <div
                    className={styles.footer}
                >

                    <span
                        className={styles.link}
                    >
                        ランキングを見る →
                    </span>

                </div>

            </div>

        </Link>

    )

}