// ============================================================================
// FILE:
// /app/sitemap.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Platform Service
 * Sitemap Entry Point
 * ============================================================================
 *
 * PURPOSE
 *
 * Next.js Sitemap entry point.
 *
 * This file delegates all Runtime responsibilities to the
 * Platform Runtime.
 *
 * ============================================================================
 */

import type {
  MetadataRoute,
} from 'next'

import {
  generateSitemap,
} from '@/app/platform/sitemap'

export default async function sitemap(
): Promise<MetadataRoute.Sitemap> {

  return await generateSitemap()

}