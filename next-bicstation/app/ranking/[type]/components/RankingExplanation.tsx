import styles
  from '../page.module.css'

type Props = {
  products: any[]
}

export default function RankingExplanation({
  products,
}: Props) {

  // =====================================
  // Empty
  // =====================================

  if (!products?.length) {
    return null
  }

  // =====================================
  // Helpers
  // =====================================

  const joinedText = JSON.stringify(
    products
  ).toLowerCase()

  // =====================================
  // Semantic Detection
  // =====================================

  const has4090 =
    joinedText.includes('4090')

  const has4080 =
    joinedText.includes('4080')

  const has4070 =
    joinedText.includes('4070')

  const hasAi =
    joinedText.includes('ai')
    || joinedText.includes('stable diffusion')

  const hasCreator =
    joinedText.includes('creator')
    || joinedText.includes('davinci')
    || joinedText.includes('premiere')

  const hasGaming =
    joinedText.includes('gaming')
    || joinedText.includes('fps')

  const highMemory =
    joinedText.includes('64gb')
    || joinedText.includes('32gb')

  // =====================================
  // Insight Cards
  // =====================================

  const insights = []

  // -------------------------------------
  // GPU Insight
  // -------------------------------------

  if (has4090 || has4080) {

    insights.push({

      icon:
        '🎮',

      title:
        '高性能GPUモデルが中心',

      description:
        'RTX4080以上の構成が多く、高FPS gamingや重量級ゲームに強いランキングです。',

    })

  } else if (has4070) {

    insights.push({

      icon:
        '⚡',

      title:
        '性能と価格のバランス重視',

      description:
        'RTX4070クラスが中心で、gaming・動画編集・AI用途をバランス良く対応します。',

    })

  }

  // -------------------------------------
  // AI Insight
  // -------------------------------------

  if (
    hasAi
    || has4090
    || has4080
  ) {

    insights.push({

      icon:
        '🤖',

      title:
        'AI画像生成にも強い',

      description:
        'VRAM容量が大きいGPUが多く、Stable DiffusionやローカルAI用途にも適しています。',

    })

  }

  // -------------------------------------
  // Creator Insight
  // -------------------------------------

  if (
    hasCreator
    || highMemory
  ) {

    insights.push({

      icon:
        '🎬',

      title:
        '動画編集向け構成が多い',

      description:
        '32GB以上メモリ搭載モデルが多く、4K編集や配信用途にも向いています。',

    })

  }

  // -------------------------------------
  // Gaming Insight
  // -------------------------------------

  if (hasGaming) {

    insights.push({

      icon:
        '🔥',

      title:
        '高FPS gaming向け',

      description:
        '144fps〜240fpsクラスのgaming用途を想定した高性能モデルが中心です。',

    })

  }

  // -------------------------------------
  // Fallback
  // -------------------------------------

  if (!insights.length) {

    insights.push({

      icon:
        '💡',

      title:
        '性能重視の人気構成',

      description:
        '用途別に人気の高いおすすめ構成を中心にランキング化しています。',

    })

  }

  return (

    <section
      className={
        styles.explanation
      }
    >

      {/* =================================
      HEADER
      ================================= */}

      <div
        className={
          styles.sectionHeader
        }
      >

        <span
          className={
            styles.sectionLabel
          }
        >
          WHY THIS RANKING
        </span>

        <h2>
          なぜこのランキングが人気？
        </h2>

        <p
          className={
            styles.sectionDescription
          }
        >
          このランキングで人気な理由や、
          他ランキングとの違いを
          わかりやすく整理しています。
        </p>

      </div>

      {/* =================================
      INSIGHT GRID
      ================================= */}

      <div
        className={
          styles.explanationGrid
        }
      >

        {insights.map((item) => (

          <div
            key={item.title}

            className={
              styles.insightCard
            }
          >

            {/* ===========================
            ICON
            =========================== */}

            <div
              className={
                styles.insightIcon
              }
            >
              {item.icon}
            </div>

            {/* ===========================
            TITLE
            =========================== */}

            <div
              className={
                styles.insightTitle
              }
            >
              {item.title}
            </div>

            {/* ===========================
            DESCRIPTION
            =========================== */}

            <div
              className={
                styles.insightDescription
              }
            >
              {item.description}
            </div>

          </div>

        ))}

      </div>

    </section>

  )
}