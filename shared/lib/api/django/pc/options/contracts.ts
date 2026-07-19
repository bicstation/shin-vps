// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/options/contracts.ts

// ============================================================================
// FILE:
// /shared/lib/api/django/pc/options/contracts.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Catalog Options Backend Contract
 * ============================================================================
 *
 * PURPOSE
 *
 * Defines the canonical TypeScript contract that represents the
 * Backend Catalog Options Runtime JSON.
 *
 * This file mirrors Backend Reality.
 *
 * It does NOT define:
 *
 * ✗ Frontend UI
 * ✗ Projection Models
 * ✗ Runtime Helpers
 * ✗ Future Architecture
 *
 * Backend remains:
 *
 * Reality Authority
 *
 * Adapter remains:
 *
 * Translation Authority
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Option Item
============================================================================ */

export interface CatalogOptionItem {

    value: string | number

    label: string

    count: number

}

/* ============================================================================
🔥 Meaning
============================================================================ */

export interface CatalogOptionsMeaning {

    identity?: string

    mission?: string

}

/* ============================================================================
🔥 Options
============================================================================ */

export interface CatalogOptionsData {

    maker: CatalogOptionItem[]

    cpu: CatalogOptionItem[]

    gpu: CatalogOptionItem[]

    memory: CatalogOptionItem[]

    storage: CatalogOptionItem[]

}

/* ============================================================================
🔥 Runtime Contract
============================================================================ */

export interface CatalogOptionsRuntimeContract {

    /* ------------------------------------------------------------------------
    Backend Meaning
    ------------------------------------------------------------------------ */

    meaning?: CatalogOptionsMeaning

    /* ------------------------------------------------------------------------
    Backend Options
    ------------------------------------------------------------------------ */

    options: CatalogOptionsData

    /* ------------------------------------------------------------------------
    Backend Authority
    ------------------------------------------------------------------------ */

    semantic_schema_version?: number

    authority_version?: string

    semantic_authority?: string

    ready?: boolean

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export type CatalogOptionsRuntime =
    CatalogOptionsRuntimeContract

export type CatalogOptionsRuntimeResponse =
    CatalogOptionsRuntimeContract