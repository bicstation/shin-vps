import type {
  MetadataRoute,
} from 'next'

const BASE_URL =
  'https://bicstation.com'

export default function
sitemap():
MetadataRoute.Sitemap {

  // ======================================
  // STATIC PAGES
  // ======================================

  const staticPages = [

    '',

    '/ranking/score',
    '/ranking/gaming',
    '/ranking/ai',
    '/ranking/creator',
    '/ranking/business',
    '/ranking/mobile',
  ]

  // ======================================
  // GENERATE
  // ======================================

  return staticPages.map(
    (path) => ({

      url:
        `${BASE_URL}${path}`,

      lastModified:
        new Date(),

      changeFrequency:
        'daily',

      priority:

        path === ''
          ? 1.0
          : 0.8,
    })
  )
}