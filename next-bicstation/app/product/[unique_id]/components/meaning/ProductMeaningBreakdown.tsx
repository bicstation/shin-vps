// ============================================================================
// FILE:
// app/product/[unique_id]/components/meaning/ProductMeaningBreakdown.tsx
// ============================================================================

import styles
  from './meaning.module.css'

/* ============================================================================
🔥 Types
============================================================================ */

type SemanticAttribute = {

  slug?: string

  title?: string

  description?: string

  role?: string

  weight?: string | number

}

type Props = {

  semanticRuntime?: {

    grouped_attributes?:
      Record<
        string,
        SemanticAttribute[]
      >

  }

}

/* ============================================================================
🔥 Helpers
============================================================================ */

function formatGroupName(
  key: string
): string {

  const labels:
    Record<string, string> = {

      cpu:
        'CPU',

      gpu:
        'GPU',

      memory:
        'Memory',

      storage:
        'Storage',

      maker:
        'Maker',

      usage:
        'Usage',

      cpu_feature:
        'CPU Features',

      device:
        'Device',

    }

  return (

    labels[key]

    ||

    key

  )

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductMeaningBreakdown({

  semanticRuntime,

}: Props) {

  const groups =

    semanticRuntime
      ?.grouped_attributes

    ||

    {}

  const entries =

    Object.entries(
      groups
    )

  if (

    entries.length === 0

  ) {

    return null

  }

  return (

    <section
      className={
        styles.meaningSection
      }
    >

      {/* ==========================================================
      HEADER
      ========================================================== */}

      <div
        className={
          styles.header
        }
      >

        <div
          className={
            styles.label
          }
        >
          MEANING BREAKDOWN
        </div>

        <h2
          className={
            styles.title
          }
        >
          この意味が生成された根拠
        </h2>

        <p
          className={
            styles.description
          }
        >
          Backend Semantic Runtime が
          使用した主要属性です。
        </p>

      </div>

      {/* ==========================================================
      GROUPS
      ========================================================== */}

      <div
        className={
          styles.groupGrid
        }
      >

        {

          entries.map(

            (
              [
                groupName,
                attributes
              ]
            ) => (

              <div
                key={groupName}
                className={
                  styles.groupCard
                }
              >

                <h3
                  className={
                    styles.groupTitle
                  }
                >
                  {
                    formatGroupName(
                      groupName
                    )
                  }
                </h3>

                <div
                  className={
                    styles.attributeList
                  }
                >

                  {

                    attributes.map(

                      (
                        attribute,
                        index
                      ) => (

                        <div
                          key={`${groupName}-${index}`}
                          className={
                            styles.attribute
                          }
                        >

                          <div
                            className={
                              styles.attributeTitle
                            }
                          >
                            {

                              attribute.title

                              ||

                              attribute.slug

                            }
                          </div>

                          {

                            attribute.description && (

                              <div
                                className={
                                  styles.attributeDescription
                                }
                              >
                                {
                                  attribute.description
                                }
                              </div>

                            )

                          }

                        </div>

                      )

                    )

                  }

                </div>

              </div>

            )

          )

        }

      </div>

    </section>

  )

}