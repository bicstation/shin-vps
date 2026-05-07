import styles
  from '../page.module.css'

type Props = {
  label: string
  title: string
  description?: string
}

export default function HomeSectionTitle({
  label,
  title,
  description,
}: Props) {

  return (
    <div
      className={
        styles.sectionHeader
      }
    >

      <div
        className={
          styles.sectionLabel
        }
      >
        {label}
      </div>

      <h2
        className={
          styles.sectionTitle
        }
      >
        {title}
      </h2>

      {description && (
        <p
          className={
            styles.sectionDescription
          }
        >
          {description}
        </p>
      )}

    </div>
  )
}