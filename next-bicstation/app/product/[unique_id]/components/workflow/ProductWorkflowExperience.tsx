// ============================================================================
// FILE:
// app/product/[unique_id]/components/workflow/ProductWorkflowExperience.tsx
// ============================================================================

import styles
  from './workflow.module.css'

type Props = {

  workflowTags?: string[]

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductWorkflowExperience({

  workflowTags = [],

}: Props) {

  if (

    workflowTags.length === 0

  ) {

    return null

  }

  return (

    <section
      className={
        styles.workflow
      }
    >

      <div
        className={
          styles.header
        }
      >

        <h2
          className={
            styles.title
          }
        >
          おすすめ用途
        </h2>

        <p
          className={
            styles.description
          }
        >
          この製品が活躍するワークフロー
        </p>

      </div>

      <div
        className={
          styles.chips
        }
      >

        {

          workflowTags.map(

            (
              tag,
              index
            ) => (

              <div
                key={`${tag}-${index}`}
                className={
                  styles.chip
                }
              >
                {tag}
              </div>

            )

          )

        }

      </div>

    </section>

  )

}