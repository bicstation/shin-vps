// /home/maya/shin-vps/next-bicstation/app/components/home/types/home.ts

/* =========================================================
🔥 PRODUCT
========================================================= */

export type HomeProduct = {
  id?: number

  slug?: string

  name?: string

  image_url?: string

  brand?: string

  maker?: string

  price?: number

  score?: number

  gpu?: string

  cpu?: string

  memory?: number

  storage?: number

  semantic_tags?: string[]

  usage_tags?: string[]

  recommendation_reason?: string

  [key: string]: any
}

/* =========================================================
🔥 RECOMMENDATION ITEM
========================================================= */

export type HomeRecommendationItem = {
  id: string

  icon: string

  title: string

  description: string

  href: string
}

/* =========================================================
🔥 INTENT NAV
========================================================= */

export type HomeIntentItem = {
  slug: string

  icon: string

  label: string

  description: string
}

/* =========================================================
🔥 TRUST ITEM
========================================================= */

export type HomeTrustItem = {
  id: string

  icon: string

  title: string

  description: string
}

/* =========================================================
🔥 CAPABILITY ITEM
========================================================= */

export type HomeCapabilityItem = {
  id: string

  icon: string

  title: string

  description: string
}

/* =========================================================
🔥 QUICK COMPARE ITEM
========================================================= */

export type HomeQuickCompareItem = {
  id: string

  icon: string

  title: string

  description: string

  specs: string[]

  href: string
}

/* =========================================================
🔥 GUIDE ITEM
========================================================= */

export type HomeGuideItem = {
  badge: string

  title: string

  description: string

  href: string
}

/* =========================================================
🔥 SECTION TITLE
========================================================= */

export type HomeSectionTitleProps = {
  label: string

  title: string

  description?: string
}

/* =========================================================
🔥 SEMANTIC CARD
========================================================= */

export type HomeSemanticCardProps = {
  href: string

  icon?: string

  title: string

  description?: string

  count?: number

  emphasis?: boolean
}