import styles
  from '../styles/pcFinder.module.css'

export default function FinderHero() {

  return (
    <section className={styles.hero}>

      <div className={styles.heroBadge}>
        Semantic Recommendation Engine
      </div>

      <h1 className={styles.heroTitle}>
        あなたに最適な
        semantic構成を探す
      </h1>

      <p className={styles.heroText}>
        gaming / creator / AI /
        work semantic を解析し、
        backend authority に基づき
        最適なPCを提案します。
      </p>

    </section>
  )
}