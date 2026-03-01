/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import Sidebar from './AdultSidebar'; 
import AdultSidebarAvFlash from './AdultSidebarAvFlash'; 
import { 
  fetchGenres, 
  fetchMakers, 
  fetchActresses, 
  getAdultNavigationFloors,
} from '@/shared/lib/api/django/adult';
import { getSiteMetadata } from '@/shared/lib/siteConfig';

/**
 * =====================================================================
 * 🛸 SidebarWrapper - Tactical Data Aggregator (V4.2)
 * ---------------------------------------------------------------------
 * sidebar-stats から属性データを取得し、AV Flash 用マトリックスを生成します。
 * =====================================================================
 */
export default async function SidebarWrapper() {
  const { default_brand, site_name } = getSiteMetadata();
  const isAvFlash = site_name === 'AV Flash' || site_name.includes('FLASH');

  // APIベースURL
  const API_BASE = "http://api-tiper-host:8083";

  // 1. データの並列取得
  const [navigationData, genresData, makersData, actressesData, statsResponse] = await Promise.all([
    getAdultNavigationFloors({ site: default_brand }),
    fetchGenres({ limit: 40, api_source: default_brand }),
    fetchMakers({ limit: 20, api_source: default_brand }),
    fetchActresses({ limit: 20, api_source: default_brand, ordering: '-profile__ai_power_score' }),
    // 🚀 taxonomy API ではなく、データが詰まっている sidebar-stats を取得
    fetch(`${API_BASE}/api/adult/sidebar-stats/`, { cache: 'no-store' })
      .then(res => res.json())
      .catch(() => ({ attributes: [] }))
  ]);

  // 2. ナビゲーションデータの整形 (DUGA階層構造パース)
  let processedNavigation = [];
  if (navigationData) {
    const keys = Object.keys(navigationData);
    if (keys.length > 0) {
      const firstKeyData = navigationData[keys];
      processedNavigation = firstKeyData?.services || 
                            (Array.isArray(navigationData) ? navigationData : Object.values(navigationData));
    }
  }

  const commonProps = {
    navigation: processedNavigation || [],
    genres: genresData?.results || [],
    makers: makersData?.results || [],
    actresses: actressesData?.results || [],
    // 💡 Stats API の attributes 配列を渡す
    aiAttributes: statsResponse?.attributes || [], 
    currentBrand: default_brand,
    siteName: site_name
  };

  return (
    <>
      {isAvFlash ? (
        <AdultSidebarAvFlash {...commonProps} />
      ) : (
        <Sidebar {...commonProps} />
      )}
    </>
  );
}