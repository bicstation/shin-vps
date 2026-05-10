// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/SemanticSection.tsx

import Link
  from 'next/link'

import SemanticCard, {
  type SemanticCardItem,
} from './SemanticCard'

import styles
  from '../page.module.css'

/* =========================================
🔥 Types
========================================= */

export type SemanticGroup = {

  key: string

  label: string

  title: string

  description?: string

  items: SemanticCardItem[]
}

/* =========================================
🔥 Section Title
========================================= */

function SectionTitle({
  label,
  title,
  description,
  groupKey,
}: {
  label: string
  title: string
  description?: string
  groupKey: string
}) {

  return (

    <div
      className={
        styles.semanticHeader
      }
    >

      {/* ================================= */}
      {/* Left */}
      {/* ================================= */}

      <div
        className={
          styles.semanticHeaderContent
        }
      >

        {/* =============================== */}
        {/* Label */}
        {/* =============================== */}

        <div
          className={
            styles.semanticLabel
          }
        >

          {label}

        </div>

        {/* =============================== */}
        {/* Title */}
        {/* =============================== */}

        <h2
          className={
            styles.semanticTitle
          }
        >

          {title}

        </h2>

        {/* =============================== */}
        {/* Description */}
        {/* =============================== */}

        {description && (

          <p
            className={
              styles.semanticDescription
            }
          >

            {description}

          </p>

        )}

      </div>

      {/* ================================= */}
      {/* Right */}
      {/* ================================= */}

      <Link
        href={
          `/ranking/${groupKey}`
        }

        className={
          styles.semanticViewAll
        }
      >

        すべて見る →

      </Link>

    </div>
  )
}

/* =========================================
🔥 Semantic Section
========================================= */

export default function SemanticSection({
  group,
}: {
  group: SemanticGroup
}) {

  // ======================================
  // Empty Guard
  // ======================================

  if (
    !group?.items?.length
  ) {

    return null

  }

  // ======================================
  // Render
  // ======================================

  return (

    <section
      className={
        styles.semanticSection
      }
    >

      {/* ================================= */}
      {/* Header */}
      {/* ================================= */}

      <SectionTitle

        label={
          group.label
        }

        title={
          group.title
        }

        description={
          group.description
        }

        groupKey={
          group.key
        }

      />

      {/* ================================= */}
      {/* Semantic Grid */}
      {/* ================================= */}

      <div
        className={
          styles.semanticGrid
        }
      >

        {group.items.map(
          (
            item,
            index
          ) => (

            <SemanticCard

              key={
                item.slug
                || index
              }

              item={{
                ...item,

                href:
                  item.href
                  || `/ranking/${item.slug}`,
              }}

            />

          )
        )}

      </div>

    </section>
  )
}