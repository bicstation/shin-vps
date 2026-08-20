// ============================================================================
// FILE:
// /app/concierge/page.tsx
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

import type {
    Metadata,
} from 'next'

import ConciergeChat
    from './components/ConciergeChat'

/* ============================================================================
🔥 SEO Metadata
============================================================================ */

export const metadata: Metadata = {

    title:
        'AI Concierge | BIC STATION',

    description:
        '欲しいPCについて日本語で相談できます。用途や希望条件から、あなたに合ったPCを探します。',

    keywords: [
        'BIC STATION',
        'AI Concierge',
        'PC',
        'パソコン',
        'PC選び',
        'PC検索',
    ],

    alternates: {
        canonical:
            '/concierge/',
    },

    openGraph: {

        title:
            'AI Concierge | BIC STATION',

        description:
            '欲しいPCについて日本語で相談できます。あなたに合ったPCを探します。',

        url:
            '/concierge/',

        type:
            'website',

    },

    twitter: {

        card:
            'summary_large_image',

        title:
            'AI Concierge | BIC STATION',

        description:
            '欲しいPCについて日本語で相談できます。',

    },

}

/* ============================================================================
🔥 Concierge Page
============================================================================ */

export default function ConciergePage() {

    return (

        <ConciergeChat />

    )

}