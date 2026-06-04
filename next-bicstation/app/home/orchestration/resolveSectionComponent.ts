// /home/maya/shin-vps/next-bicstation/app/home/orchestration/resolveSectionComponent.ts

import HomeHero
from '../hero/HomeHero'

import HomeCapabilitySection
from '../capability/HomeCapabilitySection'

import HomeGuideSection
from '../guide/HomeGuideSection'

import HomeTrustSection
from '../trust/HomeTrustSection'

import HomeFinderCTA
from '../recommendation/HomeFinderCTA'

import HomeIntentNav
from '../recommendation/HomeIntentNav'

import HomeRecommendedPaths
from '../recommendation/HomeRecommendedPaths'

import HomeBottomCTA
from '../cta/HomeBottomCTA'

import HomeStickyCTA
from '../cta/HomeStickyCTA'

import ProductCard
from '@/shared/components/organisms/cards/ProductCard'

import HeroRankingCard
from '@/shared/components/organisms/cards/HeroRankingCard'

export function
resolveSectionComponent(
type: string
) {

switch(type) {


case 'hero':
  return HomeHero

case 'intent_navigation':
  return HomeIntentNav

case 'hero_ranking':
  return HeroRankingCard

case 'ranking_grid':
  return ProductCard

case 'recommended_paths':
  return HomeRecommendedPaths

case 'capability':
  return HomeCapabilitySection

case 'guide':
  return HomeGuideSection

case 'trust':
  return HomeTrustSection

case 'finder_cta':
  return HomeFinderCTA

case 'bottom_cta':
  return HomeBottomCTA

case 'sticky_cta':
  return HomeStickyCTA

default:
  return null


}

}
