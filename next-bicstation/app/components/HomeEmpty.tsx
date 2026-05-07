import styles
  from '../page.module.css'

export default function HomeEmpty() {

  return (
    <div
      className={
        styles.empty
      }
    >

      <div
        className={
          styles.emptyCard
        }
      >

        <h2
          className={
            styles.emptyTitle
          }
        >
          データを取得できません
        </h2>

        <p
          className={
            styles.emptyText
          }
        >
          semantic API /
          sidebar stats /
          backend authority
          を確認してください。
        </p>

      </div>

    </div>
  )
}