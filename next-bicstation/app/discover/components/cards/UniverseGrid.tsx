// ============================================================================
// FILE:
// /app/discover/components/cards/UniverseGrid.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {
    NavigationIntent,
} from '@/shared/lib/api/django/pc/navigation/adapter'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../../styles/discover.module.css'

/* ============================================================================
🔥 Components
============================================================================ */

import UniverseCard
    from './UniverseCard'

import EmptyState
    from '../common/EmptyState'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    items: NavigationIntent[]

}

/* ============================================================================
🔥 Universe Grid
============================================================================ */

export default function UniverseGrid({

    items,

}: Props) {

    if (!items?.length) {

        return <EmptyState />

    }

    return (

        <div
            className={styles.universeGrid}
        >

            {

                items.map(

                    (item) => (

                        <UniverseCard

                            key={
                                item.group_slug
                            }

                            item={
                                item
                            }

                        />

                    )

                )

            }

        </div>

    )

}