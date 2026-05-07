import FinderResultCard
  from './FinderResultCard'

import styles
  from '../styles/pcFinder.module.css'

export default function FinderResults({
  results,
}: any) {

  return (
    <div className={styles.resultGrid}>

      {results.map((item: any) => (

        <FinderResultCard
          key={item.unique_id}
          product={item}
        />

      ))}

    </div>
  )
}