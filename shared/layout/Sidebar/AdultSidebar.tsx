// @ts-nocheck
import React from 'react';
import Link from 'next/link';

/**
 * ✅ Adult Specialized Sidebar (v18.3 - Final Build Fix)
 * --------------------------------------------------
 * 1. サーバー/クライアント両対応のため headers() を廃止
 * 2. リンク生成には相対パスまたは環境変数を使用
 */
import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge';
import styles from './AdultSidebar.module.css';

// --- アダルト・サテライトネットワーク設定 ---
const ADULT_SATELLITES = [
  { name: "最新AVトレンド速報", url: "https://main.tiper.live", icon: "💎" },
  { name: "新作予約中毒マニア", url: "https://reserve.tiper.live", icon: "📅" },
  { name: "熟女・人妻の深み", url: "https://jukujo.tiper.live", icon: "💄" },
  { name: "360度没入VR専門", url: "https://vr.tiper.live", icon: "🽽" },
  { name: "美少女新人発掘", url: "https://idol.tiper.live", icon: "✨" },
  { name: "嫉妬と興奮のNTR", url: "https://ntr.tiper.live", icon: "💔" },
  { name: "特定部位フェチ求道", url: "https://fetish.tiper.live", icon: "👠" },
  { name: "AV歴史アーキビスト", url: "https://wiki.tiper.live", icon: "📚" },
  { name: "生ハメ快楽主義", url: "https://nakadashi.tiper.live", icon: "💧" },
  { name: "素人ハプニング実録", url: "https://amateur.tiper.live", icon: "📹" },
  { name: "処女・初体験の輝き", url: "https://virgin.tiper.live", icon: "🌸" },
  { name: "制服と放課後の背徳", url: "https://jk.tiper.live", icon: "🎒" },
  { name: "女子大生自由奔放", url: "https://jd.tiper.live", icon: "🏫" },
  { name: "パパ活・援交実録", url: "https://enkou.tiper.live", icon: "💴" },
  { name: "団地の淫らな若妻", url: "https://wakazuma.tiper.live", icon: "🏠" },
  { name: "白衣の天使・裏の顔", url: "https://nurse.tiper.live", icon: "💉" },
  { name: "女上司・タイトスカート", url: "https://ol.tiper.live", icon: "💼" },
  { name: "衆人環視の痴女", url: "https://chijo.tiper.live", icon: "🧥" },
  { name: "派手エロギャル専", url: "https://gal.tiper.live", icon: "💅" },
  { name: "細身の曲線スレンダー", url: "https://slender.tiper.live", icon: "💃" },
  { name: "VRガジェット評論", url: "https://bg.vr.tiper.live", icon: "👓" },
  { name: "大型新人告知事件", url: "https://bg.idol.tiper.live", icon: "📢" },
  { name: "マダムコンシェルジュ", url: "https://bg.jukujo.tiper.live", icon: "🌹" },
  { name: "略奪の美学・不倫", url: "https://bg.ntr.tiper.live", icon: "🍷" },
  { name: "部位解剖フェティシスト", url: "https://bg.fetish.tiper.live", icon: "🔍" },
  { name: "衣装エロス・記号論", url: "https://bg.fashion.tiper.live", icon: "👗" },
  { name: "実録ドキュメンタリー", url: "https://bg.real.tiper.live", icon: "🎙️" },
  { name: "伝説の女優・名作蔵", url: "https://bg.archive.tiper.live", icon: "🎞️" },
  { name: "メーカー別ブランド検証", url: "https://bg.lab.tiper.live", icon: "🧪" },
  { name: "アダルト総合ポータル", url: "https://bg.news.tiper.live", icon: "🌐" }
];

export default async function AdultSidebar() {
  const siteColor = "#d946ef"; // 固定パープル（Tiper仕様）

  // API連携（Djangoからのデータ取得）
  // サーバーサイドフェッチとして機能させる
  const bridgeData = await fetchDjangoBridgeContent('posts', 5, { content_type: 'adult_video' })
    .catch(() => ({ results: [] }));
  const recentArticles = Array.isArray(bridgeData) ? bridgeData : (bridgeData?.results || []);

  // サテライトをランダム選出（10件）
  const shuffledSatellites = [...ADULT_SATELLITES].sort(() => Math.random() - 0.5).slice(0, 10);

  return (
    <aside className={styles.sidebar}>
      
      {/* 🏆 ADULT-FINDER */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle} style={{ color: siteColor }}>SPECIAL SEARCH</h3>
        <Link href="/video-finder/" className={styles.specialBanner} style={{ borderLeft: `4px solid ${siteColor}` }}>
          <span className={styles.finderIcon}>🔞</span>
          <div className={styles.finderText}>
            <span className={styles.finderMain}>AV-FINDER</span>
            <span className={styles.finderSub}>AIが極上の１本を厳選</span>
          </div>
        </Link>
      </section>

      {/* 🛰️ ADULT SATELLITE NETWORK */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle} style={{ color: "#10b981" }}>EROTIC NETWORK</h3>
        <div className={styles.satelliteGrid}>
          {shuffledSatellites.map((sat, idx) => (
            <a key={idx} href={sat.url} target="_blank" rel="noopener noreferrer" className={styles.satelliteLink}>
              <span className={styles.satIcon}>{sat.icon}</span>
              <span className={styles.satName}>{sat.name}</span>
            </a>
          ))}
        </div>
      </section>

      {/* 🔞 CATEGORIES */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>GENRES</h3>
        <ul className={styles.list}>
          {['単体作品', '熟女・人妻', '素人・生撮', 'VR専用'].map((genre) => (
            <li key={genre}>
              <Link href={`/genre/${encodeURIComponent(genre)}`} className={styles.link}>
                <span>💋 {genre}</span>
                <span className={styles.badge}>NEW</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 📄 RECENT REVIEWS */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>LATEST REVIEWS</h3>
        <ul className={styles.list}>
          {recentArticles.length > 0 ? (
            recentArticles.map((item: any) => (
              <li key={item.id} className={styles.newsItem}>
                <Link href={`/post/${item.id}`} className={styles.newsLink}>
                   <span className={styles.newsIcon}>🎬</span>
                   <span className={styles.newsTitle}>{item.title}</span>
                </Link>
              </li>
            ))
          ) : (
            <li className={styles.empty}>新作データを解析中...</li>
          )}
        </ul>
      </section>

      {/* 🚀 SYSTEM FOOTER */}
      <div className={styles.sidebarFooter}>
        <span className={styles.statusDot} style={{ backgroundColor: siteColor }}></span>
        <span className={styles.statusText}>ADULT_NODE ONLINE</span>
      </div>
    </aside>
  );
}