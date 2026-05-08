// next-bicstation/app/product/[unique_id]/components/semantic/ProductSemanticSummary.tsx

import styles
  from './semantic.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildSummary(
  product: any
) {

  const text = JSON.stringify(
    product
  ).toLowerCase()

  // ======================================
  // AI + gaming
  // ======================================

  if (
    text.includes('rtx')
    && text.includes('32gb')
  ) {

    return {
      title:
        'gaming・AI・クリエイティブ用途をバランス良くこなしやすい構成',
      description:
        '高fps gaming・AI画像生成・動画編集など、幅広い用途を快適に行いやすい性能バランスを備えています。',
    }

  }

  // ======================================
  // gaming
  // ======================================

  if (
    text.includes('rtx')
    || text.includes('gaming')
  ) {

    return {
      title:
        '高fps gaming を快適に楽しみやすい構成',
      description:
        'FPSゲームや重量級タイトルを高画質・高フレームレートで遊びやすいGPU性能を備えています。',
    }

  }

  // ======================================
  // creator
  // ======================================

  if (
    text.includes('creator')
    || text.includes('premiere')
    || text.includes('davinci')
  ) {

    return {
      title:
        '動画編集・制作用途にも向いた構成',
      description:
        'Premiere ProやDaVinci Resolveなどの編集用途でも快適に作業しやすい性能を備えています。',
    }

  }

  // ======================================
  // default
  // ======================================

  return {
    title:
      '日常用途から幅広く使いやすいバランス構成',
    description:
      'ブラウジング・動画視聴・作業用途などを快適にこなしやすい扱いやすい性能です。',
  }

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductSemanticSummary({
  product,
}: Props) {

  const summary =
    buildSummary(
      product
    )

  return (

    <section
      className={
        styles.semanticSummarySection
      }
    >

      {/* ==================================
      LABEL
      ================================== */}

      <div
        className={
          styles.semanticSummaryLabel
        }
      >
        SEMANTIC SUMMARY
      </div>

      {/* ==================================
      TITLE
      ================================== */}

      <h2
        className={
          styles.semanticSummaryTitle
        }
      >
        {summary.title}
      </h2>

      {/* ==================================
      DESCRIPTION
      ================================== */}

      <p
        className={
          styles.semanticSummaryDescription
        }
      >
        {summary.description}
      </p>

      {/* ==================================
      FOOTER
      ================================== */}

      <div
        className={
          styles.semanticSummaryFooter
        }
      >

        <div
          className={
            styles.semanticSummaryFooterText
          }
        >
          ✔ semantic recommendation をもとに、
          利用シーン中心で整理しています。
        </div>

      </div>

    </section>

  )
}