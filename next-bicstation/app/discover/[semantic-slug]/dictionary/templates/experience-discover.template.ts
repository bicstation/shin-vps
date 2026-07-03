// ============================================================================
// SHIN CORE LINX
// Discover Experience V2
// Experience Dictionary Template
// ============================================================================

import type {

  ExperienceDictionary,

} from '../types/experience'

/* ============================================================================
Experience Translation Data
============================================================================ */

export interface ExperienceTranslationData {

  group_slug: string

  theme: {

    icon: string

    accentColor: string

    backgroundImage: string

  }

  hero: {

    label: string

    title: string

    catchCopy: string

    description: string

    backgroundPosition: string

  }

  about: {

    title: string

    body: string

    backgroundPosition: string

  }

  elements: {

    title: string

    description: string

    keywords: string[]

    backgroundPosition: string

  }

  products: {

    title: string

    description: string

    backgroundPosition: string

  }

  related: {

    title: string

    description: string

    backgroundPosition: string

  }

  continue: {

    title: string

    description: string

    buttonLabel: string

    backgroundPosition: string

  }

}

/* ============================================================================
Template
============================================================================ */

export function createExperienceDictionary(

  data: ExperienceTranslationData

): ExperienceDictionary {

  return {

    hero: {

      label:
        data.hero.label,

      title:
        data.hero.title,

      catchCopy:
        data.hero.catchCopy,

      description:
        data.hero.description,

      icon:
        data.theme.icon,

      accentColor:
        data.theme.accentColor,

      backgroundImage:
        data.theme.backgroundImage,

      backgroundPosition:
        data.hero.backgroundPosition,

    },

    about: {

      title:
        data.about.title,

      body:
        data.about.body,

      icon:
        'book-open',

      accentColor:
        data.theme.accentColor,

      backgroundImage:
        data.theme.backgroundImage,

      backgroundPosition:
        data.about.backgroundPosition,

    },

    elements: {

      title:
        data.elements.title,

      description:
        data.elements.description,

      keywords:
        data.elements.keywords,

      icon:
        'layers',

      accentColor:
        data.theme.accentColor,

      backgroundImage:
        data.theme.backgroundImage,

      backgroundPosition:
        data.elements.backgroundPosition,

    },

    products: {

      title:
        data.products.title,

      description:
        data.products.description,

      icon:
        'cpu',

      accentColor:
        data.theme.accentColor,

      backgroundImage:
        data.theme.backgroundImage,

      backgroundPosition:
        data.products.backgroundPosition,

    },

    related: {

      title:
        data.related.title,

      description:
        data.related.description,

      icon:
        'network',

      accentColor:
        data.theme.accentColor,

      backgroundImage:
        data.theme.backgroundImage,

      backgroundPosition:
        data.related.backgroundPosition,

    },

    continue: {

      title:
        data.continue.title,

      description:
        data.continue.description,

      buttonLabel:
        data.continue.buttonLabel,

      icon:
        'compass',

      accentColor:
        data.theme.accentColor,

      backgroundImage:
        data.theme.backgroundImage,

      backgroundPosition:
        data.continue.backgroundPosition,

    },

  }

}