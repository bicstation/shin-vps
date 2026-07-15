// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/components/recommendation/ProductNextIntent.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
  from './recommendation.module.css'

/* ============================================================================
🔥 Projection
============================================================================ */

import type {

  ProjectedProduct,

} from '@/shared/lib/api/django/pc/product-detail'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  product: ProjectedProduct

  related: any[]

}

/* ============================================================================
🔥 HELPERS
============================================================================ */

function buildNextIntent(

  product: ProjectedProduct,

  related: any[]

) {

  const intents: string[] = []

  // ==========================================================================
  // RELATED RUNTIME
  // ==========================================================================

  if (

    Array.isArray(

      related

    )

  ) {

    related.forEach(

      (

        item: any

      ) => {

        const text =

          JSON.stringify(item)

            .toLowerCase()

        // ================================================================
        // AI
        // ================================================================

        if (

          text.includes('ai')

          || text.includes('llm')

          || text.includes('stable diffusion')

        ) {

          intents.push(

            'AI画像生成・ローカルLLM用途への探索を広げられます'

          )

        }

        // ================================================================
        // CREATOR
        // ================================================================

        if (

          text.includes('creator')

          || text.includes('premiere')

          || text.includes('davinci')

        ) {

          intents.push(

            '動画編集やクリエイティブ workflow へ拡張できます'

          )

        }

        // ================================================================
        // GAMING
        // ================================================================

        if (

          text.includes('gaming')

          || text.includes('geforce')

          || text.includes('rtx')

        ) {

          intents.push(

            '高fps gaming や配信用途へ探索を広げられます'

          )

        }

        // ================================================================
        // BUSINESS
        // ================================================================

        if (

          text.includes('business')

          || text.includes('office')

        ) {

          intents.push(

            'ビジネス用途や日常workflow向け構成も探索できます'

          )

        }

      }

    )

  }

  // ==========================================================================
  // PRODUCT FALLBACK
  // ==========================================================================

  if (

    intents.length === 0

  ) {

    const text =

      JSON.stringify(product)

        .toLowerCase()

    if (

      text.includes('business')

    ) {

      intents.push(

        '次は動画編集・制作向けPCもおすすめです'

      )

    }

    if (

      text.includes('creator')

      || text.includes('premiere')

      || text.includes('davinci')

    ) {

      intents.push(

        '生成AI・ローカルAI用途への拡張も可能です'

      )

    }

    if (

      text.includes('gaming')

      || text.includes('geforce')

      || text.includes('rtx')

    ) {

      intents.push(

        '高性能GPUを活かした配信・動画編集にも向いています'

      )

    }

    if (

      text.includes('ai')

      || text.includes('rtx')

    ) {

      intents.push(

        'AI画像生成やLLM用途の探索にも繋がります'

      )

    }

  }

  // ==========================================================================
  // FINAL FALLBACK
  // ==========================================================================

  if (

    intents.length === 0

  ) {

    intents.push(

      '用途を広げながら次のPC探索へ進めます'

    )

  }

  // ==========================================================================
  // UNIQUE
  // ==========================================================================

  return Array.from(

    new Set(intents)

  ).slice(0, 4)

}

/* ============================================================================
🔥 COMPONENT
============================================================================ */

export default function ProductNextIntent({

  product,

  related,

}: Props) {

  // ==========================================================================
  // Intent Runtime
  // ==========================================================================

  const intents =

    buildNextIntent(

      product,

      related

    )

  // ==========================================================================
  // EMPTY
  // ==========================================================================

  if (

    intents.length === 0

  ) {

    return null

  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (

    <section

      className={

        styles.nextIntentSection

      }

    >

      <div

        className={

          styles.nextIntentHeader

        }

      >

        <div

          className={

            styles.nextIntentLabel

          }

        >

          NEXT EXPLORATION

        </div>

        <h2

          className={

            styles.nextIntentTitle

          }

        >

          次に探索したい用途

        </h2>

        <p

          className={

            styles.nextIntentDescription

          }

        >

          semantic runtime をもとに、
          workflow・用途・GPU構成の近い
          次の探索方向を整理しています。

        </p>

      </div>

      <div

        className={

          styles.nextIntentGrid

        }

      >

        {

          intents.map(

            (

              intent,

              index

            ) => (

              <div

                key={index}

                className={

                  styles.nextIntentCard

                }

              >

                {intent}

              </div>

            )

          )

        }

      </div>

    </section>

  )

}