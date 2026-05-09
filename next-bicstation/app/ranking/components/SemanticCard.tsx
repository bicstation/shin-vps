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
}

/* =========================================
🔥 Semantic Card
========================================= */

export function SemanticCard({
  item,
}: {
  item: SemanticCardItem
}) {

  // ======================================
  // Safe
  // ======================================

  const href =

    item.slug
      ? `/ranking/${item.slug}`
      : '#'

  // ======================================
  // Render
  // ======================================

  return (

    <Link
      href={href}

      prefetch={false}

      className={
        styles.semanticCard
      }
    >

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

    </Link>
  )
}