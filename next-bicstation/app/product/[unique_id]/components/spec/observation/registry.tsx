// ============================================================================
// FILE:
// next-bicstation/app/product/[unique_id]/components/spec/observation/registry.tsx
// ============================================================================
//
// SHIN CORE LINX
// Observation Renderer Registry
//
// PURPOSE
//
// Product
//      ↓
// Manufacturer Identity
//      ↓
// Observation Renderer Registry
//      ↓
// Manufacturer-specific Renderer
//      ↓
// DefaultObservation
//
// IMPORTANT
//
// This registry does NOT:
//
// ✗ generate meaning
// ✗ generate semantic information
// ✗ modify Reality
// ✗ inspect Observation content
// ✗ decide product suitability
//
// It only decides which UI Renderer should display the supplied
// Observation Reality.
//
// ============================================================================

import type {
    ComponentType,
} from 'react'

/* ============================================================================
🔥 Renderers
============================================================================ */

import LenovoObservation
    from './LenovoObservation'

import DellObservation
    from './DellObservation'

import HPObservation
    from './HPObservation'

import FujitsuObservation
    from './FujitsuObservation'

import DynabookObservation
    from './DynabookObservation'

import DefaultObservation
    from './DefaultObservation'

import LavieObservation
    from './LavieObservation'

import ArkObservation
    from './ARKObservation'

import FrotierObservation
    from './FrontierObservation'

import GeekomObservation
    from './GEEKOMObservation'

import GMKtecbservation
    from './GMKtecObservation'

import MINISFORUMObservation
    from './MINISFORUMObservation'

import SYCOMObservation
    from './SYCOMObservation'

import MOUSEObservation
    from './MOUSEObservation'

import OZGAMINGObservation
    from './OZGAMINGObservation'

import TSUKUMOObservation
    from './TSUKUMOObservation'

/* ============================================================================
🔥 Types
============================================================================ */

type ObservationRendererProps = {

    product: any

}

type ObservationRenderer =
    ComponentType<
        ObservationRendererProps
    >

/* ============================================================================
🔥 Manufacturer Normalization
============================================================================ */

/**
 * ============================================================================
 * normalizeMaker
 * ============================================================================
 *
 * Only normalizes the manufacturer identifier.
 *
 * This is NOT semantic classification.
 *
 * Examples:
 *
 * LENOVO
 * Lenovo
 * lenovo
 *
 * ↓
 *
 * lenovo
 *
 * ============================================================================
 */

function normalizeMaker(
    maker: unknown,
): string {

    if (
        typeof maker !== 'string'
    ) {

        return ''

    }

    return maker
        .trim()
        .toLowerCase()

}

/* ============================================================================
🔥 Registry
============================================================================ */

/**
 * ============================================================================
 * OBSERVATION_RENDERERS
 * ============================================================================
 *
 * Add a manufacturer here only when a dedicated Observation Renderer exists.
 *
 * Example:
 *
 * 'hp':
 *   HPObservation
 *
 * 'dell':
 *   DellObservation
 *
 * 'fujitsu':
 *   FujitsuObservation
 *
 * 'ark':
 *   ARKObservation
 *
 * ProductRadar does NOT need to change.
 *
 * ============================================================================
 */

const OBSERVATION_RENDERERS:
    Record<
        string,
        ObservationRenderer
    >
    = {

    /* --------------------------------------------------------------------------
    Lenovo
    -------------------------------------------------------------------------- */

    lenovo:
        LenovoObservation,

    /* --------------------------------------------------------------------------
    Dell
    -------------------------------------------------------------------------- */

    dell:
        DellObservation,

    /* --------------------------------------------------------------------------
    HP
    -------------------------------------------------------------------------- */

    hp:
        HPObservation,

    /* --------------------------------------------------------------------------
    Fujitsu
    -------------------------------------------------------------------------- */

    fujitsu:
        FujitsuObservation,

    /* --------------------------------------------------------------------------
   Dynabook
   -------------------------------------------------------------------------- */

    dynabook:
        DynabookObservation,

    /* --------------------------------------------------------------------------
   Laviebook
   -------------------------------------------------------------------------- */

    lavie:
        LavieObservation,

    /* --------------------------------------------------------------------------
   Arkbook
   -------------------------------------------------------------------------- */

    ark:
        ArkObservation,

    /* --------------------------------------------------------------------------
   Frontierbook
   -------------------------------------------------------------------------- */

    frontier:
        FrotierObservation,

    /* --------------------------------------------------------------------------
    Geekombook
    -------------------------------------------------------------------------- */

    geekom:
        GeekomObservation,

    /* --------------------------------------------------------------------------
    GMKtecbook
    -------------------------------------------------------------------------- */

    gmktec:
        GMKtecbservation,

    /* --------------------------------------------------------------------------
    MINISFORUMbook
    -------------------------------------------------------------------------- */

    minisforum:
        MINISFORUMObservation,
    
    /* --------------------------------------------------------------------------
    SYCOM
    -------------------------------------------------------------------------- */

    sycom:
        SYCOMObservation,

    /* --------------------------------------------------------------------------
    MOUSE
    -------------------------------------------------------------------------- */
        
    mouse:
        MOUSEObservation,

    /* --------------------------------------------------------------------------
    Ozgaming
    -------------------------------------------------------------------------- */
        
    'oz gaming':
        OZGAMINGObservation,

    /* --------------------------------------------------------------------------
    TSUKUMO
    -------------------------------------------------------------------------- */
        
    tsukumo:
        TSUKUMOObservation,


}

/* ============================================================================
🔥 Renderer Resolver
============================================================================ */

/**
 * ============================================================================
 * resolveObservationRenderer
 * ============================================================================
 *
 * Returns:
 *
 * dedicated manufacturer renderer
 *
 * OR
 *
 * DefaultObservation
 *
 * ============================================================================
 */

export function resolveObservationRenderer(
    product: any,
): ObservationRenderer {

    const maker =
        normalizeMaker(
            product?.maker
            ||
            product?.makerName
            ||
            product?.maker_name
        )

    return (
        OBSERVATION_RENDERERS[maker]
        ||
        DefaultObservation
    )

}

/* ============================================================================
🔥 Export
============================================================================ */

export default OBSERVATION_RENDERERS