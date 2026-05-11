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

}: {
  label: string
  title: string
  description?: string
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
  // Safe
  // ======================================

  if (
    !group
    ||
    !Array.isArray(
      group.items
    )
    ||
    !group.items.length
  ) {

    return null

  }

  // ======================================
  // Normalize
  // ======================================

  const normalizedItems =

    group.items.filter(
      item => (

        !!item?.name
        &&
        !!item?.slug

      )
    )

  // ======================================
  // Empty
  // ======================================

  if (
    !normalizedItems.length
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

      />

      {/* ================================= */}
      {/* Semantic Grid */}
      {/* ================================= */}

      <div
        className={
          styles.semanticGrid
        }
      >

        {normalizedItems.map(
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