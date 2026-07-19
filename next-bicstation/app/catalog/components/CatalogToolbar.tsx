// ============================================================================
// FILE:
// /app/catalog/components/CatalogToolbar.tsx
// ============================================================================

'use client'

import {
    usePathname,
    useRouter,
    useSearchParams,
} from 'next/navigation'

import type { ChangeEvent } from 'react'

import type {
    CatalogOptionsData,
} from '@/shared/lib/api/django/pc/options/contracts'

import CatalogFilter from './CatalogFilter'

import styles from '../styles/catalog.module.css'

type CatalogToolbarProps = {
    count: number
    sort: string
    options?: CatalogOptionsData
}

export default function CatalogToolbar({
    count,
    sort,
    options,
}: CatalogToolbarProps) {

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📦 CATALOG TOOLBAR')
    console.log('options:', options)

    console.log('Maker:', options?.maker)
    console.log('Maker length:', options?.maker?.length)

    console.log('CPU:', options?.cpu)
    console.log('CPU length:', options?.cpu?.length)

    console.log('GPU:', options?.gpu)
    console.log('GPU length:', options?.gpu?.length)

    console.log('Memory:', options?.memory)
    console.log('Memory length:', options?.memory?.length)

    console.log('Storage:', options?.storage)
    console.log('Storage length:', options?.storage?.length)

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    function handleSortChange(
        event: ChangeEvent<HTMLSelectElement>,
    ) {

        const { value } = event.target

        const params = new URLSearchParams(
            searchParams.toString(),
        )

        params.set('sort', value)
        params.set('page', '1')

        router.push(
            `${pathname}?${params.toString()}`
        )

    }

    return (

        <section className={styles.catalogHeader}>

            <div className={styles.catalogHeaderTop}>

                <div className={styles.catalogStatus}>

                    <span className={styles.catalogCount}>
                        {count.toLocaleString()} Products
                    </span>

                    <span className={styles.catalogCaption}>
                        Browse the complete catalog
                    </span>

                </div>

                <div className={styles.catalogCommands}>

                    <label
                        htmlFor="catalog-sort"
                        className={styles.catalogSortLabel}
                    >
                        Sort
                    </label>

                    <select
                        id="catalog-sort"
                        className={styles.catalogSort}
                        value={sort}
                        onChange={handleSortChange}
                    >

                        <option value="maker">
                            メーカー順
                        </option>

                        <option value="price_low">
                            価格が安い順
                        </option>

                        <option value="price_high">
                            価格が高い順
                        </option>

                        <option value="new">
                            新着順
                        </option>

                    </select>

                </div>

            </div>

            <div className={styles.catalogFilters}>

                <CatalogFilter
                    title="Maker"
                    queryKey="maker"
                    items={options?.maker ?? []}
                />

                <CatalogFilter
                    title="CPU"
                    queryKey="cpu"
                    items={options?.cpu ?? []}
                />

                <CatalogFilter
                    title="GPU"
                    queryKey="gpu"
                    items={options?.gpu ?? []}
                />

                <CatalogFilter
                    title="Memory"
                    queryKey="memory"
                    items={options?.memory ?? []}
                />

                <CatalogFilter
                    title="Storage"
                    queryKey="storage"
                    items={options?.storage ?? []}
                />

            </div>

        </section>

    )

}