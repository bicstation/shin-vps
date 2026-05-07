import styles
  from '../styles/pcFinder.module.css'

const intents = [
  {
    value: 'gaming',
    label: '🎮 ゲーム',
  },
  {
    value: 'creator',
    label: '🎬 動画編集',
  },
  {
    value: 'work',
    label: '💼 仕事',
  },
  {
    value: 'ai',
    label: '⚡ AI',
  },
]

export default function IntentSelector({
  value,
  onChange,
}: any) {

  return (
    <div className={styles.block}>

      <h2 className={styles.blockTitle}>
        用途
      </h2>

      <div className={styles.optionGrid}>

        {intents.map(item => {

          const active =
            item.value === value

          return (
            <button
              key={item.value}

              onClick={() =>
                onChange(item.value)
              }

              className={
                active
                  ? styles.optionActive
                  : styles.option
              }
            >
              {item.label}
            </button>
          )
        })}

      </div>

    </div>
  )
}