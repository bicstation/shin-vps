import styles
  from '../styles/pcFinder.module.css'

const budgets = [
  150000,
  250000,
  350000,
  500000,
]

export default function BudgetSelector({
  value,
  onChange,
}: any) {

  return (
    <div className={styles.block}>

      <h2 className={styles.blockTitle}>
        予算
      </h2>

      <div className={styles.optionGrid}>

        {budgets.map(v => {

          const active =
            v === value

          return (
            <button
              key={v}

              onClick={() =>
                onChange(v)
              }

              className={
                active
                  ? styles.optionActive
                  : styles.option
              }
            >
              ¥{v.toLocaleString()}
            </button>
          )
        })}

      </div>

    </div>
  )
}