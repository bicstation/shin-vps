import React from 'react';
import styles from './StaticPageLayout.module.css'; // CSSをインポート

interface StaticPageLayoutProps {
  title: string;
  description: string;
  lastUpdated: string;
  toc: { id: string; text: string }[];
  children: React.ReactNode;
}

export default function StaticPageLayout({ title, description, lastUpdated, toc, children }: StaticPageLayoutProps) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
          <div className={styles.updateBadge}>
            最終更新日: {lastUpdated}
          </div>
        </div>
      </header>

      <div className={styles.contentArea}>
        <div className={styles.card}>
          {/* 目次セクション */}
          <nav className={styles.tocSection}>
            <h2 className={styles.tocTitle}>TABLE OF CONTENTS</h2>
            <ul className={styles.tocGrid}>
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className={styles.tocLink}>
                    → {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* 本文エリア */}
          <main className={styles.mainContent}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}