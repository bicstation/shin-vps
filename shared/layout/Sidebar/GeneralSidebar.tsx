'use client';

import React, { useState, useEffect } from 'react';
import { getSiteColor } from '../../lib/utils/siteConfig'; 
import styles from './GeneralSidebar.module.css';

/**
 * =====================================================================
 * 🛸 GeneralSidebar - Full Satellite Network (v17.6)
 * ---------------------------------------------------------------------
 * 🛠️ 変更点:
 * 1. 提督から提示された全45サイトのデータをマスター配列に格納。
 * 2. インポートパスを GeneralSidebar.module.css に統一。
 * 3. サイト名、URL、アイコンをすべて実戦データに更新。
 * =====================================================================
 */

const ALL_SATELLITES = [
  // --- はてなブログ系 ---
  { name: "家計の守護神", url: "https://h.money.bic-saving.com", icon: "🧼" },
  { name: "ポイント還元攻略", url: "https://h.point.bic-saving.com", icon: "🏷️" },
  { name: "新NISA資産運用", url: "https://h.invest.bic-saving.com", icon: "📈" },
  { name: "ふるさと納税達人", url: "https://h.furusato.bic-saving.com", icon: "🍱" },
  { name: "固定費削減ハッカー", url: "https://h.life.bic-saving.com", icon: "🛠️" },

  // --- ライブドア系 (節約・生活) ---
  { name: "クレカソムリエ", url: "https://credit.bic-saving.com", icon: "💳" },
  { name: "楽天経済圏の住人", url: "https://rakuten.bic-saving.com", icon: "🔴" },
  { name: "スマホ決済ハンター", url: "https://pay.bic-saving.com", icon: "📱" },
  { name: "ネット銀行口座の目利き", url: "https://bank.bic-saving.com", icon: "🏦" },
  { name: "格安SIMの達人", url: "https://sim.bic-saving.com", icon: "📶" },
  { name: "住宅ローンアドバイザー", url: "https://house.bic-saving.com", icon: "🏠" },
  { name: "カーライフ節約術", url: "https://car.bic-saving.com", icon: "🚗" },
  { name: "省エネ専門家", url: "https://energy.bic-saving.com", icon: "⚡" },
  { name: "保険見直しプロ", url: "https://ins.bic-saving.com", icon: "🛡️" },
  { name: "節税対策ガイド", url: "https://tax.bic-saving.com", icon: "📝" },
  { name: "マイル旅行プランナー", url: "https://travel.bic-saving.com", icon: "✈️" },
  { name: "サブスク整理術", url: "https://sub.bic-saving.com", icon: "📺" },
  { name: "高配当・優待株投資", url: "https://stock.bic-saving.com", icon: "💴" },
  { name: "ふるさと納税キュレーター", url: "https://furu.bic-saving.com", icon: "🎁" },
  { name: "暗号資産開拓者", url: "https://crypto.bic-saving.com", icon: "🪙" },
  { name: "キャリア・ストラテジスト", url: "https://job.bic-saving.com", icon: "💼" },
  { name: "業務スーパー活用術", url: "https://shop.bic-saving.com", icon: "🛒" },
  { name: "コンビニアプリ賢者", url: "https://con.bic-saving.com", icon: "🏪" },
  { name: "金券・優待生活者", url: "https://gift.bic-saving.com", icon: "🎟️" },
  { name: "節約ライフハック総帥", url: "https://all.bic-saving.com", icon: "👑" },

  // --- Blogger系 ---
  { name: "自由への案内人", url: "https://bg.money.bic-saving.com", icon: "🗽" },
  { name: "ポイ活旅行術", url: "https://bg.invest.bic-saving.com", icon: "🧭" },
  { name: "ポイント魔術師", url: "https://bg.point.bic-saving.com", icon: "🪄" },
  { name: "確定申告の案内人", url: "https://bg.tax.bic-saving.com", icon: "🧾" },
  { name: "通信費1円の攻防", url: "https://bg.sim.bic-saving.com", icon: "📡" },
  { name: "家計の設計士", url: "https://bg.house.bic-saving.com", icon: "📐" },
  { name: "自動車コストコンサル", url: "https://bg.car.bic-saving.com", icon: "🏎️" },
  { name: "保険見直しサポーター", url: "https://bg.ins.bic-saving.com", icon: "🩺" },
  { name: "副業伴走者", url: "https://bg.work.bic-saving.com", icon: "💻" },
  { name: "お金の教科書伝道師", url: "https://bg.guide.bic-saving.com", icon: "📖" },

  // --- FX攻略系 ---
  { name: "FX総合攻略ナビ", url: "https://fx.bic-saving.com", icon: "📈" },
  { name: "テクニカル分析の鬼", url: "https://tech.fx.bic-saving.com", icon: "📊" },
  { name: "経済ニュース解説", url: "https://news.fx.bic-saving.com", icon: "🌍" },
  { name: "不労所得EA検証", url: "https://auto.fx.bic-saving.com", icon: "🤖" },
  { name: "スワップ金利の達人", url: "https://swap.fx.bic-saving.com", icon: "⛓️" },
  { name: "少額FX入門ガイド", url: "https://entry.fx.bic-saving.com", icon: "🐣" },
  { name: "スキャルピングプロ", url: "https://scal.fx.bic-saving.com", icon: "⚡" },
  { name: "デイトレ勝ちパターン", url: "https://day.fx.bic-saving.com", icon: "🌤️" },
  { name: "グローバルトレーダー", url: "https://global.fx.bic-saving.com", icon: "🗺️" },
  { name: "投資心理学カウンセラー", url: "https://mind.fx.bic-saving.com", icon: "🧠" }
];

export default function GeneralSidebar({ product, siteName = 'General Site', isBicSaving = false }: any) {
  const siteColor = isBicSaving ? '#f59e0b' : getSiteColor('general');
  const [randomSatellites, setRandomSatellites] = useState<any[]>([]);

  // クライアントサイドでのハイドレーション後にランダム選出
  useEffect(() => {
    const shuffled = [...ALL_SATELLITES].sort(() => 0.5 - Math.random());
    setRandomSatellites(shuffled.slice(0, 8)); // 8件表示に微増
  }, []);

  return (
    <aside className={styles.sidebar}>
      
      {/* 1. 共通メニュー */}
      <section className={styles.sectionWrapper}>
        <div className={styles.sectionTitle} style={{ borderLeft: `3px solid ${siteColor}` }}>
          {siteName} Menu
        </div>
        <nav className={styles.navList}>
          <a href="/" className={styles.navLink}>
            <span className={styles.icon}>🏠</span> Dashboard
          </a>
          <a href="/blog/pc-finder" className={styles.navLink}>
            <span className={styles.icon}>🔍</span> PC Finder
          </a>
        </nav>
      </section>

      {/* 2. Bic Saving 専用サテライトセクション */}
      {isBicSaving && randomSatellites.length > 0 && (
        <section className={styles.sectionWrapper}>
          <div className={styles.sectionTitle} style={{ borderLeft: `3px solid #f59e0b` }}>
            Expert Networks
          </div>
          <div className={styles.navList} style={{ gap: '0.4rem' }}>
            {randomSatellites.map((blog, idx) => (
              <a 
                key={idx} 
                href={blog.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.satelliteCard}
                title={blog.name}
              >
                <span className={styles.icon} style={{ fontSize: '0.85rem' }}>{blog.icon}</span>
                <span className={styles.satelliteName}>{blog.name}</span>
              </a>
            ))}
          </div>
          <p className="mt-3 text-[8px] text-gray-600 text-center uppercase tracking-widest">
            Total 45 Specialist Blogs
          </p>
        </section>
      )}

      {/* 3. ハードウェア解析 (商品ページのみ) */}
      {product && (
        <section className={styles.sectionWrapper}>
          <div className={styles.sectionTitle} style={{ borderLeft: `3px solid ${siteColor}` }}>
            Hardware Analysis
          </div>
          <div className={styles.specCard}>
            <div className={styles.specLabel}>Performance Index</div>
            <div className={styles.specRank}>
              RANK: <span className={styles.scoreHighlight}>{product.spec_score}</span>
            </div>
            <div className={styles.gaugeContainer}>
              <div 
                className={styles.gaugeBar} 
                style={{ 
                  width: `${Math.min(product.spec_score, 100)}%`,
                  backgroundColor: siteColor 
                }} 
              />
            </div>
          </div>
        </section>
      )}

      {/* システム情報（デバッグ・管理用） */}
      <footer className={styles.footer}>
        <p className={styles.systemNode}>
          FLEET-CORE: {siteName.replace(/\s+/g, '-').toUpperCase()}
        </p>
        <p className={styles.systemNode} style={{ fontSize: '7px', marginTop: '2px' }}>
          SATELLITE-V17.6-READY
        </p>
      </footer>
    </aside>
  );
}