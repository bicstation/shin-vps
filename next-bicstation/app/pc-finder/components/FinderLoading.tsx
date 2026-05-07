import styles
  from '../styles/pcFinder.module.css'

export default function FinderLoading() {

  return (
    <div className={styles.loading}>

      <div className={styles.spinner} />

      <div className={styles.loadingText}>
        semantic解析中...
      </div>

    </div>
  )
}