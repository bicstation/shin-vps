// ============================================================================
// SHIN CORE LINX
// Discover Experience V2
// Experience Dictionary Service
// ============================================================================

import type {

  ExperienceDictionary,

} from '../types/experience'

/* ============================================================================
Dictionary
============================================================================ */

export async function getExperienceDictionary(

  groupSlug: string

): Promise<ExperienceDictionary> {

  try {

    const module = await import(

      `../dictionary/${groupSlug}`

    )

    return module.default

  }

  catch (

    error

  ) {

    console.error(

      '[Experience Dictionary]',

      `Dictionary not found: ${groupSlug}`,

      error

    )

    throw new Error(

      `Experience Dictionary not found: ${groupSlug}`

    )

  }

}