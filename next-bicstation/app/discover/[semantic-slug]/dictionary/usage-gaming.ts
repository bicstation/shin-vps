// ============================================================================
// SHIN CORE LINX
// Discover Experience V2
// Experience Dictionary
// Semantic World : usage-gaming
// ============================================================================

import gamingData from './data/usage-gaming.json'

import {

  createExperienceDictionary,

} from './templates/experience-discover.template'

/* ============================================================================
Experience Dictionary
============================================================================ */

const usageGaming =

  createExperienceDictionary(

    gamingData

  )

export default usageGaming