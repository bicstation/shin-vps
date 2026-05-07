/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'

import {
  fetchPCProductDetail,
  fetchRelatedProducts,
} from '@/shared/lib/api/django/pc/stats'

import ProductHero
  from './components/ProductHero'

import ProductSpec
  from './components/ProductSpec'

import ProductRadar
  from './components/ProductRadar'

import AiSummary
  from './components/AiSummary'

import FinalCta
  from './components/FinalCta'

import RelatedProducts
  from './components/RelatedProducts'

import AiContent
  from './components/AiContent'

import SemanticSection
  from '@/shared/components/semantic/SemanticSection'

import styles from './page.module.css'

/* =========================================
🔥 ISR
========================================= */

export const revalidate = 300

/* =========================================
🔥 Types
========================================= */

type Props = {
  params: Promise<{
    unique_id: string
  }>
}

/* =========================================
🔥 Empty
========================================= */

function EmptyState() {

  return (
    <div className={styles.empty}>

      <h2>
        ⚠️ 商品データがありません
      </h2>

      <p>
        semantic product data を取得できませんでした
      </p>

      <Link href="/">
        →
        TOPへ戻る
      </Link>

    </div>
  )
}

/* =========================================
🔥 Semantic Reason
========================================= */

function SemanticReasonSection({
  reasons,
}: {
  reasons?: string[]
}) {

  if (!reasons?.length) {
    return null
  }

  return (
    <section className={styles.reasonSection}>

      <div className={styles.sectionHeader}>

        <span className={styles.sectionLabel}>
          SEMANTIC RECOMMENDATION
        </span>

        <h2>
          なぜおすすめなのか
        </h2>

      </div>

      <div className={styles.reasonGrid}>

        {reasons.map(
          (reason, index) => (

            <div
              key={index}
              className={styles.reasonCard}
            >

              <div
                className={
                  styles.reasonIcon
                }
              >
                ✓
              </div>

              <div
                className={
                  styles.reasonText
                }
              >
                {reason}
              </div>

            </div>

          )
        )}

      </div>

    </section>
  )
}

/* =========================================
🔥 Semantic Attributes
========================================= */

function SemanticAttributeSections({
  groupedAttributes,
}: {
  groupedAttributes?: Record<
    string,
    any[]
  >
}) {

  if (
    !groupedAttributes
  ) {
    return null
  }

  const entries =
    Object.entries(
      groupedAttributes
    )

  if (!entries.length) {
    return null
  }

  return (
    <section className={styles.semanticSection}>

      <div className={styles.sectionHeader}>

        <span className={styles.sectionLabel}>
          SEMANTIC ANALYSIS
        </span>

        <h2>
          semantic構成分析
        </h2>

      </div>

      <div className={styles.semanticGrid}>

        {entries.map(
          ([
            group,
            attributes,
          ]) => (

            <SemanticSection
              key={group}
              title={group}
              groupType={group}
              attributes={attributes}
            />

          )
        )}

      </div>

    </section>
  )
}

/* =========================================
🔥 Confidence
========================================= */

function ConfidenceSection({
  confidence,
}: {
  confidence?: number
}) {

  if (!confidence) {
    return null
  }

  return (
    <section className={styles.confidenceSection}>

      <div className={styles.confidenceCard}>

        <div
          className={
            styles.confidenceCircle
          }
        >
          {confidence}%
        </div>

        <div
          className={
            styles.confidenceContent
          }
        >

          <h3>
            おすすめ一致度
          </h3>

          <p>
            semantic similarity と
            recommendation analysis
            に基づく一致度
          </p>

        </div>

      </div>

    </section>
  )
}

/* =========================================
🔥 Related Section
========================================= */

function RelatedSection({
  products,
}: {
  products: any[]
}) {

  if (!products?.length) {
    return null
  }

  return (
    <section className={styles.relatedSection}>

      <div className={styles.sectionHeader}>

        <span className={styles.sectionLabel}>
          SEMANTIC SIMILARITY
        </span>

        <h2>
          似たおすすめ構成
        </h2>

        <p>
          同じ semantic intent を持つ
          おすすめ構成
        </p>

      </div>

      <RelatedProducts
        products={products}
      />

    </section>
  )
}

/* =========================================
🔥 Page
========================================= */

export default async function Page({
  params,
}: Props) {

  // --------------------------------
  // Params
  // --------------------------------
  const {
    unique_id,
  } = await params

  // --------------------------------
  // Fetch
  // --------------------------------
  const product =
    await fetchPCProductDetail(
      unique_id
    )

  // --------------------------------
  // Empty
  // --------------------------------
  if (!product) {
    return <EmptyState />
  }

  // --------------------------------
  // Related
  // --------------------------------
  const relatedProducts =
    await fetchRelatedProducts(
      unique_id
    )

  return (
    <main className={styles.mainWrapper}>

      {/* ========================= */}
      {/* HERO */}
      {/* ========================= */}

      <ProductHero
        product={product}
      />

      {/* ========================= */}
      {/* CONFIDENCE */}
      {/* ========================= */}

      <ConfidenceSection
        confidence={
          product.semantic_confidence
        }
      />

      {/* ========================= */}
      {/* SEMANTIC REASON */}
      {/* ========================= */}

      <SemanticReasonSection
        reasons={
          product.semantic_reason
        }
      />

      {/* ========================= */}
      {/* SEMANTIC GROUPS */}
      {/* ========================= */}

      <SemanticAttributeSections
        groupedAttributes={
          product.grouped_attributes
        }
      />

      {/* ========================= */}
      {/* SPEC */}
      {/* ========================= */}

      <ProductSpec
        product={product}
      />

      {/* ========================= */}
      {/* RADAR */}
      {/* ========================= */}

      <ProductRadar
        product={product}
      />

      {/* ========================= */}
      {/* AI SUMMARY */}
      {/* ========================= */}

      <AiSummary
        summary={
          product.summary
        }
      />

      {/* ========================= */}
      {/* FINAL CTA */}
      {/* ========================= */}

      <FinalCta
        product={{
          maker:
            product.maker,

          name:
            product.name,

          image_url:
            product.image_url,
        }}

        summary={
          product.summary
        }

        finalUrl={
          product.url
        }

        isSoftware={false}
      />

      {/* ========================= */}
      {/* AI CONTENT */}
      {/* ========================= */}

      <AiContent
        content={
          product.ai_content
        }
      />

      {/* ========================= */}
      {/* RELATED */}
      {/* ========================= */}

      <RelatedSection
        products={
          relatedProducts
        }
      />

    </main>
  )
}