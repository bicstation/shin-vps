import styles from '../page.module.css';

type Props = {
  description?: string | null;
};

export function ProductDescription({
  description,
}: Props) {
  return (
    <section className={styles.descriptionSection}>

      <h2 className={styles.sectionTitle}>
        作品紹介
      </h2>

      <div className={styles.descriptionContent}>

        {description ? (
          <p className={styles.descriptionText}>
            {description}
          </p>
        ) : (
          <p className={styles.emptyText}>
            作品紹介は登録されていません。
          </p>
        )}

      </div>

    </section>
  );
}