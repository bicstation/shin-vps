// /shared/components/organisms/sidebar/PCSidebar.tsx
// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

import { getSiteMetadata, getSiteColor } from '@/shared/lib/utils/siteConfig';
import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge';
import styles from './PCSidebar.module.css';

/**
 * 🛰️ [DYNAMIC_PORT_RESOLUTION] - 修正版
 * 環境変数があればそれを優先し、なければホスト名から内部通信先を判定
 */
const getInternalApiBase = (host: string) => {
  // 1. 環境変数が設定されている場合は最優先
  if (process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL.replace(/\/api\/?$/, '');
  }
  
  // 2. 実行環境の判定
  // ホスト名に実際のドメイン名が含まれている、またはコンテナ名が含まれている場合はVPS環境とみなす
  const isVpsEnvironment = 
    host.includes('bicstation.com') || 
    host.includes('tiper.live') || 
    host.includes('django-api-host');
  
  if (isVpsEnvironment) {
    // VPS内部通信: Dockerネットワーク内のコンテナ名を使用（ポートは8000固定）
    return 'http://django-api-host:8000';
  }
  
  // 3. ローカル開発環境（ポート8083を使用）
  const cleanHost = host.split(':')[0];
  return `http://${cleanHost}:8083`;
};

/**
 * 🛰️ PC/ガジェット特化サテライトネットワーク (全30サイト)
 */
const PC_SATELLITES = [
  { name: "PCコンパス総合案内", url: "https://pc.compass.bicstation.com", icon: "🧭", isMain: true },
  { name: "導入の伝道師", url: "https://pc.first-step.bicstation.com", icon: "🌱" },
  { name: "高速化レスキュー", url: "https://pc.sukkiri.bicstation.com", icon: "⚡" },
  { name: "資産価値の鑑定士", url: "https://pc.resale.bicstation.com", icon: "💰" },
  { name: "効率化マニア", url: "https://pc.biz-hack.bicstation.com", icon: "🚀" },
  { name: "デジタル要塞の守護者", url: "https://data.defense.bicstation.com", icon: "🛡️" },
  { name: "環境アーキテクト", url: "https://desk.setup.bicstation.com", icon: "🏗️" },
  { name: "機動力ワーカー", url: "https://mobile.pc-life.bicstation.com", icon: "🏃" },
  { name: "自動化の魔術師", url: "https://pc.automation.bicstation.com", icon: "🪄" },
  { name: "AI拡張人間", url: "https://pc.ai.tech.bicstation.com", icon: "🤖" },
  { name: "Apple製品の美学", url: "https://ld.apple.bicstation.com", icon: "🍎" },
  { name: "ASUS技術オタク", url: "https://ld.asus.bicstation.com", icon: "🐉" },
  { name: "MSIハードウェアマニア", url: "https://msi.bicstation.com", icon: "❄️" },
  { name: "Sony体験ガイド", url: "https://sony.bicstation.com", icon: "📷" },
  { name: "DELLプロ視点", url: "https://dell.bicstation.com", icon: "👽" },
  { name: "HPミニマリスト", url: "https://hp.bicstation.com", icon: "💠" },
  { name: "Lenovo効率重視", url: "https://lenovo.bicstation.com", icon: "⌨️" },
  { name: "Logicoolデバイス魂", url: "https://logicool.bicstation.com", icon: "🖱️" },
  { name: "Intelパフォーマー", url: "https://intel.bicstation.com", icon: "🔵" },
  { name: "AMD自作応援団", url: "https://amd.bicstation.com", icon: "🔴" },
  { name: "Mouse実用派", url: "https://mouse.bicstation.com", icon: "🧀" },
  { name: "Iiyamaディスプレイ番人", url: "https://iiyama.bicstation.com", icon: "🖥️" },
  { name: "Dosparaゲーマー", url: "https://dospara.bicstation.com", icon: "🎮" },
  { name: "Tsukumo自作魂", url: "https://tsukumo.bicstation.com", icon: "⚙️" },
  { name: "Arkメモリ選別師", url: "https://ark.bicstation.com", icon: "⚡" },
  { name: "Frontierハンター", url: "https://frontier.bicstation.com", icon: "🏹" },
  { name: "Sycom静音・水冷", url: "https://sycom.bicstation.com", icon: "🌊" },
  { name: "Dynabook伝道師", url: "https://dynabook.bicstation.com", icon: "💻" },
  { name: "NEC安心ガイド", url: "https://nec.bicstation.com", icon: "🏠" },
  { name: "Fujitsu匠の技", url: "https://fujitsu.bicstation.com", icon: "🇯🇵" }
];

/**
 * 🏢 メーカーリストの取得
 */
async function getRealMakers(apiBase: string, siteTag: string) {
  try {
    // 確実に末尾スラッシュを付け、siteパラメータでフィルタリングを有効にする
    const url = `${apiBase}/api/general/pc-makers/?site=${siteTag}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    
    if (!res.ok) {
      console.error(`🚨 Sidebar Fetch Failed: ${res.status} URL: ${url}`);
      return [];
    }
    return await res.json();
  } catch (e) {
    console.error("Sidebar Maker Fetch Error:", e);
    return [];
  }
}

export default async function Sidebar() {
  /** 1. アイデンティティ確定 */
  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || 'django-api-host';
  const site = getSiteMetadata(host);
  const siteTag = site?.site_name || 'bicstation'; // siteTagの確定
  const siteColor = site ? getSiteColor(site.site_name) : '#00f2ff';
  
  // 環境に合わせたAPIベースURLを決定
  const apiBase = getInternalApiBase(host);

  /** 2. データ取得 (並列実行) */
  const [bridgeData, makers] = await Promise.all([
    fetchDjangoBridgeContent('posts', 5, { content_type: 'news' }).catch(() => ({ results: [] })),
    getRealMakers(apiBase, siteTag)
  ]);

  const recentArticles = Array.isArray(bridgeData) ? bridgeData : (bridgeData?.results || []);

  /** 3. サテライトの選出ロジック */
  const mainSatellite = PC_SATELLITES.find(s => s.isMain);
  const otherSatellites = PC_SATELLITES.filter(s => !s.isMain);
  
  const shuffledOthers = [...otherSatellites]
    .sort(() => Math.random() - 0.5)
    .slice(0, 7);

  const displaySatellites = [mainSatellite, ...shuffledOthers].filter(Boolean);
  const siteUpperName = site ? site.site_name.toUpperCase() : 'BICSTATION';

  return (
    <aside className={styles.sidebar}>
      
      {/* 🏆 SPECIAL: PC-FINDER */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle} style={{ color: siteColor }}>SPECIAL</h3>
        <Link href="/pc-finder/" className={styles.specialBanner} style={{ borderLeft: `4px solid ${siteColor}` }}>
          <span className={styles.finderIcon}>🔍</span>
          <div className={styles.finderText}>
            <span className={styles.finderMain}>PC-FINDER</span>
            <span className={styles.finderSub}>AIが最適な1台を提案</span>
          </div>
        </Link>
      </section>

      {/* 🏢 BRANDS (API連動) */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle} style={{ color: siteColor }}>BRANDS</h3>
        <div className={styles.brandGroup}>
          <ul className={styles.list}>
            {makers && makers.length > 0 ? (
              makers.map((m: any) => (
                <li key={m.maker}>
                  <Link href={`/product?maker=${m.maker}`} className={styles.link}>
                    <span className={styles.brandLabel}>💻 {m.maker.toUpperCase()}</span>
                    <span className={styles.badge}>{m.count}</span>
                  </Link>
                </li>
              ))
            ) : (
              <li className={styles.empty}>ブランド取得中...</li>
            )}
            <li>
              <Link href="/product" className={`${styles.link} ${styles.allLink}`}>
                <span>🚀 全ての製品を見る</span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* 🛰️ SATELLITE NETWORK */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle} style={{ color: siteColor }}>TECH NETWORK</h3>
        <div className={styles.satelliteGrid}>
          {displaySatellites.map((sat, idx) => (
            <a 
              key={idx} 
              href={sat.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={sat.isMain ? `${styles.satelliteLink} ${styles.mainSatellite}` : styles.satelliteLink}
              style={sat.isMain ? { borderColor: siteColor } : {}}
            >
              <span className={sat.isMain ? `${styles.satIcon} ${styles.mainIcon}` : styles.satIcon}>{sat.icon}</span>
              <span className={styles.satName}>{sat.name}</span>
            </a>
          ))}
        </div>
      </section>

      {/* 📄 UPDATES (Real Data) */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle} style={{ color: siteColor }}>LATEST UPDATES</h3>
        <ul className={styles.list}>
          {recentArticles.length > 0 ? (
            recentArticles.map((item: any) => (
              <li key={item.id} className={styles.newsItem}>
                <Link href={`/post/${item.id}`} className={styles.newsLink}>
                    <span className={styles.newsIcon}>📄</span>
                    <span className={styles.newsTitle}>{item.title}</span>
                </Link>
              </li>
            ))
          ) : (
            <li className={styles.empty}>最新ニュースを同期中...</li>
          )}
        </ul>
      </section>

      {/* 🚀 SYSTEM FOOTER */}
      <div className={styles.sidebarFooter}>
        <span className={styles.statusDot} style={{ backgroundColor: siteColor }}></span>
        <span className={styles.statusText}>{siteUpperName} PC_NODE ONLINE</span>
      </div>
    </aside>
  );
}