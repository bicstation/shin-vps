// /home/maya/shin-vps/next-bicstation/app/components/home/recommendation/HomePopularSection.tsx

import Link
  from 'next/link'

import styles
  from '../styles/recommendation.module.css'

const POPULAR_ITEMS = [
  {
    title: '🎮 FPSゲーム向け',

    description:
      'APEX・VALORANT・CoDなどを高fpsで快適に遊びたい方向け。',

    href: '/ranking/gaming',
  },

  {
    title: '🎬 動画編集向け',

    description:
      'Premiere Pro・DaVinci Resolve向け creator PC を比較。',

    href: '/ranking/creator',
  },

  {
    title: '🤖 AI画像生成向け',

    description:
      'Stable Diffusion や生成AI用途向け GPU構成。',

    href: '/ranking/ai',
  },

  {
    title: '💰 コスパ重視',

    description:
      '価格と性能のバランスを重視した人気モデルを比較。',

    href: '/ranking/cost-performance',
  },
]

export default function HomePopularSection() {

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
          POPULAR RECOMMENDATIONS
        </div>

        <h2
          className={
            styles.popularTitle
          }
        >
          人気の
          recommendation
        </h2>

        <p
          className={
            styles.popularDescription
          }
        >
          gaming・AI画像生成・
          動画編集・コスパ重視など。

          人気用途から、
          比較しやすい semantic path を
          提供します。
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

        {POPULAR_ITEMS.map((item) => (

          <Link
            key={item.href}

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