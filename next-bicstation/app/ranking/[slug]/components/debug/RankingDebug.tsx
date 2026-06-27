// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/debug/RankingDebug.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

    SemanticRankingRuntime,

} from '../../types/contracts'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    runtime: SemanticRankingRuntime

}

/* ============================================================================
🔥 Ranking Debug
============================================================================ */

export default function RankingDebug({

    runtime,

}: Props) {

    return (

        <section

            style={{

                margin: '64px auto',

                maxWidth: 1400,

                padding: 24,

                borderRadius: 16,

                background: '#111827',

                color: '#f3f4f6',

                overflowX: 'auto',

            }}

        >

            <h2>

                Ranking Runtime Debug

            </h2>

            <pre

                style={{

                    marginTop: 24,

                    whiteSpace: 'pre-wrap',

                    wordBreak: 'break-word',

                    fontSize: 13,

                    lineHeight: 1.6,

                }}

            >

                {

                    JSON.stringify(

                        runtime,

                        null,

                        2,

                    )

                }

            </pre>

        </section>

    )

}