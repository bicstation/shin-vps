// /home/maya/shin-vps/next-bicstation/app/components/HomePopularSection.tsx
import Link
  from 'next/link'

import styles
  from '../page.module.css'

export default function HomePopularSection() {

  // --------------------------------
  // Popular presets
  // --------------------------------
  const popularItems = [

    {
      title:
        '🎮 FPSゲーム向け',

      description:
        'APEX・VALORANT・CoDなどを高fpsで快適に遊びたい方向け。',

      href:
        '/ranking/gaming',
    },

    {
      title:
        '🎬 動画編集向け',

      description:
        'Premiere Pro・DaVinci Resolveなどの編集用途におすすめ。',

      href:
        '/ranking/creator',
    },

    {
      title:
        '🤖 AI画像生成向け',

      description:
        'Stable DiffusionやAI生成用途に強いGPU構成を比較。',

      href:
        '/ranking/ai',
    },

    {
      title:
        '💰 コスパ重視',

      description:
        '価格と性能のバランスを重視した人気モデルを比較。',

      href:
        '/ranking/cost-performance',
    },

  ]

  return (
    <section
      className={
        styles.popularSection
      }
    >

      {/* =====================================
      HEADER
      ===================================== */}

      <div
        className={
          styles.popularHeader
        }
      >

        <div
          className={
            styles.popularLabel
          }
        >
          🔥 POPULAR CATEGORY
        </div>

        <h2
          className={
            styles.popularTitle
          }
        >
          人気のおすすめカテゴリ
        </h2>

        <p
          className={
            styles.popularDescription
          }
        >
          用途や目的から、
          自分に合う高性能PCを
          すぐ探せます。
        </p>

      </div>

      {/* =====================================
      GRID
      ===================================== */}

      <div
        className={
          styles.popularGrid
        }
      >

        {popularItems.map((
          item,
          index
        ) => (

          <Link
            key={index}

            href={item.href}

            className={
              styles.popularCard
            }
          >

            <div
              className={
                styles.popularCardTitle
              }
            >
              {item.title}
            </div>

            <div
              className={
                styles.popularCardDescription
              }
            >
              {item.description}
            </div>

            <div
              className={
                styles.popularCardAction
              }
            >
              ランキングを見る →
            </div>

          </Link>

        ))}

      </div>

    </section>
  )
}