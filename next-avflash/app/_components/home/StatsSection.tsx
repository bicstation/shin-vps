import styles from './home.module.css';

type Props = {
products: number;
actresses?: number;
series?: number;
};

export function StatsSection({
products,
actresses = 0,
series = 0,
}: Props) {
return ( <section className={styles.stats}>


  <div className={styles.sectionHeader}>

    <h2 className={styles.sectionTitle}>
      AVFLASHについて
    </h2>

    <p className={styles.sectionDescription}>
      多くの作品情報を掲載しています。
    </p>

  </div>

  <div className={styles.statsGrid}>

    <div className={styles.statCard}>
      <div className={styles.statValue}>
        {products.toLocaleString()}
      </div>

      <div className={styles.statLabel}>
        掲載作品数
      </div>
    </div>

    <div className={styles.statCard}>
      <div className={styles.statValue}>
        {actresses.toLocaleString()}
      </div>

      <div className={styles.statLabel}>
        出演者数
      </div>
    </div>

    <div className={styles.statCard}>
      <div className={styles.statValue}>
        {series.toLocaleString()}
      </div>

      <div className={styles.statLabel}>
        シリーズ数
      </div>
    </div>

  </div>

</section>


);
}
