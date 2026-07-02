// ============================================================================
// SHIN CORE LINX
// Discover Experience V2
// Experience Dictionary Registry
// ============================================================================

import type {

    ExperienceDictionary,

} from '../types/experience'

import usageAi from './usage-ai'

import usageGaming from './usage-gaming'

import usageCreator from './usage-creator'

import usageBusiness from './usage-business'

import usageMobile from './usage-mobile'

import usageBudget from './usage-budget'

/* ============================================================================
Registry
============================================================================ */

const EXPERIENCE_DICTIONARIES:

    Record<string, ExperienceDictionary> = {

    'usage-ai':
        usageAi,

    'usage-gaming':
        usageGaming,

    'usage-creator':
        usageCreator,

    'usage-business':
        usageBusiness,

    'usage-mobile':
        usageMobile,

    'usage-budget':
        usageBudget,

}

/* ============================================================================
Get Experience Dictionary
============================================================================ */

export function getExperienceDictionary(

    groupSlug: string

): ExperienceDictionary | undefined {

    return EXPERIENCE_DICTIONARIES[groupSlug]

}

/* ============================================================================
Default Export
============================================================================ */

export default EXPERIENCE_DICTIONARIES