/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import Sidebar from './AdultSidebar'; // 💡 Tiper / 一般用サイドバー
import AdultSidebarAvFlash from './AdultSidebarAvFlash'; // 💡 AV Flash 専用サイドバー
import { 
  fetchGenres, 
  fetchMakers, 
  fetchActresses, 
  getAdultNavigationFloors, 
  fetchAdultAttributes 
} from '@/shared/lib/api/django/adult';
import { getSiteMetadata } from '@/shared/lib/siteConfig';

/**
 * =====================================================================
 * 🛸 SidebarWrapper
 * ---------------------------------------------------------------------
 * ドメイン（AV Flash / Tiper 等）に基づいて、表示すべきブランド（DUGA / FANZA / DMM）を
 * 自動判別し、サイドバーに必要なデータを一括取得して最適なコンポーネントへ渡します。
 * =====================================================================
 */
export default async function SidebarWrapper() {
  // 1. サイトのメタデータを取得（AV Flash ドメインなら default_brand は 'DUGA'）
  const { default_brand, site_name } = getSiteMetadata();
  const isAvFlash = site_name === 'AV Flash';

  // サーバーログで現在の動作状況を確認（デバッグ用）
  console.log(`📡 [SidebarWrapper] Site: ${site_name} | Targeting Brand: ${default_brand} | Mode: ${isAvFlash ? 'Exclusive' : 'Standard'}`);

  // 2. 指定されたブランド（api_source）に基づいてデータを並列取得
  // getAdultNavigationFloors は内部で site_code による仕分けを行います
  const [navigationData, genresData, makersData, actressesData, aiAttributes] = await Promise.all([
    getAdultNavigationFloors({ site: default_brand }),
    fetchGenres({ limit: 20, api_source: default_brand }),
    fetchMakers({ limit: 20, api_source: default_brand }),
    fetchActresses({ limit: 20, api_source: default_brand, ordering: '-profile__ai_power_score' }),
    fetchAdultAttributes()
  ]);

  // 3. ナビゲーションデータの整形ロジック
  // DUGA の場合、階層構造が FANZA/DMM と異なるケースがあるため抽出します
  let processedNavigation = navigationData;
  if (default_brand === 'DUGA') {
    // DUGA マスタが辞書形式で返ってきた場合、最初のキーの中身（servicesなど）を優先
    const keys = Object.keys(navigationData);
    if (keys.length > 0) {
      if (navigationData[keys].services) {
        processedNavigation = navigationData[keys].services;
      } else {
        // servicesキーがない場合は、マスタの配列として扱う
        processedNavigation = Array.isArray(navigationData) ? navigationData : Object.values(navigationData);
      }
    }
  }

  // 4. コンポーネントへ流し込む Props の集約
  const commonProps = {
    navigation: processedNavigation,
    genres: genresData.results || [],
    makers: makersData.results || [],
    actresses: actressesData.results || [],
    aiAttributes: aiAttributes || [],
    currentBrand: default_brand,
    siteName: site_name
  };

  // 5. サイト判定に基づいて、表示する「看板（コンポーネント）」を切り替え
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