// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/components/recommendation/RelatedProducts.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Components
============================================================================ */

import ProductExplorationCard
from './ProductExplorationCard'

import ProductRelationReasons
from './ProductRelationReasons'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
from './RelatedProducts.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  related: any[]

  continuationRuntime?: any

  traversalEdges?: any[]

}


/* ============================================================================
🔥 COMPONENT
============================================================================ */

export default function RelatedProducts({
related,
}: Props) {

// ==========================================================================
// RELATED PRODUCTS
// ==========================================================================

const relatedProducts =


Array.isArray(
  related
)
  ? related
  : []


// ==========================================================================
// DEBUG
// ==========================================================================

console.log(
'🔥 RELATED RUNTIME:',
relatedProducts
)

// ==========================================================================
// EMPTY
// ==========================================================================

if (
relatedProducts.length === 0
) {


return null


}

// ==========================================================================
// Render
// ==========================================================================

return (


<section
  className={
    styles.relatedProductsSection
  }

  id="related"
>

  {/* ================================================================
  HEADER
  ================================================================ */}

  <div
    className={
      styles.relatedProductsHeader
    }
  >

    <div
      className={
        styles.relatedProductsLabel
      }
    >

      <div>

        SEMANTIC CONTINUITY

      </div>

      {

        traversalEdges?.length > 0 && (

          <div>

            {traversalEdges.length}
            semantic edges active

          </div>
        )
      }

      {

        continuationRuntime
          ?.workflow_continuity && (

          <div>

            workflow continuity active

          </div>
        )
      }

    </div>

    <h2
      className={
        styles.relatedProductsTitle
      }
    >

      関連するPCを探索する

    </h2>

    <p
      className={
        styles.relatedProductsDescription
      }
    >

      workflow・semantic runtime・
      GPU構成・用途分析をもとに、
      近い方向性を持つPCを探索できます。

    </p>

  </div>

  {/* ================================================================
  HORIZONTAL SLIDER
  ================================================================ */}
  <div
    className={
      styles.relatedProductsSlider
    }
  >

    {
      relatedProducts.map(
        (
          relatedProduct: any,
          index: number,
        ) => {

          // ==========================================================
          // Traversal Edge
          // ==========================================================

          const traversalEdge =

            Array.isArray(
              traversalEdges
            )

              ? traversalEdges[index]

              : null

          return (

            <div
              key={
                relatedProduct?.unique_id
              }

              className={
                styles.relatedProductsItem
              }
            >

              {/* ======================================================
              EXPLORATION CARD
              ====================================================== */}

              <ProductExplorationCard
                product={
                  relatedProduct
                }
              />

              {/* ======================================================
              CONTINUATION RUNTIME
              ====================================================== */}

              {

                traversalEdge && (

                  <div>

                    <div>

                      {
                        traversalEdge
                          ?.edge_type
                      }

                    </div>

                    <div>

                      {
                        traversalEdge
                          ?.workflow_relation
                      }

                    </div>

                  </div>
                )
              }

              {/* ======================================================
              RELATION REASONS
              ====================================================== */}

              <ProductRelationReasons
                product={
                  relatedProduct
                }

                related={
                  relatedProducts
                }
              />

            </div>
          )
        }
      )
    }

  </div>




</section>


)
}
