'use client'

import { useState }
  from 'react'

import styles
  from './semantic.module.css'

/* =========================================
🔥 Types
========================================= */

type SemanticItem = {

  slug?: string

  title?: string

  name?: string

  description?: string

  role?: string

  weight?: number

}

type Props = {

  semanticRuntime?: {

    semantic_reasons?: SemanticItem[]

    related_intents?: SemanticItem[]

    workflow_tags?: SemanticItem[]

    semantic_labels?: SemanticItem[]

  }

}

/* =========================================
🔥 Helpers
========================================= */

function getTitle(
  value: any
): string {

  if (!value) {
    return ''
  }

  if (
    typeof value === 'string'
  ) {
    return value
  }

  return (
    value.title
    || value.name
    || value.slug
    || 'Unknown'
  )

}

function getDescription(
  value: any
): string {

  if (!value) {
    return ''
  }

  if (
    typeof value === 'string'
  ) {
    return value
  }

  return (
    value.description
    || ''
  )

}

function buildItems(
  semanticRuntime: any
) {

  const items = []

  for (
    const reason of (
      semanticRuntime
        ?.semantic_reasons
        || []
    )
  ) {

    items.push({

      category:
        'Semantic Reason',

      title:
        getTitle(reason),

      detail:
        getDescription(reason),

      role:
        reason?.role,

      weight:
        reason?.weight,

    })

  }

  for (
    const intent of (
      semanticRuntime
        ?.related_intents
        || []
    )
  ) {

    items.push({

      category:
        'Related Intent',

      title:
        getTitle(intent),

      detail:
        getDescription(intent),

      role:
        intent?.role,

      weight:
        intent?.weight,

    })

  }

  for (
    const workflow of (
      semanticRuntime
        ?.workflow_tags
        || []
    )
  ) {

    items.push({

      category:
        'Workflow',

      title:
        getTitle(workflow),

      detail:
        getDescription(workflow),

      role:
        workflow?.role,

      weight:
        workflow?.weight,

    })

  }

  for (
    const label of (
      semanticRuntime
        ?.semantic_labels
        || []
    )
  ) {

    items.push({

      category:
        'Semantic Label',

      title:
        getTitle(label),

      detail:
        getDescription(label),

      role:
        label?.role,

      weight:
        label?.weight,

    })

  }

  return items

}

/* =========================================
🔥 Component
========================================= */

export default function ProductSemanticAccordion({

  semanticRuntime,

}: Props) {

  const items =
    buildItems(
      semanticRuntime
    )

  const [
    activeIndex,
    setActiveIndex,
  ] = useState<number | null>(
    0
  )

  if (
    items.length === 0
  ) {

    return null

  }

  return (

    <section
      className={
        styles.semanticAccordionSection
      }
    >

      <div
        className={
          styles.semanticAccordionHeader
        }
      >

        <div
          className={
            styles.semanticAccordionLabel
          }
        >
          SEMANTIC AUTHORITY
        </div>

        <h2
          className={
            styles.semanticAccordionTitle
          }
        >
          Semantic Runtime Analysis
        </h2>

        <p
          className={
            styles.semanticAccordionDescription
          }
        >
          Backend Semantic Authority が
         生成した Runtime を表示しています。
        </p>

      </div>

      <div
        className={
          styles.semanticAccordionList
        }
      >

        {items.map(
          (
            item,
            index
          ) => {

            const isActive =
              activeIndex === index

            return (

              <div
                key={`${item.category}-${item.title}-${index}`}
                className={
                  styles.semanticAccordionItem
                }
              >

                <button
                  type="button"

                  onClick={() => {

                    setActiveIndex(

                      isActive
                        ? null
                        : index

                    )

                  }}

                  className={
                    styles.semanticAccordionButton
                  }
                >

                  <div
                    className={
                      styles.semanticAccordionButtonContent
                    }
                  >

                    <div
                      className={
                        styles.semanticAccordionItemTitle
                      }
                    >
                      {item.title}
                    </div>

                    <div
                      className={
                        styles.semanticAccordionItemSummary
                      }
                    >
                      {item.category}
                    </div>

                  </div>

                  <div
                    className={
                      styles.semanticAccordionIcon
                    }
                  >
                    {isActive
                      ? '−'
                      : '+'}
                  </div>

                </button>

                {isActive && (

                  <div
                    className={
                      styles.semanticAccordionContent
                    }
                  >

                    {item.detail && (

                      <p
                        className={
                          styles.semanticAccordionText
                        }
                      >
                        {item.detail}
                      </p>

                    )}

                    {item.role && (

                      <p
                        className={
                          styles.semanticAccordionText
                        }
                      >
                        Role: {item.role}
                      </p>

                    )}

                    {

                      typeof item.weight === 'number'
                      && (

                        <p
                          className={
                            styles.semanticAccordionText
                          }
                        >
                          Weight: {item.weight}
                        </p>

                      )

                    }

                  </div>

                )}

              </div>

            )

          }
        )}

      </div>

      <div
        className={
          styles.semanticAccordionFooter
        }
      >

        <div
          className={
            styles.semanticAccordionFooterText
          }
        >
          ✔ Backend Semantic Authority Runtime
          をそのまま表示しています
        </div>

      </div>

    </section>

  )

}