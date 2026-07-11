// /home/maya/shin-dev/shin-vps/next-bicstation/app/publishing/JsonLd.tsx

// ============================================================================
// FILE:
// /app/publishing/JsonLd.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Publishing
 * JSON-LD Renderer
 * ============================================================================
 *
 * PURPOSE
 *
 * Render Publishing JSON-LD into HTML.
 *
 * This component SHALL:
 *
 * ✓ Render JSON-LD
 * ✓ Remain Presentation Layer
 *
 * This component SHALL NOT:
 *
 * ✗ Generate SEO
 * ✗ Generate Meaning
 * ✗ Fetch Runtime
 *
 * ============================================================================
 */

import Script from 'next/script'

import type {

  PublishingJsonLd,

} from '@/shared/publishing'

/* ============================================================================
🔥 Props
============================================================================ */

interface JsonLdProps {

  jsonLd?: PublishingJsonLd

  id?: string

}

/* ============================================================================
🔥 Renderer
============================================================================ */

export default function JsonLd({

  jsonLd,

  id = 'jsonld',

}: JsonLdProps) {

  if (!jsonLd) {

    return null

  }

  return (

    <Script

      id={id}

      type="application/ld+json"

      strategy="beforeInteractive"

      dangerouslySetInnerHTML={{

        __html:

          JSON.stringify(

            jsonLd,

          ),

      }}

    />

  )

}