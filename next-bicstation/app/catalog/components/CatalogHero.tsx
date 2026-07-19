// ============================================================================
// FILE:
// /app/catalog/components/CatalogHero.tsx
// ============================================================================

'use client'

import type { ProductsRuntime } from '@/shared/lib/api/django/pc/products/contracts'

import styles from '../styles/catalog.module.css'

type Props = {
    runtime: ProductsRuntime
}

export default function CatalogHero({ runtime }: Props) {

    const { count, page, page_size } = runtime.data

    const title =
        runtime.presentation?.title
        || runtime.seo?.title
        || runtime.meaning?.identity
        || 'PC商品一覧'

    const subtitle = runtime.presentation?.subtitle

    const description =
        runtime.presentation?.description
        || runtime.seo?.description
        || runtime.meaning?.mission
        || '用途・メーカー・価格を問わず、登録されているすべてのPCを一覧で比較できます。'

    return (

        <section className={styles.catalogHero}>

            <div className={styles.catalogHeroContent}>

                <div className={styles.catalogHeroLabel}>
                    PRODUCT CATALOG
                </div>

                <h1 className={styles.catalogHeroTitle}>
                    {title}
                </h1>

                {subtitle && (
                    <h2 className={styles.catalogHeroSubtitle}>
                        {subtitle}
                    </h2>
                )}

                <p className={styles.catalogHeroDescription}>
                    {description}
                </p>

                <div className={styles.catalogHeroStats}>

                    <div className={styles.catalogHeroStat}>
                        <span className={styles.catalogHeroStatLabel}>
                            総商品数
                        </span>
                        <strong className={styles.catalogHeroStatValue}>
                            {count.toLocaleString()}
                        </strong>
                    </div>

                    <div className={styles.catalogHeroStat}>
                        <span className={styles.catalogHeroStatLabel}>
                            現在のページ
                        </span>
                        <strong className={styles.catalogHeroStatValue}>
                            {page}
                        </strong>
                    </div>

                    <div className={styles.catalogHeroStat}>
                        <span className={styles.catalogHeroStatLabel}>
                            表示件数
                        </span>
                        <strong className={styles.catalogHeroStatValue}>
                            {page_size}
                        </strong>
                    </div>

                </div>

            </div>

            <div className={styles.catalogHeroVisual} />

        </section>

    )

}