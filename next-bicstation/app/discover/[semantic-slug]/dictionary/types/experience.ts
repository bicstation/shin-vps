// ============================================================================
// SHIN CORE LINX
// Discover Experience V2
// Experience Translation Dictionary Contract
// ============================================================================

/* ============================================================================
Shared Experience Asset
============================================================================ */

/**
 * Shared presentation assets used by the Experience Dictionary.
 *
 * These assets do NOT define Semantic Reality.
 *
 * They define how Semantic Reality is translated into
 * customer-facing experiences.
 */
export interface ExperienceAsset {

    /**
     * Shared Semantic Icon Key
     *
     * Must exist in:
     *
     * shared/lib/ui/semantic/icon-map.ts
     */
    icon?: string

    /**
     * Experience Accent Color
     *
     * Used throughout the Experience Layer
     * as the primary visual identity.
     */
    accentColor?: string

    /**
     * Background image used by this section.
     *
     * Each section may reuse the Hero image
     * or provide an independent visual.
     */
    backgroundImage?: string

    /**
     * CSS background-position value.
     *
     * Used to create visual continuity while
     * moving through the same Semantic World.
     *
     * Examples:
     *
     * center top
     * center
     * center bottom
     * bottom
     */
    backgroundPosition?: string

}

/* ============================================================================
Hero
============================================================================ */

/**
 * Introduces the Semantic World.
 */
export interface ExperienceHero
    extends ExperienceAsset {

    label: string

    title: string

    catchCopy: string

    description: string

    /**
     * Hero background is required.
     */
    backgroundImage: string

}

/* ============================================================================
About
============================================================================ */

/**
 * Explains the Semantic World.
 */
export interface ExperienceAbout
    extends ExperienceAsset {

    title: string

    body: string

}

/* ============================================================================
Elements
============================================================================ */

/**
 * Explains representative technologies
 * and characteristics of the Semantic World.
 */
export interface ExperienceElements
    extends ExperienceAsset {

    title: string

    description: string

    keywords: string[]

}

/* ============================================================================
Representative Products
============================================================================ */

/**
 * Introduces representative products
 * belonging to the Semantic World.
 */
export interface ExperienceProducts
    extends ExperienceAsset {

    title: string

    description: string

}

/* ============================================================================
Related Worlds
============================================================================ */

/**
 * Introduces neighboring Semantic Worlds
 * within the same category.
 */
export interface ExperienceRelated
    extends ExperienceAsset {

    title: string

    description: string

}

/* ============================================================================
Continue Discovery
============================================================================ */

/**
 * Encourages continued Semantic Discovery.
 */
export interface ExperienceContinue
    extends ExperienceAsset {

    title: string

    description: string

    buttonLabel: string

}

/* ============================================================================
Experience Translation Dictionary
============================================================================ */

/**
 * Customer-facing translation of a Semantic World.
 *
 * Constitutional Responsibility
 *
 * Semantic Dictionary (Backend)
 *            ↓
 * Experience Dictionary (Frontend)
 *            ↓
 * Customer Experience
 *
 * The Experience Dictionary translates
 * Semantic Reality.
 *
 * It never defines Semantic Reality.
 */
export interface ExperienceDictionary {

    hero: ExperienceHero

    about: ExperienceAbout

    elements: ExperienceElements

    products: ExperienceProducts

    related: ExperienceRelated

    continue: ExperienceContinue

}