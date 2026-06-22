// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/_components/RuntimeSelector.tsx

"use client";

import {

  RUNTIMES,

} from "../_config/runtimes";

type Props = {

  value: string

  onChange: (
    value: string
  ) => void

}

export default function RuntimeSelector({

  value,
  onChange,

}: Props) {

  console.log(
    "🔥 RUNTIME COUNT",
    RUNTIMES.length
  )

  console.log(
    "🔥 RUNTIMES",
    RUNTIMES
  )

  return (

    <section

      style={{

        marginTop:
          "24px",

        marginBottom:
          "24px",

      }}

    >

      <div

        style={{

          color:
            "#94a3b8",

          fontSize:
            "12px",

          fontWeight:
            700,

          marginBottom:
            "8px",

          textTransform:
            "uppercase",

          letterSpacing:
            ".08em",

        }}

      >

        Runtime

      </div>

      <div

        style={{

          color:
            "#94a3b8",

          fontSize:
            "12px",

          fontWeight:
            700,

          marginBottom:
            "8px",

        }}

      >

        Runtime V999

      </div>

      <select

        value={
          value
        }

        onChange={(e) =>

          onChange(
            e.target.value
          )

        }

        style={{

          minWidth:
            "260px",

          height:
            "44px",

          padding:
            "0 14px",

          border:
            "1px solid #334155",

          borderRadius:
            "10px",

          background:
            "#020617",

          color:
            "#ffffff",

          fontSize:
            "14px",

          outline:
            "none",

        }}

      >

        {

          RUNTIMES.map(

            (runtime) => (

              <option

                key={
                  runtime.key
                }

                value={
                  runtime.key
                }

              >

                {

                  runtime.label

                }

              </option>

            )

          )

        }

      </select>

    </section>

  )

}