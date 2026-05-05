/* /components/AiContent.tsx */

import ReactMarkdown from 'react-markdown'
import styles from './AiContent.module.css'

type Props = {
  content?: string
}

export default function AiContent({ content }: Props) {
  if (!content) return null

  return (
    <section className={styles.wrapper}>
      <div className={styles.aiContent}>
        <ReactMarkdown>
          {content}
        </ReactMarkdown>
      </div>
    </section>
  )
}