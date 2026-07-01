// ============================================================================
// SHIN CORE LINX
// Discover Experience V2
// Experience Dictionary Types
// ============================================================================

import type {

    ExperienceDictionary,

} from './experience'

/* ============================================================================
Dictionary Entry
============================================================================ */

export type ExperienceDictionaryEntry =
    ExperienceDictionary

/* ============================================================================
Dictionary Map
============================================================================ */

export type ExperienceDictionaryMap = Record<

    string,

    ExperienceDictionaryEntry

>