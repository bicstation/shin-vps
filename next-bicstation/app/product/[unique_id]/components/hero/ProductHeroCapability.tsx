// ============================================================================
// FILE:
// app/product/[unique_id]/components/hero/ProductHeroCapability.tsx
// ============================================================================

import styles
  from './styles/ProductHeroCapability.module.css'

/* ============================================================================
🔥 Types
============================================================================ */

type SemanticReason = {

  slug?: string

  title?: string

  description?: string

  role?: string

}

type Props = {

  semanticRuntime?: {

    workflow_tags?: string[]

    semantic_reasons?: SemanticReason[]

  }

}

/* ============================================================================
🔥 Workflow Labels
============================================================================ */

function getWorkflowLabel(
  tag: string
): string {

  const labels:
    Record<string, string> = {

      'usage-ai':
        'AI開発・生成AI',

      'usage-gaming':
        'FPS・ゲームプレイ',

      'usage-creator':
        '動画編集・制作',

      'usage-business':
        'ビジネス用途',

      'usage-mobile':
        'モバイル利用',

    }

  return (
    labels[tag]
    || tag
  )

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductHeroCapability({

  semanticRuntime,

}: Props) {

  const workflowTags =

    semanticRuntime
      ?.workflow_tags

    ||

    []

  const semanticReasons =

    semanticRuntime
      ?.semantic_reasons

    ||

    []

  const cards = [

    ...workflowTags.map(
      getWorkflowLabel
    ),

    ...semanticReasons
      .slice(0, 6)
      .map(
        reason =>
          reason.title
      ),

  ]
    .filter(Boolean)
    .slice(0, 12)

  if (
    cards.length === 0
  ) {

    return null

  }

  return (

    <section
      className={
        styles.heroCapabilitySection
      }
    >

      {/* ==========================================================
      HEADER
      ========================================================== */}

      <div
        className={
          styles.heroCapabilityHeader
        }
      >

        <div
          className={
            styles.heroCapabilityLabel
          }
        >
          WORKFLOW EXPERIENCE
        </div>

        <h2
          className={
            styles.heroCapabilityTitle
          }
        >
          この製品で実現できること
        </h2>

        <p
          className={
            styles.heroCapabilityDescription
          }
        >
          Semantic Runtime が判定した
          利用シーンと主要な特徴です。
        </p>

      </div>

      {/* ==========================================================
      GRID
      ========================================================== */}

      <div
        className={
          styles.heroCapabilityGrid
        }
      >

        {

          cards.map(

            (
              card,
              index
            ) => (

              <div
                key={index}
                className={
                  styles.heroCapabilityCard
                }
              >

                <div
                  className={
                    styles.heroCapabilityText
                  }
                >
                  ✓ {card}
                </div>

              </div>

            )

          )

        }

      </div>

    </section>

  )

}