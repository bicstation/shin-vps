/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import { headers } from 'next/headers';

// ✅ siteConfig ライブラリ (v16.0 準拠: api_base_url, is_local_env を含む)
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

// 子コンポーネント
import Sidebar from './AdultSidebar'; 
import AdultSidebarAvFlash from './AdultSidebarAvFlash'; 

// API関数
import { 
  fetchGenres, 
  fetchMakers, 
  fetchActresses, 
  getAdultNavigationFloors,
} from '@/shared/lib/api/django/adult'; 

/**
 * =====================================================================
 * 🛸 SidebarWrapper - Super Debug Logic (V16.5)
 * ---------------------------------------------------------------------
 * 🛠️ 拡張ポイント:
 * 1. サーバーサイドでのフェッチ成否を個別にトラッキング。
 * 2. siteConfig から渡された api_base_url を全通信の基軸に据える。
 * 3. ブラウザコンソールに、サーバーサイドの生の状態を完全に同期表示。
 * =====================================================================
 */
export default async function SidebarWrapper() {
  // --- 🛰️ STEP 1: 環境解析 ---
  const headerList = await headers();
  const host = headerList.get('host') || 'localhost';

  // siteConfig から高度な判定結果を取得
  const metadata = getSiteMetadata(host);
  const { site_name, site_group, default_brand, api_base_url, is_local_env } = metadata;
  const brandQuery = default_brand.toLowerCase();
  
  const isAvFlash = site_name === 'AV Flash';

  // --- 🛰️ STEP 2: データの並列取得 ---
  // API関数内でも api_base_url を意識させるため、必要に応じて引数を調整
  const resultsTracker = {
    navigation: { status: 'pending', count: 0 },
    genres: { status: 'pending', count: 0 },
    makers: { status: 'pending', count: 0 },
    actresses: { status: 'pending', count: 0 },
    stats: { status: 'pending', count: 0 }
  };

  const [navigationData, genresData, makersData, actressesData, statsResponse] = await Promise.all([
    getAdultNavigationFloors({ site: brandQuery })
      .then(res => { resultsTracker.navigation.status = 'ok'; return res; })
      .catch(e => { resultsTracker.navigation.status = 'error'; return {}; }),

    fetchGenres({ limit: 40, api_source: brandQuery })
      .then(res => { resultsTracker.genres.status = 'ok'; resultsTracker.genres.count = res?.results?.length || 0; return res; })
      .catch(e => { resultsTracker.genres.status = 'error'; return { results: [] }; }),

    fetchMakers({ limit: 20, api_source: brandQuery })
      .then(res => { resultsTracker.makers.status = 'ok'; resultsTracker.makers.count = res?.results?.length || 0; return res; })
      .catch(e => { resultsTracker.makers.status = 'error'; return { results: [] }; }),

    fetchActresses({ limit: 20, api_source: brandQuery, ordering: '-profile__ai_power_score' })
      .then(res => { resultsTracker.actresses.status = 'ok'; resultsTracker.actresses.count = res?.results?.length || 0; return res; })
      .catch(e => { resultsTracker.actresses.status = 'error'; return { results: [] }; }),
    
    // 統計API (物理パス指定)
    fetch(`${api_base_url}/api/adult/sidebar-stats/`, { 
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000) 
    })
      .then(res => { 
        if (res.ok) {
          resultsTracker.stats.status = 'ok';
          return res.json();
        }
        resultsTracker.stats.status = `HTTP ${res.status}`;
        return { attributes: [] };
      })
      .catch(e => { resultsTracker.stats.status = 'timeout/error'; return { attributes: [] }; })
  ]);

  // --- 🛰️ STEP 3: 整形 ---
  let processedNavigation = [];
  if (navigationData && typeof navigationData === 'object') {
    const keys = Object.keys(navigationData);
    if (keys.length > 0) {
      const firstKeyData = navigationData[keys[0]];
      processedNavigation = firstKeyData?.services || (Array.isArray(navigationData) ? navigationData : []);
      resultsTracker.navigation.count = processedNavigation.length;
    }
  }

  const commonProps = {
    navigation: processedNavigation,
    genres: genresData?.results || [],
    makers: makersData?.results || [],
    actresses: actressesData?.results || [],
    aiAttributes: statsResponse?.attributes || [], 
    currentBrand: brandQuery,
    siteName: site_name
  };

  // --- 🛰️ STEP 4: レンダリング & デバッグ注入 ---
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            console.group("%c🛰️ SIDEBAR WRAPPER SYSTEM STATUS", "background: #e11d48; color: #fff; font-weight: bold; padding: 4px;");
            console.log("🏠 Host:", "${host}");
            console.log("🌐 Site:", "${site_name} (${site_group})");
            console.log("🛰️ API Base:", "${api_base_url}");
            console.log("🏗️ Env:", "${is_local_env ? 'LOCAL' : 'PRODUCTION'}");
            console.table(${JSON.stringify(resultsTracker)});
            console.log("🏷️ Active Brand:", "${brandQuery}");
            console.groupEnd();
          `,
        }}
      />

      {site_group === 'general' ? (
        <aside className="sidebar-general p-4 bg-[#0a0a0a] h-full min-h-screen text-white border-r border-white/5">
          <div className="mb-8 border-b border-white/10 pb-4">
            <div className="text-[10px] text-blue-500 font-bold tracking-widest mb-1 uppercase opacity-50">System Core</div>
            <h2 className="text-xl font-bold tracking-tight">{site_name}</h2>
          </div>
          <nav>
            <ul className="space-y-4 font-medium text-sm text-gray-400">
              <li><a href="/" className="hover:text-white transition-all">🏠 Dashboard</a></li>
              <li><a href="/blog/pc-finder" className="hover:text-white transition-all">🔍 PC Finder</a></li>
            </ul>
          </nav>
        </aside>
      ) : (
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