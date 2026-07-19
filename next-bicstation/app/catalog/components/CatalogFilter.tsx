// ============================================================================
// FILE:
// /app/catalog/components/CatalogFilter.tsx
// ============================================================================

'use client'

import { useState } from 'react'

import {
    usePathname,
    useRouter,
    useSearchParams,
} from 'next/navigation'

import type {
    CatalogOptionItem,
} from '@/shared/lib/api/django/pc/options'

import styles from '../styles/catalog.module.css'

type CatalogFilterProps = {
    title: string
    queryKey: string
    items: CatalogOptionItem[]
}

export default function CatalogFilter({
    title,
    queryKey,
    items,
}: CatalogFilterProps) {

    console.log('🎛️ FILTER', {
        title,
        queryKey,
        length: items.length,
        items,
    })

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [open, setOpen] =
        useState(false)

    const selected =
        searchParams.get(queryKey)

    console.log('📂 STATE', {
        title,
        open,
        selected,
        length: items.length,
    })

    function handleSelect(
        value: string,
    ) {

        console.log('✅ SELECT', {
            title,
            queryKey,
            value,
        })

        const params =
            new URLSearchParams(
                searchParams.toString(),
            )

        // --------------------------------------------------
        // RESET FILTER
        // --------------------------------------------------

        ;[
            'maker',
            'cpu',
            'gpu',
            'memory',
            'storage',
        ].forEach(key => {

            params.delete(key)

        })

        // --------------------------------------------------
        // TOGGLE
        // --------------------------------------------------

        const current =
            searchParams.get(queryKey)

        if (current === value) {

            // クリック済みなら解除

        } else {

            params.set(
                queryKey,
                value,
            )

        }

        params.set(
            'page',
            '1',
        )

        router.push(
            `${pathname}?${params.toString()}`
        )

        setOpen(false)

    }

    return (

        <div
            className={styles.catalogFilter}
            style={{
                position: 'relative',
                zIndex: open ? 1000 : 1,
            }}
        >

            <button
                type="button"
                aria-expanded={open}
                onClick={() =>
                    setOpen(!open)
                }
            >

                {title}

                {selected
                    ? ` : ${selected}`
                    : ' ▼'}

            </button>

            {open && (

                <>

                    {console.log(
                        '📖 OPEN',
                        {
                            title,
                            length: items.length,
                            items,
                        },
                    )}

                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            zIndex: 99999,
                            minWidth: 220,
                            padding: 8,
                            border: '1px solid #ddd',
                            borderRadius: 12,
                            background: '#fff',
                            boxShadow:
                                '0 8px 24px rgba(0,0,0,.12)',
                        }}
                    >

                        {items.length === 0 && (

                            <div
                                style={{
                                    padding: 12,
                                    textAlign: 'center',
                                    color: '#777',
                                }}
                            >
                                No Options
                            </div>

                        )}

                        {items.map(item => {

                            const value =
                                String(item.value)

                            const active =
                                selected === value

                            return (

                                <button
                                    key={value}
                                    type="button"
                                    onClick={() =>
                                        handleSelect(
                                            value,
                                        )
                                    }
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        width: '100%',
                                        padding: '8px 10px',
                                        border: 0,
                                        background: active
                                            ? '#eef4ff'
                                            : 'transparent',
                                        fontWeight: active
                                            ? 600
                                            : 400,
                                        cursor: 'pointer',
                                    }}
                                >

                                    <span>
                                        {item.label}
                                    </span>

                                    <span>
                                        {item.count}
                                    </span>

                                </button>

                            )

                        })}

                    </div>

                </>

            )}

        </div>

    )

}