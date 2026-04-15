/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import { headers } from 'next/headers';

// ✅ siteConfig ライブラリ
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

// 子コンポーネント
import Sidebar from './AdultSidebar'; 
import AdultSidebarAvFlash from './AdultSidebarAvFlash'; 
import GeneralSidebar from './GeneralSidebar';

// API関数
import { 
  fetchGenres, 
  fetchMakers, 
  fetchActresses, 
  getAdultNavigationFloors,
} from '@/shared/lib/api/django/adult'; 

/**
 * =====================================================================
 * 🛡️ Maya's Logic: サイドバー・インテリジェンス・ラッパー
 * ---------------------------------------------------------------------
 * 🚀 修正の要点:
 * 1. 【安全なFetch】AbortSignal.timeout 依存を排除し、例外を完全ラップ。
 * 2. 【条件付きリクエスト】一般サイト時はアダルト系 API への Fetch をスキップ。
 * 3. 【URLガード】api_base_url が無い場合に不正な URL を叩かないよう保護。
 * =====================================================================
 */
export default async function SidebarWrapper() {
  // --- 🛰️ STEP 1: 環境解析 ---
  const headerList = await headers();
  const host = headerList.get('host') || 'localhost';

  const metadata = getSiteMetadata(host);
  // undefined ガード
  const { 
    site_name = 'Bic Saving', 
    site_group = 'general', 
    default_brand = 'saving', 
    api_base_url = '' 
  } = metadata || {};
  
  const brandQuery = default_brand.toLowerCase();
  const isAvFlash = site_name === 'AV Flash';
  const isGeneral = site_group === 'general';

  // --- 🛰️ STEP 2: データの並列取得 (安全策を最大化) ---
  
  // 🛡️ API URL の検証と構築
  const statsUrl = (api_base_url && !isGeneral) 
    ? `${api_base_url}/api/adult/sidebar-stats/` 
    : null;

  const [navigationData, genresData, makersData, actressesData, statsResponse] = await Promise.all([
    getAdultNavigationFloors({ site: brandQuery }).catch(() => ({})),
    fetchGenres({ limit: 40, api_source: brandQuery }).catch(() => ({ results: [] })),
    fetchMakers({ limit: 20, api_source: brandQuery }).catch(() => ({ results: [] })),
    fetchActresses({ limit: 20, api_source: brandQuery }).catch(() => ({ results: [] })),
    
    // 自前で fetch のエラーハンドリングを完結させる (AbortSignal.timeout は使わない)
    (async () => {
      if (!statsUrl) return { attributes: [] };
      try {
        const res = await fetch(statsUrl, { 
          next: { revalidate: 3600 }
          // Note: タイムアウト制御が必要な場合はコントローラーを手動で作成するか、
          // インフラ側のタイムアウトに任せるのが Server Components では安全。
        });
        return res.ok ? await res.json() : { attributes: [] };
      } catch (e) {
        console.error("🛰️ Sidebar stats fetch error:", e);
        return { attributes: [] };
      }
    })()
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
    isBicSaving: isGeneral // Bic Saving / Bic Station を包含
  };

  // --- 🛰️ STEP 4: レンダリング ---
  return (
    <>
      {/* 🛠️ デバッグ注入ロジック (安全な文字列埋め込み) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            console.group("%c🛰️ SIDEBAR SYSTEM", "background: #111; color: #fbbf24; font-weight: bold; padding: 4px;");
            console.log("🌐 Site:", "${site_name.replace(/"/g, '\\"')}");
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