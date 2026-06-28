// ============================================================================
// FILE:
// /app/pc-finder/loading.tsx
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

'use client'

/* ============================================================================
Loading
============================================================================ */

export default function Loading() {

    return (

        <main
            style={{

                minHeight: '100vh',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'center',

                background:
                    'linear-gradient(180deg,#070b14,#10192d)',

            }}
        >

            <div
                style={{

                    textAlign: 'center',

                    color: '#ffffff',

                }}
            >

                {/* ==========================================================
                Orb
                ========================================================== */}

                <div

                    style={{

                        width: 84,

                        height: 84,

                        margin: '0 auto 32px',

                        borderRadius: '50%',

                        border:
                            '4px solid rgba(90,150,255,.15)',

                        borderTop:
                            '4px solid #62a8ff',

                        animation:
                            'finder-spin 1s linear infinite',

                    }}

                />

                {/* ==========================================================
                Title
                ========================================================== */}

                <h2
                    style={{

                        fontSize: '2rem',

                        marginBottom: 16,

                    }}
                >

                    Semantic Discovery

                </h2>

                <p
                    style={{

                        color: '#c8d5eb',

                        lineHeight: 1.8,

                    }}
                >

                    あなたに最適なPCを探しています...

                    <br />

                    Semantic Reality を解析中です。

                </p>

            </div>

            <style jsx>{`

                @keyframes finder-spin{

                    from{

                        transform:rotate(0deg);

                    }

                    to{

                        transform:rotate(360deg);

                    }

                }

            `}</style>

        </main>

    )

}