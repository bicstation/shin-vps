// /app/ranking/[type]/components/RecommendedForYou.tsx

import Link
  from 'next/link'

import styles
  from '../page.module.css'

type Props = {
  type: string
}

export default function RecommendedForYou({
  type,
}: Props) {

  // =====================================
  // Recommendation Routing
  // =====================================

  const recommendationMap: Record<
    string,
    {
      title: string
      description: string
      href: string
    }[]
  > = {

    'usage-gaming': [

      {
        title:
          '🎥 配信・動画編集向け',

        description:
          'ゲーム配信や4K動画編集も快適な高性能構成を比較。',

        href:
          '/ranking/usage-creator',
      },

      {
        title:
          '🤖 AI画像生成向け',

        description:
          'Stable DiffusionやローカルAIに強いGPU構成を比較。',

        href:
          '/ranking/usage-ai',
      },

      {
        title:
          '💰 コスパ重視モデル',

        description:
          '価格と性能バランスが良い人気構成を比較。',

        href:
          '/ranking/price-low',
      },

    ],

    'usage-ai': [

      {
        title:
          '🎮 高FPSゲーミング',

        description:
          'RTX4080以上の高FPS gaming向け構成を比較。',

        href:
          '/ranking/usage-gaming',
      },

      {
        title:
          '🎬 動画編集向け',

        description:
          'AI生成と4K編集を両立しやすい構成を比較。',

        href:
          '/ranking/usage-creator',
      },

      {
        title:
          '💼 開発・Docker向け',

        description:
          'LLM開発やDocker用途向け高メモリ構成を比較。',

        href:
          '/ranking/usage-development',
      },

    ],

    'usage-creator': [

      {
        title:
          '🎮 配信向けゲーミング',

        description:
          '配信・録画にも強いgaming構成を比較。',

        href:
          '/ranking/usage-gaming',
      },

      {
        title:
          '⚡ AI生成向け',

        description:
          '生成AIと動画編集を両立できるGPU構成を比較。',

        href:
          '/ranking/usage-ai',
      },

      {
        title:
          '💰 コスパ重視',

        description:
          '編集用途でも人気の価格バランス構成を比較。',

        href:
          '/ranking/price-low',
      },

    ],

  }

  // =====================================
  // Fallback
  // =====================================

  const items =

    recommendationMap[type]
    || [

      {
        title:
          '🎮 ゲーミングPC',

        description:
          '高FPS gaming向け人気モデルを比較。',

        href:
          '/ranking/usage-gaming',
      },

      {
        title:
          '⚡ AI向けPC',

        description:
          '生成AIやローカルAI向けGPU構成を比較。',

        href:
          '/ranking/usage-ai',
      },

      {
        title:
          '🎬 動画編集PC',

        description:
          '4K編集やcreator用途向け構成を比較。',

        href:
          '/ranking/usage-creator',
      },

    ]

  return (

    <section
      className={
        styles.recommendSection
      }
    >

      {/* =================================
      HEADER
      ================================= */}

      <div
        className={
          styles.recommendHeader
        }
      >

        <div
          className={
            styles.recommendLabel
          }
        >
          CONTINUE COMPARING
        </div>

        <h2
          className={
            styles.recommendTitle
          }
        >
          他の用途も比較してみる
        </h2>

        <p
          className={
            styles.recommendDescription
          }
        >
          gaming・AI・動画編集・コスパなど、
          他の人気用途も比較しながら
          自分に合う構成を探せます。
        </p>

      </div>

      {/* =================================
      GRID
      ================================= */}

      <div
        className={
          styles.recommendGrid
        }
      >

        {items.map((item) => (

          <Link
            key={item.href}

            href={item.href}

            className={
              styles.recommendCard
            }
          >

            {/* ===========================
            TITLE
            =========================== */}

            <div
              className={
                styles.recommendCardTitle
              }
            >
              {item.title}
            </div>

            {/* ===========================
            DESCRIPTION
            =========================== */}

            <div
              className={
                styles.recommendCardDescription
              }
            >
              {item.description}
            </div>

            {/* ===========================
            ACTION
            =========================== */}

            <div
              className={
                styles.recommendCardAction
              }
            >
              比較を見る →
            </div>

          </Link>

        ))}

      </div>

    </section>

  )
}