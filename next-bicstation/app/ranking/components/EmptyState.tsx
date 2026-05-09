// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/EmptyState.tsx

import Link from 'next/link'

import styles from '../page.module.css'

/* =========================================
🔥 Props
========================================= */

type EmptyStateProps = {

  title?: string

  description?: string

  showReload?: boolean
}

/* =========================================
🔥 Empty State
========================================= */

export function EmptyState({
  title =
    'semantic data unavailable',

  description =
    'semantic authority / ranking API / backend semantic engine を確認してください。',

  showReload = true,
}: EmptyStateProps) {

  return (

    <div
      className={
        styles.empty
      }
    >

      <div
        className={
          styles.emptyCard
        }
      >

        {/* ================================= */}
        {/* Label */}
        {/* ================================= */}

        <div
          className={
            styles.emptyLabel
          }
        >
          Semantic Platform Status
        </div>

        {/* ================================= */}
        {/* Title */}
        {/* ================================= */}

        <h2
          className={
            styles.emptyTitle
          }
        >
          {title}
        </h2>

        {/* ================================= */}
        {/* Description */}
        {/* ================================= */}

        <p
          className={
            styles.emptyText
          }
        >
          {description}
        </p>

        {/* ================================= */}
        {/* Actions */}
        {/* ================================= */}

        {showReload && (

          <div
            className={
              styles.emptyActions
            }
          >

            <Link
              href="/ranking"

              className={
                styles.emptyButton
              }
            >
              → reload semantic navigation
            </Link>

          </div>

        )}

      </div>

    </div>
  )
}