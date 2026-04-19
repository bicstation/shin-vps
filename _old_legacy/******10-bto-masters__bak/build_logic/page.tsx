import React from 'react';
import { BUILD_SERIES_DETAIL } from './data';
import styles from './build_logic.module.css';

export default function BuildLogicPage() {
  const s = BUILD_SERIES_DETAIL;

  return (
    <main className={styles.container}>
      {/* ヒーロービジュアル：冷徹なハードウェアの物理学 */}
      <section className={styles.heroSection}>
        <div className={styles.imageWrapper}>
          <img 
            src="/images/series/build/01-build-logic.jpg" 
            alt="PC Build Logic Visual" 
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay}>
            <div className={styles.seriesTag}>SERIES 01</div>
            <h1 className={styles.title}>{s.title}</h1>
            <p className={styles.concept}>{s.concept}</p>
          </div>
        </div>
      </section>

      {/* ステータスバー */}
      <div className={styles.statusBar}>
        <div className={styles.specItem}>
          <span className={styles.label}>PRIORITY_DEVICE</span>
          <span className={styles.value}>{s.priorityDevice}</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.label}>TOTAL_EPISODES</span>
          <span className={styles.value}>{s.episodes.length} VOLS</span>
        </div>
      </div>

      {/* 予算・フェーズロードマップ */}
      <section className={styles.phaseRoadmap}>
        {s.phases.map((phase, idx) => (
          <div key={idx} className={styles.phaseCard}>
            <div className={styles.phaseBadge}>PHASE 0{idx + 1}</div>
            <h2 className={styles.phaseLabel}>{phase.label}</h2>
            <div className={styles.budget}>{phase.budget}</div>
            <p className={styles.focus}><span>FOCUS:</span> {phase.focus}</p>
            <p className={styles.env}><span>ENV:</span> {phase.environment}</p>
          </div>
        ))}
      </section>

      {/* ミッションログ（講義一覧） */}
      <section className={styles.episodeSection}>
        <h3 className={styles.sectionTitle}>MISSION_LOGS</h3>
        <div className={styles.episodeGrid}>
          {s.episodes.map((ep) => (
            <div key={ep.volume} className={`${styles.episodeCard} ${ep.isFurnitureUnlocked ? styles.unlocked : ''}`}>
              <div className={styles.volNum}>VOL.{String(ep.volume).padStart(2, '0')}</div>
              <h4 className={styles.epTitle}>{ep.title.split(': ')[1]}</h4>
              <div className={styles.hint}>
                <span className={styles.hintIcon}>⚡</span> {ep.technicalHint}
              </div>
              {ep.isFurnitureUnlocked && <div className={styles.unlockTag}>FURNITURE_UNLOCKED</div>}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}