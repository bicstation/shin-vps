import Link
  from 'next/link'

import styles
  from '../page.module.css'

export default function RankingNavigation() {

  // =====================================
  // Navigation Items
  // =====================================

  const navigationItems = [

    {
      title:
        '🏠 TOPページへ戻る',

      description:
        '用途別比較や人気ランキング一覧へ戻ります。',

      href:
        '/',
    },

    {
      title:
        '📊 他のランキングを見る',

      description:
        'AI・gaming・動画編集・コスパなどを比較。',

      href:
        '/ranking',
    },

    {
      title:
        '🎯 PC診断を試す',

      description:
        '用途に合うおすすめ構成をAIベースで探索。',

      href:
        '/pc-finder',
    },

  ]

  return (

    <section
      className={
        styles.bottomNav
      }
    >

      {/* =================================
      HEADER
      ================================= */}

      <div
        className={
          styles.bottomNavHeader
        }
      >

        <div
          className={
            styles.bottomNavLabel
          }
        >
          CONTINUE EXPLORING
        </div>

        <h2
          className={
            styles.bottomNavTitle
          }
        >
          他の比較も見てみる
        </h2>

        <p
          className={
            styles.bottomNavDescription
          }
        >
          ranking・finder・semantic recommendation
          を横断しながら、
          自分に合う構成を比較できます。
        </p>

      </div>

      {/* =================================
      GRID
      ================================= */}

      <div
        className={
          styles.bottomNavGrid
        }
      >

        {navigationItems.map((item) => (

          <Link
            key={item.href}

            href={item.href}

            className={
              styles.bottomNavCard
            }
          >

            {/* ===========================
            TITLE
            =========================== */}

            <div
              className={
                styles.bottomNavCardTitle
              }
            >
              {item.title}
            </div>

            {/* ===========================
            DESCRIPTION
            =========================== */}

            <div
              className={
                styles.bottomNavCardDescription
              }
            >
              {item.description}
            </div>

            {/* ===========================
            ACTION
            =========================== */}

            <div
              className={
                styles.bottomNavCardAction
              }
            >
              比較を続ける →
            </div>

          </Link>

        ))}

      </div>

    </section>

  )
}