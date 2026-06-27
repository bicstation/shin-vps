// ============================================================================
// FILE:
// /app/ranking/[slug]/lib/getRankingBadge.ts
// ============================================================================

export default function getRankingBadge(

    rank: number,

): string {

    if (

        rank >= 1 &&

        rank <= 10

    ) {

        return `/images/ranking/ranking_core_${rank}.webp`

    }

    return '/images/ranking/ranking_core_10.webp'

}