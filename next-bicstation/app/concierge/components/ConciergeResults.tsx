'use client'

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

            <section>

                <h2>
                    もう少し詳しく教えてください
                </h2>

                <p>
                    お探しのPCの用途を教えていただければ、
                    条件に合うPCを探します。
                </p>

            </section>

        )

    }

    /* ========================================================================
    Finder Not Ready
    ======================================================================== */

    if (!finder) {

        return (

            <section>

                <h2>
                    PCを探しています
                </h2>

            </section>

        )

    }

    /* ========================================================================
    No Results
    ======================================================================== */

    if (!finder.products.length) {

        return (

            <section>

                <h2>
                    条件に合うPCが見つかりませんでした
                </h2>

                <p>
                    条件を少し変えて、もう一度お試しください。
                </p>

            </section>

        )

    }

    /* ========================================================================
    Results
    ======================================================================== */

    return (

        <section>

            <header>

                <h2>
                    {finder.header.title}
                </h2>

                {

                    finder.header.description && (

                        <p>
                            {finder.header.description}
                        </p>

                    )

                }

                <p>
                    {finder.stats.result_count}件
                </p>

            </header>

            <div>

                {

                    finder.products.map(

                        product => (

                            <article
                                key={
                                    product.unique_id
                                }
                            >

                                {

                                    product.image && (

                                        <img

                                            src={
                                                product.image
                                            }

                                            alt={
                                                product.name
                                            }

                                        />

                                    )

                                }

                                <div>

                                    <p>
                                        {product.maker}
                                    </p>

                                    <h3>
                                        {product.name}
                                    </h3>

                                    <p>
                                        ¥
                                        {
                                            product.price.toLocaleString(
                                                'ja-JP'
                                            )
                                        }
                                    </p>

                                </div>

                            </article>

                        )

                    )

                }

            </div>

        </section>

    )

}