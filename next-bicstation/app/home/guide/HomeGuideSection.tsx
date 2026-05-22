// /home/maya/shin-vps/next-bicstation/app/components/home/guide/HomeGuideSection.tsx

import Link
  from 'next/link'

import styles
  from '../styles/guide.module.css'

const GUIDE_ITEMS = [
  {
    badge: '初心者向け',

    title: '🎮 ゲーミングPCの選び方',

    description:
      '高FPS gaming に必要な GPU・CPU構成を初心者向けに解説。',

    href: '/guide/gaming-pc',
  },

  {
    badge: 'クリエイター向け',

    title: '🎬 動画編集PCの選び方',

    description:
      'Premiere Pro・DaVinci Resolve向け creator構成を比較。',

    href: '/guide/video-editing',
  },

  {
    badge: 'AI対応',

    title: '🤖 AI用PCの選び方',

    description:
      'Stable Diffusion・ローカルAI向け GPU構成をわかりやすく解説。',

    href: '/guide/ai-pc',
  },

  {
    badge: 'コスパ重視',

    title: '💰 コスパ重視PCの選び方',

    description:
      '価格と性能のバランスを重視した recommendation guide。',

    href: '/guide/cost-performance',
  },
]

export default function HomeGuideSection() {

  return (

    <section
      className={
        styles.guideSection
      }
    >

      {/* ====================================
      HEADER
      ==================================== */}

      <div
        className={
          styles.guideHeader
        }
      >

        <div
          className={
            styles.guideLabel
          }
        >
          BUYING GUIDE
        </div>

        <h2
          className={
            styles.guideTitle
          }
        >
          失敗しにくい
          PCの選び方
        </h2>

        <p
          className={
            styles.guideDescription
          }
        >
          gaming・AI画像生成・
          動画編集など。

          用途別 recommendation guide により、
          初心者でも比較しやすい
          semantic learning experience を
          提供します。
        </p>

      </div>

      {/* ====================================
      GRID
      ==================================== */}

      <div
        className={
          styles.guideGrid
        }
      >

        {GUIDE_ITEMS.map((item) => (

          <Link
            key={item.href}

            href={item.href}

            className={
              styles.guideCard
            }
          >

            {/* =================================
            TOP
            ================================= */}

            <div
              className={
                styles.guideCardTop
              }
            >

              <div
                className={
                  styles.guideCardBadge
                }
              >
                {item.badge}
              </div>

              <div
                className={
                  styles.guideCardTitle
                }
              >
                {item.title}
              </div>

              <div
                className={
                  styles.guideCardDescription
                }
              >
                {item.description}
              </div>

            </div>

            {/* =================================
            ACTION
            ================================= */}

            <div
              className={
                styles.guideCardAction
              }
            >
              解説を見る →
            </div>

          </Link>

        ))}

      </div>

    </section>

  )
}