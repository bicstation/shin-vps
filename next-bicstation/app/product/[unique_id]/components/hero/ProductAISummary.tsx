// ============================================================================
// FILE:
// app/product/[unique_id]/components/hero/ProductAISummary.tsx
// ============================================================================

import styles
  from './styles/ProductAISummary.module.css'

/* ============================================================================
🔥 Types
============================================================================ */

type SemanticReason = {

  slug?: string

  title?: string

  description?: string

}

type Props = {

  semanticRuntime?: {

    semantic_summary?: string

    semantic_reasons?: SemanticReason[]

    workflow_tags?: string[]

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
        'AI開発',

      'usage-creator':
        '動画編集',

      'usage-gaming':
        'FPS Gaming',

      'usage-business':
        'ビジネス',

      'usage-mobile':
        'モバイル',

    }

  return (
    labels[tag]
    || tag
  )

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductAISummary({

  semanticRuntime,

}: Props) {

  const summary =

    semanticRuntime
      ?.semantic_summary

    ||

    ''

  const workflowTags =

    semanticRuntime
      ?.workflow_tags

    ||

    []

  const reasons =

    semanticRuntime
      ?.semantic_reasons

    ||

    []

  if (

    !summary

    &&

    workflowTags.length === 0

  ) {

    return null

  }

  return (

    <section
      className={
        styles.aiSummary
      }
    >

      {/* ==========================================================
      HEADER
      ========================================================== */}

      <div
        className={
          styles.aiSummaryHeader
        }
      >

        <div
          className={
            styles.aiSummaryLabel
          }
        >
          PRODUCT SUMMARY
        </div>

        <h2
          className={
            styles.aiSummaryTitle
          }
        >
          この製品はどんなPC？
        </h2>

      </div>

      {/* ==========================================================
      SUMMARY
      ========================================================== */}

      {

        summary && (

          <div
            className={
              styles.aiSummaryBlock
            }
          >

            <p
              className={
                styles.aiSummaryText
              }
            >
              {summary}
            </p>

          </div>

        )

      }

      {/* ==========================================================
      WORKFLOW
      ========================================================== */}

      {

        workflowTags.length > 0 && (

          <div
            className={
              styles.aiSummaryWorkflow
            }
          >

            {

              workflowTags.map(

                (
                  tag,
                  index
                ) => (

                  <div
                    key={index}
                    className={
                      styles.aiSummaryChip
                    }
                  >
                    {
                      getWorkflowLabel(
                        tag
                      )
                    }
                  </div>

                )

              )

            }

          </div>

        )

      }

      {/* ==========================================================
      HIGHLIGHTS
      ========================================================== */}

      {

        reasons.length > 0 && (

          <ul
            className={
              styles.aiSummaryList
            }
          >

            {

              reasons
                .slice(0, 4)
                .map(

                  (
                    reason,
                    index
                  ) => (

                    <li
                      key={index}
                      className={
                        styles.aiSummaryItem
                      }
                    >
                      {

                        reason.title

                      }
                    </li>

                  )

                )

            }

          </ul>

        )

      }

    </section>

  )

}