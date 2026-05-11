// /app/concierge/domain/routing/routingDomain.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '../../contracts/semantic/SemanticIntent'

/* =========================================
🔥 Types
========================================= */

type RouteDestination = {

  type:
    | 'finder'
    | 'ranking'
    | 'product'
    | 'concierge'
    | 'search'

  path: string

  reason?: string
}

/* =========================================
🔥 Routing Domain
========================================= */

export const RoutingDomain = {

  /* =====================================
  Resolve Semantic Route
  ===================================== */

  resolveSemanticRoute(
    semanticIntent?:
      SemanticIntent
  ): RouteDestination {

    // ===================================
    // No Intent
    // ===================================

    if (
      !semanticIntent
    ) {

      return {

        type:
          'concierge',

        path:
          '/concierge',

        reason:
          'fallback_runtime',
      }
    }

    // ===================================
    // Gaming
    // ===================================

    if (
      semanticIntent?.usage
      === 'gaming'
    ) {

      return {

        type:
          'ranking',

        path:
          '/ranking/gaming',

        reason:
          'gaming_semantic_route',
      }
    }

    // ===================================
    // Creator
    // ===================================

    if (
      semanticIntent?.usage
      === 'creator'
    ) {

      return {

        type:
          'ranking',

        path:
          '/ranking/creator',

        reason:
          'creator_semantic_route',
      }
    }

    // ===================================
    // AI
    // ===================================

    if (
      semanticIntent?.usage
      === 'ai'
    ) {

      return {

        type:
          'finder',

        path:
          '/pc-finder',

        reason:
          'ai_finder_route',
      }
    }

    // ===================================
    // Business
    // ===================================

    if (
      semanticIntent?.usage
      === 'business'
    ) {

      return {

        type:
          'finder',

        path:
          '/pc-finder',

        reason:
          'business_finder_route',
      }
    }

    // ===================================
    // GPU Intent
    // ===================================

    if (
      semanticIntent?.gpu
    ) {

      return {

        type:
          'search',

        path:
          `/search?gpu=${semanticIntent.gpu}`,

        reason:
          'gpu_search_route',
      }
    }

    // ===================================
    // Budget Intent
    // ===================================

    if (
      semanticIntent?.budget
    ) {

      return {

        type:
          'finder',

        path:
          `/pc-finder?budget=${semanticIntent.budget}`,

        reason:
          'budget_finder_route',
      }
    }

    // ===================================
    // Default
    // ===================================

    return {

      type:
        'concierge',

      path:
        '/concierge',

      reason:
        'default_runtime_route',
    }
  },

  /* =====================================
  Is Finder Route
  ===================================== */

  isFinderRoute(
    route?:
      RouteDestination
  ) {

    return (
      route?.type
      === 'finder'
    )
  },

  /* =====================================
  Is Ranking Route
  ===================================== */

  isRankingRoute(
    route?:
      RouteDestination
  ) {

    return (
      route?.type
      === 'ranking'
    )
  },

  /* =====================================
  Is Product Route
  ===================================== */

  isProductRoute(
    route?:
      RouteDestination
  ) {

    return (
      route?.type
      === 'product'
    )
  },

  /* =====================================
  Build Search Route
  ===================================== */

  buildSearchRoute(
    query?: string
  ): RouteDestination {

    return {

      type:
        'search',

      path:
        `/search?q=${encodeURIComponent(
          query || ''
        )}`,

      reason:
        'manual_search_route',
    }
  },

  /* =====================================
  Normalize Route
  ===================================== */

  normalizeRoute(
    route?:
      RouteDestination
  ): RouteDestination {

    return {

      type:
        route?.type
        || 'concierge',

      path:
        route?.path
        || '/concierge',

      reason:
        route?.reason
        || 'normalized_route',
    }
  },
}

export default RoutingDomain