// ============================================================================
// FILE:
// /app/discover/components/cards/UniverseCard.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Next
============================================================================ */

import Link from 'next/link'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles from '../../styles/discover.module.css'

/* ============================================================================
🔥 Semantic Icon
============================================================================ */

import SemanticIcon
    from '@/shared/lib/ui/semantic/SemanticIcon'

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {
    NavigationIntent,
} from '@/shared/lib/api/django/pc/navigation/adapter'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    item: NavigationIntent

}

/* ============================================================================
🔥 Universe Card
============================================================================ */

export default function UniverseCard({

    item,

}: Props) {

    console.log(item)

    const backgroundImage =
        `/images/discover/${item.group_slug}.png`

    return (

        <Link
            href={`/discover/${item.group_slug}`}
            className={styles.universeCard}
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >

            <div
                className={styles.universeCardOverlay}
            />

            {/* ==========================================================
            ICON
            ========================================================== */}

            <div
                className={styles.universeCardIcon}
            >

                <SemanticIcon
                    icon={item.icon}
                    color={item.color}
                    size={24}
                />

            </div>

            {/* ==========================================================
            CONTENT
            ========================================================== */}

            <div
                className={styles.universeCardContent}
            >

                <h3
                    className={styles.universeCardTitle}
                >

                    {item.presentation_name ?? item.group_name}

                </h3>

                <p
                    className={styles.universeCardDescription}
                >

                    {item.presentation_description}

                </p>

            </div>

            {/* ==========================================================
            META
            ========================================================== */}

            <div
                className={styles.universeCardMeta}
            >

                <span>

                    Explore

                </span>

                <span>

                    →

                </span>

            </div>

        </Link>

    )

}