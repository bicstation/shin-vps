// /home/maya/shin-vps/shared/lib/api/django/pc/utils/buildEndpoint.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

// @ts-nocheck

/**
 * =====================================================================
 * 🛰️ SHIN CORE LINX｜Unified Endpoint Builder
 * =====================================================================
 *
 * PURPOSE:
 *   - SSR → Docker Internal API
 *   - Browser → Public API
 *   - Runtime-aware endpoint generation
 *
 * =====================================================================
 */

import API_CONFIG from '../../../../config/api';

/* ====================================================================
🔥 Resolve Base URL
==================================================================== */

function resolveBaseUrl(): string {

  return API_CONFIG.baseUrl;
}

/* ====================================================================
🔥 Normalize Base URL
==================================================================== */

function normalizeBaseUrl(
  url: string
): string {

  return url.replace(
    /\/+$/,
    ''
  );
}

/* ====================================================================
🔥 Normalize Path
==================================================================== */

function normalizePath(
  path: string
): string {

  return path.startsWith('/')
    ? path
    : `/${path}`;
}

/* ====================================================================
🔥 Build Endpoint
==================================================================== */

export function buildEndpoint(

  path: string

): string {

  // ================================================================
  // Base URL
  // ================================================================

  const baseUrl = normalizeBaseUrl(
    resolveBaseUrl()
  );

  // ================================================================
  // Path
  // ================================================================

  const normalizedPath =
    normalizePath(path);

  // ================================================================
  // Build
  // ================================================================

  const endpoint =
    `${baseUrl}${normalizedPath}`;

  // ================================================================
  // Development Debug
  // ================================================================

  if (
    process.env.NODE_ENV ===
    'development'
  ) {

    console.log(
      '🔥 BUILD ENDPOINT:',
      {
        runtime:
          typeof window === 'undefined'
            ? 'SSR'
            : 'CSR',

        endpoint,
      }
    );
  }

  // ================================================================
  // Return
  // ================================================================

  return endpoint;
}

/* ====================================================================
🔥 Default Export
==================================================================== */

export default buildEndpoint;