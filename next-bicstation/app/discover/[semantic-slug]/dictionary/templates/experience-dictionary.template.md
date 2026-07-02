// ============================================================================
// SHIN CORE LINX
// Discover Experience V2
// Experience Translation Dictionary Template
// ============================================================================

import type {

    ExperienceDictionary,

} from '../types/experience'

/**
 * ============================================================================
 * Experience Translation Dictionary Template
 * ============================================================================
 *
 * Replace:
 *
 * {{group_slug}}
 * {{dictionaryName}}
 * {{World Title}}
 * {{Hero Catch Copy}}
 * {{Hero Description}}
 * {{About Body}}
 * {{Elements Description}}
 * {{Products Description}}
 * {{Related Description}}
 * {{Continue Description}}
 * {{Keyword}}
 * {{icon}}
 * {{accentColor}}
 *
 * Background Image Rule
 *
 * /images/discover/{{group_slug}}.png
 *
 * ============================================================================
 */

const {{ dictionaryName }}: ExperienceDictionary = {

    /* ==========================================================================
    Hero
    ========================================================================== */

    hero: {

        label: 'SEMANTIC WORLD',

        title:
            '{{World Title}}',

        catchCopy:
            '{{Hero Catch Copy}}',

        description:
            '{{Hero Description}}',

        backgroundImage:
            '/images/discover/{{group_slug}}.png',

        backgroundPosition:
            'center top',

        icon:
            '{{icon}}',

        accentColor:
            '{{accentColor}}',

    },

    /* ==========================================================================
    About
    ========================================================================== */

    about: {

        title:
            'この世界について',

        icon:
            'book-open',

        backgroundImage:
            '/images/discover/{{group_slug}}.png',

        backgroundPosition:
            'center 30%',

        body:
            '{{About Body}}',

    },

    /* ==========================================================================
    Elements
    ========================================================================== */

    elements: {

        title:
            'この世界を構成する主な要素',

        icon:
            'layers',

        backgroundImage:
            '/images/discover/{{group_slug}}.png',

        backgroundPosition:
            'center',

        description:
            '{{Elements Description}}',

        keywords: [

            '{{Keyword 1}}',

            '{{Keyword 2}}',

            '{{Keyword 3}}',

            '{{Keyword 4}}',

            '{{Keyword 5}}',

        ],

    },

    /* ==========================================================================
    Representative Products
    ========================================================================== */

    products: {

        title:
            'この世界を代表する製品',

        icon:
            'cpu',

        backgroundImage:
            '/images/discover/{{group_slug}}.png',

        backgroundPosition:
            'center 70%',

        description:
            '{{Products Description}}',

    },

    /* ==========================================================================
    Related Worlds
    ========================================================================== */

    related: {

        title:
            '同じ用途カテゴリーの世界',

        icon:
            'network',

        backgroundImage:
            '/images/discover/{{group_slug}}.png',

        backgroundPosition:
            'center bottom',

        description:
            '{{Related Description}}',

    },

    /* ==========================================================================
    Continue Discovery
    ========================================================================== */

    continue: {

        title:
            '次の世界を探索する',

        icon:
            'compass',

        backgroundImage:
            '/images/discover/{{group_slug}}.png',

        backgroundPosition:
            'bottom',

        description:
            '{{Continue Description}}',

        buttonLabel:
            '他のセマンティックワールドを探索する',

    },

}

export default {{ dictionaryName }}