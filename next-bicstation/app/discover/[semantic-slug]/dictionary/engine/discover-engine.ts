// ============================================================================
// SHIN CORE LINX
// Discover Experience V2
// Discover Engine
// ============================================================================

import type {

  ExperienceDictionary,

} from '../types/experience'

import {

  createExperienceDictionary,

} from '../templates/experience-discover.template'

/* ============================================================================
Create Discover Dictionary
============================================================================ */

export async function createDiscoverDictionary(

  groupSlug: string

): Promise<ExperienceDictionary> {

  try {

    const module = await import(

      `../data/${groupSlug}.json`

    )

    return createExperienceDictionary(

      module.default

    )

  }

  catch (

    error

  ) {

    console.error(

      '[Discover Engine]',

      `Translation Data not found: ${groupSlug}`,

      error

    )

    throw new Error(

      `Translation Data not found: ${groupSlug}`

    )

  }

}