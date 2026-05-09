// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/SemanticCard.tsx

import Link from 'next/link'

import styles from '../page.module.css'

/* =========================================
🔥 Types
========================================= */

export type SemanticCardItem = {

  slug: string

  name: string

  description?: string

  icon?: string

  count?: number

  semantic_role?:
    | 'highlight'
    | 'primary'
    | 'secondary'
    | 'supportive'

  color?: string
}

/* =========================================
🔥 Semantic Role Class
========================================= */

function getCardClass(
  semanticRole?: string
) {

  switch (semanticRole) {

    case 'highlight':
      return styles.semanticCardHighlight

    case 'primary':
      return styles.semanticCardPrimary

    case 'secondary':
      return styles.semanticCardSecondary

    case 'supportive':
      return styles.semanticCardSupportive

    default:
      return styles.semanticCard
  }
}

/* =========================================
🔥 Semantic Card
========================================= */

export function SemanticCard({
  item,
}: {
  item: SemanticCardItem
}) {

  return (

    <Link
      href={`/ranking/${item.slug}`}

      prefetch={false}

      className={
        getCardClass(
          item.semantic_role
        )
      }
    >

      {/* ================================= */}
      {/* Top */}
      {/* ================================= */}

      <div
        className={
          styles.cardTop
        }
      >

        {/* ================================= */}
        {/* Icon */}
        {/* ================================= */}

        <div
          className={
            styles.cardIcon
          }
        >
          {item.icon || '⚡'}
        </div>

        {/* ================================= */}
        {/* Count */}
        {/* ================================= */}

        {typeof item.count ===
          'number' && (

          <div
            className={
              styles.cardCount
            }
          >
            {item.count}
          </div>

        )}

      </div>

      {/* ================================= */}
      {/* Body */}
      {/* ================================= */}

      <div
        className={
          styles.cardBody
        }
      >

        {/* ================================= */}
        {/* Title */}
        {/* ================================= */}

        <div
          className={
            styles.cardTitle
          }
        >
          {item.name}
        </div>

        {/* ================================= */}
        {/* Description */}
        {/* ================================= */}

        {item.description && (

          <div
            className={
              styles.cardDescription
            }
          >
            {item.description}
          </div>

        )}

      </div>

      {/* ================================= */}
      {/* Footer */}
      {/* ================================= */}

      <div
        className={
          styles.cardFooter
        }
      >

        {/* ================================= */}
        {/* Semantic Role */}
        {/* ================================= */}

        {item.semantic_role && (

          <div
            className={
              styles.cardRole
            }
          >
            {item.semantic_role}
          </div>

        )}

        {/* ================================= */}
        {/* Arrow */}
        {/* ================================= */}

        <div
          className={
            styles.cardArrow
          }
        >
          →
        </div>

      </div>

    </Link>
  )
}
