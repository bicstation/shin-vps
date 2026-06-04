// app/_components/home/StatsSection.tsx

import styles from './home.module.css';

interface Props {
  products: number;
  actresses?: number;
  genres?: number;
  series?: number;
}

export default function StatsSection({
  products,
  actresses,
  genres,
  series,
}: Props) {
  return (
    <section className={styles.homeSection}>
      <div className={styles.statsGrid}>

        <div className={styles.statCard}>
          <span className={styles.statValue}>
            {products.toLocaleString()}
          </span>

          <span className={styles.statLabel}>
            登録作品
          </span>
        </div>

        {actresses !== undefined && (
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {actresses.toLocaleString()}
            </span>

            <span className={styles.statLabel}>
              女優
            </span>
          </div>
        )}

        {genres !== undefined && (
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {genres.toLocaleString()}
            </span>

            <span className={styles.statLabel}>
              ジャンル
            </span>
          </div>
        )}

        {series !== undefined && (
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {series.toLocaleString()}
            </span>

            <span className={styles.statLabel}>
              シリーズ
            </span>
          </div>
        )}

      </div>
    </section>
  );
}

