// ============================================================================
// FILE:
// /app/pc-finder/data/intents.ts
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

/* ============================================================================
Intent Data

Temporary Discovery Intent definitions.

These values will later be provided by
the Semantic Runtime.

============================================================================ */

export type FinderIntent = {

    id: string

    title: string

    description: string

    icon: string

}

/* ============================================================================
Discovery Intents
============================================================================ */

export const intents: FinderIntent[] = [

    {

        id: 'usage-ai',

        title: 'AI',

        description: '画像生成・ChatGPT',

        icon: '🧠',

    },

    {

        id: 'usage-gaming',

        title: 'ゲーム',

        description: 'Steam・FPS',

        icon: '🎮',

    },

    {

        id: 'usage-creator',

        title: 'クリエイター',

        description: '動画編集・Photoshop',

        icon: '🎨',

    },

    {

        id: 'usage-business',

        title: 'ビジネス',

        description: 'Office・開発',

        icon: '💼',

    },

]