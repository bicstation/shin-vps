// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/options/projection.ts
// ============================================================================
// FILE:
// /shared/lib/api/django/pc/options/projection.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Catalog Options Projection
 * ============================================================================
 *
 * PURPOSE
 *
 * Translate the Catalog Options Backend Contract into a lightweight
 * Frontend View Model.
 *
 * Backend Runtime
 *      ↓
 * Normalize
 *      ↓
 * Catalog Options Backend Contract
 *      ↓
 * Projection
 *      ↓
 * Frontend View Model
 *
 * Projection Responsibilities
 *
 * ✓ Contract Translation
 * ✓ Lightweight View Model
 * ✓ Stable Frontend Contract
 *
 * Projection SHALL NOT
 *
 * ✗ Generate Meaning
 * ✗ Generate Runtime
 * ✗ Generate Authority
 * ✗ Modify Backend Reality
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

import type {
    CatalogOptionsRuntimeContract,
    CatalogOptionsData,
    CatalogOptionItem,
} from './contracts'

/* ============================================================================
🔥 Catalog Options View Model
============================================================================ */

export interface ProjectedCatalogOptionsRuntime {

    options: ProjectedCatalogOptionsData

}

/* ============================================================================
🔥 Catalog Options Data View Model
============================================================================ */

export interface ProjectedCatalogOptionsData {

    maker: ProjectedCatalogOption[]

    cpu: ProjectedCatalogOption[]

    gpu: ProjectedCatalogOption[]

    memory: ProjectedCatalogOption[]

    storage: ProjectedCatalogOption[]

}

/* ============================================================================
🔥 Catalog Option View Model
============================================================================ */

export interface ProjectedCatalogOption {

    value: string | number

    label: string

    count: number

}

/* ============================================================================
🔥 Projection
============================================================================ */

export function projectCatalogOptions(
    contract: CatalogOptionsRuntimeContract,
): ProjectedCatalogOptionsRuntime {

    return {

        options: projectOptions(contract.options),

    }

}

/* ============================================================================
🔥 Options Projection
============================================================================ */

function projectOptions(
    options: CatalogOptionsData,
): ProjectedCatalogOptionsData {

    return {

        maker: options.maker.map(projectOption),

        cpu: options.cpu.map(projectOption),

        gpu: options.gpu.map(projectOption),

        memory: options.memory.map(projectOption),

        storage: options.storage.map(projectOption),

    }

}

/* ============================================================================
🔥 Option Projection
============================================================================ */

function projectOption(
    option: CatalogOptionItem,
): ProjectedCatalogOption {

    return {

        value: option.value,

        label: option.label,

        count: option.count,

    }

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const projectCatalogOptionsRuntime =
    projectCatalogOptions

/* ============================================================================
🔥 Default Export
============================================================================ */

export default projectCatalogOptions