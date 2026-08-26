// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/hero/RankingHero.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

import type {
    SemanticRankingRuntime,
} from '../../types/contracts'

import styles
    from '../../styles/hero/hero.module.css'

type Props = {
    runtime: SemanticRankingRuntime
    totalProducts?: number
}

export default function RankingHero({
    runtime,
    totalProducts = 0,
}: Props) {

    const {
        meaning,
        presentation,
        seo,
        semantic_authority,
        ready,
    } = runtime

    const title =
        presentation?.title
        ??
        seo?.title
        ??
        'PCランキング'

    const subtitle =
        presentation?.subtitle
        ??
        ''

    const description =
        presentation?.description
        ??
        seo?.description
        ??
        ''

    const badge =
        meaning?.identity
        ??
        'FEATURED RANKING'

    const groupSlug =
        runtime.data.group_slug

    const heroBackground =
        groupSlug
            ? `/images/ranking/${groupSlug}.webp`
            : '/images/ranking/ranking-hero.webp'

    const heroCore =
        '/images/ranking/ranking_ai_core.webp'

    return (
        <section
            className={styles.runtimeHero}
            style={{
                backgroundImage: `url(${heroBackground})`,
            }}
        >
            <div className={styles.runtimeHeroOverlay} />

            <div className={styles.runtimeHeroInner}>

                <div className={styles.runtimeHeroVisual}>
                    <img
                        src={heroCore}
                        alt="Ranking AI Core"
                        className={styles.runtimeHeroEmblem}
                    />
                </div>

                <div className={styles.runtimeHeroContent}>

                    <div className={styles.runtimeHeroBadge}>
                        {badge}
                    </div>

                    <h1 className={styles.runtimeHeroTitle}>
                        {title}
                    </h1>

                    {subtitle && (
                        <div className={styles.runtimeHeroSubtitle}>
                            {subtitle}
                        </div>
                    )}

                    {description && (
                        <p className={styles.runtimeHeroDescription}>
                            {description}
                        </p>
                    )}

                    <div className={styles.runtimeHeroMetrics}>

                        <div className={styles.runtimeHeroMetric}>
                            <span>掲載製品</span>
                            <strong>{totalProducts}</strong>
                        </div>

                        <div className={styles.runtimeHeroMetric}>
                            <span>Runtime</span>
                            <strong>
                                {ready ? 'READY' : 'WAIT'}
                            </strong>
                        </div>

                        <div className={styles.runtimeHeroMetric}>
                            <span>Authority</span>
                            <strong>
                                {semantic_authority ?? '-'}
                            </strong>
                        </div>

                    </div>

                    <div className={styles.runtimeHeroActions}>
                        <a
                            href="/discover"
                            className={styles.runtimeHeroPrimaryButton}
                        >
                            関連カテゴリを見る
                        </a>
                    </div>

                </div>

            </div>
        </section>
    )
}