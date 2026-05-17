// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/ProductSemanticChips.tsx
// ============================================================================

'use client'

import Link from 'next/link'

import styles from '../styles/semantic-chips.module.css'

type Props = {
  groupedAttributes?: Record<
    string,
    any[]
  >
}

/* ============================================================================
🔥 Semantic Presentation
============================================================================ */

function getSemanticPresentation(
  groupKey?: string
) {

  switch (groupKey) {

    case 'usage':

      return {

        tone: 'usage',

        label: '用途',
      }

    case 'gpu':

      return {

        tone: 'gpu',

        label: 'Graphics',
      }

    case 'cpu':

      return {

        tone: 'cpu',

        label: 'CPU',
      }

    case 'maker':

      return {

        tone: 'maker',

        label: 'Brand',
      }

    default:

      return {

        tone: 'default',

        label: 'Semantic',
      }
  }
}

/* ============================================================================
🔥 Semantic Route
============================================================================ */

function buildSemanticRoute(
  groupKey?: string,
  slug?: string
) {

  if (
    !groupKey
    ||
    !slug
  ) {

    return '#'
  }

  return `/ranking/${slug}/`
}

/* ============================================================================
🔥 Product Semantic Chips
============================================================================ */

export default function ProductSemanticChips({
  groupedAttributes = {},
}: Props) {

  /* ==========================================================================
  🔥 Flatten Runtime Attributes
  ========================================================================== */

  const chips =
    Object.entries(
      groupedAttributes
    ).flatMap(

      ([groupKey, attrs]) =>

        (attrs || []).map(
          (attr: any) => ({

            groupKey,

            slug:
              attr?.slug,

            name:
              attr?.name,

            icon:
              attr?.icon,

            semanticRole:
              attr?.semantic_role,

          })
        )
    )

  /* ==========================================================================
  🔥 Empty
  ========================================================================== */

  if (!chips.length) {

    return null
  }

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <div className={styles.semanticChips}>

      {chips.map(
        (
          chip,
          index
        ) => {

          const presentation =

            getSemanticPresentation(
              chip.groupKey
            )

          const href =

            buildSemanticRoute(
              chip.groupKey,
              chip.slug
            )

          return (

            <Link
              key={
                chip.slug
                ||
                `${chip.groupKey}-${index}`
              }
              href={href}
              className={`
                ${styles.semanticChip}
                ${styles[`semantic-${presentation.tone}`]}
              `}
            >

              {/* ========================================================
              Glow
              ======================================================== */}

              <div
                className={
                  styles.semanticChipGlow
                }
              />

              {/* ========================================================
              Icon
              ======================================================== */}

              {chip.icon && (

                <span
                  className={
                    styles.semanticChipIcon
                  }
                >

                  {chip.icon}

                </span>

              )}

              {/* ========================================================
              Content
              ======================================================== */}

              <div
                className={
                  styles.semanticChipContent
                }
              >

                {/* Group */}

                <span
                  className={
                    styles.semanticChipGroup
                  }
                >

                  {presentation.label}

                </span>

                {/* Label */}

                <span
                  className={
                    styles.semanticChipLabel
                  }
                >

                  {chip.name}

                </span>

              </div>

            </Link>

          )
        }
      )}

    </div>

  )
}