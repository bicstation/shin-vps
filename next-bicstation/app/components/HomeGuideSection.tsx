// /home/maya/shin-vps/next-bicstation/app/components/HomeGuideSection.tsx
import Link
  from 'next/link'

import styles
  from '../page.module.css'

export default function HomeGuideSection() {

  // --------------------------------
  // Guide Items
  // --------------------------------
  const guideItems = [

    {
      title:
        '🎮 ゲーミングPCの選び方',

      description:
        'fps・GPU・メモリなど、ゲーム向けPC選びで失敗しないポイントを解説。',

      href:
        '/guide/gaming-pc',
    },

    {
      title:
        '🎬 動画編集PCの選び方',

      description:
        'Premiere ProやDaVinci Resolve向けのおすすめ構成を紹介。',

      href:
        '/guide/video-editing',
    },

    {
      title:
        '🤖 AI用PCの選び方',

      description:
        'Stable DiffusionやローカルAI向けGPU構成を初心者向けに解説。',

      href:
        '/guide/ai-pc',
    },

    {
      title:
        '💰 コスパ重視PCの選び方',

      description:
        '価格と性能のバランスを重視したおすすめ構成を比較。',

      href:
        '/guide/cost-performance',
    },

  ]

  return (
    <section
      className={
        styles.guideSection
      }
    >

      {/* =====================================
      HEADER
      ===================================== */}

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
          📘 BUYING GUIDE
        </div>

        <h2
          className={
            styles.guideTitle
          }
        >
          失敗しないPCの選び方
        </h2>

        <p
          className={
            styles.guideDescription
          }
        >
          初心者向けに、
          用途別のおすすめ構成や
          PC選びのポイントを
          わかりやすく解説しています。
        </p>

      </div>

      {/* =====================================
      GRID
      ===================================== */}

      <div
        className={
          styles.guideGrid
        }
      >

        {guideItems.map((
          item,
          index
        ) => (

          <Link
            key={index}

            href={item.href}

            className={
              styles.guideCard
            }
          >

            {/* =============================
            TITLE
            ============================= */}

            <div
              className={
                styles.guideCardTitle
              }
            >
              {item.title}
            </div>

            {/* =============================
            DESCRIPTION
            ============================= */}

            <div
              className={
                styles.guideCardDescription
              }
            >
              {item.description}
            </div>

            {/* =============================
            ACTION
            ============================= */}

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