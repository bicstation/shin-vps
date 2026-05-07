import styles
  from '../styles/pcFinder.module.css'

export default function EmptyFinder() {

  return (
    <div className={styles.empty}>

      <div className={styles.emptyIcon}>
        🧠
      </div>

      <h2 className={styles.emptyTitle}>
        semantic finder standby
      </h2>

      <p className={styles.emptyText}>
        用途と予算を選択すると
        semantic recommendation を
        表示します。
      </p>

    </div>
  )
}