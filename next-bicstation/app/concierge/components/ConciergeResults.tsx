'use client'

/* ============================================================================
🔥 Next
============================================================================ */

import Link from 'next/link'

/* ============================================================================
🔥 Intent Runtime
============================================================================ */

import type {
    IntentRuntime,
} from '@/shared/lib/api/django/pc/intent'

/* ============================================================================
🔥 Finder Projection
============================================================================ */

import type {
    ProjectedFinderRuntime,
} from '@/shared/lib/api/django/pc/finder/projection'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles from './ConciergeResults.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

interface ConciergeResultsProps {

    intent:
    IntentRuntime | null

    finder:
    ProjectedFinderRuntime | null
}

/* ============================================================================
🔥 Concierge Results
============================================================================ */

export default function ConciergeResults({

    intent,

    finder,

}: ConciergeResultsProps) {

    /* ========================================================================
    Initial
    ======================================================================== */

    if (!intent) {

        return null

    }

    /* ========================================================================
    Unknown Intent
    ======================================================================== */

    if (!intent.intent) {

        return (

            <section
                className={
                    styles.unknown
                }
            >

                <div
                    className={
                        styles.statusIcon
                    }
                >
                    ?
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
                        もう少し詳しく教えてください
                    </h2>

                    <p>
                        どんな用途でPCをお探しですか？
                    </p>

                </div>

            </section>

        )

    }

    /* ========================================================================
    Finder Not Ready
    ======================================================================== */

    if (!finder) {

        return (

            <section
                className={
                    styles.loading
                }
            >

                <div
                    className={
                        styles.loadingIndicator
                    }
                />

                <div>

                    <span
                        className={
                            styles.eyebrow
                        }
                    >
                        AI CONCIERGE
                    </span>

                    <h2>
                        PCを探しています
                    </h2>

                    <p>
                        条件に合うPCを確認しています…
                    </p>

                </div>

            </section>

        )

    }

    /* ========================================================================
    No Results
    ======================================================================== */

    if (!finder.products.length) {

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
                        SEARCH RESULT
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
                        styles.headerMain
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
                        「{intent.intent}」のPCをお探しですね。
                    </h2>

                    {

                        finder.header.description && (

                            <p
                                className={
                                    styles.description
                                }
                            >
                                {
                                    finder.header.description
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
                            finder.stats.result_count
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

                    finder.products.map(

                        product => (

                            <Link

                                key={
                                    product.unique_id
                                }

                                href={
                                    `/pc/products/${encodeURIComponent(
                                        product.unique_id,
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

                                        product.image ? (

                                            <img

                                                src={
                                                    product.image
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

                                            product.memoryGb && (

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

                                            product.storageGb && (

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


                                        {/* =============================================
                                        AI PC
                                        ============================================= */}

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