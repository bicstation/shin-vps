// ============================================================================
// FILE:
// /app/catalog/components/CatalogHero.tsx
// ============================================================================

'use client'

/* ============================================================================
Contracts
============================================================================ */

import type {

  ProductsRuntime,

} from '@/shared/lib/api/django/pc/products/contracts'

/* ============================================================================
Styles
============================================================================ */

import styles
  from '../styles/catalog.module.css'

/* ============================================================================
Props
============================================================================ */

type Props = {

  runtime: ProductsRuntime

}

/* ============================================================================
Experience

Catalog Introduction

Communicates the current Runtime Reality
before the user begins browsing products.

Responsibilities

- Present Catalog identity
- Present Runtime summary
- Build discovery confidence

This component does NOT

- Generate Runtime
- Generate Semantic Meaning
- Interpret Semantic Reality

============================================================================ */

export default function CatalogHero({

  runtime,

}: Props) {

  return (

    <section className={styles.catalogHero}>

      <div className={styles.catalogHeroContent}>

        <div className={styles.catalogHeroLabel}>

          PRODUCT CATALOG

        </div>

        <h1 className={styles.catalogHeroTitle}>

          {

            runtime.presentation?.title
            ||

            runtime.seo?.title
            ||

            runtime.meaning?.identity
            ||

            'PC商品一覧'

          }

        </h1>

        {runtime.presentation?.subtitle && (

          <h2 className={styles.catalogHeroSubtitle}>

            {runtime.presentation.subtitle}

          </h2>

        )}

        <p className={styles.catalogHeroDescription}>

          {

            runtime.presentation?.description
            ||

            runtime.seo?.description
            ||

            runtime.meaning?.mission
            ||

            '用途・メーカー・価格を問わず、登録されているすべてのPCを一覧で比較できます。'

          }

        </p>

        <div className={styles.catalogHeroStats}>

          <div className={styles.catalogHeroStat}>

            <span className={styles.catalogHeroStatLabel}>

              総商品数

            </span>

            <strong className={styles.catalogHeroStatValue}>

              {runtime.count.toLocaleString()}

            </strong>

          </div>

          <div className={styles.catalogHeroStat}>

            <span className={styles.catalogHeroStatLabel}>

              現在のページ

            </span>

            <strong className={styles.catalogHeroStatValue}>

              {runtime.page}

            </strong>

          </div>

          <div className={styles.catalogHeroStat}>

            <span className={styles.catalogHeroStatLabel}>

              表示件数

            </span>

            <strong className={styles.catalogHeroStatValue}>

              {runtime.page_size}

            </strong>

          </div>

        </div>

      </div>

      <div className={styles.catalogHeroVisual} />

    </section>

  )

}