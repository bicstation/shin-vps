// ============================================================================
// FILE:
// /app/catalog/components/Breadcrumb.tsx
// ============================================================================

'use client'

import Link from 'next/link'

import styles from '../styles/catalog.module.css'

export default function Breadcrumb() {

    return (

        <nav

            className={styles.breadcrumb}

            aria-label="Breadcrumb"

        >

            <Link

                href="/"

                className={styles.breadcrumbLink}

            >

                ホーム

            </Link>

            <span className={styles.breadcrumbSeparator}>

                /

            </span>

            <span className={styles.breadcrumbCurrent}>

                商品一覧

            </span>

        </nav>

    )

}