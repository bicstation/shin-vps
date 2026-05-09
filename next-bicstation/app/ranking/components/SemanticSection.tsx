// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/SemanticSection.tsx

import styles from '../page.module.css'

import {
  SemanticCard,
  type SemanticCardItem,
} from './SemanticCard'

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
        styles.sectionHeader
      }
    >

      {/* ================================= */}
      {/* Label */}
      {/* ================================= */}

      <div
        className={
          styles.sectionLabel
        }
      >
        {label}
      </div>

      {/* ================================= */}
      {/* Title */}
      {/* ================================= */}

      <h2
        className={
          styles.sectionTitle
        }
      >
        {title}
      </h2>

      {/* ================================= */}
      {/* Description */}
      {/* ================================= */}

      {description && (

        <p
          className={
            styles.sectionDescription
          }
        >
          {description}
        </p>

      )}

    </div>
  )
}

/* =========================================
🔥 Semantic Section
========================================= */

export function SemanticSection({
  group,
}: {
  group: SemanticGroup
}) {

  // --------------------------------
  // Empty Guard
  // --------------------------------

  if (
    !group?.items?.length
  ) {
    return null
  }

  return (

    <section
      className={
        styles.section
      }
    >

      {/* ================================= */}
      {/* Section Header */}
      {/* ================================= */}

      <SectionTitle
        label={group.label}
        title={group.title}
        description={group.description}
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
          item => (

            <SemanticCard
              key={item.slug}
              item={item}
            />

          )
        )}

      </div>

    </section>
  )
}