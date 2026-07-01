// ============================================================================
// SHIN CORE LINX
// Discover Experience V2
// Experience Dictionary Contract
// ============================================================================

/* ============================================================================
Hero
============================================================================ */

export interface ExperienceHero {

    label: string

    title: string

    catchCopy: string

    description: string

}

/* ============================================================================
About
============================================================================ */

export interface ExperienceAbout {

    title: string

    body: string

}

/* ============================================================================
Elements
============================================================================ */

export interface ExperienceElements {

    title: string

    description: string

    keywords: string[]

}

/* ============================================================================
Representative Products
============================================================================ */

export interface ExperienceProducts {

    title: string

    description: string

}

/* ============================================================================
Related Worlds
============================================================================ */

export interface ExperienceRelated {

    title: string

    description: string

}

/* ============================================================================
Continue Discovery
============================================================================ */

export interface ExperienceContinue {

    title: string

    description: string

}

/* ============================================================================
Experience Dictionary
============================================================================ */

export interface ExperienceDictionary {

    hero: ExperienceHero

    about: ExperienceAbout

    elements: ExperienceElements

    products: ExperienceProducts

    related: ExperienceRelated

    continue: ExperienceContinue

}