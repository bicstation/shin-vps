// app/_components/home/ExplorerEntrySection.tsx

import Link from 'next/link';

import styles from './home.module.css';

export default function ExplorerEntrySection() {
  return (
    <section
      className={`${styles.homeSection} ${styles.explorerEntry}`}
    >
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          もっと作品を探す
        </h2>

        <p className={styles.sectionDescription}>
          AVFLASHには13,000作品以上のアーカイブがあります。
          気になる作品を見つけてみましょう。
        </p>
      </div>

      <Link
        href="/adults"
        className={styles.explorerButton}
      >
        作品一覧を見る
      </Link>
    </section>
  );
}

