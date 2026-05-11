// CTASection.tsx
'use client'

/* =========================================
🔥 Next
========================================= */

import Link
  from 'next/link'

/* =========================================
🔥 Styles
========================================= */

import styles
  from './CTASection.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  purpose: string

  semanticUsage: string
}

/* =========================================
🔥 CTA Text
========================================= */

function getPurposeText(
  purpose: string
) {

  switch (
    purpose
  ) {

    case 'gaming':
      return 'FPS・重量級ゲーム向け'

    case 'creator':
      return '動画編集・配信・制作向け'

    case 'business':
      return '法人・業務用途向け'

    case 'ai':
      return 'AI画像生成・LLM向け'

    default:
      return 'semantic recommendation'
  }
}

/* =========================================
🔥 CTA Section
========================================= */

export default function
CTASection({

  purpose,

  semanticUsage,

}: Props) {

  // ======================================
  // Text
  // ======================================

  const purposeText =

    getPurposeText(
      purpose
    )

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 CTASection',
    {
      purpose,
      semanticUsage,
    }
  )

  // ======================================
  // Render
  // ======================================

  return (

    <section
      className={
        styles.section
      }
    >

      {/* ==================================
      Glow
      ================================== */}

      <div
        className={
          styles.glow
        }
      />

      {/* ==================================
      Content
      ================================== */}

      <div
        className={
          styles.content
        }
      >

        {/* ============================= */}
        {/* Label */}
        {/* ============================= */}

        <div
          className={
            styles.label
          }
        >

          FINAL RECOMMENDATION

        </div>

        {/* ============================= */}
        {/* Title */}
        {/* ============================= */}

        <h2
          className={
            styles.title
          }
        >

          {purposeText}
          のおすすめ構成を比較する

        </h2>

        {/* ============================= */}
        {/* Description */}
        {/* ============================= */}

        <p
          className={
            styles.description
          }
        >

          semantic recommendation /
          workload analysis /
          recommendation balance
          をもとに、
          最適なPC候補を比較できます。

        </p>

        {/* ============================= */}
        {/* Semantic */}
        {/* ============================= */}

        <div
          className={
            styles.semanticBox
          }
        >

          <div
            className={
              styles.semanticLabel
            }
          >

            ACTIVE SEMANTIC

          </div>

          <div
            className={
              styles.semanticValue
            }
          >

            {semanticUsage}

          </div>

        </div>

        {/* ============================= */}
        {/* Actions */}
        {/* ============================= */}

        <div
          className={
            styles.actions
          }
        >

          <Link

            href={
              `/ranking/${semanticUsage}`
            }

            className={
              styles.primaryButton
            }
          >

            👉 ランキングを見る

          </Link>

          <Link

            href="/ranking"

            className={
              styles.secondaryButton
            }
          >

            すべてのランキングを見る

          </Link>

        </div>

      </div>

    </section>

  )
}