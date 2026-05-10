// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/EmptyState.tsx

import Link
  from 'next/link'

import styles
  from '../page.module.css'

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

export default function EmptyState({
  title =
    'ランキングデータを読み込めませんでした',

  description =
    '現在ランキングデータが取得できません。API接続または semantic backend を確認してください。',

  showReload = true,
}: EmptyStateProps) {

  return (

    <section
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

          RANKING STATUS

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

              ランキングを再読み込み

            </Link>

            <Link
              href="/"

              className={
                styles.emptySubButton
              }
            >

              トップページへ戻る

            </Link>

          </div>

        )}

      </div>

    </section>
  )
}