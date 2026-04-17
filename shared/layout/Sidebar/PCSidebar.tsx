// /shared/components/organisms/sidebar/PCSidebar.tsx
// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

import { getSiteMetadata, getSiteColor } from '@/shared/lib/utils/siteConfig';
import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge';
import { fetchPCSidebarStats } from '@/shared/lib/api/django/pc/stats'; 
import styles from './PCSidebar.module.css'; // ✅ 正しいCSSをインポート

/**
 * 🛰️ PC/ガジェット特化サテライトネットワーク (固定リスト)
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

export default async function PCSidebar() {
  /** 1. アイデンティティ確定 */
  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || 'localhost';
  const site = getSiteMetadata(host);
  const siteColor = site ? getSiteColor(site.site_name) : '#00f2ff';
  
  /** 2. データ取得 (並列実行) */
  const [bridgeData, statsData] = await Promise.all([
    fetchDjangoBridgeContent('posts', 5, { content_type: 'news' }).catch(() => ({ results: [] })),
    fetchPCSidebarStats(host).catch(() => null)
  ]);

  const recentArticles = Array.isArray(bridgeData) ? bridgeData : (bridgeData?.results || []);

  /** 🛡️ stats.ts の戻り値構造に完全同期 */
  const stats = statsData || {};
  const makers = Array.isArray(stats.maker_counts) ? stats.maker_counts : [];

  /** 3. サテライトの選出ロジック */
  const mainSatellite = PC_SATELLITES.find(s => s.isMain);
  const otherSatellites = PC_SATELLITES.filter(s => !s.isMain);
  const daySeed = new Date().getDate(); 
  const displaySatellites = [
    mainSatellite,
    ...otherSatellites.slice(daySeed % 5, (daySeed % 5) + 7) 
  ].filter(Boolean);

  const siteUpperName = (site?.site_name || 'BICSTATION').toUpperCase();

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

      {/* 📊 SPEC SEGMENTS (属性表示セクション) */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle} style={{ color: siteColor }}>SPEC SEGMENTS</h3>
        
        {/* CPU Segment */}
        {stats.CPU && Array.isArray(stats.CPU) && (
          <div className={styles.statGroup}>
            <p className={styles.groupLabel}>PROCESSOR & AI</p>
            <div className={styles.tagWrapper}>
              {stats.CPU.slice(0, 10).map((item: any, idx: number) => (
                <Link key={idx} href={`/product?cpu=${item.slug}`} className={styles.attrTag}>
                  <span className={styles.tagName}>{item.name}</span>
                  <span className={styles.tagCount} style={{ color: siteColor }}>{item.count}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Features & Graphics Segment */}
        {(stats.feature || stats["グラフィック"]) && (
          <div className={styles.statGroup}>
            <p className={styles.groupLabel}>FEATURES & GRAPHICS</p>
            <div className={styles.tagWrapper}>
              {/* Feature Tags */}
              {Array.isArray(stats.feature) && stats.feature.map((item: any, idx: number) => (
                <Link key={idx} href={`/product?feature=${item.slug}`} className={`${styles.attrTag} ${styles.highlightTag}`}>
                  <span className={styles.tagName}>✨ {item.name}</span>
                  <span className={styles.tagCount} style={{ color: siteColor }}>{item.count}</span>
                </Link>
              ))}
              {/* Graphics Tags */}
              {Array.isArray(stats["グラフィック"]) && stats["グラフィック"].slice(0, 5).map((item: any, idx: number) => (
                <Link key={idx} href={`/product?gpu=${item.slug}`} className={styles.attrTag}>
                  <span className={styles.tagName}>{item.name}</span>
                  <span className={styles.tagCount} style={{ color: siteColor }}>{item.count}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Memory & OS Segment */}
        {(stats["メモリ"] || stats["OS"]) && (
          <div className={styles.statGroup}>
            <p className={styles.groupLabel}>MEMORY & OS</p>
            <div className={styles.tagWrapper}>
              {Array.isArray(stats["メモリ"]) && stats["メモリ"].map((item: any, idx: number) => (
                <Link key={idx} href={`/product?memory=${item.slug}`} className={styles.attrTag}>
                  <span className={styles.tagName}>{item.name}</span>
                  <span className={styles.tagCount} style={{ color: siteColor }}>{item.count}</span>
                </Link>
              ))}
              {Array.isArray(stats["OS"]) && stats["OS"].map((item: any, idx: number) => (
                <Link key={idx} href={`/product?os=${item.slug}`} className={styles.attrTag}>
                  <span className={styles.tagName}>{item.name}</span>
                  <span className={styles.tagCount} style={{ color: siteColor }}>{item.count}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 🏢 BRANDS (メーカー表示) */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle} style={{ color: siteColor }}>BRANDS</h3>
        <div className={styles.brandGroup}>
          <ul className={styles.list}>
            {makers.length > 0 ? (
              makers.map((m: any, idx: number) => {
                const brandName = m.name || m.maker || "Unknown";
                return (
                  <li key={idx}>
                    <Link href={`/product?maker=${encodeURIComponent(brandName)}`} className={styles.link}>
                      <span className={styles.brandLabel}>💻 {String(brandName).toUpperCase()}</span>
                      {m.count !== undefined && (
                        <span className={styles.tagCount} style={{ color: siteColor }}>
                          ({m.count})
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })
            ) : (
              <li className={styles.empty}>NO BRAND DATA DETECTED</li>
            )}
            <li>
              <Link href="/product" className={`${styles.link} ${styles.allLink}`} style={{ color: siteColor }}>
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
              <span className={sat.isMain ? styles.mainSatName : styles.satName}>{sat.name}</span>
            </a>
          ))}
        </div>
      </section>

      {/* 📄 UPDATES (Django News Data) */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle} style={{ color: siteColor }}>LATEST UPDATES</h3>
        <ul className={styles.list}>
          {recentArticles.length > 0 ? (
            recentArticles.map((item: any, idx: number) => (
              <li key={idx} className={styles.newsItem}>
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