// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/utils/buildEndpoint.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 API Base URL
========================================= */

const API_BASE_URL =

  typeof window ===
  'undefined'

    ? (

        process.env
          .INTERNAL_API_URL

        || ''

      )

    : (

        process.env
          .NEXT_PUBLIC_API_URL

        || ''

      )

/* =========================================
🔥 Build Endpoint
========================================= */

export function
buildEndpoint(

  path: string
): string {

  // ======================================
  // Base URL
  // ======================================

  const baseUrl =

    API_BASE_URL
      .replace(/\/$/, '')

  // ======================================
  // Normalize Path
  // ======================================

  const normalizedPath =

    path.startsWith('/')

      ? path

      : `/${path}`

  // ======================================
  // Build
  // ======================================

  const endpoint =

    `${baseUrl}${normalizedPath}`

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 BUILD ENDPOINT:',
    endpoint
  )

  // ======================================
  // Return
  // ======================================

  return endpoint
}