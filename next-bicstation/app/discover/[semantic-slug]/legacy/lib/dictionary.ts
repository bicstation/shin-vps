// ============================================================================
// SHIN CORE LINX
// Discover Experience V2
// Experience Dictionary Loader
// ============================================================================

import type {

    ExperienceDictionary,

} from '../types/experience'

/* ============================================================================
Get Experience Dictionary
============================================================================ */

export async function getExperienceDictionary(

    groupSlug: string

): Promise<ExperienceDictionary> {

    throw new Error(

        `Experience Dictionary not implemented: ${groupSlug}`

    )

}