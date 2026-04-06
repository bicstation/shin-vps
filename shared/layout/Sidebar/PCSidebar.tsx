// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

/**
 * ✅ Bic Station PC_NODE Specialized Sidebar (v17.7)
 * --------------------------------------------------
 * 1. 提督提供の全31サテライト（PCブランド/技術特化）を実装
 * 2. 既存のNews実データ + Brand/Specダミー表示を維持
 * 3. サイトカラーに連動した洗練されたUI
 */
import { getSiteMetadata, getSiteColor } from '@/shared/lib/utils/siteConfig';
import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge';
import styles from './PCSidebar.module.css';

// --- 提督提供：PC/ガジェット特化サテライトネットワーク ---
const PC_SATELLITES = [
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
  { name: "Fujitsu匠の技", url: "https://fujitsu.bicstation.com", icon: "🇯🇵" },
  { name: "IT潮流サマライズ", url: "https://h.main.bicstation.com", icon: "📰" },
  { name: "お金の知恵袋", url: "https://h.money.bic-saving.com", icon: "💰" },
  { name: "AI進化監視局", url: "https://h.ai.bicstation.com", icon: "🤖" },
  { name: "ワーク最適化術", url: "https://h.work.bicstation.com", icon: "☕" },
  { name: "PCライフハッカー", url: "https://h.pc.life.bicstation.com", icon: "💡" },
  { name: "自作PC探求者", url: "https://pc.bicstation.com", icon: "🔧" },
  { name: "AIアナリスト", url: "https://ai.bicstation.com", icon: "🧬" },
  { name: "最前線PCゲーマー", url: "https://game.bicstation.com", icon: "🕹️" },
  { name: "モバイルコンサル", url: "https://mobile.bicstation.com", icon: "📱" },
  { name: "生産性・副業SaaS", url: "https://work.bicstation.com", icon: "📈" },
  { name: "資産運用・自由への道", url: "https://bg.money.bicstation.com", icon: "🗽" }
];

export default async function Sidebar() {
  /** 1. アイデンティティ確定 */
  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || '';
  const site = getSiteMetadata(host);
  const siteColor = site ? getSiteColor(site.site_name) : '#00f2ff';

  /** 2. データ取得 */
  async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
    try {
      const result = await promise;
      return result ?? fallback;
    } catch (e) { return fallback; }
  }

  const bridgeData = await safeFetch(
    fetchDjangoBridgeContent('posts', 5, { content_type: 'news' }), 
    { results: [] }
  );
  const recentArticles = Array.isArray(bridgeData) ? bridgeData : (bridgeData?.results || []);

  /** 3. サテライトのランダム選出 (SSR) */
  const shuffledSatellites = [...PC_SATELLITES]
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);

  /** 4. ダミーデータ定義 */
  const dummyMakers = {
    domestic: [
      { id: 'd1', lowerName: 'mouse', displayName: 'MOUSE', count: '-' },
      { id: 'fujitsu', lowerName: 'fujitsu', displayName: 'FUJITSU', count: '-' }
    ],
    overseas: [
      { id: 'o1', lowerName: 'dell', displayName: 'DELL', count: '-' },
      { id: 'o2', lowerName: 'hp', displayName: 'HP', count: '-' },
      { id: 'o3', lowerName: 'lenovo', displayName: 'LENOVO', count: '-' }
    ]
  };

  const dummySpecs = {
    "CPU_SERIES": [
      { slug: 'core-i7', name: 'Core i7' },
      { slug: 'ryzen-7', name: 'Ryzen 7' }
    ],
    "GPU_SERIES": [
      { slug: 'rtx-4060', name: 'RTX 4060' },
      { slug: 'rtx-4070', name: 'RTX 4070' }
    ]
  };

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

      {/* 🛰️ SATELLITE NETWORK (提督追加分) */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle} style={{ color: siteColor }}>TECH NETWORK</h3>
        <div className={styles.satelliteGrid}>
          {shuffledSatellites.map((sat, idx) => (
            <a key={idx} href={sat.url} target="_blank" rel="noopener noreferrer" className={styles.satelliteLink}>
              <span className={styles.satIcon}>{sat.icon}</span>
              <span className={styles.satName}>{sat.name}</span>
            </a>
          ))}
        </div>
      </section>

      {/* 🏢 BRANDS */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>BRANDS</h3>
        <div className={styles.brandGroup}>
          <p className={styles.subLabel}>国内ブランド</p>
          <ul className={styles.list}>
            {dummyMakers.domestic.map((item) => (
              <li key={item.id}>
                <Link href={`/brand/${item.lowerName}`} className={styles.link}>
                  <span>💻 {item.displayName}</span>
                  <span className={styles.badge}>{item.count}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className={styles.subLabel} style={{ marginTop: '12px' }}>海外ブランド</p>
          <ul className={styles.list}>
            {dummyMakers.overseas.map((item) => (
              <li key={item.id}>
                <Link href={`/brand/${item.lowerName}`} className={styles.link}>
                  <span>💻 {item.displayName}</span>
                  <span className={styles.badge}>{item.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 📄 UPDATES (Real Data) */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>LATEST UPDATES</h3>
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