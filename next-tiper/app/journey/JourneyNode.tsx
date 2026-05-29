// /home/maya/shin-vps/next-tiper/app/journey/JourneyNode.tsx

import Link from 'next/link'

import styles from './JourneyLayer.module.css'

import type {JourneyItem,} from './journey.config'

type Props = {
item: JourneyItem
}

export default function JourneyNode({
item,
}: Props) {

return (


<article
  className={
    styles.node
  }
>

  {/* =====================================
      Label
  ===================================== */}

  <div
    className={
      styles.nodeLabel
    }
  >
    {item.subtitle}
  </div>

  {/* =====================================
      Title
  ===================================== */}

  <h3
    className={
      styles.nodeTitle
    }
  >
    {item.title}
  </h3>

  {/* =====================================
      Description
  ===================================== */}

  <ul
    className={
      styles.nodeList
    }
  >

    {
      item.description.map(

        (
          text
        ) => (

          <li
            key={text}
          >
            {text}
          </li>

        )

      )
    }

  </ul>

  {/* =====================================
      CTA
  ===================================== */}

  <Link
    href={
      item.href
    }
    className={
      styles.nodeAction
    }
  >

    {item.cta}

    <span>
      →
    </span>

  </Link>

</article>


)

}
