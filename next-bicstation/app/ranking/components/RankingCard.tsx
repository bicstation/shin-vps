// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/RankingCard.tsx
// ============================================================================

import Link from 'next/link'

import styles from '../RankingPage.module.css'

import {
  getHumanSummary,
} from '../lib/humanSummary'

type Props = {
  attr: {
    slug?: string
    name?: string
    count?: number
    icon?: string
    color?: string
    semantic_role?: string
    semantic_weight?: number
  }

  summary?: string
}

/* ============================================================================
🔥 Semantic Role Label
============================================================================ */

const ROLE_LABELS: Record<
  string,
  string
> = {

  primary:
    'メインカテゴリ',

  secondary:
    '人気カテゴリ',

  highlight:
    '注目カテゴリ',

}

/* ============================================================================
🔥 Ranking Card
============================================================================ */

export default function RankingCard({
  attr,
  summary,
}: Props) {

  /* ==========================================================================
  🔥 Human Summary
  ========================================================================== */

  const humanSummary =
    summary
    ||
    getHumanSummary(attr)

  /* ==========================================================================
  🔥 Semantic Role
  ========================================================================== */

  const semanticRoleLabel =
    ROLE_LABELS[
      attr.semantic_role || ''
    ]

  /* ==========================================================================
  🔥 Product Count
  ========================================================================== */

  const productCountLabel =
    attr.count
      ? `${attr.count}モデル比較可能`
      : null

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <Link
      href={`/ranking/${attr.slug}`}
      className={styles.card}
    >

      {/* ================================================================
      GLOW
      ================================================================ */}

      <div className={styles.cardGlow} />

      {/* ================================================================
      COUNT
      ================================================================ */}

      {productCountLabel && (

        <div className={styles.cardCountBox}>

          <div className={styles.cardCount}>

            {attr.count}

          </div>

          <div className={styles.cardCountLabel}>

            models

          </div>

        </div>

      )}

      {/* ================================================================
      CONTENT
      ================================================================ */}

      <div className={styles.cardContent}>

        {/* ============================================================
        TOP LINE
        ============================================================ */}

        {semanticRoleLabel && (

          <div className={styles.cardTopLine}>

            {semanticRoleLabel}

          </div>

        )}

        {/* ============================================================
        HUMAN SUMMARY
        ============================================================ */}

        <div className={styles.cardEyebrow}>

          {humanSummary}

        </div>

        {/* ============================================================
        TITLE
        ============================================================ */}

        <h3 className={styles.cardTitle}>

          {attr.name}

        </h3>

        {/* ============================================================
        DESCRIPTION
        ============================================================ */}

        <p className={styles.cardDescription}>

          semantic ontology runtime による
          次世代PC discovery category。

        </p>

        {/* ============================================================
        SLUG
        ============================================================ */}

        <div className={styles.cardSlug}>

          {attr.slug}

        </div>

      </div>

      {/* ================================================================
      FOOTER
      ================================================================ */}

      <div className={styles.cardFooter}>

        {/* Icon */}
        {attr.icon && (

          <div className={styles.cardBadge}>

            {attr.icon}

          </div>

        )}

        {/* Color */}
        {attr.color && (

          <div className={styles.cardBadge}>

            {attr.color}

          </div>

        )}

        {/* Semantic Weight */}
        {attr.semantic_weight && (

          <div className={styles.cardBadge}>

            score {attr.semantic_weight}

          </div>

        )}

      </div>

      {/* ================================================================
      CTA
      ================================================================ */}

      <div className={styles.cardArrow}>

        →

      </div>

    </Link>

  )
}