/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import { headers } from 'next/headers';

// ✅ siteConfig ライブラリ
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

// 子コンポーネント
import Sidebar from './AdultSidebar'; 
import AdultSidebarAvFlash from './AdultSidebarAvFlash'; 
import GeneralSidebar from './GeneralSidebar'; // 👈 追加

// API関数
import { 
  fetchGenres, 
  fetchMakers, 
  fetchActresses, 
  getAdultNavigationFloors,
} from '@/shared/lib/api/django/adult'; 

export default async function SidebarWrapper() {
  // --- 🛰️ STEP 1: 環境解析 ---
  const headerList = await headers();
  const host = headerList.get('host') || 'localhost';

  const metadata = getSiteMetadata(host);
  const { site_name, site_group, default_brand, api_base_url, is_local_env } = metadata;
  const brandQuery = default_brand.toLowerCase();
  
  const isAvFlash = site_name === 'AV Flash';
  const isBicSaving = site_name === 'Bic Saving'; // 👈 判定用に追加

  // --- 🛰️ STEP 2: データの並列取得 ---
  const resultsTracker = {
    navigation: { status: 'pending', count: 0 },
    genres: { status: 'pending', count: 0 },
    makers: { status: 'pending', count: 0 },
    actresses: { status: 'pending', count: 0 },
    stats: { status: 'pending', count: 0 }
  };

  // ※一般サイト（Bic Saving等）の場合は、アダルトAPIのフェッチをスキップして負荷を軽減する運用も可能ですが、
  // 現状のロジックを維持しつつ安全に実行します。
  const [navigationData, genresData, makersData, actressesData, statsResponse] = await Promise.all([
    getAdultNavigationFloors({ site: brandQuery }).catch(() => ({})),
    fetchGenres({ limit: 40, api_source: brandQuery }).catch(() => ({ results: [] })),
    fetchMakers({ limit: 20, api_source: brandQuery }).catch(() => ({ results: [] })),
    fetchActresses({ limit: 20, api_source: brandQuery }).catch(() => ({ results: [] })),
    fetch(`${api_base_url}/api/adult/sidebar-stats/`, { 
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000) 
    }).then(res => res.ok ? res.json() : { attributes: [] }).catch(() => ({ attributes: [] }))
  ]);

  // --- 🛰️ STEP 3: 整形 ---
  const commonProps = {
    navigation: navigationData?.services || [],
    genres: genresData?.results || [],
    makers: makersData?.results || [],
    actresses: actressesData?.results || [],
    aiAttributes: statsResponse?.attributes || [], 
    currentBrand: brandQuery,
    siteName: site_name,
    isBicSaving: isBicSaving // 👈 Propとして渡す
  };

  // --- 🛰️ STEP 4: レンダリング ---
  return (
    <>
      {/* 🛠️ デバッグ注入ロジック */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            console.group("%c🛰️ SIDEBAR SYSTEM v17.0", "background: #10b981; color: #fff; font-weight: bold; padding: 4px;");
            console.log("🌐 Site:", "${site_name}");
            console.log("🏗️ Mode:", "${site_group}");
            console.groupEnd();
          `,
        }}
      />

      {site_group === 'general' ? (
        /* 🏠 一般サイト（Bic Station / Bic Saving） */
        <GeneralSidebar {...commonProps} />
      ) : (
        /* 🔞 アダルトサイト（AV Flash / Tiper） */
        <div className="sidebar-dynamic-container">
          {isAvFlash ? (
            <AdultSidebarAvFlash {...commonProps} />
          ) : (
            <Sidebar {...commonProps} />
          )}
        </div>
      )}
    </>
  );
}