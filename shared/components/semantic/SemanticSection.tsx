// /home/maya/shin-vps/shared/components/semantic/SemanticSection.tsx

'use client'

import Link
  from 'next/link'

import styles
  from './SemanticSection.module.css'

import type {

  SemanticNavigationGroup,

} from '@/shared/lib/navigation/navigationTypes'

/* =========================================
🔥 Props
========================================= */

type Props = {

  group:
    SemanticNavigationGroup
}

/* =========================================
🔥 Group Labels
========================================= */

const GROUP_LABELS:
  Record<string, string> = {

  gpu:
    'GPU性能から選ぶ',

  maker:
    'メーカーから選ぶ',

  usage:
    '用途から選ぶ',

  device:
    'タイプから選ぶ',
}

/* =========================================
🔥 Component
========================================= */

export default function
SemanticSection({

  group,

}: Props) {

  // ======================================
  // Empty
  // ======================================

  if (
    !group?.items?.length
  ) {

    return null
  }

  // ======================================
  // Label
  // ======================================

  const label =

    GROUP_LABELS[
      group.key
    ]

    || group.title

  // ======================================
  // Render
  // ======================================

  return (

    <section
      className={
        styles.section
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.header
        }
      >

        <h2
          className={
            styles.title
          }
        >
          {label}
        </h2>

        {group.description && (

          <p
            className={
              styles.description
            }
          >
            {group.description}
          </p>

        )}

      </div>

      {/* ==================================
      ITEMS
      ================================== */}

      <div
        className={
          styles.items
        }
      >

        {group.items.map(item => (

          <Link
            key={
              item.slug
            }
            href={
              item.href
            }
            className={
              styles.item
            }
          >

            {/* ============================
            LABEL
            ============================ */}

            <span
              className={
                styles.label
              }
            >
              {item.label}
            </span>

            {/* ============================
            COUNT
            ============================ */}

            {typeof item.count ===
              'number'
              && item.count > 0 && (

              <span
                className={
                  styles.count
                }
              >
                {item.count}
              </span>

            )}

          </Link>

        ))}

      </div>

    </section>
  )
}