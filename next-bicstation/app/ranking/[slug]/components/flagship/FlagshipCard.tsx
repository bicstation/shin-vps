// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/ranking/[slug]/components/flagship/FlagshipCard.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Next
============================================================================ */

import Image from 'next/image'
import Link from 'next/link'

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {
    RankingProduct,
} from '../../types/contracts'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../../styles/flagship/flagship.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {
    product: RankingProduct
    rank: number
}

/* ============================================================================
🔥 Flagship Card
============================================================================ */

export default function FlagshipCard({
    product,
    rank,
}: Props) {

    const {
        unique_id,
        name,
        maker,
        brand,
        image_url,
        price,
        cpu_model,
        gpu_model,
        memory_gb,
        storage_gb,
        display_info,
        recommendation_reason,
        semantic_labels = [],
    } = product

    const href =
        unique_id
            ? `/product/${unique_id}`
            : '#'

    return (
        <section className={styles.flagship}>

            {/* ================================================================
            Header
            ================================================================ */}

            <header className={styles.header}>

                <div className={styles.headerTop}>

                    <div className={styles.headerLeft}>

                        <div className={styles.badge}>
                            TOP PICK
                        </div>

                        <Image
                            src="/images/ranking/ranking_core_1.png"
                            alt="Ranking Core"
                            width={64}
                            height={64}
                            className={styles.badgeCore}
                            priority
                        />

                    </div>

                    <div className={styles.rank}>
                        #{rank}
                    </div>

                </div>

                <div className={styles.headerTitle}>

                    <h2 className={styles.title}>
                        {name ?? 'Unknown Product'}
                    </h2>

                    {(maker || brand) && (
                        <div className={styles.brand}>
                            {maker ?? brand}
                        </div>
                    )}

                </div>

            </header>

            {/* ================================================================
            Body
            ================================================================ */}

            <div className={styles.body}>

                {/* ============================================================
                Product Image
                ============================================================ */}

                <div className={styles.imageArea}>

                    {image_url ? (
                        <Image
                            src={image_url}
                            alt={name ?? ''}
                            width={520}
                            height={520}
                            className={styles.image}
                            unoptimized
                        />
                    ) : (
                        <div className={styles.imagePlaceholder}>
                            NO IMAGE
                        </div>
                    )}

                </div>

                {/* ============================================================
                Product Reality
                ============================================================ */}

                <div className={styles.content}>

                    {recommendation_reason && (
                        <p className={styles.description}>
                            {recommendation_reason}
                        </p>
                    )}

                    {semantic_labels.length > 0 && (
                        <div className={styles.chips}>
                            {semantic_labels
                                .slice(0, 3)
                                .map((label, index) => (
                                    <span
                                        key={index}
                                        className={styles.chip}
                                    >
                                        {label}
                                    </span>
                                ))}
                        </div>
                    )}

                    <div className={styles.specs}>

                        {cpu_model && (
                            <div className={styles.spec}>
                                <span>CPU</span>
                                <strong>{cpu_model}</strong>
                            </div>
                        )}

                        {gpu_model && (
                            <div className={styles.spec}>
                                <span>GPU</span>
                                <strong>{gpu_model}</strong>
                            </div>
                        )}

                        {memory_gb > 0 && (
                            <div className={styles.spec}>
                                <span>Memory</span>
                                <strong>{memory_gb}GB</strong>
                            </div>
                        )}

                        {storage_gb > 0 && (
                            <div className={styles.spec}>
                                <span>Storage</span>
                                <strong>{storage_gb}GB</strong>
                            </div>
                        )}

                        {display_info && (
                            <div className={styles.spec}>
                                <span>Display</span>
                                <strong>{display_info}</strong>
                            </div>
                        )}

                    </div>

                </div>

            </div>

            {/* ================================================================
            Bottom
            ================================================================ */}

            <footer className={styles.footer}>

                {typeof price === 'number' && (
                    <div className={styles.price}>
                        ¥{price.toLocaleString()}
                    </div>
                )}

                {unique_id && (
                    <Link
                        href={href}
                        className={styles.button}
                    >
                        製品の詳細を見る
                    </Link>
                )}

            </footer>

        </section>
    )
}