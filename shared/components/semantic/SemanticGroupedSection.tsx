// /home/maya/shin-dev/shin-vps/shared/components/semantic/SemanticGroupedSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import styles
  from './SemanticGroupedSection.module.css'

/* =========================================
🔥 Components
========================================= */

import SemanticBadge
  from './SemanticBadge'

/* =========================================
🔥 Semantic
========================================= */

import {
  groupSemanticSlugs,
} from '@/shared/lib/semantic'

/* =========================================
🔥 Types
========================================= */

type Props = {

  slugs: string[]

  title?: string
}

/* =========================================
🔥 Labels
========================================= */

const groupLabels = {

  device:
    '構造',

  usage:
    '用途',

  maker:
    'ブランド',

  gpu:
    'GPU',

  cpu:
    'CPU',

  memory:
    'メモリ',

  storage:
    'ストレージ',

  pc_feature:
    '特徴',

  product_type:
    '製品タイプ',

  unknown:
    'その他',
}

/* =========================================
🔥 Component
========================================= */

export default function
SemanticGroupedSection({

  slugs,

  title =
    'semantic attributes',

}: Props) {

  // ======================================
  // Empty
  // ======================================

  if (!slugs?.length) {
    return null
  }

  // ======================================
  // Grouped
  // ======================================

  const grouped =
    groupSemanticSlugs(
      slugs
    )

  return (

    <div
      className={
        styles.wrapper
      }
    >

      {/* ==================================
      TITLE
      ================================== */}

      <div
        className={
          styles.title
        }
      >
        {title}
      </div>

      {/* ==================================
      GROUPS
      ================================== */}

      {Object.entries(
        grouped
      ).map(([
        group,
        items,
      ]) => {

        // -------------------------------
        // Empty
        // -------------------------------

        if (!items?.length) {
          return null
        }

        return (

          <div
            key={group}

            className={
              styles.group
            }
          >

            {/* ==========================
            GROUP TITLE
            ========================== */}

            <div
              className={
                styles.groupTitle
              }
            >
              {
                groupLabels[
                  group
                ]
              }
            </div>

            {/* ==========================
            BADGES
            ========================== */}

            <div
              className={
                styles.badges
              }
            >

              {items.map(
                (
                  item
                ) => (

                  <SemanticBadge
                    key={
                      item.slug
                    }

                    slug={
                      item.slug
                    }
                  />

                )
              )}

            </div>

          </div>

        )
      })}

    </div>

  )
}

