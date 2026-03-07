// /home/maya/shin-dev/shin-vps/shared/layout/Sidebar/SidebarWrapper.tsx
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';

/**
 * ✅ 同一ディレクトリ内のコンポーネント参照
 * 物理構造: /shared/layout/Sidebar/ 
 */
import Sidebar from './AdultSidebar'; 
import AdultSidebarAvFlash from './AdultSidebarAvFlash'; 

/**
 * ✅ インポートパスの厳密な修正 (物理ツリー準拠)
 * 1. API: /shared/lib/api/django-bridge.ts 
 * 2. siteConfig: /shared/lib/utils/siteConfig.ts
 * * ※ tsconfig のエイリアスが "@/shared" の場合はそれに合わせ、
 * なければ相対パス or 正しいエイリアス (@shared) を使用します。
 */
import { 
  fetchGenres, 
  fetchMakers, 
  fetchActresses, 
  getAdultNavigationFloors,
} from '@/shared/lib/api/django-bridge'; 

import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

/**
 * =====================================================================
 * 🛸 SidebarWrapper - Tactical Data Aggregator (V4.4)
 * ---------------------------------------------------------------------
 * Build Error Fix:
 * - Module not found: Can't resolve '@shared/utils/siteConfig' 対策。
 * - 物理ツリーに基づき '@/shared/lib/utils/siteConfig' へ修正。
 * =====================================================================
 */
export default async function SidebarWrapper() {
  // getSiteMetadata の返り値が undefined の場合のフォールバック
  const metadata = getSiteMetadata() || {};
  const default_brand = metadata.default_brand || 'dmm';
  const site_name = metadata.site_name || 'TIPER';
  
  const isAvFlash = site_name === 'AV Flash' || site_name.includes('FLASH');

  // APIベースURL (Dockerネットワーク内部名)
  const API_BASE = "http://api-tiper-host:8083";

  // 1. データの並列取得
  const [navigationData, genresData, makersData, actressesData, statsResponse] = await Promise.all([
    getAdultNavigationFloors({ site: default_brand }).catch(() => ({})),
    fetchGenres({ limit: 40, api_source: default_brand }).catch(() => ({ results: [] })),
    fetchMakers({ limit: 20, api_source: default_brand }).catch(() => ({ results: [] })),
    fetchActresses({ limit: 20, api_source: default_brand, ordering: '-profile__ai_power_score' }).catch(() => ({ results: [] })),
    
    // 🚀 内部APIサーバーからサイドバー統計を取得
    fetch(`${API_BASE}/api/adult/sidebar-stats/`, { 
      next: { revalidate: 3600 } // ISR/キャッシュ設定
    })
      .then(res => res.ok ? res.json() : { attributes: [] })
      .catch(() => ({ attributes: [] }))
  ]);

  // 2. ナビゲーションデータの整形
  let processedNavigation = [];
  if (navigationData && typeof navigationData === 'object') {
    const keys = Object.keys(navigationData);
    if (keys.length > 0) {
      const firstKeyData = navigationData[keys[0]];
      processedNavigation = firstKeyData?.services || 
                           (Array.isArray(navigationData) ? navigationData : Object.values(navigationData));
    }
  }

  const commonProps = {
    navigation: processedNavigation || [],
    genres: genresData?.results || [],
    makers: makersData?.results || [],
    actresses: actressesData?.results || [],
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