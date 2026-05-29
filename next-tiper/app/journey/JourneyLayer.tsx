// /home/maya/shin-vps/next-tiper/app/journey/JourneyLayer.tsx

import styles from './JourneyLayer.module.css'

import JourneyNode from './JourneyNode'

import {
JOURNEY_ITEMS,
} from './journey.config'

export default function JourneyLayer() {

return (


<section
  className={
    styles.journeyLayer
  }
>

  {/* ======================================================
      Header
  ====================================================== */}

  <div
    className={
      styles.journeyHeader
    }
  >

    <div>

      <div
        className={
          styles.journeyHeading
        }
      >
        ACCESS TERMINAL
      </div>

      <p
        className={
          styles.journeyDescription
        }
      >
        あなたは何を探していますか？
        目的から選ぶことで、
        必要な情報へ素早くアクセスできます。
      </p>

    </div>

  </div>

  {/* ======================================================
      Grid
  ====================================================== */}

  <div
    className={
      styles.nodeGrid
    }
  >

    {
      JOURNEY_ITEMS.map(

        (
          item
        ) => (

          <JourneyNode
            key={
              item.id
            }
            item={
              item
            }
          />

        )

      )
    }

  </div>

</section>


)

}
