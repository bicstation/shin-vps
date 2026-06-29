// ============================================================================
// FILE:
// /app/pc-finder/components/DiscoverySummary.tsx
// ============================================================================

'use client'

/* ============================================================================
Types
============================================================================ */

type DiscoverySummaryProps = {

    intent: string

    budget: number | null

}

/* ============================================================================
Component
============================================================================ */

export default function DiscoverySummary({

    intent,

    budget,

}: DiscoverySummaryProps) {

    return (

        <section>

            <h3>

                現在の検索条件

            </h3>

            <div>

                <strong>用途</strong>

                <div>

                    {intent || '未選択'}

                </div>

            </div>

            <div>

                <strong>予算</strong>

                <div>

                    {budget !== null
                        ? `¥${budget.toLocaleString()}`
                        : '指定なし'}

                </div>

            </div>

        </section>

    )

}