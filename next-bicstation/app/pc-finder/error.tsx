// ============================================================================
// FILE:
// /app/pc-finder/error.tsx
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

'use client'

/* ============================================================================
Next
============================================================================ */

import Link
    from 'next/link'

/* ============================================================================
Props
============================================================================ */

type Props = {

    error: Error

    reset: () => void

}

/* ============================================================================
Error Boundary
============================================================================ */

export default function FinderError({

    error,

    reset,

}: Props) {

    console.error(

        '[PC Finder]',

        error

    )

    return (

        <main
            style={{

                minHeight: '100vh',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'center',

                padding: '48px',

                background:
                    'linear-gradient(180deg,#070b14,#10192d)',

            }}
        >

            <div
                style={{

                    width: '100%',

                    maxWidth: 720,

                    padding: 48,

                    borderRadius: 24,

                    textAlign: 'center',

                    border:
                        '1px solid rgba(120,170,255,.15)',

                    background:
                        'rgba(20,28,46,.94)',

                }}
            >

                <div
                    style={{

                        fontSize: 54,

                    }}
                >

                    ⚠️

                </div>

                <h1>

                    PC Finderを表示できませんでした

                </h1>

                <p
                    style={{

                        color: '#c7d4ea',

                        lineHeight: 1.8,

                    }}
                >

                    一時的な問題が発生しました。

                    <br />

                    少し時間をおいて、もう一度お試しください。

                </p>

                <div
                    style={{

                        display: 'flex',

                        justifyContent: 'center',

                        gap: 16,

                        marginTop: 40,

                        flexWrap: 'wrap',

                    }}
                >

                    <button

                        onClick={reset}

                        style={{

                            height: 52,

                            padding: '0 28px',

                            border: 'none',

                            borderRadius: 12,

                            cursor: 'pointer',

                            color: '#fff',

                            background:
                                'linear-gradient(135deg,#4b9cff,#736dff)',

                        }}

                    >

                        もう一度試す

                    </button>

                    <Link

                        href="/"

                        style={{

                            display: 'flex',

                            alignItems: 'center',

                            justifyContent: 'center',

                            height: 52,

                            padding: '0 28px',

                            borderRadius: 12,

                            textDecoration: 'none',

                            color: '#ffffff',

                            border:
                                '1px solid rgba(120,170,255,.2)',

                        }}

                    >

                        トップへ戻る

                    </Link>

                </div>

            </div>

        </main>

    )

}