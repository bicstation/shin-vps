/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import { headers } from 'next/headers';

// ✅ siteConfig ライブラリ
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

// 各専門サイドバー（役割ごとに完全に分離）
import PCSidebar from './organisms/sidebar/PCSidebar';      // 💻 PC・ガジェット専門
import GeneralSidebar from './GeneralSidebar';             // 💰 節約・金融専門 (Bic Saving)
import Sidebar from './AdultSidebar';                     // 🔞 アダルト共通
import AdultSidebarAvFlash from './AdultSidebarAvFlash';   // 🔞 AV Flash 専門

// API関数（Adult系）
import { 
  fetchGenres, 
  fetchMakers, 
  fetchActresses, 
  getAdultNavigationFloors,
} from '@/shared/lib/api/django/adult'; 

/**
 * =====================================================================
 * 🛡️ Sidebar Intelligence System (Complete Edition)
 * ---------------------------------------------------------------------
 * 🚀 分離設計のポイント:
 * 1. 【サイト判定】site_name に "Station" が含まれれば PC 専門、"Saving" なら節約専門へ。
 * 2. 【無駄なFetchの排除】一般サイト時はアダルト系 API の Promise を実行しません。
 * 3. 【コンテンツの純粋性】GeneralSidebar は節約サテライトのみに集中させます。
 * =====================================================================
 */
export default async function SidebarWrapper() {
  // --- 🛰️ STEP 1: 環境解析 ---
  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || 'localhost';

  const metadata = getSiteMetadata(host);
  const { 
    site_name = 'Bic Saving', 
    site_group = 'general', 
    default_brand = 'saving', 
    api_base_url = '' 
  } = metadata || {};
  
  const brandQuery = default_brand.toLowerCase();
  const isGeneral = site_group === 'general';
  
  // 🎯 詳細なサイト判別
  const isPCStation = site_name.toLowerCase().includes('station');
  const isBicSaving = site_name.toLowerCase().includes('saving');

  // --- 🛰️ STEP 2: データの並列取得（サイトグループに応じて最適化） ---
  let sidebarProps = {};

  if (isGeneral) {
    /** * 🏠 一般サイト（PC または 節約）
     * ここではアダルト系 API は一切叩かず、最小限のデータでPCSidebar/GeneralSidebarへ繋ぎます
     */
    sidebarProps = {
      siteName: site_name,
      isBicSaving: isBicSaving,
      host: host
    };
  } else {
    /** * 🔞 アダルトサイト
     * 必要な API 群を並列取得
     */
    const statsUrl = api_base_url ? `${api_base_url}/api/adult/sidebar-stats/` : null;

    const [navigationData, genresData, makersData, actressesData, statsResponse] = await Promise.all([
      getAdultNavigationFloors({ site: brandQuery }).catch(() => ({})),
      fetchGenres({ limit: 40, api_source: brandQuery }).catch(() => ({ results: [] })),
      fetchMakers({ limit: 20, api_source: brandQuery }).catch(() => ({ results: [] })),
      fetchActresses({ limit: 20, api_source: brandQuery }).catch(() => ({ results: [] })),
      (async () => {
        if (!statsUrl) return { attributes: [] };
        try {
          const res = await fetch(statsUrl, { next: { revalidate: 3600 } });
          return res.ok ? await res.json() : { attributes: [] };
        } catch (e) {
          console.error("🛰️ Sidebar stats error:", e);
          return { attributes: [] };
        }
      })()
    ]);

    sidebarProps = {
      navigation: navigationData?.services || [],
      genres: genresData?.results || [],
      makers: makersData?.results || [],
      actresses: actressesData?.results || [],
      aiAttributes: statsResponse?.attributes || [], 
      currentBrand: brandQuery,
      siteName: site_name,
    };
  }

  // --- 🛰️ STEP 3: レンダリング分岐（コンテンツごとに完全分離） ---

  // 1. PC・ガジェット専門（Bic Station）
  if (isPCStation) {
    return <PCSidebar host={host} siteName={site_name} />;
  }

  // 2. 節約・金融専門（Bic Saving / その他一般）
  if (isGeneral) {
    return <GeneralSidebar {...sidebarProps} />;
  }

  // 3. アダルト系（AV Flash）
  if (site_name === 'AV Flash') {
    return <AdultSidebarAvFlash {...sidebarProps} />;
  }

  // 4. アダルト共通（Tiper / その他）
  return (
    <div className="sidebar-dynamic-container">
       <Sidebar {...sidebarProps} />
    </div>
  );
}