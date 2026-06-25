// ============================================================================
// FILE:
// /app/catalog/types/catalog.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Catalog Experience Types
 * ============================================================================
 *
 * Frontend Authority:
 *
 * Presentation
 *
 * This layer SHALL NOT redefine Runtime Contracts.
 *
 * Runtime Authority remains:
 *
 * Backend
 *
 * Projection Authority remains:
 *
 * Adapter
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Runtime Contract
============================================================================ */

import type {

    ProductsRuntime,
    PCProductItem,

} from '@/shared/lib/api/django/pc/products/contracts'

/* ============================================================================
🔥 Catalog Runtime
============================================================================ */

export type CatalogRuntime =
    ProductsRuntime

/* ============================================================================
🔥 Catalog Product
============================================================================ */

export type CatalogProduct =
    PCProductItem