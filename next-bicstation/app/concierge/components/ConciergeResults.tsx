'use client'

/* ============================================================================
🔥 Next
============================================================================ */

import Link from 'next/link'

/* ============================================================================
🔥 Consultation Projection
============================================================================ */

import type {
    ProjectedConsultationRuntime,
} from '@/shared/lib/api/django/pc/consultation/projection'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles from './ConciergeResults.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

interface ConciergeResultsProps {

    consultation:
    ProjectedConsultationRuntime | null

}

/* ============================================================================
🔥 Concierge Results
============================================================================ */

export default function ConciergeResults({

    consultation,

}: ConciergeResultsProps) {

    /* ========================================================================
    Initial
    ======================================================================== */

    if (!consultation) {

        return null

    }

    /* ========================================================================
    Presentation
    ======================================================================== */

    const presentation =
        consultation.presentation

    /* ========================================================================
    Summary
    ======================================================================== */

    const summary =
        consultation.summary

    /* ========================================================================
    Products
    ======================================================================== */

    const products =
        consultation.products

    /* ========================================================================
    No Results
    ======================================================================== */

    if (!summary.hasResult || !products.length) {

        return (

            <section
                className={
                    styles.empty
                }
            >

                <div
                    className={
                        styles.statusIcon
                    }
                >
                    0
                </div>

                <div>

                    <span
                        className={
                            styles.eyebrow
                        }
                    >
                        AI CONCIERGE
                    </span>

                    <h2>
                        条件に合うPCが見つかりませんでした
                    </h2>

                    <p>
                        条件を少し変えて、もう一度お試しください。
                    </p>

                </div>

            </section>

        )

    }

    /* ========================================================================
    Results
    ======================================================================== */

    return (

        <section
            className={
                styles.results
            }
        >

            {/* ==================================================================
            Result Header
            ================================================================== */}

            <header
                className={
                    styles.header
                }
            >

                <div
                    className={
                        styles.headerCopy
                    }
                >

                    <span
                        className={
                            styles.eyebrow
                        }
                    >
                        AI CONCIERGE
                    </span>

                    <h2>
                        {
                            presentation?.title
                            ??
                            'おすすめのPC'
                        }
                    </h2>

                    {

                        presentation?.subtitle && (

                            <p
                                className={
                                    styles.subtitle
                                }
                            >
                                {
                                    presentation.subtitle
                                }
                            </p>

                        )

                    }

                    {

                        presentation?.description && (

                            <p
                                className={
                                    styles.description
                                }
                            >
                                {
                                    presentation.description
                                }
                            </p>

                        )

                    }

                </div>

                <div
                    className={
                        styles.resultCount
                    }
                >

                    <strong>
                        {
                            summary.resultCount
                        }
                    </strong>

                    <span>
                        RESULTS
                    </span>

                </div>

            </header>


            {/* ==================================================================
            Divider
            ================================================================== */}

            <div
                className={
                    styles.divider
                }
            />


            {/* ==================================================================
            Product Grid
            ================================================================== */}

            <div
                className={
                    styles.grid
                }
            >

                {

                    products.map(

                        product => (

                            <Link

                                key={
                                    product.uniqueId
                                }

                                href={
                                    `/product/${encodeURIComponent(
                                        product.uniqueId,
                                    )}/`
                                }

                                className={
                                    styles.card
                                }

                            >

                                {/* =================================================
                                Product Image
                                ================================================= */}

                                <div
                                    className={
                                        styles.imageWrap
                                    }
                                >

                                    {

                                        product.imageUrl ? (

                                            <img

                                                src={
                                                    product.imageUrl
                                                }

                                                alt={
                                                    product.name
                                                }

                                                className={
                                                    styles.image
                                                }

                                            />

                                        ) : (

                                            <div
                                                className={
                                                    styles.imagePlaceholder
                                                }
                                            >
                                                NO IMAGE
                                            </div>

                                        )

                                    }

                                </div>


                                {/* =================================================
                                Product Information
                                ================================================= */}

                                <div
                                    className={
                                        styles.productInfo
                                    }
                                >

                                    <p
                                        className={
                                            styles.maker
                                        }
                                    >
                                        {
                                            product.maker
                                        }
                                    </p>

                                    <h3
                                        className={
                                            styles.productName
                                        }
                                    >
                                        {
                                            product.name
                                        }
                                    </h3>


                                    {/* =============================================
                                    Specifications
                                    ============================================= */}

                                    <div
                                        className={
                                            styles.specs
                                        }
                                    >

                                        {

                                            product.cpuModel && (

                                                <div
                                                    className={
                                                        styles.spec
                                                    }
                                                >

                                                    <span>
                                                        CPU
                                                    </span>

                                                    <strong>
                                                        {
                                                            product.cpuModel
                                                        }
                                                    </strong>

                                                </div>

                                            )

                                        }


                                        {

                                            product.gpuModel && (

                                                <div
                                                    className={
                                                        styles.spec
                                                    }
                                                >

                                                    <span>
                                                        GPU
                                                    </span>

                                                    <strong>
                                                        {
                                                            product.gpuModel
                                                        }
                                                    </strong>

                                                </div>

                                            )

                                        }


                                        {

                                            product.memoryGb != null
                                            &&
                                            product.memoryGb > 0
                                            && (

                                                <div
                                                    className={
                                                        styles.spec
                                                    }
                                                >

                                                    <span>
                                                        MEMORY
                                                    </span>

                                                    <strong>
                                                        {
                                                            product.memoryGb
                                                        }
                                                        GB
                                                    </strong>

                                                </div>

                                            )

                                        }


                                        {

                                            product.storageGb != null
                                            &&
                                            product.storageGb > 0
                                            && (

                                                <div
                                                    className={
                                                        styles.spec
                                                    }
                                                >

                                                    <span>
                                                        STORAGE
                                                    </span>

                                                    <strong>
                                                        {
                                                            product.storageGb
                                                        }
                                                        GB
                                                    </strong>

                                                </div>

                                            )

                                        }


                                        {

                                            product.displayInfo && (

                                                <div
                                                    className={
                                                        styles.spec
                                                    }
                                                >

                                                    <span>
                                                        DISPLAY
                                                    </span>

                                                    <strong>
                                                        {
                                                            product.displayInfo
                                                        }
                                                    </strong>

                                                </div>

                                            )

                                        }


                                        {

                                            product.isAiPc && (

                                                <div
                                                    className={
                                                        styles.spec
                                                    }
                                                >

                                                    <span>
                                                        AI PC
                                                    </span>

                                                    <strong>
                                                        AI PC
                                                    </strong>

                                                </div>

                                            )

                                        }

                                    </div>


                                    {/* =============================================
                                    Price / Score
                                    ============================================= */}

                                    <div
                                        className={
                                            styles.cardBottom
                                        }
                                    >

                                        <div>

                                            <span
                                                className={
                                                    styles.priceLabel
                                                }
                                            >
                                                PRICE
                                            </span>

                                            <p
                                                className={
                                                    styles.price
                                                }
                                            >
                                                ¥
                                                {
                                                    product.price.toLocaleString(
                                                        'ja-JP',
                                                    )
                                                }
                                            </p>

                                        </div>

                                        {

                                            product.score > 0 && (

                                                <div
                                                    className={
                                                        styles.score
                                                    }
                                                >

                                                    <span>
                                                        SCORE
                                                    </span>

                                                    <strong>
                                                        {
                                                            product.score
                                                        }
                                                    </strong>

                                                </div>

                                            )

                                        }

                                    </div>


                                    {/* =============================================
                                    Detail Link Hint
                                    ============================================= */}

                                    <div
                                        className={
                                            styles.detailHint
                                        }
                                    >

                                        <span>
                                            商品詳細を見る
                                        </span>

                                        <span
                                            aria-hidden="true"
                                        >
                                            →
                                        </span>

                                    </div>

                                </div>

                            </Link>

                        )

                    )

                }

            </div>

        </section>

    )

}