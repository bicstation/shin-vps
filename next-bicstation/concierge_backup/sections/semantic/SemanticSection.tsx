// /app/concierge/sections/semantic/SemanticSection.tsx

'use client'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticAttribute,
  SemanticGroup,
} from '../../contracts/semantic/SemanticPayload'

/* =========================================
🔥 COMPONENTS
========================================= */

import SemanticCard
  from './SemanticCard'

/* =========================================
🔥 STYLES
========================================= */

import styles
  from './SemanticSection.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  group: SemanticGroup
}

/* =========================================
🔥 Section Title
========================================= */

function SectionTitle({
  label,
  title,
  description,
  href,
}: {
  label: string
  title: string
  description?: string
  href: string
}) {

  return (
    <div className={styles.semanticHeader}>
      <div className={styles.semanticHeaderContent}>
        <div className={styles.semanticLabel}>{label}</div>
        <h2 className={styles.semanticTitle}>{title}</h2>
        {description && (
          <p className={styles.semanticDescription}>
            {description}
          </p>
        )}
      </div>

      <a className={styles.semanticViewAll} href={href}>
        すべて見る →
      </a>
    </div>
  )
}

/* =========================================
🔥 Semantic Section
========================================= */

export default function SemanticSection({
  group,
}: Props) {

  if (!group || !Array.isArray(group.items) || !group.items.length) {
    return null
  }

  const normalizedItems =
    group.items.filter(item => item?.name && item?.slug)

  if (!normalizedItems.length) return null

  const groupHref = group.href || `/ranking/${group.key}`

  return (
    <section className={styles.semanticSection}>
      <SectionTitle
        label={group.label}
        title={group.title}
        description={group.description}
        href={groupHref}
      />

      <div className={styles.semanticGrid}>
        {normalizedItems.map((item, index) => (
          <SemanticCard
            key={item.slug || index}
            item={{
              ...item,
              href: item.href || `/ranking/${item.slug}`,
            }}
          />
        ))}
      </div>
    </section>
  )
}