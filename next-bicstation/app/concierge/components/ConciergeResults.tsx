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
    Backend Response
    ========================================================================

    Backend Consultation Runtime

        response
            ↓
        Adapter Projection
            ↓
        ProjectedConsultationRuntime.response
            ↓
        AI Concierge

    Concierge does NOT generate
    or reinterpret this response.
    ======================================================================== */

    const response =
        consultation.response

    /* ========================================================================
    No Results
    ======================================================================== */

    if (
        !summary.hasResult
        ||
        !products.length
    ) {

        return (

            <section
                className={
                    styles.empty
                }
            >

                {/* =============================================================
                Backend Response
                ============================================================= */}

                {

                    response && (

                        <div
                            className={
                                styles.response
                            }
                        >

                            <span
                                className={
                                    styles.responseLabel
                                }
                            >
                                AI CONCIERGE
                            </span>

                            <p
                                className={
                                    styles.responseContent
                                }
                            >
                                {
                                    response
                                }
                            </p>

                        </div>

                    )

                }


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
                        条件を少し変えて、もう一度相談してみてください。
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
            Backend Response
            ================================================================== */}

            {

                response && (

                    <div
                        className={
                            styles.response
                        }
                    >

                        <span
                            className={
                                styles.responseLabel
                            }
                        >
                            AI CONCIERGE
                        </span>

                        <p
                            className={
                                styles.responseContent
                            }
                        >
                            {
                                response
                            }
                        </p>

                    </div>

                )

            }


            {/* ==================================================================
            Consultation Result Header
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
                            'あなたに合うPC'
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

                {/* ==============================================================
                Result Count
                ============================================================== */}

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
                        PC CANDIDATES
                    </span>

                </div>

            </header>


            {/* ==================================================================
            Divider
            ================================================================== */}

            <div
                className={
                    styles.divider
                } />


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
                                    Reality Specifications
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
                                    Detail Link
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