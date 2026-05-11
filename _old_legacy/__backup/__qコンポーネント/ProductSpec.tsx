'use client'

import SemanticSection
  from '@/shared/components/semantic/SemanticSection'

import styles
  from './ProductSpec.module.css'

/* =========================================
🔥 Types
========================================= */

type Props = {
  product: any
}

/* =========================================
🔥 Spec Item
========================================= */

function SpecItem({
  label,
  value,
  emphasis = false,
}: {
  label: string
  value?: string
  emphasis?: boolean
}) {

  if (!value) {
    return null
  }

  return (
    <div
      className={
        emphasis
          ? styles.specItemStrong
          : styles.specItem
      }
    >

      <div
        className={
          styles.specLabel
        }
      >
        {label}
      </div>

      <div
        className={
          styles.specValue
        }
      >
        {value}
      </div>

    </div>
  )
}

/* =========================================
🔥 Component
========================================= */

export default function ProductSpec({
  product,
}: Props) {

  // --------------------------------
  // Safety
  // --------------------------------
  if (!product) {
    return null
  }

  // --------------------------------
  // Basic
  // --------------------------------
  const title =
    product.shortTitle
    || product.name
    || 'おすすめPC'

  const image =
    product.image_url
    || '/no-image.png'

  // --------------------------------
  // Semantic
  // --------------------------------
  const grouped =
    product
      ?.grouped_attributes
      || {}

  return (
    <section
      className={
        styles.section
      }
    >

      {/* ========================= */}
      {/* Header */}
      {/* ========================= */}

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
          Semantic Specification
        </div>

        <h2
          className={
            styles.title
          }
        >
          semantic構成分析
        </h2>

        <p
          className={
            styles.description
          }
        >
          gaming /
          creator /
          workload /
          recommendation balance
          を含む semantic analysis。
        </p>

      </div>

      {/* ========================= */}
      {/* Main Grid */}
      {/* ========================= */}

      <div
        className={
          styles.grid
        }
      >

        {/* ================================= */}
        {/* Image */}
        {/* ================================= */}

        <div
          className={
            styles.imageArea
          }
        >

          <div
            className={
              styles.imageWrap
            }
          >

            <img
              src={image}
              alt={title}

              className={
                styles.image
              }
            />

            <div
              className={
                styles.imageOverlay
              }
            />

          </div>

        </div>

        {/* ================================= */}
        {/* Content */}
        {/* ================================= */}

        <div
          className={
            styles.content
          }
        >

          {/* title */}
          <div
            className={
              styles.productTitle
            }
          >
            {title}
          </div>

          {/* ========================= */}
          {/* Core Specs */}
          {/* ========================= */}

          <div
            className={
              styles.specGrid
            }
          >

            <SpecItem
              label="GPU"
              value={
                product.gpu_model
              }
              emphasis
            />

            <SpecItem
              label="CPU"
              value={
                product.cpu_model
              }
            />

            <SpecItem
              label="メモリ"
              value={
                product.memory
              }
            />

            <SpecItem
              label="ストレージ"
              value={
                product.storage
              }
            />

            <SpecItem
              label="メーカー"
              value={
                product.maker
              }
            />

          </div>

          {/* ========================= */}
          {/* Semantic Groups */}
          {/* ========================= */}

          <div
            className={
              styles.semanticGroups
            }
          >

            {Object.entries(
              grouped
            ).map((
              [
                group,
                attrs,
              ]
            ) => (

              <SemanticSection
                key={group}

                title={group}

                groupType={group}

                attributes={
                  attrs as any[]
                }
              />

            ))}

          </div>

          {/* ========================= */}
          {/* Semantic Notes */}
          {/* ========================= */}

          <div
            className={
              styles.notes
            }
          >

            <div
              className={
                styles.noteCard
              }
            >

              <div
                className={
                  styles.noteTitle
                }
              >
                🎮 Gaming Semantic
              </div>

              <div
                className={
                  styles.noteText
                }
              >
                高リフレッシュレート /
                1440p gaming /
                balance workload
                に適した構成。
              </div>

            </div>

            <div
              className={
                styles.noteCard
              }
            >

              <div
                className={
                  styles.noteTitle
                }
              >
                ⚡ Recommendation Analysis
              </div>

              <div
                className={
                  styles.noteText
                }
              >
                semantic similarity /
                price balance /
                workload analysis
                を総合評価。
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  )
}