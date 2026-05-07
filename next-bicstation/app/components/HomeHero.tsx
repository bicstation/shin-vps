import styles
  from '../page.module.css'

export default function HomeHero() {

  return (
    <section
      className={
        styles.hero
      }
    >

      <div
        className={
          styles.heroLabel
        }
      >
        Semantic Ranking Explorer
      </div>

      <h1
        className={
          styles.heroTitle
        }
      >
        用途・性能・semanticから
        最適な1台を探す
      </h1>

      <p
        className={
          styles.heroDescription
        }
      >
        usage /
        GPU /
        maker /
        AI /
        workload /
        recommendation balance
        を横断探索。
      </p>

    </section>
  )
}