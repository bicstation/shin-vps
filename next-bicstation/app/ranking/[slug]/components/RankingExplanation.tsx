// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/RankingExplanation.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import styles
  from './RankingExplanation.module.css'

/* =========================================
🔥 Types
========================================= */

type Props = {

  products: any[]
}

/* =========================================
🔥 Component
========================================= */

export default function
RankingExplanation({
  products,
}: Props) {

  // ======================================
  // Empty
  // ======================================

  if (!products?.length) {
    return null
  }

  // ======================================
  // Semantic Scan
  // ======================================

  const joinedText =
    JSON.stringify(
      products
    ).toLowerCase()

  // ======================================
  // Detection
  // ======================================

  const has4090 =
    joinedText.includes(
      '4090'
    )

  const has4080 =
    joinedText.includes(
      '4080'
    )

  const has4070 =
    joinedText.includes(
      '4070'
    )

  const hasAi =

    joinedText.includes(
      'ai'
    )

    || joinedText.includes(
      'stable diffusion'
    )

  const hasCreator =

    joinedText.includes(
      'creator'
    )

    || joinedText.includes(
      'davinci'
    )

    || joinedText.includes(
      'premiere'
    )

  const hasGaming =

    joinedText.includes(
      'gaming'
    )

    || joinedText.includes(
      'fps'
    )

  const highMemory =

    joinedText.includes(
      '64gb'
    )

    || joinedText.includes(
      '32gb'
    )

  // ======================================
  // Insights
  // ======================================

  const insights = []

  // --------------------------------------
  // GPU
  // --------------------------------------

  if (
    has4090
    || has4080
  ) {

    insights.push({

      icon:
        '🎮',

      title:
        '高性能GPUモデル中心',

      description:
        'RTX4080以上の構成が多く、高FPS gaming や重量級ゲーム用途に強い構成が集まっています。',
    })

  } else if (
    has4070
  ) {

    insights.push({

      icon:
        '⚡',

      title:
        '性能と価格のバランス重視',

      description:
        'RTX4070クラスが中心で、gaming・動画編集・AI用途をバランス良く対応します。',
    })
  }

  // --------------------------------------
  // AI
  // --------------------------------------

  if (
    hasAi
    || has4090
    || has4080
  ) {

    insights.push({

      icon:
        '🤖',

      title:
        'AI用途にも強い',

      description:
        'VRAM容量の大きいGPU構成が多く、Stable Diffusion やローカルAI用途にも適しています。',
    })
  }

  // --------------------------------------
  // Creator
  // --------------------------------------

  if (
    hasCreator
    || highMemory
  ) {

    insights.push({

      icon:
        '🎬',

      title:
        '動画編集向け構成',

      description:
        '32GB以上メモリ搭載モデルが多く、4K編集や配信ワークロードにも向いています。',
    })
  }

  // --------------------------------------
  // Gaming
  // --------------------------------------

  if (
    hasGaming
  ) {

    insights.push({

      icon:
        '🔥',

      title:
        '高FPS gaming向け',

      description:
        '144fps〜240fpsクラスの gaming を想定した高性能モデルが中心です。',
    })
  }

  // --------------------------------------
  // Fallback
  // --------------------------------------

  if (
    !insights.length
  ) {

    insights.push({

      icon:
        '💡',

      title:
        '人気構成を中心に選定',

      description:
        '用途別に人気の高いおすすめ構成を中心にランキング化しています。',
    })
  }

  return (

    <div
      className={
        styles.grid
      }
    >

      {insights.map(
        (item) => (

          <article
            key={item.title}

            className={
              styles.card
            }
          >

            {/* ============================
            ICON
            ============================ */}

            <div
              className={
                styles.icon
              }
            >
              {item.icon}
            </div>

            {/* ============================
            BODY
            ============================ */}

            <div
              className={
                styles.body
              }
            >

              <h3
                className={
                  styles.title
                }
              >
                {item.title}
              </h3>

              <p
                className={
                  styles.description
                }
              >
                {item.description}
              </p>

            </div>

          </article>

        )
      )}

    </div>

  )
}