// /home/maya/shin-dev/shin-vps/shared/lib/api/django/adult/sidebar.ts
// @ts-nocheck

/**
 * =====================================================================
 * 📊 Adult Sidebar Stats Service
 * AVFLASH Semantic API v1
 * =====================================================================
 *
 * Endpoint:
 * GET /api/adult/sidebar-stats/
 *
 * Purpose:
 * - 作品数
 * - 女優数
 * - メーカー数
 * - ジャンル数
 *
 * Frontend が常に安全に扱えるよう、
 * null / undefined を吸収して返却する。
 * =====================================================================
 */

import {
  resolveApiUrl,
  getDjangoHeaders,
  handleResponseWithDebug,
} from '../client';

export interface AdultSidebarStats {
  totalProducts: number;
  totalActresses: number;
  totalMakers: number;
  totalGenres: number;
}

export async function getAdultSidebarStats(
  siteTag: string = 'avflash'
): Promise<AdultSidebarStats> {
  const fallback: AdultSidebarStats = {
    totalProducts: 0,
    totalActresses: 0,
    totalMakers: 0,
    totalGenres: 0,
  };

  try {
    const url = resolveApiUrl(
      'adult/sidebar-stats/',
      siteTag
    );

    const res = await fetch(url, {
      headers: getDjangoHeaders(siteTag),
      cache: 'no-store',
    });

    const data = await handleResponseWithDebug(res, url);

    if (!data || typeof data !== 'object') {
      return fallback;
    }

    return {
      totalProducts:
        Number(
          data.products ??
          data.total_products ??
          0
        ) || 0,

      totalActresses:
        Number(
          data.actresses ??
          data.total_actresses ??
          0
        ) || 0,

      totalMakers:
        Number(
          data.makers ??
          data.total_makers ??
          0
        ) || 0,

      totalGenres:
        Number(
          data.genres ??
          data.total_genres ??
          0
        ) || 0,
    };
  } catch (error) {
    console.error(
      '🚨 [Adult Sidebar Stats Error]',
      error
    );

    return fallback;
  }
}

