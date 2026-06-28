// ============================================================================
// FILE:
// /app/pc-finder/components/HeroAssistant.tsx
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

'use client'

/* ============================================================================
Next
============================================================================ */

import Image
    from 'next/image'

/* ============================================================================
Styles
============================================================================ */

import styles
    from '../styles/pcFinder.module.css'

/* ============================================================================
Props
============================================================================ */

type Props = {

    src?: string

    alt?: string

}

/* ============================================================================
Hero Assistant
============================================================================ */

export default function HeroAssistant({

    src = '/images/finder/assistant.webp',

    alt = 'Finder Assistant',

}: Props) {

    return (

        <div
            className={
                styles.heroAssistant
            }
        >

            <div
                className={
                    styles.heroGlow
                }
            />

            <Image

                src={src}

                alt={alt}

                width={720}

                height={720}

                priority

                className={
                    styles.heroImage
                }

            />

        </div>

    )

}