import styles from '../page.module.css';

type Item = {
  id?: number | string;
  name?: string;
};

type Props = {
  maker?: Item | null;
  label?: Item | null;
  series?: Item | null;
  actresses?: Item[];
};

export function ProductSpecs({
  maker,
  label,
  series,
  actresses = [],
}: Props) {
  return (
    <section className={styles.specs}>

      <h2 className={styles.sectionTitle}>
        作品情報
      </h2>

      <div className={styles.specGrid}>

        <div className={styles.specItem}>
          <span className={styles.specLabel}>
            メーカー
          </span>

          <span className={styles.specValue}>
            {maker?.name || '未登録'}
          </span>
        </div>

        <div className={styles.specItem}>
          <span className={styles.specLabel}>
            レーベル
          </span>

          <span className={styles.specValue}>
            {label?.name || '未登録'}
          </span>
        </div>

        <div className={styles.specItem}>
          <span className={styles.specLabel}>
            シリーズ
          </span>

          <span className={styles.specValue}>
            {series?.name || '未登録'}
          </span>
        </div>

      </div>

      <div className={styles.castSection}>

        <h3 className={styles.castTitle}>
          出演者
        </h3>

        <div className={styles.tags}>

          {actresses.length > 0 ? (
            actresses.map((actress) => (
              <span
                key={actress.id}
                className={styles.tag}
              >
                {actress.name}
              </span>
            ))
          ) : (
            <span className={styles.emptyText}>
              出演者情報はありません
            </span>
          )}

        </div>

      </div>

    </section>
  );
}