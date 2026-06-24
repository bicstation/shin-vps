// ============================================================================
// FILE:
// /app/discover/components/cards/UniverseCard.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Next
============================================================================ */

import Link
  from 'next/link'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
  from '../../styles/discover.module.css'

/* ============================================================================
🔥 Semantic Icon
============================================================================ */

import SemanticIcon
  from '@/shared/lib/ui/semantic/SemanticIcon'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  item:
    NavigationItem

}

/* ============================================================================
🔥 Universe Card
============================================================================ */

export default function UniverseCard({

  item,

}: Props) {

  const backgroundImage =

    `/images/discover/${item.group_slug}.png`

  return (

    <Link
      href={
        `/discover/${item.group_slug}`
      }
      className={
        styles.universeCard
      }
        style={{
          backgroundImage:
            `url(${backgroundImage})`,
          backgroundSize:
            'cover',
          backgroundPosition:
            'center',
        }}
    >

    <div
      className={
        styles.universeCardOverlay
      }
    />

      {/* ==========================================================
      ICON
      ========================================================== */}

      <div
        className={
          styles.universeCardIcon
        }
      >
        <SemanticIcon
          icon={
            item.icon
          }
          color={
            item.color
          }
          size={24}
        />
      </div>

      {/* ==========================================================
      CONTENT
      ========================================================== */}

      <div
        className={
          styles.universeCardContent
        }
      >
        <h3
          className={
            styles.universeCardTitle
          }
        >
          {item.group_name}
        </h3>
        <p
          className={
            styles.universeCardDescription
          }
        >
          Semantic Attribute
        </p>
      </div>

      {/* ==========================================================
      META
      ========================================================== */}

      <div
        className={
          styles.universeCardMeta
        }
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